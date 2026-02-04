# 🎨 Visual Assets & Branding Guide

Guidelines for using FlowSync's visual identity.

---

## 🎨 Brand Colors

### Primary Colors

```css
/* Primary Purple */
--primary-color: #6c63ff;
--primary-light: #8b84ff;
--primary-dark: #524bbf;

/* Accent Pink */
--accent-color: #ec4899;
--accent-light: #f472b6;
--accent-dark: #db2777;
```

### Secondary Colors

```css
/* Success Green */
--success-color: #10b981;
--success-light: #34d399;
--success-dark: #059669;

/* Warning Orange */
--warning-color: #f59e0b;
--warning-light: #fbbf24;
--warning-dark: #d97706;

/* Error Red */
--error-color: #ef4444;
--error-light: #f87171;
--error-dark: #dc2626;

/* Info Blue */
--info-color: #3b82f6;
--info-light: #60a5fa;
--info-dark: #2563eb;
```

### Neutral Colors

```css
/* Text */
--text-primary: #1f2937;
--text-secondary: #6b7280;
--text-light: #9ca3af;

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;

/* Borders */
--border-light: #e5e7eb;
--border-medium: #d1d5db;
--border-dark: #9ca3af;
```

---

## 📝 Typography

### Font Families

```css
/* Primary Font */
--font-primary:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
  Arial, sans-serif;

/* Monospace Font */
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Courier New", monospace;
```

### Font Sizes

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 🖼️ Logo Usage

### Logo Files

```
frontend/public/
├── parllel-logo.png      # Main logo (transparent background)
├── logo-white.png        # White version (for dark backgrounds)
├── favicon.ico           # Browser favicon
└── icon-192.png         # PWA icon
```

### Logo Guidelines

Do:

- Maintain minimum clear space (logo height × 0.5)
- Use on white or light backgrounds (colored logo)
- Use white version on dark backgrounds
- Scale proportionally
- Keep aspect ratio

Don't:

- Distort or stretch the logo
- Change logo colors
- Add effects (shadows, gradients, etc.)
- Place on busy backgrounds
- Rotate the logo

### Minimum Sizes

- Digital: 120px width minimum
- Print: 1 inch width minimum

---

## 🎯 Icons

### Icon Library

We use **Font Awesome Free** icons throughout the app.

```html
<!-- Example Usage -->
<i class="fas fa-heart"></i>
<i class="fas fa-calendar"></i>
<i class="fas fa-chart-line"></i>
```

### Common Icons

| Feature   | Icon | Code             |
| --------- | ---- | ---------------- |
| Period    | 🩸   | `fa-droplet`     |
| Calendar  | 📅   | `fa-calendar`    |
| Analytics | 📊   | `fa-chart-line`  |
| Profile   | 👤   | `fa-user`        |
| Settings  | ⚙️   | `fa-gear`        |
| Health    | 🏥   | `fa-heart-pulse` |
| Mood      | 😊   | `fa-smile`       |
| Symptoms  | 🤒   | `fa-thermometer` |

---

## 📐 Spacing System

```css
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */
--spacing-3xl: 4rem; /* 64px */
```

---

## 🎭 UI Components

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
}
```

### Cards

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Inputs

```css
.input {
  border: 2px solid var(--border-light);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

.input:focus {
  border-color: var(--primary-color);
  outline: none;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) {
  /* Small tablets */
}
@media (min-width: 768px) {
  /* Tablets */
}
@media (min-width: 1024px) {
  /* Laptops */
}
@media (min-width: 1280px) {
  /* Desktops */
}
@media (min-width: 1536px) {
  /* Large screens */
}
```

---

## 🎨 Design Principles

### 1. Simplicity

- Clean, uncluttered interfaces
- Focus on essential features
- Progressive disclosure of complexity

### 2. Consistency

- Reuse components and patterns
- Maintain visual hierarchy
- Follow spacing system

### 3. Accessibility

- High color contrast (WCAG AA minimum)
- Large touch targets (44×44px minimum)
- Clear focus indicators
- Semantic HTML

### 4. Feedback

- Loading states for async actions
- Success/error messages
- Hover/active states on interactive elements
- Validation feedback

---

## 📸 Screenshots Guidelines

### For Documentation

Required Screenshots:

1. Home page
2. Dashboard (logged in)
3. Trackers page
4. Analytics page
5. Mobile responsive views

Screenshot Standards:

- Resolution: 1920×1080 (desktop), 375×812 (mobile)
- Format: PNG with transparency where applicable
- Quality: High quality, no compression artifacts
- Content: Use sample data, blur personal info

---

## 🎨 Brand Voice

### Tone & Style

We are:

- Friendly and approachable
- Empowering and supportive
- Clear and direct
- Knowledgeable but not clinical

We are not:

- Condescending or judgmental
- Overly technical or medical
- Cold or impersonal
- Negative or discouraging

### Writing Style

```
Good: "Track your cycle with ease"
Bad: "Efficiently monitor menstrual parameters"

Good: "Log how you're feeling today"
Bad: "Input emotional state data"

Good: "Your wellness score is looking great!"
Bad: "Health metric threshold: optimal"
```

---

## 🎯 Marketing Materials

### Taglines

- "Empowering reproductive health through intelligent tracking"
- "Your cycle, your insights, your control"
- "Track smarter, live better"

### Key Messages

1. **Privacy First**: Your data, your control
2. **Health Focused**: Real health insights, not just tracking
3. **Intelligent**: AI-powered predictions and analytics
4. **Accessible**: Easy to use, available everywhere

---

## 📦 Asset Export Guidelines

### For Developers

```bash
# Logo exports needed:
- logo.svg (vector, preferred)
- logo@1x.png (96 DPI, 120px width)
- logo@2x.png (192 DPI, 240px width)
- logo@3x.png (288 DPI, 360px width)

# Favicon exports:
- favicon.ico (16x16, 32x32, 48x48)
- icon-192.png (192x192, for PWA)
- icon-512.png (512x512, for PWA)
- apple-touch-icon.png (180x180)
```

---

## 🎨 Future Design System

### Planned Components

- [ ] Design tokens file
- [ ] Component library documentation
- [ ] Storybook integration
- [ ] Figma design file
- [ ] Animation guidelines
- [ ] Dark mode theme

---

## 📞 Questions?

For design-related questions:

- Open an issue with `design` label
- Email: design@flowsync.com
- Discuss in [GitHub Discussions](https://github.com/AmanCrafts/Menstrual-Health-Tracker/discussions)

---

<div align="center">

**Consistent design creates better experiences**

</div>
