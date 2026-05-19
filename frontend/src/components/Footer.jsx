import React from 'react';
import { Code } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '2rem', 
      color: 'var(--text-muted)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      marginTop: '2rem',
      fontSize: '0.85rem'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        Car Health Prediction System v2.0
      </div>
      <a href="https://github.com/yenwadhwa22/Car-Health-Predictions" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', transition: 'color 0.3s' }}>
        <Code size={16} />
        View on GitHub
      </a>
    </footer>
  );
};

export default Footer;
