import React from 'react';
import { useReducedMotion } from '../utils/animation';

const stats = [
  "6 Failure Types Monitored",
  "Real-Time Prediction",
  "Tool Wear Failure: Most Common Fault",
  "95%+ Model Accuracy",
  "Check Cooling System if HDF Detected",
  "Overstrain = Reduce Load"
];

const LiveStatsTicker = () => {
  const prefersReduced = useReducedMotion();

  return (
    <div className="ticker-wrapper">
      <div 
        className="ticker-content" 
        style={{ 
          animationPlayState: prefersReduced ? 'paused' : 'running',
          // Duplicate items to ensure smooth infinite scroll
          width: 'max-content'
        }}
      >
        {[...stats, ...stats, ...stats, ...stats].map((stat, i) => (
          <div key={i} className="ticker-item">
            <span>{stat}</span>
            <div className="ticker-dot"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveStatsTicker;
