# CountUpAnimation - Production-Ready Documentation

## Overview

A lightweight, production-ready count-up animation component with scroll-triggered animation. Works in both React and vanilla JavaScript with zero external dependencies.

**Features:**
- ✅ Scroll-triggered animation using IntersectionObserver
- ✅ Smooth easing function (easeOutExpo)
- ✅ K formatting (1.2K, 5.0K)
- ✅ Decimal value support (4.6/5)
- ✅ Runs only once per page load
- ✅ Vanilla JavaScript, no external libraries
- ✅ Works in React and plain HTML
- ✅ Customizable duration and delay
- ✅ TypeScript-ready

---

## Installation & Setup

### React Component

1. **Copy the component** to your project:
```bash
cp src/components/CountUpAnimation.jsx your-project/src/components/
```

2. **Import and use:**
```jsx
import CountUpAnimation from '@/components/CountUpAnimation';

<CountUpAnimation
  target={5200}
  duration={2000}
  format="k"
  decimals={1}
  suffix="K"
/>
```

### Vanilla JavaScript

1. **Copy the script** to your public folder:
```bash
cp backend/public/count-up-animation.js your-project/public/
```

2. **Include in HTML:**
```html
<script src="/count-up-animation.js"></script>
```

3. **Mark elements with data attributes:**
```html
<span data-count-up data-target="5200" data-format="k" data-suffix="K">0</span>
```

---

## API Reference

### React Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | number | 0 | Final value to animate to |
| `duration` | number | 2000 | Animation duration in milliseconds |
| `suffix` | string | '' | Text appended after number (e.g., 'K', '/5') |
| `prefix` | string | '' | Text prepended before number |
| `decimals` | number | 1 | Number of decimal places to display |
| `format` | string | 'default' | Format type: 'default', 'k', 'decimal', 'comma' |
| `delay` | number | 0 | Delay before animation starts (ms) |

### Format Types

| Format | Example Output | Use Case |
|--------|----------------|----------|
| `default` | 1234 | Regular integers |
| `k` | 1.2K | Large numbers |
| `decimal` | 4.6 | Decimal scores |
| `comma` | 1,234 | Formatted integers |

### Vanilla JS Data Attributes

```html
<span 
  data-count-up              <!-- Required: Marks for animation -->
  data-target="5200"         <!-- Required: Final value -->
  data-format="k"            <!-- Number format -->
  data-decimals="1"          <!-- Decimal places -->
  data-duration="2000"       <!-- Animation time (ms) -->
  data-delay="0"             <!-- Delay before start (ms) -->
  data-prefix=""             <!-- Text before number -->
  data-suffix="K"            <!-- Text after number -->
>
  0                          <!-- Initial value -->
</span>
```

---

## Usage Examples

### React: Basic Implementation

```jsx
import CountUpAnimation from '@/components/CountUpAnimation';

function ImpactSection() {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stat Card 1: K Format */}
        <div className="bg-blue-600/20 backdrop-blur rounded-2xl p-8 text-center">
          <div className="text-5xl font-bold text-blue-400 mb-2">
            <CountUpAnimation
              target={5200}
              duration={2000}
              format="k"
              decimals={1}
              suffix="K"
            />
          </div>
          <h3 className="text-white font-semibold">Total Users</h3>
        </div>

        {/* Stat Card 2: Decimal Format */}
        <div className="bg-orange-600/20 backdrop-blur rounded-2xl p-8 text-center">
          <div className="text-5xl font-bold text-orange-400 mb-2">
            <CountUpAnimation
              target={4.6}
              duration={2000}
              format="decimal"
              decimals={1}
              suffix="/5"
            />
          </div>
          <h3 className="text-white font-semibold">Avg Score</h3>
        </div>
      </div>
    </section>
  );
}
```

### React: Advanced with Staggered Animations

```jsx
const stats = [
  { value: 5200, label: 'Users', delay: 0 },
  { value: 12400, label: 'Sessions', delay: 200 },
  { value: 8900, label: 'Interviews', delay: 400 },
  { value: 4.6, label: 'Score', delay: 600, format: 'decimal' }
];

function AdvancedImpactSection() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="stat-card">
          <CountUpAnimation
            target={stat.value}
            duration={2000}
            format={stat.format || 'k'}
            suffix={stat.format === 'decimal' ? '/5' : 'K'}
            delay={stat.delay}
          />
        </div>
      ))}
    </div>
  );
}
```

