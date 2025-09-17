#!/bin/bash
# 💾 生产环境备份脚本
# 用于备份数据库、Redis数据和配置文件

echo "💾 Starting production backup process..."

# 设置备份目录
BACKUP_BASE_DIR="/backups"
BACKUP_DIR="$BACKUP_BASE_DIR/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Backup directory: $BACKUP_DIR"

# 备份数据库
echo "🗄️ Backing up production database..."
if docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U postgres planning_engine_prod > "$BACKUP_DIR/database.sql"; then
    echo "✅ Database backup completed"
else
    echo "❌ Database backup failed"
    exit 1
fi

# 备份Redis数据
echo "🔴 Backing up Redis data..."
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli --rdb /data/backup.rdb; then
    docker cp $(docker-compose -f docker-compose.production.yml ps -q redis):/data/backup.rdb "$BACKUP_DIR/redis.rdb"
    echo "✅ Redis backup completed"
else
    echo "❌ Redis backup failed"
    exit 1
fi

# 备份配置文件
echo "⚙️ Backing up configuration files..."
cp -r . "$BACKUP_DIR/config" 2>/dev/null || true
cp .env.production "$BACKUP_DIR/" 2>/dev/null || true
cp docker-compose.production.yml "$BACKUP_DIR/" 2>/dev/null || true

# 备份日志文件
echo "📝 Backing up log files..."
mkdir -p "$BACKUP_DIR/logs"
docker-compose -f docker-compose.production.yml logs > "$BACKUP_DIR/logs/container-logs.txt" 2>/dev/null || true

# 备份监控配置
echo "📊 Backing up monitoring configuration..."
mkdir -p "$BACKUP_DIR/monitoring"
cp -r ../monitoring/* "$BACKUP_DIR/monitoring/" 2>/dev/null || true

# 压缩备份
echo "📦 Compressing backup..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .

if [ $? -eq 0 ]; then
    echo "✅ Backup compressed successfully"
    echo "📁 Backup file: $BACKUP_DIR.tar.gz"
else
    echo "❌ Backup compression failed"
    exit 1
fi

# 上传到云存储（如果配置了）
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "☁️ Uploading backup to S3..."
    if aws s3 cp "$BACKUP_DIR.tar.gz" "s3://$AWS_S3_BUCKET/backups/"; then
        echo "✅ Backup uploaded to S3"
    else
        echo "❌ S3 upload failed"
    fi
fi

# 清理旧备份（保留最近7天）
echo "🧹 Cleaning up old backups..."
find "$BACKUP_BASE_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

# 清理临时目录
rm -rf "$BACKUP_DIR"

# 显示备份信息
BACKUP_SIZE=$(du -h "$BACKUP_DIR.tar.gz" | cut -f1)
echo ""
echo "✅ Production backup completed successfully!"
echo "📁 Backup file: $BACKUP_DIR.tar.gz"
echo "📊 Backup size: $BACKUP_SIZE"
echo "🕒 Backup time: $(date)"
echo ""
echo "📋 Backup contents:"
echo "   - Database: database.sql"
echo "   - Redis: redis.rdb"
echo "   - Configuration: config/"
echo "   - Logs: logs/"
echo "   - Monitoring: monitoring/"
echo ""
echo "🔄 To restore from backup:"
echo "   tar -xzf $BACKUP_DIR.tar.gz"
echo "   # Then follow restore procedures for each component"
