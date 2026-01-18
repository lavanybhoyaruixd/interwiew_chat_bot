import { useState, useEffect, useRef } from "react";

export default function AnimatedCounter({
  end = 1000,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = null
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  // Format number with K suffix if needed
  const formatNumber = (num, decimalPlaces) => {
    // If decimals is explicitly set, use that
    if (decimalPlaces !== null) {
      return num.toFixed(decimalPlaces);
    }

    // Auto-detect decimals needed for the final value
    const finalDecimalPlaces = end % 1 !== 0 ? 1 : 0;
    
    // Format with K for large numbers
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    
    // Return with appropriate decimal places
    if (finalDecimalPlaces > 0) {
      return num.toFixed(1);
    }
    
    return Math.floor(num).toLocaleString();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;

          let startTime = null;
          const animationDuration = duration;

          // Easing function for smoother animation
          const easeOutExpo = (t) => {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          };

          const animate = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            const easedProgress = easeOutExpo(progress);
            
            // Calculate current count with easing
            const currentCount = easedProgress * end;
            
            // Determine decimal places based on end value
            let decimalPlaces = 0;
            if (end % 1 !== 0) {
              decimalPlaces = 1;
            }
            
            // For numbers that need K formatting
            if (end >= 1000) {
              setCount(currentCount);
            } else {
              setCount(currentCount);
            }
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end, duration]);

  // Determine decimal places for display
  const displayDecimals = decimals !== null ? decimals : (end % 1 !== 0 ? 1 : 0);
  const displayValue = formatNumber(count, displayDecimals);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
