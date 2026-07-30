FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements_backend.txt /app/backend/requirements_backend.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements_backend.txt

COPY . /app/backend

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]