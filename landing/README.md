# Better Wallet Landing Page

A clean, minimal landing page with neobrutalism design for the Better Wallet project. This landing page explains how Better Wallet turns any device into a hardware wallet with air-gapped security.

## Features

### Design System
- **Neobrutalism Style**: Bold 4px borders, offset shadows (8px), flat colors
- **Clean & Minimal**: Focused content, clear hierarchy, no clutter
- **Responsive**: Works beautifully on mobile, tablet, and desktop
- **Accessible**: High contrast, keyboard navigation, semantic HTML

### Page Sections

1. **Hero Section**
   - Main headline: "Turn Any Device Into a Hardware Wallet"
   - Two prominent CTA buttons:
     - Download Cold Wallet APK (placeholder with alert)
     - Open Hot Wallet (→ https://better-wallet.web.app/)

2. **How It Works**
   - 3-step visual guide showing the QR code workflow
   - Step 1: Setup Cold Wallet (offline device)
   - Step 2: Connect Hot Wallet (online device)
   - Step 3: Sign with QR Codes (air-gapped)

3. **Features**
   - Cold Wallet features (airplane mode, biometric auth, QR signing)
   - Hot Wallet features (watch-only, ERC20 tokens, WalletConnect)

4. **Security Highlights**
   - Air-gapped signing
   - QR code communication only
   - Your keys, your crypto
   - Open source

5. **Footer**
   - GitHub link
   - Hot Wallet App link
   - Documentation placeholder

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
cd landing
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the landing page.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Design System

### Colors
- **Primary**: `#3B82F6` (Blue) - Main actions
- **Success**: `#10B981` (Green) - Positive actions
- **Background**: `#FEFCE8` (Soft Yellow)
- **Black**: `#000000` - Borders and text
- **Gray**: `#6B7280` - Secondary text

### Typography
- **Headings**: 900 weight (black), system font stack
- **Body**: 500-600 weight (medium-semibold)
- **Font sizes**: Responsive with `clamp()`

### Components
- **Buttons**: Bold borders, offset shadows, interactive hover/press states
- **Cards**: White background, black borders, shadow on hover
- **Spacing**: Consistent padding and margins

## Customization

### Update APK Download Link

When you have the APK ready, replace the placeholder alert in `src/App.tsx`:

```tsx
// Find this code (appears twice):
onClick={(e) => {
  e.preventDefault();
  alert('APK download coming soon!...');
}}

// Replace with:
href="https://your-apk-link.com/better-wallet.apk"
// And remove the onClick handler
```

### Change Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --color-primary: #3B82F6;    /* Change primary color */
  --color-success: #10B981;    /* Change success color */
  --color-bg: #FEFCE8;         /* Change background */
  /* ... etc */
}
```

### Update Links

In `src/App.tsx`, update the footer links:
- GitHub link (line 204)
- Documentation link (line 206)

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features (CSS Grid, Flexbox, custom properties)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile

## Deployment

### Deploy to Vercel

```bash
npm run build
# Upload dist/ folder to Vercel
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Deploy to Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

## File Structure

```
landing/
├── src/
│   ├── App.tsx          # Main landing page component
│   ├── App.css          # Component-specific styles
│   ├── index.css        # Global design system
│   └── main.tsx         # Entry point
├── public/
│   └── vite.svg         # Favicon
├── index.html           # HTML template with meta tags
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## License

Part of the Better Wallet open source project.
