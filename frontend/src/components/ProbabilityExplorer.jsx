import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const AnimatedBar = ({ name, value, index }) => {
  const colorClass = value < 40 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                     value < 70 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                     'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm font-heading">
        <span className="text-gray-300">{name}</span>
        <span className="font-mono text-gray-400">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isFail = data.A > 50;
    return (
      <div className="bg-card/90 backdrop-blur-md border border-primary/50 p-3 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.2)]">
        <div className="text-white font-bold mb-1">{data.subject}</div>
        <div className="text-primary font-mono text-lg">{data.A.toFixed(1)}%</div>
        <div className={`text-xs mt-1 font-bold ${isFail ? 'text-red-500' : 'text-green-500'}`}>
          {isFail ? 'CRITICAL RISK' : 'NORMAL'}
        </div>
      </div>
    );
  }
  return null;
};

const ProbabilityExplorer = ({ probabilities }) => {
  const [activeTab, setActiveTab] = useState('radar');

  const data = [
    { subject: 'TWF', A: probabilities.TWF, fullMark: 100 },
    { subject: 'HDF', A: probabilities.HDF, fullMark: 100 },
    { subject: 'PWF', A: probabilities.PWF, fullMark: 100 },
    { subject: 'OSF', A: probabilities.OSF, fullMark: 100 },
    { subject: 'RNF', A: probabilities.RNF, fullMark: 100 },
  ];

  const sortedData = [...data].sort((a, b) => b.A - a.A);

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-6 border-b border-white/10 mb-6 relative">
        {['radar', 'bar'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-heading uppercase tracking-wider text-sm transition-colors relative ${
              activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'radar' ? 'Radar View' : 'Linear View'}
            {activeTab === tab && (
              <motion.div 
                layoutId="prob-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(0,229,255,0.8)]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative flex-1 min-h-[250px]">
        <AnimatePresence mode="wait">
          {activeTab === 'radar' ? (
            <motion.div 
              key="radar"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
                  <PolarGrid stroke="rgba(0, 229, 255, 0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Space Grotesk' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Probability" 
                    dataKey="A" 
                    stroke="#00e5ff" 
                    strokeWidth={2}
                    fill="#00e5ff" 
                    fillOpacity={0.3}
                    isAnimationActive={true}
                    activeDot={{ r: 5, fill: '#fff', stroke: '#00e5ff', strokeWidth: 2 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RechartsRadar>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div
              key="bar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 overflow-y-auto pr-4 custom-scrollbar flex flex-col justify-center"
            >
              {sortedData.map((item, idx) => (
                <AnimatedBar key={item.subject} name={item.subject} value={item.A} index={idx} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProbabilityExplorer;
