import base64
import binascii
import io
import os
import re
import secrets
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image, ImageOps
from psycopg.errors import UniqueViolation
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

EDITION = "cml-ii"
MAX_PHOTO_BYTES = 2 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 16_000_000
pool = ConnectionPool(
    kwargs=dict(host=os.getenv("PGHOST", "db"), dbname=os.getenv("PGDATABASE", "arena"),
                user=os.getenv("PGUSER", "arena"), password=os.getenv("PGPASSWORD"),
                row_factory=dict_row),
    min_size=1, max_size=5, open=False,
)


@asynccontextmanager
async def lifespan(_app):
    pool.open(wait=True)
    try:
        with pool.connection() as db:
            db.execute("SELECT pg_advisory_xact_lock(4182601)")
            db.execute("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY)")
            for migration in sorted(Path(__file__).with_name("migrations").glob("*.sql")):
                if not db.execute("SELECT 1 FROM schema_migrations WHERE name = %s", (migration.name,)).fetchone():
                    db.execute(migration.read_text(encoding="utf-8"))
                    db.execute("INSERT INTO schema_migrations VALUES (%s)", (migration.name,))
        yield
    finally:
        pool.close()


app = FastAPI(title="Arena Marks", version="1.0.0", lifespan=lifespan)
bearer = HTTPBearer(auto_error=False)


def require_admin(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]):
    expected = os.getenv("ARENA_ADMIN_KEY", "")
    if not expected or not credentials or not secrets.compare_digest(
        credentials.credentials.encode(), expected.encode()
    ):
        raise HTTPException(401, "Chave da organizacao ausente ou invalida.", {"WWW-Authenticate": "Bearer"})


class Registration(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str = Field(min_length=1, max_length=100)
    nickname: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(max_length=20)
    city: str = Field(min_length=1, max_length=100)
    uf: str = Field(pattern=r"^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$")
    photo: str = Field(max_length=2_800_000)
    terms: Literal[True]
    imageConsent: Literal[True]

    @field_validator("phone")
    @classmethod
    def phone_with_ddd(cls, value):
        if not 10 <= len(re.sub(r"\D", "", value)) <= 13:
            raise ValueError("Informe um WhatsApp com DDD.")
        return value


class Review(BaseModel):
    status: Literal["approved", "rejected"]


def clean_photo(value: str) -> bytes:
    try:
        prefix, encoded = value.split(",", 1)
        if prefix not in {"data:image/jpeg;base64", "data:image/png;base64", "data:image/webp;base64"}:
            raise ValueError
        raw = base64.b64decode(encoded, validate=True)
        if len(raw) > MAX_PHOTO_BYTES:
            raise ValueError
        with Image.open(io.BytesIO(raw), formats=["JPEG", "PNG", "WEBP"]) as source:
            if source.width * source.height > Image.MAX_IMAGE_PIXELS:
                raise ValueError
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((800, 800))
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=85)
            return output.getvalue()
    except (ValueError, OSError, binascii.Error, Image.DecompressionBombError):
        raise HTTPException(422, "Envie uma foto JPG, PNG ou WebP valida, de ate 2 MB.") from None


def lock_edition(db):
    return db.execute("SELECT capacity FROM editions WHERE id = %s FOR UPDATE", (EDITION,)).fetchone()["capacity"]


def has_slot(db, capacity):
    count = db.execute(
        "SELECT count(*) AS total FROM registrations WHERE edition_id = %s AND status <> 'rejected'", (EDITION,)
    ).fetchone()["total"]
    return count < capacity


@app.get("/health")
def health():
    with pool.connection() as db:
        db.execute("SELECT 1 FROM editions LIMIT 1")
    return {"status": "ok"}


@app.post("/registrations", status_code=201)
def create_registration(data: Registration):
    photo = clean_photo(data.photo)
    registration_id = uuid.uuid4()
    protocol = registration_id.hex[:12].upper()
    try:
        with pool.connection() as db:
            if not has_slot(db, lock_edition(db)):
                raise HTTPException(409, "As vagas desta edicao estao preenchidas.")
            db.execute(
                """INSERT INTO registrations (id, edition_id, protocol, name, nickname, email, phone, city, uf, photo)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (registration_id, EDITION, protocol, data.name, data.nickname,
                 data.email.lower(), data.phone, data.city, data.uf, photo),
            )
    except UniqueViolation:
        raise HTTPException(409, "Ja existe uma inscricao ativa com este e-mail.") from None
    return {"protocol": protocol, "status": "pending"}


@app.get("/admin/registrations", dependencies=[Depends(require_admin)])
def list_registrations():
    with pool.connection() as db:
        rows = db.execute(
            """SELECT id, name, nickname, email AS contact, phone, city, uf, status, photo, protocol
               FROM registrations WHERE edition_id = %s ORDER BY created_at DESC""", (EDITION,)
        ).fetchall()
    for row in rows:
        row.update(photo="data:image/jpeg;base64," + base64.b64encode(row["photo"]).decode(),
                   club="", group="", color="#29acff")
    return rows


@app.patch("/admin/registrations/{registration_id}", dependencies=[Depends(require_admin)])
def review_registration(registration_id: uuid.UUID, review: Review):
    try:
        with pool.connection() as db:
            capacity = lock_edition(db)
            args = (registration_id, EDITION)
            row = db.execute("SELECT status FROM registrations WHERE id = %s AND edition_id = %s", args).fetchone()
            if not row:
                raise HTTPException(404, "Inscricao nao encontrada.")
            if row["status"] == "rejected" and review.status == "approved" and not has_slot(db, capacity):
                raise HTTPException(409, "Nao ha vaga para aprovar esta inscricao.")
            db.execute("UPDATE registrations SET status = %s, reviewed_at = now() WHERE id = %s AND edition_id = %s",
                       (review.status, *args))
    except UniqueViolation:
        raise HTTPException(409, "Ja existe outra inscricao ativa com este e-mail.") from None
    return {"status": review.status}
