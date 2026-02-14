# Maritime Monitor - Deployment Guide

Complete instructions for deploying Maritime Monitor using GitHub Pages or Docker.

## Table of Contents

- [GitHub Pages Deployment](#github-pages-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Security Best Practices](#security-best-practices)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

The repository is configured with GitHub Actions to automatically deploy to GitHub Pages whenever you push to `main`.

#### Setup GitHub Pages

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set "Source" to "GitHub Actions"
   - Save changes

2. **Add API Keys as Secrets**:
   ```bash
   # Go to Settings > Secrets and variables > Actions
   # Add these secrets:
   AIS_HUB_API_KEY=your_key_here
   OPENWEATHER_API_KEY=your_key_here
   MARITIME_AWARENESS_API_KEY=recaap_rss_feed
   ```

3. **Deploy**:
   - Simply push to `main` branch
   - GitHub Actions automatically builds and deploys
   - View deployment at: `https://tdeletto.github.io/maritime-monitor`

#### Manual Deployment

```bash
# Build for production
npm run build

# This creates a `dist` folder ready for deployment
# GitHub Pages workflow automatically deploys this folder
```

### GitHub Pages Benefits

- ✅ **Free hosting** - No additional costs
- ✅ **Automatic HTTPS** - Secure by default
- ✅ **Custom domain support** - Use your own domain
- ✅ **Automatic rebuilds** - Deploy on every commit
- ✅ **Zero configuration** - Works out of the box

### GitHub Pages Limitations

- ❌ **No backend** - Frontend only
- ❌ **API calls limited** - CORS restrictions
- ❌ **No database** - State in browser only
- ❌ **Build time limit** - 10 minutes per build

**Workaround**: Use API proxy or backend service for production.

---

## Docker Deployment

### Local Development with Docker

```bash
# Build image
docker build -t maritime-monitor:latest .

# Run container
docker run -p 3000:3000 \
  -e VITE_AIS_HUB_API_KEY=your_key \
  -e VITE_OPENWEATHER_API_KEY=your_key \
  maritime-monitor:latest

# Access at http://localhost:3000
```

### Docker Compose (Recommended)

```bash
# Create .env file
cat > .env << EOF
VITE_AIS_HUB_API_KEY=your_key
VITE_OPENWEATHER_API_KEY=your_key
VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f maritime-monitor

# Stop services
docker-compose down
```

### Production Docker Deployment

#### AWS ECS

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name maritime-monitor

# 2. Build and push image
docker build -t maritime-monitor:latest .
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com
docker tag maritime-monitor:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/maritime-monitor:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/maritime-monitor:latest

# 3. Create ECS task definition and service
# (Use AWS Console or CloudFormation)
```

#### DigitalOcean App Platform

```bash
# 1. Connect repository to DigitalOcean
# - Go to https://cloud.digitalocean.com/apps
# - Click "Create App"
# - Select "GitHub" and authorize
# - Select maritime-monitor repository

# 2. Configure app
# - Set build command: npm run build
# - Set run command: npm run serve
# - Set environment variables from .env

# 3. Deploy automatically on push
```

#### Heroku

```bash
# 1. Install Heroku CLI
# 2. Login and create app
heroku login
heroku create maritime-monitor

# 3. Add Buildpack
heroku buildpacks:add heroku/nodejs

# 4. Set environment variables
heroku config:set VITE_AIS_HUB_API_KEY=your_key
heroku config:set VITE_OPENWEATHER_API_KEY=your_key

# 5. Deploy
git push heroku main
```

### Docker Health Checks

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View logs
docker logs maritime-monitor

# Inspect container
docker inspect maritime-monitor
```

---

## Environment Configuration

### Build-Time Variables

These variables are baked into the build:

```bash
# .env.local (not committed)
VITE_AIS_HUB_API_KEY=your_key
VITE_OPENWEATHER_API_KEY=your_key
VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed
```

### Runtime Variables (Docker)

For Docker, pass environment variables at runtime:

```bash
docker run -e VITE_AIS_HUB_API_KEY=key maritime-monitor:latest
```

### GitHub Actions Secrets

```yaml
# GitHub repository settings
Settings > Secrets and variables > Actions

AIS_HUB_API_KEY: your_key
OPENWEATHER_API_KEY: your_key
MARITIME_AWARENESS_API_KEY: recaap_rss_feed
```

---

## Security Best Practices

### API Key Protection

1. **Never commit keys**:
   ```bash
   # .gitignore should have:
   .env.local
   .env
   .env.*.local
   ```

2. **Use GitHub Secrets**:
   - Store sensitive data in GitHub Secrets
   - Reference in workflows: `${{ secrets.API_KEY }}`
   - Never print in logs

3. **Rotate keys regularly**:
   - Change API keys every 90 days
   - Use separate keys for dev/prod
   - Monitor API key usage

### Docker Security

1. **Run as non-root**:
   ```dockerfile
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

2. **Use minimal base images**:
   ```dockerfile
   FROM node:18-alpine  # Small footprint
   ```

3. **Scan for vulnerabilities**:
   ```bash
   docker scan maritime-monitor:latest
   npm audit
   ```

4. **Keep images updated**:
   ```bash
   docker pull node:18-alpine
   docker build --no-cache -t maritime-monitor:latest .
   ```

### Network Security

1. **HTTPS only**:
   - GitHub Pages: automatic HTTPS
   - Docker: use reverse proxy (nginx)
   - Set `Strict-Transport-Security` header

2. **CORS configuration**:
   - Restrict to trusted domains
   - Use API proxy for third-party APIs

3. **Rate limiting**:
   - Implement rate limiting in backend
   - Prevent DDoS attacks

---

## Monitoring and Maintenance

### GitHub Actions Monitoring

```bash
# View workflow runs
# GitHub > Actions tab

# Check deployment status
# GitHub > Deployments tab

# View logs
# Click workflow run > see detailed logs
```

### Docker Monitoring

```bash
# CPU and memory usage
docker stats maritime-monitor

# Uptime and restarts
docker ps -a --filter name=maritime-monitor

# View application logs
docker logs -f --tail 100 maritime-monitor
```

### Performance Monitoring

1. **Lighthouse audits**:
   ```bash
   # Use Chrome DevTools Lighthouse
   # Or: https://developers.google.com/speed/pagespeed/insights
   ```

2. **API performance**:
   - Monitor API response times
   - Track error rates
   - Alert on degradation

3. **Data updates**:
   - Monitor vessel count
   - Check weather data freshness
   - Verify incident retrieval

### Maintenance Tasks

```bash
# Weekly
- Review error logs
- Check API quotas
- Verify data freshness

# Monthly
- Rotate API keys
- Update dependencies
- Run security audits

# Quarterly
- Backup configuration
- Update base images
- Performance review
```

### Troubleshooting

#### GitHub Pages Not Updating

```bash
# Check build logs
# GitHub > Actions > Latest workflow

# Rebuild manually
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

#### Docker Container Won't Start

```bash
# Check logs
docker logs maritime-monitor

# Rebuild image
docker build --no-cache -t maritime-monitor:latest .

# Run with verbose output
docker run -it maritime-monitor:latest
```

#### API Keys Not Working

```bash
# Verify environment variables
docker exec maritime-monitor env | grep VITE_

# Check .env file
cat .env.local

# Test API endpoints
curl -v https://www.aishub.net/api/v2/vessels
```

---

## Advanced Deployment

### Kubernetes Deployment

```yaml
# maritime-monitor-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: maritime-monitor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: maritime-monitor
  template:
    metadata:
      labels:
        app: maritime-monitor
    spec:
      containers:
      - name: maritime-monitor
        image: maritime-monitor:latest
        ports:
        - containerPort: 3000
        env:
        - name: VITE_AIS_HUB_API_KEY
          valueFrom:
            secretKeyRef:
              name: maritime-secrets
              key: ais-hub-key
```

### CI/CD Pipeline

```yaml
# Include in GitHub Actions workflow
- name: Run tests
  run: npm run test

- name: Run linter
  run: npm run lint

- name: Security scan
  run: npm audit

- name: Build
  run: npm run build

- name: Deploy
  run: |
    docker build -t maritime-monitor:${{ github.sha }} .
    docker push maritime-monitor:${{ github.sha }}
```

---

## Deployment Checklist

- [ ] All API keys configured
- [ ] Environment variables set in deployment platform
- [ ] GitHub Secrets added (for GitHub Pages)
- [ ] Docker image built and tested
- [ ] Health checks configured
- [ ] SSL/TLS enabled (HTTPS)
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Support and Resources

- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Repository**: https://github.com/tdeletto/maritime-monitor
- **Issues**: https://github.com/tdeletto/maritime-monitor/issues

---

**Last Updated**: February 14, 2026
