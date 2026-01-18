# CountUpAnimation - Quick Reference Card

## 🚀 Quick Start

### React (30 seconds)
```jsx
import CountUpAnimation from '@/components/CountUpAnimation';

<CountUpAnimation target={5200} format="k" suffix="K" />
```

### Vanilla JS (30 seconds)
```html
<span data-count-up data-target="5200" data-format="k" data-suffix="K">0</span>
<script src="count-up-animation.js"></script>
```

---

## 📋 Props / Attributes

```
target      → Final value (required)
duration    → Animation time in ms (default: 2000)
format      → 'default', 'k', 'decimal', 'comma'
decimals    → Decimal places (default: 1)
suffix      → Text after number (e.g., 'K', '/5')
prefix      → Text before number
delay       → Delay before animation (ms)
```

---

## 💡 Common Examples

### Example 1: 5.2K (Large numbers)
```jsx
<CountUpAnimation target={5200} format="k" suffix="K" decimals={1} />
```

### Example 2: 4.6/5 (Ratings)
```jsx
<CountUpAnimation target={4.6} format="decimal" suffix="/5" decimals={1} />
```

### Example 3: 1,234 (Formatted integers)
```jsx
<CountUpAnimation target={1234} format="comma" />
```

### Example 4: Staggered animations
```jsx
<CountUpAnimation target={5200} delay={0} />    {/* Starts immediately */}
<CountUpAnimation target={12400} delay={200} />  {/* Starts 200ms later */}
<CountUpAnimation target={8900} delay={400} />   {/* Starts 400ms later */}
```

---

## 🎨 Complete Impact Section

```jsx
import CountUpAnimation from '@/components/CountUpAnimation';

<section className="py-20">
  <h2 className="text-center text-4xl font-bold text-white mb-12">Our Impact</h2>
  
  <div className="grid grid-cols-4 gap-6">
    {/* Users */}
    <div className="bg-blue-600/20 backdrop-blur rounded-2xl p-8 text-center">
      <div className="text-5xl font-bold text-blue-400 mb-2">
        <CountUpAnimation target={5200} format="k" suffix="K" />
      </div>
      <h3 className="text-white">Total Users</h3>
    </div>

    {/* Sessions */}
    <div className="bg-purple-600/20 backdrop-blur rounded-2xl p-8 text-center">
      <div className="text-5xl font-bold text-purple-400 mb-2">
        <CountUpAnimation target={12400} format="k" suffix="K" />
      </div>
      <h3 className="text-white">Daily Sessions</h3>
    </div>

    {/* Interviews */}
    <div className="bg-green-600/20 backdrop-blur rounded-2xl p-8 text-center">
      <div className="text-5xl font-bold text-green-400 mb-2">
        <CountUpAnimation target={8900} format="k" suffix="K" />
      </div>
      <h3 className="text-white">Interviews Taken</h3>
    </div>

    {/* Score */}
    <div className="bg-orange-600/20 backdrop-blur rounded-2xl p-8 text-center">
      <div className="text-5xl font-bold text-orange-400 mb-2">
        <CountUpAnimation target={4.6} format="decimal" suffix="/5" />
      </div>
      <h3 className="text-white">Avg Feedback Score</h3>
    </div>
  </div>
</section>
```

---

## 🔧 Vanilla HTML Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; padding: 2rem; }
    .stat { background: rgba(55, 65, 81, 0.5); padding: 2rem; border-radius: 1rem; text-align: center; }
    .number { font-size: 2.5rem; font-weight: bold; margin: 1rem 0; min-height: 3rem; }
    .stat:nth-child(1) .number { color: #60a5fa; }
    .stat:nth-child(2) .number { color: #a78bfa; }
    .stat:nth-child(3) .number { color: #4ade80; }
    .stat:nth-child(4) .number { color: #fb923c; }
  </style>
</head>
<body>
  <h1 style="text-align: center; margin: 2rem 0;">Our Impact</h1>
  
  <div class="stats">
    <div class="stat">
      <div class="number" data-count-up data-target="5200" data-format="k" data-suffix="K">0</div>
      <h3>Total Users</h3>
    </div>
    <div class="stat">
      <div class="number" data-count-up data-target="12400" data-format="k" data-suffix="K">0</div>
      <h3>Daily Sessions</h3>
    </div>
    <div class="stat">
      <div class="number" data-count-up data-target="8900" data-format="k" data-suffix="K">0</div>
      <h3>Interviews Taken</h3>
    </div>
    <div class="stat">
      <div class="number" data-count-up data-target="4.6" data-format="decimal" data-suffix="/5">0</div>
      <h3>Avg Feedback Score</h3>
    </div>
  </div>

  <script src="count-up-animation.js"></script>
</body>
</html>
```

---

## 📊 Format Comparison

| Format | Code | Output |
|--------|------|--------|
| K notation | `target={5200} format="k"` | **5.2K** |
| Decimal | `target={4.6} format="decimal"` | **4.6** |
| Comma | `target={1234} format="comma"` | **1,234** |
| Plain | `target={100}` | **100** |

---

## ⚙️ Performance Settings

```jsx
// Fast animation (ideal for small numbers)
<CountUpAnimation target={100} duration={1000} />

// Medium animation (default, smooth)
<CountUpAnimation target={5200} duration={2000} />

// Slow animation (dramatic effect)
<CountUpAnimation target={5200} duration={3000} />
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Animation not starting | Scroll element into view or check console |
| Numbers jumping | Add `min-height` to container |
| Slow performance | Reduce animation duration or count |
| Animation playing multiple times | Already handled - runs once per load |

---

## 📁 Files Created

1. **CountUpAnimation.jsx** - React component
2. **count-up-animation.js** - Vanilla JavaScript
3. **COUNTUP_DOCUMENTATION.md** - Full documentation
4. **HOME_INTEGRATION_EXAMPLE.jsx** - Integration example
5. **COUNTUP_EXAMPLES.js** - More examples

---

## 🎯 Copy-Paste Your Numbers

Just replace these values with your actual statistics:

```jsx
// Current examples
target={5200}      // Total Users
target={12400}     // Daily Sessions
target={8900}      // Interviews Taken
target={4.6}       // Avg Feedback Score

// Replace with your values:
target={YOUR_TOTAL_USERS}
target={YOUR_DAILY_SESSIONS}
target={YOUR_INTERVIEWS}
target={YOUR_SCORE}
```

---

## ✨ Features Checklist

- ✅ Scroll-triggered (IntersectionObserver)
- ✅ Smooth easing (easeOutExpo)
- ✅ K formatting (1.2K)
- ✅ Decimal support (4.6/5)
- ✅ Runs once per load
- ✅ Vanilla JS (no libs)
- ✅ React compatible
- ✅ Production-ready
- ✅ TypeScript-ready
- ✅ Mobile responsive

---

**Ready to use! Just copy, paste, and customize with your numbers.** 🚀
