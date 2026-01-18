/**
 * USAGE EXAMPLES - CountUpAnimation
 * 
 * Complete guide for implementing count-up animations in your project
 */

/* ============================================
   REACT IMPLEMENTATION
   ============================================ */

// Example 1: Basic React Implementation
import CountUpAnimation from '@/components/CountUpAnimation';

export default function ImpactSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Our Impact
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-sm 
                          border border-blue-400/30 rounded-2xl p-8 text-center
                          hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl font-bold text-blue-400 mb-2">
              <CountUpAnimation
                target={5200}
                duration={2000}
                format="k"
                decimals={1}
                suffix="K"
              />
            </div>
            <h3 className="text-lg font-semibold text-white">Total Users</h3>
            <p className="text-sm text-slate-400">Active members</p>
          </div>

          {/* Daily Sessions */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-sm 
                          border border-purple-400/30 rounded-2xl p-8 text-center
                          hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl font-bold text-purple-400 mb-2">
              <CountUpAnimation
                target={12400}
                duration={2000}
                format="k"
                decimals={1}
                suffix="K"
              />
            </div>
            <h3 className="text-lg font-semibold text-white">Daily Sessions</h3>
            <p className="text-sm text-slate-400">Per day average</p>
          </div>

          {/* Interviews Taken */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 backdrop-blur-sm 
                          border border-green-400/30 rounded-2xl p-8 text-center
                          hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl font-bold text-green-400 mb-2">
              <CountUpAnimation
                target={8900}
                duration={2000}
                format="k"
                decimals={1}
                suffix="K"
              />
            </div>
            <h3 className="text-lg font-semibold text-white">Interviews Taken</h3>
            <p className="text-sm text-slate-400">Total mock interviews</p>
          </div>

          {/* Avg Feedback Score */}
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 backdrop-blur-sm 
                          border border-orange-400/30 rounded-2xl p-8 text-center
                          hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl font-bold text-orange-400 mb-2">
              <CountUpAnimation
                target={4.6}
                duration={2000}
                format="decimal"
                decimals={1}
                suffix="/5"
              />
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Feedback Score</h3>
            <p className="text-sm text-slate-400">User satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ============================================
   VANILLA HTML + JAVASCRIPT IMPLEMENTATION
   ============================================ */

// Example 2: Plain HTML with data attributes
/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Impact Section with CountUp</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }

    .impact-section {
      max-width: 1200px;
      margin: 0 auto;
    }

    .impact-section h2 {
      font-size: 2.25rem;
      font-weight: bold;
      color: white;
      text-align: center;
      margin-bottom: 3rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: linear-gradient(135deg, rgba(96, 125, 139, 0.1), rgba(55, 65, 81, 0.1));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      cursor: default;
    }

    .stat-card:hover {
      transform: translateY(-0.5rem);
      border-color: rgba(148, 163, 184, 0.5);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .stat-number {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      min-height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-card:nth-child(1) .stat-number {
      color: #60a5fa; /* blue-400 */
    }

    .stat-card:nth-child(2) .stat-number {
      color: #a78bfa; /* purple-400 */
    }

    .stat-card:nth-child(3) .stat-number {
      color: #4ade80; /* green-400 */
    }

    .stat-card:nth-child(4) .stat-number {
      color: #fb923c; /* orange-400 */
    }

    .stat-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: white;
      margin-bottom: 0.25rem;
    }

    .stat-subtitle {
      font-size: 0.875rem;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <section class="impact-section">
    <h2>Our Impact</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number" data-count-up data-target="5200" data-format="k" data-decimals="1" data-suffix="K">0</div>
        <div class="stat-title">Total Users</div>
        <div class="stat-subtitle">Active members</div>
      </div>

      <div class="stat-card">
        <div class="stat-number" data-count-up data-target="12400" data-format="k" data-decimals="1" data-suffix="K">0</div>
        <div class="stat-title">Daily Sessions</div>
        <div class="stat-subtitle">Per day average</div>
      </div>

      <div class="stat-card">
        <div class="stat-number" data-count-up data-target="8900" data-format="k" data-decimals="1" data-suffix="K">0</div>
        <div class="stat-title">Interviews Taken</div>
        <div class="stat-subtitle">Total mock interviews</div>
      </div>

      <div class="stat-card">
        <div class="stat-number" data-count-up data-target="4.6" data-format="decimal" data-decimals="1" data-suffix="/5">0</div>
        <div class="stat-title">Avg Feedback Score</div>
        <div class="stat-subtitle">User satisfaction</div>
      </div>
    </div>
  </section>

  <script src="count-up-animation.js"></script>
</body>
</html>
*/


/* ============================================
   ADVANCED REACT IMPLEMENTATION WITH STAGGERED DELAYS
   ============================================ */

// Example 3: Advanced with staggered animation
import CountUpAnimation from '@/components/CountUpAnimation';

export default function AdvancedImpactSection() {
  const stats = [
    {
      id: 1,
      value: 5200,
      label: 'Total Users',
      subtitle: 'Active members',
      color: 'text-blue-400',
      bgGradient: 'from-blue-600/20 to-blue-900/20',
      borderColor: 'border-blue-400/30',
      delay: 0
    },
    {
      id: 2,
      value: 12400,
      label: 'Daily Sessions',
      subtitle: 'Per day average',
      color: 'text-purple-400',
      bgGradient: 'from-purple-600/20 to-purple-900/20',
      borderColor: 'border-purple-400/30',
      delay: 200
    },
    {
      id: 3,
      value: 8900,
      label: 'Interviews Taken',
      subtitle: 'Total mock interviews',
      color: 'text-green-400',
      bgGradient: 'from-green-600/20 to-green-900/20',
      borderColor: 'border-green-400/30',
      delay: 400
    },
    {
      id: 4,
      value: 4.6,
      label: 'Avg Feedback Score',
      subtitle: 'User satisfaction',
      color: 'text-orange-400',
      bgGradient: 'from-orange-600/20 to-orange-900/20',
      borderColor: 'border-orange-400/30',
      delay: 600
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Our Impact
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm 
                          border ${stat.borderColor} rounded-2xl p-8 text-center
                          hover:-translate-y-2 transition-all duration-300`}
            >
              <div className={`text-5xl font-bold ${stat.color} mb-2`}>
                <CountUpAnimation
                  target={stat.value}
                  duration={2000}
                  format={stat.value < 10 ? 'decimal' : 'k'}
                  decimals={stat.value < 10 ? 1 : 1}
                  suffix={stat.value < 10 ? '/5' : 'K'}
                  delay={stat.delay}
                />
              </div>
              <h3 className="text-lg font-semibold text-white">{stat.label}</h3>
              <p className="text-sm text-slate-400">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ============================================
   ATTRIBUTE REFERENCE FOR VANILLA JS
   ============================================ */

/*
Data Attributes Reference:

data-count-up          - Marks element for animation (required)
data-target            - Final value to animate to (required) [number]
data-duration          - Animation duration in ms (default: 2000) [number]
data-delay             - Delay before animation starts (default: 0) [number]
data-format            - Number format type:
                         'default'  - Plain integer
                         'k'        - K notation (1.2K, 5.0K)
                         'decimal'  - Decimal values (4.6)
                         'comma'    - Comma separated (1,234)
data-decimals          - Decimal places to show (default: 1) [number]
data-prefix            - Text before number (default: '') [string]
data-suffix            - Text after number (default: '') [string]

Example:
<span data-count-up 
      data-target="1250" 
      data-format="k" 
      data-decimals="1"
      data-duration="2000"
      data-suffix="K">
  0
</span>
*/