### Vanilla HTML + JS: Basic

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .stat-card {
      text-align: center;
      padding: 2rem;
      background: rgba(55, 65, 81, 0.1);
      border-radius: 1rem;
      color: white;
    }
    .stat-number {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      min-height: 3.5rem;
    }
  </style>
</head>
<body>
  <div class="stat-card">
    <div class="stat-number" 
         data-count-up 
         data-target="5200" 
         data-format="k" 
         data-decimals="1"
         data-suffix="K">
      0
    </div>
    <h3>Total Users</h3>
  </div>

  <div class="stat-card">
    <div class="stat-number" 
         data-count-up 
         data-target="4.6" 
         data-format="decimal" 
         data-decimals="1"
         data-suffix="/5">
      0
    </div>
    <h3>Avg Feedback Score</h3>
  </div>

  <script src="/count-up-animation.js"></script>
</body>
</html>
```

### Vanilla JS: Programmatic Control

```javascript
// Animate a specific element
CountUpAnimation.animate(
  '.my-number',        // CSS selector
  1250,                // target value
  2000,                // duration (ms)
  0,                   // delay (ms)
  'k',                 // format type
  1                    // decimals
);

// Format numbers manually
console.log(CountUpAnimation.formatWithK(5200, 1));  // "5.2K"
console.log(CountUpAnimation.formatDecimal(4.6, 1)); // "4.6"

// Reset all animations
CountUpAnimation.reset();
```

---

## How It Works

### IntersectionObserver Trigger

The animation starts when:
1. Element enters viewport (10% visibility threshold)
2. Element has never been animated before
3. Only **once per page load**

```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // Trigger animation when entering viewport
      if (entry.isIntersecting && !isAnimated) {
        startAnimation();
      }
    });
  },
  { threshold: 0.1 }
);
```

### Easing Function

Uses `easeOutExpo` for smooth deceleration:
- Starts fast, ends slow
- Natural, pleasing motion
- Formula: `1 - 2^(-10t)`

### Performance

- **requestAnimationFrame**: Syncs with browser refresh rate (60fps)
- **Memory efficient**: Cleans up observers after animation
- **Cancelable**: Automatically cleans up on unmount (React)

---

## Customization

### Custom Easing Functions

Modify the `easeOutExpo` function in `count-up-animation.js`:

```javascript
// Linear easing (constant speed)
const linear = (t) => t;

// Ease in quad
const easeInQuad = (t) => t * t;

// Ease out cubic
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
```

### Custom Formatting

Add a new format type:

```javascript
const formatNumber = (num, format) => {
  switch (format) {
    case 'percent':
      return (num * 100).toFixed(1) + '%';
    case 'currency':
      return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    default:
      return Math.floor(num);
  }
};
```

---

## Performance Tips

1. **Limit animations per page**: 4-8 animated elements works well
2. **Use appropriate duration**: 1500-2500ms feels smooth
3. **Stagger delays**: Space animations by 200ms for visual interest
4. **Lazy load**: Consider lazy-loading the script for above-the-fold content
5. **Mobile**: Reduce duration on mobile devices:
   ```jsx
   duration={window.innerWidth < 768 ? 1500 : 2000}
   ```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| IE 11 | ❌ No (uses IntersectionObserver) |

**Polyfill for older browsers:**
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"></script>
```

---

## Troubleshooting

### Animation not triggering?

1. Check element is in viewport when page loads
2. Verify `data-count-up` attribute exists (vanilla JS)
3. Check console for errors

```javascript
// Debug: Log when elements are detected
const elements = document.querySelectorAll('[data-count-up]');
console.log(`Found ${elements.length} elements to animate`);
```

### Numbers jumping/flickering?

Set a minimum height on the container:
```css
.stat-number {
  min-height: 3.5rem;  /* Prevents layout shift */
}
```

### Performance issues?

- Reduce number of simultaneous animations
- Increase animation duration
- Disable on mobile:
  ```jsx
  {!isMobile && <CountUpAnimation target={5200} ... />}
  ```

---

## License

MIT - Use freely in your projects

## Files Included

1. **CountUpAnimation.jsx** - React component
2. **count-up-animation.js** - Vanilla JavaScript
3. **COUNTUP_EXAMPLES.js** - Usage examples
4. **COUNTUP_DOCUMENTATION.md** - This file
