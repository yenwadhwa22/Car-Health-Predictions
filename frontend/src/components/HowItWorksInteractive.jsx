import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../utils/animation';

const MiniGauge = ({ label, initialValue, min, max }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => {
        const diff = (Math.random() - 0.5) * ((max - min) * 0.05);
        let next = prev + diff;
        if (next > max) next = max;
        if (next < min) next = min;
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [min, max]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto' }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(201,162,122,0.2)" strokeWidth="10" />
          <circle 
            cx="50" cy="50" r="40" 
            fill="none" 
            stroke="var(--accent-cream)" 
            strokeWidth="10" 
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (percentage / 100) * 251.2}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: 4 }}>{value.toFixed(1)}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
};

const Step1Demo = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <MiniGauge label="Air Temp" initialValue={298} min={250} max={400} />
      <MiniGauge label="RPM" initialValue={1500} min={0} max={3000} />
      <MiniGauge label="Torque" initialValue={40} min={0} max={100} />
      <MiniGauge label="Wear" initialValue={100} min={0} max={250} />
    </div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-cream)' }}>
      Live sensor readings feed into our model
    </div>
  </motion.div>
);

const Step2Demo = () => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
      <svg width="200" height="150" viewBox="0 0 200 150">
        <g stroke="rgba(201,162,122,0.3)" strokeWidth="2">
          {/* Edges */}
          <line x1="30" y1="30" x2="100" y2="75" />
          <line x1="30" y1="75" x2="100" y2="75" />
          <line x1="30" y1="120" x2="100" y2="75" />
          <line x1="100" y1="75" x2="170" y2="50" />
          <line x1="100" y1="75" x2="170" y2="100" />
        </g>
        <g stroke="var(--accent-cream)" strokeWidth="2" strokeDasharray="10 10" strokeDashoffset="0">
          {!prefersReduced && (
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
          )}
          <line x1="30" y1="30" x2="100" y2="75" />
          <line x1="30" y1="75" x2="100" y2="75" />
          <line x1="30" y1="120" x2="100" y2="75" />
          <line x1="100" y1="75" x2="170" y2="50" />
          <line x1="100" y1="75" x2="170" y2="100" />
        </g>
        {/* Nodes */}
        <circle cx="30" cy="30" r="10" fill="var(--bg-cream)" stroke="var(--accent-cream)" strokeWidth="2" />
        <circle cx="30" cy="75" r="10" fill="var(--bg-cream)" stroke="var(--accent-cream)" strokeWidth="2" />
        <circle cx="30" cy="120" r="10" fill="var(--bg-cream)" stroke="var(--accent-cream)" strokeWidth="2" />
        
        <circle cx="100" cy="75" r="12" fill="var(--accent-cream)" />
        
        <circle cx="170" cy="50" r="10" fill="var(--bg-cream)" stroke="var(--accent-cream)" strokeWidth="2" />
        <circle cx="170" cy="100" r="10" fill="var(--bg-cream)" stroke="var(--accent-cream)" strokeWidth="2" />
      </svg>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-cream)', marginTop: '1rem' }}>
        MultiOutput Random Forest processes all signals
      </div>
    </motion.div>
  );
}

const Step3Demo = () => {
  const [isFault, setIsFault] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFault(f => !f);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
      <div style={{ 
        background: isFault ? 'rgba(255,59,59,0.1)' : 'rgba(0,255,102,0.1)',
        border: `1px solid ${isFault ? 'var(--red-danger)' : 'var(--green-success)'}`,
        padding: '1rem',
        borderRadius: '8px',
        width: '200px',
        margin: '0 auto 1rem',
        transition: 'all 0.5s'
      }}>
        <div style={{ color: isFault ? 'var(--red-danger)' : 'var(--green-success)', fontWeight: 'bold' }}>
          {isFault ? 'FAULT DETECTED' : 'HEALTHY'}
        </div>
        <div style={{ marginTop: '1rem' }}>
           <div style={{ height: 4, background: 'rgba(0,0,0,0.1)', marginBottom: 4 }}>
             <div style={{ height: '100%', width: isFault ? '80%' : '10%', background: isFault ? 'var(--red-danger)' : 'var(--green-success)', transition: 'width 0.5s' }}></div>
           </div>
           <div style={{ height: 4, background: 'rgba(0,0,0,0.1)' }}>
             <div style={{ height: '100%', width: isFault ? '60%' : '5%', background: isFault ? 'var(--red-danger)' : 'var(--green-success)', transition: 'width 0.5s' }}></div>
           </div>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-cream)' }}>
        Instant prediction with maintenance guidance
      </div>
    </motion.div>
  );
};

const steps = [
  { num: 1, title: 'Input Sensor Data', desc: 'Continuous metrics collection' },
  { num: 2, title: 'AI Processes Data', desc: 'Real-time classification' },
  { num: 3, title: 'Get Health Report', desc: 'Actionable diagnostics' },
];

const HowItWorksInteractive = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced || isHovered) return;
    const interval = setInterval(() => {
      setActiveStep(s => (s + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [prefersReduced, isHovered]);

  return (
    <div className="cream-section" style={{ padding: '4rem 1rem', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', letterSpacing: '2px' }}>
          HOW IT WORKS
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--accent-soft)' }}>
          {/* LEFT PANEL */}
          <div 
            style={{ flex: '1 1 300px', borderRight: '1px solid var(--accent-soft)', position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  style={{ 
                    padding: '1.5rem', 
                    cursor: 'pointer',
                    borderLeft: `4px solid ${isActive ? 'var(--accent-cream)' : 'transparent'}`,
                    background: isActive ? 'var(--bg-cream)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isActive ? 'var(--accent-cream)' : 'transparent',
                    border: `1px solid ${isActive ? 'transparent' : 'var(--text-muted)'}`,
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontWeight: isActive ? 'bold' : 'normal', color: 'var(--text-cream)' }}>{step.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                  </div>
                </div>
              );
            })}
            
            {/* Progress Bar */}
            {!prefersReduced && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'var(--accent-soft)', width: '100%' }}>
                <motion.div
                  key={activeStep}
                  initial={{ width: '0%' }}
                  animate={{ width: isHovered ? 'var(--current-width, 0%)' : '100%' }}
                  transition={{ duration: 4, ease: 'linear' }}
                  style={{ height: '100%', background: 'var(--accent-cream)' }}
                  onUpdate={v => {
                     // store width on element for pause resume theoretically, simplified here
                  }}
                />
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div style={{ flex: '2 1 400px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <AnimatePresence mode="wait">
              {activeStep === 0 && <Step1Demo key="step1" />}
              {activeStep === 1 && <Step2Demo key="step2" />}
              {activeStep === 2 && <Step3Demo key="step3" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksInteractive;
