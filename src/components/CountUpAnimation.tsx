import React, { useState, useEffect, useRef } from 'react';

/**
 * Type definitions for CountUpAnimation
 */
export type FormatType = 'default' | 'k' | 'decimal' | 'comma';

export interface CountUpAnimationProps {
  /** Final value to animate to */
  target: number;
  /** Animation duration in milliseconds (default: 2000) */
  duration?: number;
  /** Text to append after number (e.g., 'K', '/5') */
  suffix?: string;
  /** Text to prepend before number */
  prefix?: string;
  /** Number of decimal places to display (default: 1) */
  decimals?: number;
  /** Number format type (default: 'default') */
  format?: FormatType;
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number;
  /** Optional CSS class name for styling */
  className?: string;
  /** Optional callback when animation completes */
  onComplete?: () => void;
}

/**
 * Production-ready CountUpAnimation component with TypeScript support
 * 
 * Features:
 * - IntersectionObserver for scroll-triggered animation
 * - Smooth easing function (easeOutExpo)
 * - K formatting (e.g., 1.2K, 5.0K)
 * - Decimal value support (e.g., 4.6/5)
 * - Runs only once per page load
 * - Vanilla JavaScript, no external libraries
 * - TypeScript support with full type safety
 * 
 * @example
 * ```tsx
 * <CountUpAnimation
 *   target={5200}
 *   duration={2000}
 *   format="k"
 *   decimals={1}
 *   suffix="K"
 *   onComplete={() => console.log('Animation done!')}
 * />
 * ```
 */
const CountUpAnimation = React.memo<CountUpAnimationProps>(({
  target = 0,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 1,
  format = 'default',
  delay = 0,
  className = '',
  onComplete
}) => {
  const [count, setCount] = useState<number>(0);
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const countRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Format numbers with K notation (1.2K, 5.0K, etc.)
   */
  const formatWithK = (num: number, dec: number): string => {
    if (num === 0) return `0.${'0'.repeat(dec)}K`;
    
    if (num >= 1000) {
      return (num / 1000).toFixed(dec) + 'K';
    }
    return num.toFixed(dec);
  };

  /**
   * Format decimal values (e.g., 4.6/5)
   */
  const formatDecimal = (num: number, dec: number): string => {
    return num.toFixed(dec);
  };

  /**
   * Format number with commas (1,234)
   */
  const formatWithCommas = (num: number): string => {
    return Math.floor(num).toLocaleString();
  };

  /**
   * Easing function: easeOutExpo
   * Provides smooth deceleration for natural animation feel
   */
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  /**
   * Format the displayed number based on format type
   */
  const formatNumber = (num: number): string => {
    switch (format) {
      case 'k':
        return formatWithK(num, decimals);
      case 'decimal':
        return formatDecimal(num, decimals);
      case 'comma':
        return formatWithCommas(num);
      case 'default':
      default:
        return Math.floor(num).toString();
    }
  };

  /**
   * Animation loop using requestAnimationFrame
   */
  const animate = (timestamp: number): void => {
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
      onComplete?.();
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
  }, [isAnimated, duration, delay, target, onComplete]);

  return (
    <div 
      ref={countRef} 
      className={className || 'count-up-number'}
      role="status"
      aria-live="polite"
    >
      {prefix}
      {formatNumber(count)}
      {suffix}
    </div>
  );
});

CountUpAnimation.displayName = 'CountUpAnimation';

export default CountUpAnimation;


/* ============================================
   ADVANCED TYPESCRIPT UTILITIES
   ============================================ */

/**
 * Advanced type-safe utilities for number formatting
 */
export namespace NumberFormatting {
  /**
   * Configuration for number formatting
   */
  export interface FormatterConfig {
    format: FormatType;
    decimals?: number;
    locale?: string;
  }

  /**
   * Generic formatter with type safety
   */
  export const formatNumber = (
    value: number,
    config: FormatterConfig
  ): string => {
    const { format, decimals = 1, locale = 'en-US' } = config;

    switch (format) {
      case 'k':
        if (value >= 1000) {
          return (value / 1000).toFixed(decimals) + 'K';
        }
        return value.toFixed(decimals);

      case 'decimal':
        return value.toFixed(decimals);

      case 'comma':
        return Math.floor(value).toLocaleString(locale);

      case 'default':
      default:
        return Math.floor(value).toString();
    }
  };

  /**
   * Parse data attributes from DOM element
   */
  export const parseElementConfig = (
    element: Element
  ): Partial<CountUpAnimationProps> => {
    const dataset = element.dataset;
    
    return {
      target: parseFloat(dataset.target || '0'),
      duration: parseInt(dataset.duration || '2000'),
      format: (dataset.format as FormatType) || 'default',
      decimals: parseInt(dataset.decimals || '1'),
      suffix: dataset.suffix || '',
      prefix: dataset.prefix || '',
      delay: parseInt(dataset.delay || '0'),
    };
  };
}

/**
 * Hook-based API for advanced use cases
 */
export const useCountUpAnimation = (
  target: number,
  options: Partial<CountUpAnimationProps> = {}
): {
  count: number;
  isAnimated: boolean;
  ref: React.RefObject<HTMLDivElement>;
} => {
  const [count, setCount] = useState<number>(0);
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const {
    duration = 2000,
    delay = 0,
  } = options;

  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const animate = (timestamp: number): void => {
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
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, [isAnimated, duration, delay, target]);

  return { count, isAnimated, ref };
};


/* ============================================
   REACT COMPONENT EXAMPLES WITH TYPESCRIPT
   ============================================ */

/**
 * Example: Type-safe stat card component
 */
export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: number;
  format: FormatType;
  suffix?: string;
  colorClass: string;
  glowClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  subtitle,
  value,
  format,
  suffix = '',
  colorClass,
  glowClass,
}) => {
  return (
    <div className={`bg-gradient-to-br backdrop-blur-sm border rounded-2xl p-8 text-center hover:-translate-y-2 transition-all duration-300 ${glowClass}`}>
      <div className={`w-14 h-14 rounded-xl ${colorClass} shadow-lg mb-6 text-white flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className={`text-5xl font-bold ${colorClass.split(' ')[0]} mb-2 font-[Space_Grotesk] min-h-16`}>
        <CountUpAnimation
          target={value}
          duration={2000}
          format={format}
          decimals={format === 'decimal' ? 1 : 1}
          suffix={suffix}
        />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  );
};

/**
 * Example: Impact section component
 */
export interface ImpactSectionProps {
  stats: Array<{
    id: string | number;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: number;
    format: FormatType;
    suffix?: string;
    colorClass: string;
    glowClass: string;
  }>;
}

export const ImpactSection: React.FC<ImpactSectionProps> = ({ stats }) => {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              icon={stat.icon}
              title={stat.title}
              subtitle={stat.subtitle}
              value={stat.value}
              format={stat.format}
              suffix={stat.suffix}
              colorClass={stat.colorClass}
              glowClass={stat.glowClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
