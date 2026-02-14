# Maritime Monitor - Recovery Steps

**Date**: February 14, 2026  
**Status**: All fixes applied ✅  
**Action Required**: Run commands below to recover

---

## What Went Wrong

Your initial clone had two issues:

1. ❌ **Missing `tsconfig.node.json`** - Vite configuration file
2. ❌ **Invalid package version** - `leaflet-fullscreen@^3.0.0` doesn't exist
3. ❌ **Shell syntax error** - Copy-paste comments caused zsh errors

**All fixed in main branch!** ✅

---

## Quick Recovery (5 minutes)

### Option 1: Start Fresh (Recommended)

```bash
# 1. Remove old broken directory
rm -rf maritime-monitor

# 2. Fresh clone from main branch
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor

# 3. Verify fixes are in place
ls -la tsconfig.node.json  # Should exist now ✓
grep 'leaflet-fullscreen' package.json  # Should show ^2.4.5 ✓

# 4. Clean install (remove old cache)
rm -rf node_modules package-lock.json
npm install

# 5. Start development server
npm run dev
```

**Expected result:**
```
VITE v5.0.7  ready in 252 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.154:5173/
```

### Option 2: Use Quick Start Script

```bash
# If you already have the new version cloned:
cd maritime-monitor

# Make script executable
chmod +x QUICK_START.sh

# Run it
./QUICK_START.sh

# Script will:
# ✓ Check Node/npm versions
# ✓ Remove old node_modules
# ✓ Clean install dependencies
# ✓ Verify all files exist
# ✓ Set up .env.local
# ✓ Run type checking
```

### Option 3: Update Existing Clone

If you have the old clone:

```bash
cd maritime-monitor

# Pull latest changes
git pull origin main

# Verify new files downloaded
ls -la tsconfig.node.json
grep 'leaflet-fullscreen' package.json

# Force clean reinstall
rm -rf node_modules package-lock.json npm-cache
npm cache clean --force
npm install

# Verify
npm run type-check

# Start
npm run dev
```

---

## What Was Fixed

### ✅ Fix #1: Added `tsconfig.node.json`

**File**: [tsconfig.node.json](./tsconfig.node.json)

**Purpose**: Vite configuration for building (`vite.config.ts`)

**Content**:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### ✅ Fix #2: Updated `package.json`

**File**: [package.json](./package.json)

**Changes**:
- `leaflet-fullscreen@^3.0.0` → `leaflet-fullscreen@^2.4.5` ✓ (version exists)
- Added `leaflet.markercluster@^1.5.1` (marker clustering)
- Added `zustand@^4.4.1` (state management)
- Added `axios@^1.6.2` (HTTP requests)
- Added `tailwindcss@^3.4.1` (styling)

**All valid, published versions** ✓

### ✅ Fix #3: Added Documentation

- [TROUBLESHOOTING_QUICK_FIX.md](./TROUBLESHOOTING_QUICK_FIX.md) - Common issues & solutions
- [QUICK_START.sh](./QUICK_START.sh) - Automated setup script
- [RECOVERY_STEPS.md](./RECOVERY_STEPS.md) - This file!

---

## Verification Checklist

After running recovery steps, verify everything works:

### ✓ Check 1: Files Present
```bash
ls -la tsconfig.node.json
ls -la tsconfig.json
ls -la vite.config.ts
ls -la package.json
```

**Expected**: All files listed with recent timestamps

### ✓ Check 2: Correct Package Versions
```bash
npm list leaflet leaflet-fullscreen zustand axios
```

**Expected output**:
```
maritimes-monitor@1.0.0
├─ leaflet@1.9.4
├─ leaflet-fullscreen@2.4.5
├─ zustand@4.4.1
└─ axios@1.6.2
```

### ✓ Check 3: Type Checking
```bash
npm run type-check
```

**Expected**: No errors (or 0 errors found)

### ✓ Check 4: Development Server Starts
```bash
npm run dev
```

**Expected**:
```
VITE v5.0.7 ready in 252 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.154:5173/
➜  press h + enter to show help
```

✅ **If you see this, you're good!**

---

## Environment Configuration

### Create `.env.local`

```bash
# Copy example file
cp .env.local.example .env.local

# Verify it was created
cat .env.local

# Should show:
# VITE_AIS_HUB_API_KEY=
# VITE_OPENWEATHER_API_KEY=
# VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed
```

### Get Your API Keys

**AIS Hub API Key** (vessel tracking):
1. Go to https://www.aishub.net/
2. Click "Register"
3. Create account and verify email
4. Go to "Account" → "API Key"
5. Copy your key (alphanumeric, ~20 chars)
6. Add to `.env.local`:
   ```
   VITE_AIS_HUB_API_KEY=your_key_here
   ```

**OpenWeather API Key** (weather data):
1. Go to https://openweathermap.org/
2. Click "Sign Up"
3. Create account
4. Go to "API Keys" section
5. Copy "Default" key (32-char hex)
6. Add to `.env.local`:
   ```
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

**ReCAAP** (maritime security):
- Already configured: `VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed`
- No API key needed (public RSS feed)

---

## Troubleshooting

### Still Getting `tsconfig.node.json` Error?

```bash
# Verify file exists
file tsconfig.node.json
# Should show: ASCII text

# If missing, you have old version:
git status
# Should show you're on main branch and up to date

# If not up to date:
git pull origin main
git status  # Should say "up to date"

# Then clean reinstall:
rm -rf node_modules
npm install
```

### Still Getting Leaflet Version Error?

```bash
# Check current package.json
grep 'leaflet-fullscreen' package.json
# Should show: "leaflet-fullscreen": "^2.4.5"

# If still shows ^3.0.0:
git pull origin main
cat package.json | grep leaflet-fullscreen

# Clean reinstall:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Getting npm Permission Errors?

```bash
# Use sudo (not ideal but works)
sudo npm install

# Or fix npm permissions (better):
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to ~/.zshrc or ~/.bashrc:
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Then try again
npm install
```

---

## Next Steps

✅ **After successful recovery:**

1. Start dev server: `npm run dev`
2. Open http://localhost:5173 in browser
3. Add your API keys to `.env.local`
4. Explore the application
5. Read [BUILD_AND_RUN.md](./BUILD_AND_RUN.md) for full documentation

---

## Additional Resources

- [BUILD_AND_RUN.md](./BUILD_AND_RUN.md) - Complete build & run guide
- [TROUBLESHOOTING_QUICK_FIX.md](./TROUBLESHOOTING_QUICK_FIX.md) - All common issues
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Feature overview
- [GitHub Issues](https://github.com/tdeletto/maritime-monitor/issues) - Report problems

---

## Summary of Changes

| What | Before | After | Status |
|------|--------|-------|--------|
| `tsconfig.node.json` | ❌ Missing | ✅ Included | Fixed |
| `leaflet-fullscreen` version | ❌ `^3.0.0` (doesn't exist) | ✅ `^2.4.5` (exists) | Fixed |
| State management | ❌ Missing | ✅ `zustand@4.4.1` | Added |
| HTTP client | ❌ Missing | ✅ `axios@1.6.2` | Added |
| Marker clustering | ❌ Missing | ✅ `leaflet.markercluster@1.5.1` | Added |
| Setup automation | ❌ Manual | ✅ `QUICK_START.sh` | Added |
| Troubleshooting guide | ❌ None | ✅ Full documentation | Added |

---

**Your project is now ready to run!** 🚀

Run these commands to get started:

```bash
cd maritime-monitor
npm install
npm run dev
```

Open http://localhost:5173 and you should see the application loading! 🎉
