# Deployment Guide

## Production Deployment Checklist

### 1. Environment Setup

#### Required Services
- [ ] PostgreSQL database (RDS, managed service, or self-hosted)
- [ ] Redis instance (ElastiCache, managed service, or self-hosted)
- [ ] S3 bucket (AWS S3 or S3-compatible)
- [ ] Domain name with SSL certificate

#### Environment Variables
Update `.env` with production values:
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
REDIS_URL="redis://host:6379"
AWS_S3_BUCKET="mh26-services-prod"
RAZORPAY_KEY_ID="prod_key_id"
RAZORPAY_KEY_SECRET="prod_key_secret"
CORS_ORIGIN="https://yourdomain.com"
```

### 2. Database Migration

```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate:deploy

# Seed initial data (if needed)
npm run seed
```

### 3. Build Application

```bash
# Install dependencies
npm ci

# Build TypeScript
npm run build

# Verify build
ls -la dist/
```

### 4. Process Manager

#### Using PM2
```bash
npm install -g pm2

# Start application
pm2 start dist/index.js --name mh26-api

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Docker
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 5. Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/mh26-api
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL Certificate

```bash
# Using Let's Encrypt
sudo certbot --nginx -d api.yourdomain.com
```

### 7. Monitoring Setup

#### Health Check
```bash
# Add to monitoring service
curl https://api.yourdomain.com/healthz
```

#### Sentry Integration
1. Create Sentry project
2. Add DSN to `.env`:
   ```
   SENTRY_DSN="https://xxx@sentry.io/xxx"
   ```
3. Update code to initialize Sentry

#### Logging
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Set up log rotation
- Consider CloudWatch, Datadog, or similar

### 8. Backup Strategy

#### Database Backups
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_*.sql s3://backups/mh26-db/
```

#### Automated Backups
- Set up cron job for daily backups
- Retain backups for 30 days
- Test restore procedure

### 9. Security Hardening

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable firewall (only allow 80, 443, SSH)
- [ ] Disable root SSH login
- [ ] Set up fail2ban
- [ ] Regular security updates
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure CORS properly

### 10. Performance Optimization

#### Database
- [ ] Enable connection pooling
- [ ] Add read replicas if needed
- [ ] Monitor slow queries
- [ ] Regular VACUUM and ANALYZE

#### Redis
- [ ] Enable persistence (RDB or AOF)
- [ ] Set up Redis Cluster for HA
- [ ] Monitor memory usage

#### Application
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Monitor response times

## Deployment Platforms

### AWS (EC2 + RDS + ElastiCache)
1. Launch EC2 instance
2. Set up RDS PostgreSQL
3. Set up ElastiCache Redis
4. Configure S3 bucket
5. Set up Application Load Balancer
6. Configure Auto Scaling

### Railway / Render / Fly.io
1. Connect GitHub repository
2. Set environment variables
3. Configure database addon
4. Deploy

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: mh26_services
      POSTGRES_USER: mh26_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Post-Deployment

### Verify Deployment
```bash
# Health check
curl https://api.yourdomain.com/healthz

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com",...}'

# Test providers endpoint
curl https://api.yourdomain.com/api/providers
```

### Monitoring
- Set up uptime monitoring
- Configure alerts for errors
- Monitor API response times
- Track database performance
- Monitor Redis usage

### Maintenance
- Regular security updates
- Database maintenance
- Log rotation
- Backup verification
- Performance tuning

---

**Ready for production! 🚀**

