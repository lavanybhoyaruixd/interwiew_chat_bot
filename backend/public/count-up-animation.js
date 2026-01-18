/**
 * CountUpAnimation - Vanilla JavaScript Implementation
 * 
 * Production-ready count-up animation with:
 * - IntersectionObserver for scroll-triggered animation
 * - Smooth easing function (easeOutExpo)
 * - K formatting (e.g., 1.2K, 5.0K)
 * - Decimal value support (e.g., 4.6/5)
 * - Runs only once per page load
 * - Zero external dependencies
 * 
 * Usage in HTML:
 * <span class="count-up" data-target="1250" data-format="k" data-decimals="1">0</span>
 * <script src="count-up-animation.js"></script>
 * <script>
 *   CountUpAnimation.init();
 * </script>
 */

const CountUpAnimation = (() => {
  const activeAnimations = new Map();
  const animatedElements = new Set();

  /**
   * Format numbers with K notation (1.2K, 5.0K, etc.)
   */
  const formatWithK = (num, decimals = 1) => {
    if (num === 0) return '0.0K';
    
    if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  /**
   * Format decimal values (e.g., 4.6/5)
   */
  const formatDecimal = (num, decimals = 1) => {
    return num.toFixed(decimals);
  };

  /**
   * Format number with commas (1,234)
   */
  const formatWithCommas = (num) => {
    return Math.floor(num).toLocaleString();
  };

  /**
   * Easing function: easeOutExpo
   * Provides smooth deceleration for natural animation feel
   */
  const easeOutExpo = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  /**
   * Format the displayed number based on format type
   */
  const formatNumber = (num, format, decimals) => {
    switch (format) {
      case 'k':
        return formatWithK(num, decimals);
      case 'decimal':
        return formatDecimal(num, decimals);
      case 'comma':
        return formatWithCommas(num);
      default:
        return Math.floor(num);
    }
  };

  /**
   * Start animation for an element
   */
  const animateElement = (element, target, duration, delay, format, decimals, prefix, suffix) => {
    const elementKey = `${Math.random()}`;
    let startTime = null;
    let animationFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime - delay;
      const progress = Math.min(Math.max(elapsed / duration, 0), 1);
      const easedProgress = easeOutExpo(progress);

      const currentCount = easedProgress * target;
      const formattedNumber = formatNumber(currentCount, format, decimals);
      
      element.textContent = prefix + formattedNumber + suffix;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
        activeAnimations.set(elementKey, animationFrameId);
      } else {
        // Final value
        const finalFormatted = formatNumber(target, format, decimals);
        element.textContent = prefix + finalFormatted + suffix;
        activeAnimations.delete(elementKey);
        animatedElements.add(element);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    activeAnimations.set(elementKey, animationFrameId);
  };

  /**
   * Initialize IntersectionObserver and set up animations
   */
  const init = () => {
    const elements = document.querySelectorAll('[data-count-up]');
    
    if (elements.length === 0) {
      console.warn('No elements with [data-count-up] attribute found');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedElements.has(entry.target)) {
            const element = entry.target;
            const target = parseFloat(element.dataset.target) || 0;
            const duration = parseInt(element.dataset.duration) || 2000;
            const delay = parseInt(element.dataset.delay) || 0;
            const format = element.dataset.format || 'default'; // 'default', 'k', 'decimal', 'comma'
            const decimals = parseInt(element.dataset.decimals) || 1;
            const prefix = element.dataset.prefix || '';
            const suffix = element.dataset.suffix || '';

            animateElement(element, target, duration, delay, format, decimals, prefix, suffix);

            // Optional: unobserve after animation starts
            // observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px 0px -100px 0px' // Start before fully visible
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return observer;
  };

  /**
   * Manually trigger animation for specific element
   */
  const animate = (selector, target, duration = 2000, delay = 0, format = 'default', decimals = 1) => {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`Element with selector "${selector}" not found`);
      return;
    }

    animateElement(element, target, duration, delay, format, decimals, '', '');
    animatedElements.add(element);
  };

  /**
   * Reset all animations
   */
  const reset = () => {
    activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    activeAnimations.clear();
    animatedElements.clear();
  };

  return {
    init,
    animate,
    reset,
    formatWithK,
    formatDecimal,
    formatWithCommas,
    easeOutExpo
  };
})();

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CountUpAnimation.init();
  });
} else {
  CountUpAnimation.init();
}

// Export for use as ES module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CountUpAnimation;
}
