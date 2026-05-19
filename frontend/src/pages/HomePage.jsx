import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import HeroScene from '../components/HeroScene';
import DiagnosticsForm from '../components/DiagnosticsForm';
import ResultsDashboard from '../components/ResultsDashboard';
import Features from '../components/Features';

function HomePage() {
  const [formData, setFormData] = useState({
    air_temperature: 298.1,
    process_temperature: 308.6,
    rotational_speed: 1551,
    torque: 42.8,
    tool_wear: 0,
    type_L: 0,
    type_M: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const formRef = useRef(null);
  const resultsRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      air_temperature: Number(formData.air_temperature),
      process_temperature: Number(formData.process_temperature),
      rotational_speed: Number(formData.rotational_speed),
      torque: Number(formData.torque),
      tool_wear: Number(formData.tool_wear),
      type_L: formData.type_L,
      type_M: formData.type_M,
    };

    const { data, apiError } = await apiService.predict(payload);

    setIsLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      setResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-white selection:bg-primary/30 font-sans"
    >
      <Navbar />

      <main>
        <section id="home">
          <HeroScene status={result?.overall_status} isLoading={isLoading} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-20 flex justify-center gap-6 mt-[-3rem] pb-16 px-4"
          >
            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary"
            >
              Start Prediction
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary"
            >
              View Dashboard
            </button>
          </motion.div>
        </section>

        <section id="features" className="py-20 relative">
          <Features />
        </section>

        <section id="dashboard" className="py-20 relative min-h-screen" ref={formRef}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"
          />

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                Run Diagnostics
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Enter current machine telemetry data to predict potential failures and receive
                AI-driven maintenance recommendations.
              </p>
            </motion.div>

            <DiagnosticsForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 border border-danger/50 bg-danger/10 rounded-xl text-center max-w-2xl mx-auto"
              >
                <h3 className="text-danger font-heading text-xl mb-2">Connection Error</h3>
                <p className="text-red-200">{error}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: result ? 1 : 0 }}
              className="mt-16"
              ref={resultsRef}
            >
              {result && <ResultsDashboard result={result} />}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 bg-black/50 text-center">
        <p className="text-gray-500 font-mono text-sm">© 2026 DriveSense AI. All rights reserved.</p>
      </footer>
    </motion.div>
  );
}

export default HomePage;
