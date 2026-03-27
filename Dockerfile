# Stage 1: Build React frontend
FROM node:20-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Python backend + serve frontend
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY --from=frontend /app/dist ./dist

WORKDIR /app/backend
ENV PORT=8000
EXPOSE ${PORT}
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
