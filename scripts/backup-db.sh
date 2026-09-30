#!/bin/bash
set -e

DATE=$(date +%F_%H-%M)
BACKUP_DIR=/opt/ecommerce/backups
COMPOSE_DIR=/home/ec2-user/ecommerce/deployment/release

mkdir -p "$BACKUP_DIR"

# Nạp thông tin cấu hình từ file .env
if [ -f "$COMPOSE_DIR/.env" ]; then
  export $(grep -v '^#' "$COMPOSE_DIR/.env" | xargs)
fi

DB_USER=${POSTGRES_USER:-app_user}
DB_NAME=${POSTGRES_DB:-ecommerce}

# Tạo bản sao lưu logical nén định dạng custom (-Fc)
docker compose -f "$COMPOSE_DIR/release-docker-compose.yaml" exec -T postgres_service \
  pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc \
  > "$BACKUP_DIR/backup_$DATE.dump"

# Tự động dọn dẹp các bản backup cũ hơn 14 ngày
find "$BACKUP_DIR" -name "backup_*.dump" -mtime +14 -delete

echo "[$DATE] Backup completed successfully: $BACKUP_DIR/backup_$DATE.dump"
