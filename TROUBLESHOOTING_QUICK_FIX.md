# Maritime Monitor - Quick Fix Guide

**Last Updated**: February 14, 2026  
**Status**: ✅ Common Issues Resolved

---

## Issue 1: `tsconfig.node.json` Not Found

### Error
```
TSConfckParseError: Failed to scan for dependencies from entries:
  parsing /Users/.../maritime-monitor/tsconfig.node.json failed:
  Error: ENOENT: no such file or directory
```

### Solution
✅ **FIXED** - File now included in repository

**What you need to do:**
```bash
# Pull latest changes
git pull origin main

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

**Why this happened:**
- Vite configuration references `tsconfig.node.json`
- File was missing from initial commit
- Now included: [tsconfig.node.json](./tsconfig.node.json)

---

## Issue 2: `leaflet-fullscreen@^3.0.0` Not Found

### Error
```
npm error code ETARGET
npm error notarget No matching version found for leaflet-fullscreen@^3.0.0
```

### Solution
✅ **FIXED** - Updated to valid version `^2.4.5`

**What you need to do:**
```bash
# Pull latest changes (includes fixed package.json)
git pull origin main

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm list leaflet-fullscreen
# Should show: leaflet-fullscreen@2.4.5
```

**Why this happened:**
- Version `^3.0.0` doesn't exist on npm
- `leaflet-fullscreen` latest stable is `2.4.5`
- Package.json has been corrected

**Valid Leaflet packages installed:**
- ✅ `leaflet@^1.9.4` - Core map library
- ✅ `leaflet-draw@^1.0.4` - Drawing tools
- ✅ `leaflet-fullscreen@^2.4.5` - Fullscreen mode
- ✅ `leaflet.markercluster@^1.5.1` - Marker clustering

---

## Issue 3: Shell Comment Syntax Error

### Error
```
zsh: command not found: #
zsh: missing end of string
zsh: number expected
```

### Solution
⚠️ **USER ERROR** - Copy-paste issue with comments

**What happened:**
- You copied code blocks that included `#` comments
- Shell interpreted `#` as a command (not a comment)
- Some quotes weren't properly closed

**How to fix:**

**Option A: Run commands separately (recommended)**
```bash
# Paste each line or command block individually
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor
npm install

# Then these three are separate commands:
cp .env.local.example .env.local
npm run dev
```

**Option B: Remove comments before pasting**
```bash
# Original (with comments):
git clone https://github.com/tdeletto/maritime-monitor.git  # Clone repo
cd maritime-monitor  # Enter directory
npm install  # Install dependencies

# What to paste (comments removed):
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor
npm install
```

**Option C: Use a script file**
```bash
# Create setup.sh
cat > setup.sh << 'EOF'
#!/bin/bash
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor
npm install
cp .env.local.example .env.local
npm run dev
EOF

# Make executable and run
chmod +x setup.sh
./setup.sh
```

---

## Fresh Start (Recommended)

If you're still experiencing issues, do a clean setup:

```bash
# 1. Remove old directories
rm -rf maritime-monitor
rm -rf ~/.npm  # (optional, clears npm cache)

# 2. Fresh clone
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor

# 3. Verify files exist
ls -la tsconfig.node.json
cat package.json | grep leaflet-fullscreen

# 4. Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 5. Verify all is well
npm run type-check

# 6. Start dev server
npm run dev
```

---

## Verification Steps

### ✅ Check 1: Files Exist
```bash
ls -la tsconfig.node.json
ls -la tsconfig.json
ls -la vite.config.ts
ls -la package.json
```

**Expected output:** Each file should exist and show timestamps

### ✅ Check 2: Dependencies Installed
```bash
npm list leaflet
npm list leaflet-fullscreen
npm list zustand
npm list axios
```

**Expected output:**
```
maritimes-monitor@1.0.0
├── leaflet@1.9.4
├── leaflet-fullscreen@2.4.5
├── zustand@4.4.1
└── axios@1.6.2
```

### ✅ Check 3: Type Checking
```bash
npm run type-check
```

**Expected output:**
```
Found 0 errors. Watching for file changes.
```

### ✅ Check 4: Start Dev Server
```bash
npm run dev
```

**Expected output:**
```
VITE v5.0.7  ready in 252 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

If you see this, you're good to go! 🎉

---

## Environment Configuration

### Create .env.local File

```bash
# 1. Copy example
cp .env.local.example .env.local

# 2. Add your API keys
echo "VITE_AIS_HUB_API_KEY=your_key_here" >> .env.local
echo "VITE_OPENWEATHER_API_KEY=your_key_here" >> .env.local

# 3. Verify
cat .env.local
```

### Getting API Keys

**AIS Hub:**
- Visit: https://www.aishub.net/
- Register → Account → API Key
- Copy your alphanumeric key (~20 characters)

**OpenWeather:**
- Visit: https://openweathermap.org/
- Sign Up → API Keys section
- Copy "Default" key (32-character hexadecimal)

---

## Advanced Troubleshooting

### Clear Everything and Start Over
```bash
# Nuclear option - complete clean slate
cd ~
rm -rf maritime-monitor
rm -rf ~/.npm
rm -rf ~/.cache/node-gyp

# Fresh install
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor
npm ci  # ci = clean install (uses lock file)
npm run dev
```

### Check npm Version
```bash
npm --version
# Should be 9.0.0 or higher

# If outdated:
sudo npm install -g npm@latest
```

### Check Node Version
```bash
node --version
# Should be 18.0.0 or higher

# If outdated, use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Check Vite Installation
```bash
npm list vite
# Should show vite@5.0.7 or higher

# If missing or wrong version:
npm install vite@latest --save-dev
```

---

## Still Having Issues?

1. **Check Node/npm versions:** `node --version` && `npm --version`
2. **Verify file existence:** `ls -la tsconfig.node.json`
3. **Check package.json:** `cat package.json | grep leaflet`
4. **Run clean install:** `rm -rf node_modules && npm install`
5. **Open an issue:** https://github.com/tdeletto/maritime-monitor/issues

---

## Next Steps

✅ All fixes applied to main branch
✅ Fresh clone will have all fixes
✅ Run `git pull` if you have existing clone
✅ Follow verification steps above
✅ Start with `npm run dev`

**You're ready to go!** 🚀
