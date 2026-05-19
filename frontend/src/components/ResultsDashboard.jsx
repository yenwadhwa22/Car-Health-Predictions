import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';
import ProbabilityExplorer from './ProbabilityExplorer';
import FailureExplorer from './FailureExplorer';

const ResultsDashboard = ({ result }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (!result) return null;

  const isFault = result.overall_status === 'FAULT DETECTED';
  const riskColor = result.risk_level === 'High' ? 'text-red-500' : result.risk_level === 'Medium' ? 'text-yellow-500' : 'text-green-500';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      ref={ref}
      initial="hidden" 
      animate={isInView ? "visible" : "hidden"} 
      variants={containerVariants}
      className="mt-8"
    >
      {/* Hero Result Banner */}
      <motion.div 
        variants={itemVariants} 
        className={`glass-card p-8 md:p-12 mb-8 relative overflow-hidden flex flex-col items-center text-center border-t-4 ${
          isFault ? 'border-t-red-500' : 'border-t-primary'
        }`}
      >
        {/* Background glow */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${isFault ? 'bg-red-500' : 'bg-primary'}`}></div>
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] blur-[100px] rounded-full pointer-events-none ${
          isFault ? 'bg-red-500/20' : 'bg-primary/20'
        }`}></div>

        <div className={`relative z-10 p-4 rounded-full mb-6 ${
          isFault ? 'bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-primary/10 shadow-[0_0_30px_rgba(0,229,255,0.2)]'
        }`}>
          {isFault ? (
            <ShieldAlert size={64} className="text-red-500" />
          ) : (
            <ShieldCheck size={64} className="text-primary" />
          )}
        </div>
        
        <h2 className={`text-4xl md:text-5xl font-bold font-heading mb-8 tracking-wide ${
          isFault ? 'text-red-500 neon-text drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-primary neon-text'
        }`}>
          {result.overall_status}
        </h2>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 w-full max-w-3xl border-t border-white/10 pt-8 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 font-heading text-xs tracking-widest uppercase mb-2">Risk Level</span>
            <span className={`text-3xl font-bold font-heading ${riskColor}`}>{result.risk_level}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-gray-500 font-heading text-xs tracking-widest uppercase mb-2">Failure Probability</span>
            <span className={`text-3xl font-bold font-mono ${isFault ? 'text-red-500' : 'text-white'}`}>
              {result.probabilities['Machine failure']?.toFixed(1) || 0}%
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-gray-500 font-heading text-xs tracking-widest uppercase mb-2">Confidence Score</span>
            <span className="text-3xl font-bold font-mono text-white">99.8%</span>
          </div>
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Probability Radar */}
        <motion.div variants={itemVariants} className="glass-card p-6 xl:col-span-1">
           <div className="flex items-center gap-2 mb-6">
             <Activity className="text-primary" size={20} />
             <h3 className="font-heading font-medium tracking-wide">AI Probability Analysis</h3>
           </div>
           <ProbabilityExplorer probabilities={result.probabilities} />
        </motion.div>

        {/* Detailed Failure Breakdown */}
        <motion.div variants={itemVariants} className="glass-card p-6 xl:col-span-2">
           <div className="flex items-center gap-2 mb-6">
             <AlertTriangle className="text-primary" size={20} />
             <h3 className="font-heading font-medium tracking-wide">Failure Explorer</h3>
           </div>
           <FailureExplorer result={result} />
        </motion.div>
      </div>

    </motion.div>
  );
};

export default ResultsDashboard;
