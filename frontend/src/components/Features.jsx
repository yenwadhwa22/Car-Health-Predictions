import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Wrench, ShieldAlert, LineChart, Activity, Zap } from 'lucide-react';

const features = [
  {
    icon: <Brain size={28} />,
    title: "AI Diagnostics",
    description: "Advanced machine learning algorithms analyze complex telemetry data patterns to predict failures before they occur."
  },
  {
    icon: <Wrench size={28} />,
    title: "Predictive Maintenance",
    description: "Intelligent scheduling recommendations extend equipment lifespan and minimize costly unplanned downtime."
  },
  {
    icon: <ShieldAlert size={28} />,
    title: "Multi-Failure Detection",
    description: "Simultaneously predicts Tool Wear, Heat Dissipation, Power, and Overstrain failures with extreme accuracy."
  },
  {
    icon: <Activity size={28} />,
    title: "Real-Time Monitoring",
    description: "Continuous streaming analytics engine processes high-frequency sensor data with sub-millisecond latency."
  },
  {
    icon: <LineChart size={28} />,
    title: "Risk Analysis",
    description: "Comprehensive probability distributions and risk scoring provide actionable insights for operations teams."
  },
  {
    icon: <Zap size={28} />,
    title: "Intelligent Recommendations",
    description: "Context-aware mitigation strategies automatically generated based on the specific failure prediction profile."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const Features = () => {
  return (
    <div className="container mx-auto px-6 lg:px-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary mb-6">
          <Activity size={16} />
          <span className="text-xs font-heading font-bold uppercase tracking-widest">Platform Capabilities</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
          Intelligent Operations
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto font-light">
          A comprehensive suite of predictive tools designed to revolutionize industrial maintenance through artificial intelligence.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={cardVariants} className="glass-card p-8 group">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              {feature.icon}
            </div>
            <h3 className="text-xl font-heading font-medium text-white mb-3 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
              {feature.description}
            </p>
            
            {/* Hover visual accent */}
            <div className="w-0 h-1 bg-gradient-to-r from-primary to-transparent mt-6 group-hover:w-1/2 transition-all duration-500 rounded-full"></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Features;
