import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Sliders, Cpu, FileCheck } from 'lucide-react';

const steps = [
  {
    icon: <Sliders size={32} />,
    title: 'INPUT SENSOR DATA',
    desc: 'Enter live metrics from your machine\'s sensors including temperature, RPM, and torque.'
  },
  {
    icon: <Cpu size={32} />,
    title: 'AI ANALYSIS',
    desc: 'Our MultiOutput Balanced Random Forest model processes the data in real-time.'
  },
  {
    icon: <FileCheck size={32} />,
    title: 'HEALTH REPORT',
    desc: 'Receive an instant diagnostic report with failure probabilities and actionable advice.'
  }
];

const HowItWorks = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ padding: '4rem 1rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(0,245,255,0.1)', borderBottom: '1px solid rgba(0,245,255,0.1)', margin: '4rem 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--cyan-primary)', marginBottom: '3rem', letterSpacing: '2px' }}>
          HOW IT WORKS
        </h2>

        <motion.div 
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            position: 'relative'
          }}
        >
          {/* Connector Line (only visible on desktop via media query or flex magic, keeping it simple here) */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), transparent)',
            zIndex: 0
          }}></div>

          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} style={{ position: 'relative', zIndex: 1, textAlign: 'center', background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 1.5rem', 
                background: 'var(--bg-panel)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan-primary)',
                boxShadow: '0 0 15px rgba(0,245,255,0.2)',
                border: '2px solid var(--cyan-primary)'
              }}>
                {step.icon}
              </div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;
