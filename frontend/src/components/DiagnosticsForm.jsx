import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';

const DualInput = ({ label, name, value, onChange, min, max, step, hint }) => {
  const [isFocused, setIsFocused] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-6 relative group">
      <div className="flex justify-between items-end mb-2">
        <label className={`font-heading text-sm transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-gray-400'}`}>
          {label} {hint && <span className="text-xs text-gray-600 ml-1">({hint})</span>}
        </label>
        <input 
          type="number" 
          name={name} 
          value={value} 
          onChange={onChange} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min} 
          max={max} 
          step={step} 
          className="bg-transparent border-b border-white/20 text-right text-white font-mono w-24 focus:outline-none focus:border-primary transition-colors pb-1"
        />
      </div>
      
      <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        <input 
          type="range" 
          name={name}
          value={value} 
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min} 
          max={max} 
          step={step}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      {/* Glow effect on focus */}
      {isFocused && (
        <div className="absolute -inset-2 bg-primary/5 rounded-lg -z-10 blur-sm pointer-events-none" />
      )}
    </div>
  );
};

const presets = {
  normal: { name: 'Normal', data: { air_temperature: 298.1, process_temperature: 308.6, rotational_speed: 1500, torque: 40, tool_wear: 50, type_L: 0, type_M: 1 } },
  stress: { name: 'Stress', data: { air_temperature: 330, process_temperature: 345, rotational_speed: 2000, torque: 65, tool_wear: 180, type_L: 1, type_M: 0 } },
  worn: { name: 'Worn Tool', data: { air_temperature: 305, process_temperature: 315, rotational_speed: 1400, torque: 55, tool_wear: 220, type_L: 0, type_M: 0 } }
};

const DiagnosticsForm = ({ formData, setFormData, onSubmit, isLoading }) => {
  const [activePreset, setActivePreset] = useState('normal');

  const handleChange = (e) => {
    setActivePreset(null);
    const { name, value, type } = e.target;
    if (type === 'radio') {
      if (value === 'L') setFormData({ ...formData, type_L: 1, type_M: 0 });
      if (value === 'M') setFormData({ ...formData, type_L: 0, type_M: 1 });
      if (value === 'H') setFormData({ ...formData, type_L: 0, type_M: 0 });
    } else {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    }
  };

  const applyPreset = (key) => {
    setActivePreset(key);
    setFormData(presets[key].data);
  };

  const currentType = formData.type_L === 1 ? 'L' : formData.type_M === 1 ? 'M' : 'H';

  return (
    <div className="glass-card p-8 md:p-10 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Activity className="text-primary" size={20} />
          </div>
          <h3 className="text-xl font-heading font-medium tracking-wide">Telemetry Input</h3>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
          {Object.entries(presets).map(([key, preset]) => (
            <button 
              key={key} 
              type="button"
              onClick={() => applyPreset(key)}
              className={`px-4 py-1.5 rounded-md text-xs font-heading uppercase tracking-wider transition-all duration-300 ${
                activePreset === key 
                  ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <div>
            <DualInput label="Air Temperature" name="air_temperature" value={formData.air_temperature} onChange={handleChange} min={250} max={400} step="0.1" hint="K" />
            <DualInput label="Process Temperature" name="process_temperature" value={formData.process_temperature} onChange={handleChange} min={250} max={450} step="0.1" hint="K" />
            <DualInput label="Tool Wear" name="tool_wear" value={formData.tool_wear} onChange={handleChange} min={0} max={300} step="1" hint="min" />
          </div>
          <div>
            <DualInput label="Rotational Speed" name="rotational_speed" value={formData.rotational_speed} onChange={handleChange} min={1} max={3000} step="1" hint="RPM" />
            <DualInput label="Torque" name="torque" value={formData.torque} onChange={handleChange} min={0.1} max={100} step="0.1" hint="Nm" />
            
            <div className="mb-6 mt-4">
              <label className="font-heading text-sm text-gray-400 block mb-3">Machine Quality Type</label>
              <div className="flex gap-4">
                {['L', 'M', 'H'].map((type) => (
                  <label key={type} className="flex-1 cursor-pointer group">
                    <input
                      type="radio"
                      name="machine_type"
                      value={type}
                      checked={currentType === type}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="text-center py-2 rounded-lg border border-white/10 bg-black/40 text-gray-400 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary peer-checked:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-300 font-heading">
                      {type === 'L' ? 'Low' : type === 'M' ? 'Medium' : 'High'}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs font-mono text-gray-500">
            {activePreset ? <span className="text-primary flex items-center gap-2"><Zap size={12}/> Preset Profile Loaded</span> : 'Custom Profile Active'}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Run AI Diagnostics'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosticsForm;
