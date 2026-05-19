import React, { useEffect, useState } from 'react';

const CircularGauge = ({ value, isFault }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        clearInterval(timer);
        setAnimatedValue(value);
      } else {
        setAnimatedValue(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  const color = isFault ? 'var(--red-danger)' : 'var(--cyan-primary)';

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', color: color, textShadow: `0 0 10px ${color}` }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{animatedValue.toFixed(1)}%</div>
        <div style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>FAILURE PROB</div>
      </div>
    </div>
  );
};

export default CircularGauge;
