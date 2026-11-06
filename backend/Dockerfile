FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --system arena
COPY main.py .
COPY migrations ./migrations
USER arena
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
