import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Flame, Zap, Weight, Dice5, AlertTriangle } from 'lucide-react';

const failureDetails = {
  'TWF': { icon: Settings, name: 'Tool Wear Failure', text: 'Gradual degradation of the cutting tool during machining. The tool has reached the end of its usable life and requires replacement to maintain precision.', conditions: ['Tool wear time > 200 mins', 'High temperature variance'] },
  'HDF': { icon: Flame, name: 'Heat Dissipation Failure', text: 'The machine is unable to effectively dissipate heat generated during the process. This leads to dangerous thermal expansion and potential structural damage.', conditions: ['High air temp', 'High process temp'] },
  'PWF': { icon: Zap, name: 'Power Failure', text: 'Irregularities in the power supply or motor draw. This indicates the machine is either stalling due to extreme load or experiencing electrical faults.', conditions: ['Low rotational speed', 'High torque'] },
  'OSF': { icon: Weight, name: 'Overstrain Failure', text: 'Mechanical overload on the machine components. The applied forces have exceeded the designed tensile strength, risking catastrophic breakage.', conditions: ['High torque', 'Specific machine types'] },
  'RNF': { icon: Dice5, name: 'Random Failure', text: 'An unpredictable stochastic failure event not directly tied to a single sensor threshold. Usually indicates a complex combination of marginal operating conditions.', conditions: ['Various'] }
};

const FailureExplorer = ({ result }) => {
  const failureTypes = ['TWF', 'HDF', 'PWF', 'OSF', 'RNF'];
  
  const defaultSelection = failureTypes.find(type => result.predictions[type] === 1) || 'TWF';
  const [selectedType, setSelectedType] = useState(defaultSelection);

  useEffect(() => {
    const firstFault = failureTypes.find(type => result.predictions[type] === 1);
    if (firstFault) setSelectedType(firstFault);
  }, [result]);

  const selectedData = failureDetails[selectedType];
  const isSelectedFail = result.predictions[selectedType] === 1;
  const selectedProb = result.probabilities[selectedType];
  
  const IconComponent = selectedData.icon;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Left List */}
      <div className="flex flex-col gap-2 w-full lg:w-1/3 min-w-[200px]">
        {failureTypes.map(type => {
          const isFail = result.predictions[type] === 1;
          const prob = result.probabilities[type];
          const isActive = selectedType === type;
          
          return (
            <button 
              key={type}
              onClick={() => setSelectedType(type)}
              className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left ${
                isActive 
                  ? 'bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isFail ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-primary shadow-[0_0_8px_rgba(0,229,255,0.5)]'}`}></div>
                <span className={`font-heading ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                  {type}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                   <div 
                     className={`h-full rounded-full ${isFail ? 'bg-red-500' : 'bg-primary'}`}
                     style={{ width: `${prob}%` }}
                   ></div>
                </div>
                <span className={`w-10 text-right text-xs font-mono ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {prob.toFixed(0)}%
                </span>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="active-failure-indicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Detail Panel */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`h-full rounded-2xl border bg-black/40 p-6 flex flex-col ${
              isSelectedFail ? 'border-red-500/50 shadow-[inset_0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/10'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
               <div className="flex gap-4 items-center">
                 <div className={`p-3 rounded-xl border ${
                   isSelectedFail 
                     ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                     : 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                 }`}>
                   <IconComponent size={32} />
                 </div>
                 <div>
                   <h3 className="text-xl font-heading text-white mb-1">{selectedData.name}</h3>
                   <div className={`inline-block px-3 py-0.5 rounded text-xs font-bold font-mono border uppercase tracking-wider ${
                     isSelectedFail 
                       ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                       : 'bg-green-500/20 text-green-400 border-green-500/50'
                   }`}>
                     {isSelectedFail ? 'Failure Detected' : 'Status Normal'}
                   </div>
                 </div>
               </div>
               
               {/* Minimal Probability Display instead of CircularGauge for better fit */}
               <div className="text-right">
                 <div className={`text-3xl font-mono font-bold ${isSelectedFail ? 'text-red-500' : 'text-primary'}`}>
                   {selectedProb.toFixed(1)}<span className="text-xl">%</span>
                 </div>
                 <div className="text-xs text-gray-500 tracking-widest font-heading uppercase">Probability</div>
               </div>
            </div>

            <div className="mb-6">
              <h4 className="text-primary text-sm font-heading tracking-wider uppercase mb-2">Analysis</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{selectedData.text}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-primary text-sm font-heading tracking-wider uppercase mb-2">Trigger Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedData.conditions.map((cond, i) => (
                  <span key={i} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            {isSelectedFail && result.maintenance_advice && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-auto pt-4"
              >
                 <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3 items-start">
                   <AlertTriangle className="text-red-400 shrink-0" size={20} />
                   <div>
                     <span className="text-red-400 font-bold text-sm block mb-1">RECOMMENDED ACTION</span>
                     <span className="text-gray-300 text-sm">
                       {result.maintenance_advice[0] || 'Schedule immediate maintenance and inspection.'}
                     </span>
                   </div>
                 </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FailureExplorer;
