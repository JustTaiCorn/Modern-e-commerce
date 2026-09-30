#!/bin/bash
set -e

echo "=== [1/5] Stopping old containers..."
docker compose -f release-docker-compose.yaml down

echo "=== [2/5] Pulling new images from Docker Hub..."
docker compose -f release-docker-compose.yaml pull

echo "=== [3/5] Starting containers..."
nohup docker compose -f release-docker-compose.yaml up -d > deploy.log 2>&1 &

echo "=== [4/5] Waiting for backend to become healthy..."
for i in $(seq 1 20); do
  status=$(docker inspect --format='{{.State.Health.Status}}' \
    $(docker compose -f release-docker-compose.yaml ps -q backend_service) 2>/dev/null || echo "starting")
  if [ "$status" = "healthy" ]; then
    echo "✅ Backend is healthy!"
    break
  fi
  echo "   Attempt $i/20 — status: $status"
  sleep 5
done

if [ "$status" != "healthy" ]; then
  echo "❌ Backend did not become healthy in time. Check logs:"
  echo "   docker compose -f release-docker-compose.yaml logs backend_service"
  exit 1
fi

echo "=== [5/5] Pruning old images (keep last 72h)..."
docker image prune -f --filter "until=72h"

echo ""
echo "=== Deploy complete! Current images:"
docker images | head -20
