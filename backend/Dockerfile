# ── Backend Dockerfile ────────────────────────────────────────────────────────
# Uses Python 3.11 slim image for a lightweight container
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements first for Docker layer caching
# (dependencies only re-install when requirements.txt changes)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project files
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Default command — runs Uvicorn with live reload for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
