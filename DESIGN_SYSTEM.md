# Tapverse Design System - Apple-Inspired Light Theme

## 🎨 Color Palette

### Primary Orange (Logo Color)
- **Orange 500:** `#ff4f00` - Primary brand color (exact logo color - main actions, highlights)
- **Orange 400:** `#ff8049` - Hover states (lighter orange)
- **Orange 600:** `#e64700` - Active/pressed states (darker orange)
- **Orange 50:** `#fff4f0` - Background highlights (subtle orange tint)

### Neutral Grays (Apple-inspired)
- **Gray 50:** `#fafafa` - Page background
- **Gray 100:** `#f5f5f5` - Card backgrounds, hover states
- **Gray 200:** `#e5e5e5` - Borders, dividers
- **Gray 300:** `#d4d4d4` - Subtle borders

### Text Colors
- **Text Primary:** `#1d1d1f` - Main text
- **Text Secondary:** `#6e6e73` - Secondary text, labels
- **Text Tertiary:** `#86868b` - Tertiary text, placeholders

### Background Colors
- **Background Primary:** `#ffffff` - Cards, panels
- **Background Secondary:** `#fafafa` - Page background
- **Background Tertiary:** `#f5f5f5` - Alternate backgrounds

## 🔤 Typography

### Font Family
**Primary:** `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, Helvetica Neue, Arial`

**Code:** `'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New'`

### Font Features
- `-webkit-font-smoothing: antialiased`
- `text-rendering: optimizeLegibility`
- Font feature: `"kern" 1`

## 📐 Spacing & Layout

### Border Radius
- **Small:** `12px` (buttons, inputs)
- **Large:** `18px` (cards, panels)

### Shadows (Apple-like subtle)
- **Small:** `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Medium:** `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **Large:** `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

### Transitions
- **Default:** `transition-all duration-200`
- **Smooth:** `transition-all duration-300 ease-in-out`

## 🎯 Component Styles

### Buttons

**Primary Button:**
```css
bg-orange-500 text-white px-6 py-2.5 rounded-apple font-medium
hover:bg-orange-600 active:bg-orange-700
shadow-apple hover:shadow-apple-lg
```

**Secondary Button:**
```css
bg-white text-text-primary px-6 py-2.5 rounded-apple font-medium
border border-gray-300 hover:bg-gray-50 active:bg-gray-100
shadow-apple hover:shadow-apple-lg
```

**Ghost Button:**
```css
text-text-secondary px-4 py-2 rounded-apple font-medium
hover:bg-gray-100 active:bg-gray-200
```

### Cards

**Standard Card:**
```css
bg-white rounded-apple-lg border border-gray-200 shadow-apple
p-6 transition-all duration-200 hover:shadow-apple-lg
```

**Hover Card:**
```css
card hover:border-orange-200 hover:shadow-apple-xl
```

### Inputs

```css
w-full px-4 py-2.5 bg-white border border-gray-300 rounded-apple
text-text-primary placeholder-text-tertiary
focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
```

### Tables

```css
table th: bg-gray-50 border-b border-gray-200
table td: border-b border-gray-100
table tr:hover: bg-gray-50
```

## 📱 Sidebar (Collapsible)

### States
- **Expanded:** `w-64` (256px)
- **Collapsed:** `w-16` (64px)

### Navigation Item Active State
```css
bg-orange-50 text-orange-600 border border-orange-200
```

### Navigation Item Hover State
```css
hover:bg-gray-100 hover:text-text-primary
```

## 🖼️ Logo & Assets

### Logo Placement
- Header/Sidebar: `/logo.png`
- Recommended size: 200x60px (or similar aspect ratio)
- Format: PNG with transparent background

### Favicon
- Path: `/favicon.png`
- Recommended size: 32x32px or 64x64px
- Format: PNG

## ✨ Apple Design Principles

1. **Clarity:** Clear hierarchy, readable typography
2. **Deference:** Content first, UI supports content
3. **Depth:** Subtle shadows, layering, smooth transitions
4. **Consistency:** Reusable patterns, predictable interactions
5. **Minimalism:** Clean, uncluttered, purposeful design

## 🚫 What We DON'T Have

- ❌ Dark mode / Night mode (Day mode only)
- ❌ Heavy shadows or gradients
- ❌ Overly bold colors (except primary orange)
- ❌ Unnecessary animations
- ❌ Cluttered interfaces

## 📋 Usage Examples

### Example Card
```jsx
<div className="card">
  <h3 className="text-lg font-semibold text-text-primary mb-2">Title</h3>
  <p className="text-text-secondary">Content here</p>
</div>
```

### Example Button
```jsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
```

### Example Input
```jsx
<input type="text" className="input" placeholder="Enter text..." />
```
