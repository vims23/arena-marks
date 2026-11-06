CREATE TABLE editions (
    id text PRIMARY KEY,
    capacity integer NOT NULL CHECK (capacity > 0)
);

INSERT INTO editions (id, capacity) VALUES ('cml-ii', 32);

CREATE TABLE registrations (
    id uuid PRIMARY KEY,
    edition_id text NOT NULL REFERENCES editions(id),
    protocol text NOT NULL UNIQUE,
    name text NOT NULL,
    nickname text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    city text NOT NULL,
    uf char(2) NOT NULL,
    photo bytea NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    consent_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_at timestamptz
);

CREATE UNIQUE INDEX registrations_active_email
    ON registrations (edition_id, lower(email)) WHERE status <> 'rejected';
CREATE INDEX registrations_review ON registrations (edition_id, created_at DESC);
