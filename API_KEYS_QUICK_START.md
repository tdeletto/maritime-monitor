# API Keys - Quick Start Guide

## ⚡ TL;DR - 5 Minute Setup

### Option 1: Automated Setup (Recommended)

**macOS/Linux:**
```bash
bash scripts/setup-env.sh
```

**Windows:**
```cmd
scripts\setup-env.bat
```

The interactive wizard will guide you through API key configuration.

### Option 2: Manual Setup

1. **Copy template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` with your API keys:**
   ```bash
   nano .env.local  # macOS/Linux
   # or
   notepad .env.local  # Windows
   ```

3. **Add your API keys:**
   ```env
   VITE_AIS_HUB_API_KEY=your_key_here
   VITE_OPENWEATHER_API_KEY=your_key_here
   VITE_MARITIME_AWARENESS_API_KEY=your_key_here
   ```

4. **Start the app:**
   ```bash
   npm run dev
   ```

---

## 1️⃣ AIS Hub API (Vessel Tracking)

| Item | Value |
|------|-------|
| **Service** | https://www.aishub.net/ |
| **Sign Up Time** | 5 minutes |
| **Cost** | Free |
| **Rate Limit** | 100 requests/hour |
| **Key Format** | Alphanumeric, ~20 chars |

### Quick Setup
1. Go to https://www.aishub.net/
2. Sign up → Confirm email
3. Dashboard → API → Copy key
4. Paste in `.env.local` as `VITE_AIS_HUB_API_KEY`

**Docs:** https://www.aishub.net/api

---

## 2️⃣ OpenWeather API (Maritime Weather)

| Item | Value |
|------|-------|
| **Service** | https://openweathermap.org/ |
| **Sign Up Time** | 3 minutes |
| **Cost** | Free |
| **Rate Limit** | 60 calls/minute, 1M/month |
| **Key Format** | Alphanumeric, 32 chars |

### Quick Setup
1. Go to https://openweathermap.org/
2. Sign up → Confirm email
3. Account → My API keys → Copy default key
4. Paste in `.env.local` as `VITE_OPENWEATHER_API_KEY`

**Docs:** https://openweathermap.org/api

---

## 3️⃣ Maritime Awareness (Security Data)

### Fastest Option: ReCAAP ISC (Free, No Setup)

| Item | Value |
|------|-------|
| **Service** | https://www.recaap.org/ |
| **Sign Up Time** | 0 minutes (public RSS) |
| **Cost** | Free |
| **Data** | Southeast Asia piracy/security incidents |

**Configuration:**
```env
VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed
VITE_MARITIME_AWARENESS_API_URL=https://www.recaap.org/rss
```

No additional setup needed! ReCAAP provides free public RSS feeds.

### Other Options

| Provider | Cost | Setup Time | Coverage |
|----------|------|-----------|----------|
| **IMO GISIS** | Free | 1-2 weeks | Global (institutional) |
| **Marine Traffic** | $99+/month | 5 min | Global (commercial) |
| **Custom Feed** | Varies | 10+ min | Custom |

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Start development server
npm run dev

# 2. Open browser to http://localhost:5173

# 3. Check browser console (Press F12)
#    Should see:
#    - "[Maritime Monitor] Initializing application..."
#    - "[Maritime Monitor] Application initialized successfully"
#    - No errors about missing API keys

# 4. Verify layers toggle in left panel
#    All 5 maritime layers should be available

# 5. Monitor Network tab (F12 > Network)
#    Should see API requests to:
#    - api.aishub.net (AIS Hub)
#    - api.openweathermap.org (OpenWeather)
#    - Your maritime data source
```

### Troubleshooting

**Issue**: "Cannot find module 'dotenv'"
- Solution: `.env.local` must be in project root
- Verify: `ls -la | grep .env.local`

**Issue**: API key errors in console
- Solution: Restart dev server after editing `.env.local`
- Run: `npm run dev` (CTRL+C to stop, then restart)

**Issue**: "Rate limit exceeded" (429 errors)
- Solution: Increase update intervals in `.env.local`
- Change: `VITE_AIS_UPDATE_INTERVAL=120000` (2 minutes instead of 1)

**Issue**: API returns 401 Unauthorized
- Solution: Verify API key is correct and complete
- Check: No extra spaces or truncated key
- Regenerate: Go to provider dashboard and create new key

---

## 🔒 Security Notes

⚠ **Critical**: API keys are secrets

- [ ] `.env.local` is in `.gitignore` (DO NOT COMMIT)
- [ ] Never share API keys in chat, email, or pull requests
- [ ] Rotate keys every 3 months
- [ ] Use strong, unique API keys
- [ ] Monitor API usage for unauthorized access
- [ ] For production, use backend proxy (keys hidden from client)

### Secure API Key Rotation

```bash
# 1. Go to provider dashboard (AIS Hub, OpenWeather, etc.)
# 2. Generate new API key
# 3. Update .env.local with new key
# 4. Test: npm run dev
# 5. Once working, delete old key from provider
```

---

## 📚 Full Documentation

- **Detailed Setup Guide**: See `.env.setup.md`
- **Configuration Reference**: See `.env.local.example`
- **Project Setup**: See `SETUP_GUIDE.md`
- **Main README**: See `README.md`

---

## 📄 Environment Variables Reference

### Required
```env
# At least one of these (for data to work):
VITE_AIS_HUB_API_KEY=          # AIS vessel tracking
VITE_OPENWEATHER_API_KEY=      # Maritime weather
VITE_MARITIME_AWARENESS_API_KEY= # Security data
```

### Optional
```env
# Update intervals (milliseconds)
VITE_AIS_UPDATE_INTERVAL=60000         # Default: 60 seconds
VITE_WEATHER_UPDATE_INTERVAL=600000    # Default: 10 minutes
VITE_SECURITY_UPDATE_INTERVAL=300000   # Default: 5 minutes

# Map settings
VITE_MAP_CENTER_LAT=0
VITE_MAP_CENTER_LON=20
VITE_MAP_DEFAULT_ZOOM=2

# Thresholds
VITE_WEATHER_ALERT_THRESHOLD=6         # Beaufort scale (0-12)
VITE_SECURITY_ALERT_THRESHOLD=medium   # low/medium/high/critical
```

---

## 🚀 Getting Started

```bash
# 1. Clone repository
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor

# 2. Install dependencies
npm install

# 3. Setup API keys (pick one method)
# Method A: Automated (recommended)
bash scripts/setup-env.sh
# Method B: Manual
cp .env.local.example .env.local
# Edit .env.local with your API keys

# 4. Start development
npm run dev

# 5. Open browser
# Visit: http://localhost:5173
```

---

## 🤙 Need Help?

- **General questions**: Check `.env.setup.md` for detailed guide
- **API issues**: Visit provider documentation links above
- **Project issues**: https://github.com/tdeletto/maritime-monitor/issues
- **Configuration questions**: Review `.env.local.example` comments

---

**Last Updated:** February 2026
