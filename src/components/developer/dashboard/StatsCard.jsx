import React, { useEffect, useRef, useState } from 'react';

/**
 * Premium StatsCard — animated counter, gradient icon area, trend indicator
 */
const StatsCard = ({ title, value, icon, loading = false, trend = null, accentColor = '#dc2626' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    const start = prevValueRef.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = end;
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [value, loading]);

  const trendUp = trend > 0;

  return (
    <div
      style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: '18px',
        border: '1px solid rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'; }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at 80% 20%, ${accentColor}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0, background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}10 100%)`, border: `1.5px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={icon} alt={title} style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#94a3b8', margin: 0, marginBottom: '4px' }}>{title}</p>
        {loading ? (
          <div style={{ height: '32px', width: '80px', borderRadius: '8px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-1px' }}>
              {displayValue.toLocaleString()}
            </span>
            {trend !== null && trend !== 0 && (
              <span style={{ fontSize: '12px', fontWeight: 700, borderRadius: '20px', padding: '2px 8px', background: trendUp ? '#dcfce7' : '#fee2e2', color: trendUp ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {trendUp ? '↑' : '↓'} {Math.abs(trend)}
              </span>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
};

export default StatsCard;