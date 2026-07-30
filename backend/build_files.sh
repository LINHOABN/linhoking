#!/bin/bash
# Vercel build script — runs before serverless function is deployed
set -e

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Running database migrations..."
python manage.py migrate --noinput || echo "Warning: Migration skipped during build step."

echo "==> Build complete."
