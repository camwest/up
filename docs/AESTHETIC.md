# Concert Finder – Core Aesthetic Guide
**"8-Bit Neon Signals"**

Design system for maximum visibility in dark concert venues with zero-friction mobile experience.

---

## Visual Language

| Layer | Treatment |
|-------|-----------|
| **Backdrop** | Pure black `#050505` (OLED-friendly) |
| **Grid System** | 8px baseline, 8px columns, square corners only |
| **Neon Glow** | 1px inner stroke + 16–24px text-shadow/box-shadow |
| **Motion** | `steps()` keyframes for choppy 8-bit LED flicker |

---

## Color Tokens

```css
:root {
  --c-bg:      #050505;  /* Main background */
  --c-magenta: #FF008C;  /* Primary neon accent */
  --c-cyan:    #00F9FF;  /* Secondary accent */
  --c-lime:    #B4FF11;  /* High-visibility option */
  --c-amber:   #FFBF00;  /* A11y fallback */
  --c-violet:  #8B00FF;  /* Pattern variety */
  --c-fg:      #E4E4E4;  /* Neutral text */
  --c-glass:   rgba(255,255,255,0.06); /* Frosted elements */
}
```

---

## Typography Stack

**Google Fonts Selection (Performance Optimized):**

| Role | Font Family | Weight | Purpose |
|------|-------------|--------|---------|
| **Logo/Display** | Orbitron | 900 | Tech/8-bit aesthetic |
| **Headlines** | Rajdhani | 600, 700 | Bold, technical feel |
| **Body Text** | Inter | 400, 700 | Proven mobile readability |
| **Code/URLs** | JetBrains Mono | 400 | Monospace clarity |

**CSS Variables:**
```css
:root {
  --font-display: 'Orbitron', sans-serif;
  --font-headline: 'Rajdhani', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    fontFamily: {
      display: ['var(--font-display)'],
      headline: ['var(--font-headline)'],
      body: ['var(--font-body)'],
      mono: ['var(--font-mono)'],
    },
    extend: {
      colors: {
        bg: '#050505',
        magenta: '#FF008C',
        cyan: '#00F9FF',
        lime: '#B4FF11',
        amber: '#FFBF00',
        violet: '#8B00FF',
        fg: '#E4E4E4',
        glass: 'rgba(255,255,255,0.06)',
      },
      keyframes: {
        pulse8: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' }
        },
        strobe8: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        wave8: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'pulse8': 'pulse8 600ms steps(4,end) infinite',
        'strobe8': 'strobe8 140ms steps(2,end) infinite',
        'wave8': 'wave8 1200ms steps(8,end) infinite',
      },
      textShadow: {
        neon: '0 0 12px currentColor, 0 0 24px currentColor',
      },
      boxShadow: {
        neon: '0 0 16px currentColor, 0 0 32px currentColor',
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
  ],
};
```

---

## Component Classes

### Primary CTA Button
```html
<button class="font-headline font-bold bg-magenta text-bg px-6 py-3 shadow-neon uppercase tracking-wide text-lg active:translate-y-0.5 transition-transform">
  Create Pattern to Share
</button>
```

### Pattern Display
```html
<div class="fixed inset-0 bg-magenta animate-pulse8" style="animation-duration: 2s;">
  <!-- Pattern content -->
</div>
```

### Share URL Display
```html
<code class="font-mono text-lime text-shadow-neon bg-bg/80 px-3 py-2 rounded border border-lime/30">
  concertfinder.app/p?c=FF008C
</code>
```

### Navigation/UI Chip
```html
<div class="border border-fg/20 bg-glass backdrop-blur px-3 py-1 font-body text-xs text-fg rounded">
  3 others nearby
</div>
```

---

## Animation Timing Scale

```css
:root {
  --anim-slow: 1200ms;    /* Ambient/background patterns */
  --anim-medium: 600ms;   /* Standard visibility */
  --anim-fast: 300ms;     /* High-attention/emergency */
}
```

**Usage Rule:** All animations use `steps()` easing for 8-bit LED effect.

---

## Mobile-Specific Styles

```css
/* Pattern display optimizations */
.pattern-display {
  touch-action: none;
  user-select: none;
  -webkit-touch-callout: none;
  image-rendering: pixelated; /* Enhance 8-bit aesthetic */
}

/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px;
}
```

---

## Accessibility Standards

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --c-magenta: #FFBF00; /* Switch to amber */
    --c-cyan: #FFBF00;
    --c-lime: #FFBF00;
    --c-violet: #FFBF00;
    --c-bg: #1A1A1A; /* Lighter background */
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse8,
  .animate-strobe8,
  .animate-wave8 {
    animation: none;
    opacity: 0.85; /* Solid color fallback */
  }
}
```

### WCAG Compliance
- All text on neon backgrounds must meet 4.5:1 contrast ratio
- Fallback to `--c-fg` when contrast insufficient
- Pattern animations limited to essential visibility only

---

## Brand Voice

**Core Tagline:** "Put your signal up"

**UI Copy Style:**
- "Put your signal up ↑"
- "Signal up and glow on"
- "Keep your signal up"
- "Pattern locked ⚡"
- "Broadcasting signal"
- "Signal synced ✓"
- "Hold phone up high ↑"
- "Glow on."

**Call-to-Action Examples:**
- "Signal up now"
- "Put signal up"
- "Get your signal up"
- "Signal up to connect"

**Tone:** Direct, tech-inspired, minimal. Every word serves visibility or guidance. The "signal up" concept reinforces both the physical action (holding phone up) and the digital broadcasting.

---

## Performance Requirements

- **Font Loading:** ~15-20KB total (Google Fonts via Next.js optimization)
- **Animation Performance:** Default 500ms+ to preserve battery
- **Low Power Mode:** Double animation duration, halve opacity
- **Image Rendering:** `pixelated` for crisp 8-bit aesthetic

---

## North Star Principle

**Zero Friction, Maximum Signal** — Every pixel either shines or guides toward finding friends in crowds.