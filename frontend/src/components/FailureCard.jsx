import React, { useEffect, useState } from 'react';
import { Settings, Flame, Zap, Weight, Dice5 } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  'TWF': <Settings size={20} />,
  'HDF': <Flame size={20} />,
  'PWF': <Zap size={20} />,
  'OSF': <Weight size={20} />,
  'RNF': <Dice5 size={20} />
};

const labelMap = {
  'TWF': 'Tool Wear Failure',
  'HDF': 'Heat Dissipation Failure',
  'PWF': 'Power Failure',
  'OSF': 'Overstrain Failure',
  'RNF': 'Random Failure'
};

const FailureCard = ({ type, isFail, probability }) => {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    // Delay animation slightly for effect
    const timer = setTimeout(() => {
      setFillWidth(probability);
    }, 300);
    return () => clearTimeout(timer);
  }, [probability]);

  const color = isFail ? 'var(--red-danger)' : 'var(--green-success)';
  const glow = isFail ? 'var(--red-glow)' : 'var(--green-glow)';

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className={`cyber-card ${isFail ? 'danger' : ''}`}
      style={{ padding: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
          <div style={{ color: color }}>{iconMap[type]}</div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{type}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{labelMap[type]}</div>
          </div>
        </div>
        <div style={{ 
          background: isFail ? 'rgba(255, 59, 59, 0.1)' : 'rgba(0, 255, 102, 0.1)',
          color: color,
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          border: `1px solid ${color}`,
          boxShadow: `0 0 5px ${glow}`
        }}>
          {isFail ? 'FAIL' : 'PASS'}
        </div>
      </div>
      
      <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${fillWidth}%`, 
          height: '100%', 
          background: color,
          boxShadow: `0 0 10px ${glow}`,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}></div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
        {probability.toFixed(1)}%
      </div>
    </motion.div>
  );
};

export default FailureCard;
