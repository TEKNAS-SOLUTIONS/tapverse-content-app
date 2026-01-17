# Required Assets - Logo & Favicon

## ⚠️ MISSING ASSETS

The following files are **REQUIRED** but **MISSING** from `frontend/public/`:

1. **`logo.png`** - Main logo file
   - **Location:** `frontend/public/logo.png`
   - **Referenced in:**
     - `frontend/src/components/Layout.jsx` (Line 98)
     - `frontend/index.html` (Line 6) - as apple-touch-icon
   - **Recommended size:** 200x60px (or similar aspect ratio)
   - **Format:** PNG with transparent background
   - **Current status:** ❌ MISSING - Fallback text "Tapverse" displays

2. **`favicon.png`** - Browser favicon
   - **Location:** `frontend/public/favicon.png`
   - **Referenced in:**
     - `frontend/index.html` (Line 5)
   - **Recommended size:** 32x32px or 64x64px
   - **Format:** PNG or ICO
   - **Current status:** ❌ MISSING - Browser shows default favicon

---

## 📋 Action Required

**PLEASE PLACE THESE FILES:**
1. Add `logo.png` to `frontend/public/logo.png`
2. Add `favicon.png` to `frontend/public/favicon.png`

**OR** if you have different file names:
- Update `frontend/src/components/Layout.jsx` to reference correct logo filename
- Update `frontend/index.html` to reference correct favicon filename

---

## ✅ Current Fallback Behavior

- **Logo:** Falls back to text "Tapverse" if `logo.png` fails to load
- **Favicon:** Browser shows default favicon if `favicon.png` is missing

---

## 🎨 Design Requirements

Per DESIGN_SYSTEM.md:
- **Logo:** Should use primary orange color `#ff4f00`
- **Favicon:** Should be simplified version of logo (recognizable at small size)
- **Format:** PNG with transparent background preferred
- **Style:** Apple-inspired, clean, minimalist

---

**Status:** ⚠️ Assets missing - Please add logo.png and favicon.png to `frontend/public/`
