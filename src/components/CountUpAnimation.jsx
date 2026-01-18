import React, { useState, useEffect, useRef } from 'react';

/**
 * Production-ready CountUpAnimation component
 * Features:
 * - IntersectionObserver for scroll-triggered animation
 * - Smooth easing function (easeOutExpo)
 * - K formatting (e.g., 1.2K, 5.0K)
 * - Decimal value support (e.g., 4.6/5)
 * - Runs only once per page load
 * - Vanilla JavaScript, no external libraries
 */
const CountUpAnimation = React.memo(({
  target = 0,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 1,
  format = 'default', // 'default', 'k', 'decimal'
  delay = 0
}) => {
  const [count, setCount] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);
  const countRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  /**
   * Format numbers with K notation (1.2K, 5.0K, etc.)
   */
  const formatWithK = (num, decimals) => {
    if (num === 0) return '0.0K';
    
    if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  /**
   * Format decimal values (e.g., 4.6/5)
   */
  const formatDecimal = (num, decimals) => {
    return num.toFixed(decimals);
  };

  /**
   * Easing function: easeOutExpo
   * Provides smooth deceleration
   */
  const easeOutExpo = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  /**
   * Format the displayed number based on format type
   */
  const formatNumber = (num) => {
    switch (format) {
      case 'k':
        return formatWithK(num, decimals);
      case 'decimal':
        return formatDecimal(num, decimals);
      default:
        return Math.floor(num).toLocaleString();
    }
  };

  /**
   * Animation loop using requestAnimationFrame
   */
  const animate = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current - delay;
    const progress = Math.min(Math.max(elapsed / duration, 0), 1);
    const easedProgress = easeOutExpo(progress);

    const currentCount = easedProgress * target;
    setCount(currentCount);

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setCount(target);
      setIsAnimated(true);
    }
  };

  /**
   * Set up IntersectionObserver for scroll-triggered animation
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAnimated) {
            startTimeRef.current = null;
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -100px 0px' // Start animation slightly before entering viewport
      }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, [isAnimated, duration, delay, target, animate]);

  return (
    <div ref={countRef} className="count-up-number">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </div>
  );
});

CountUpAnimation.displayName = 'CountUpAnimation';

export default CountUpAnimation;
