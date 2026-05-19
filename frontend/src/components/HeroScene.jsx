import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, PresentationControls, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import CarSkeleton from './CarSkeleton';

const LoadingSpinner = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 3;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" wireframe />
    </mesh>
  );
};

const HeroScene = ({ status, isLoading }) => {
  const isFault = status === 'FAULT DETECTED';

  return (
    <section className="relative h-[85vh] w-full bg-background overflow-hidden flex items-center justify-center">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-cyber-gradient opacity-30 pointer-events-none"></div>
      
      {/* Overlay Text Container */}
      <div className="absolute z-10 w-full text-center pointer-events-none px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full border border-primary/50 shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center bg-card">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,229,255,0.8)]"></div>
            </div>
            <span className="text-primary tracking-[0.3em] text-sm uppercase font-heading font-medium">System Active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4 text-white tracking-tight">
            DriveSense <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light leading-relaxed">
            AI-powered predictive vehicle intelligence and real-time machine health monitoring.
          </p>
        </motion.div>
      </div>

      {/* Interactive 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 1.5, 9]} />
          
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.2} />
          
          {/* Neon lights */}
          <pointLight position={[10, 10, 10]} intensity={1.5} color={isFault ? "#ff2a2a" : "#00e5ff"} />
          <pointLight position={[-10, -5, -10]} intensity={1} color="#9d00ff" />
          <spotLight position={[0, 5, 0]} intensity={0.5} color="#00e5ff" penumbra={1} angle={0.5} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1.5} />
          <Sparkles count={200} scale={12} size={1.5} speed={0.4} opacity={0.6} color={isFault ? "#ff2a2a" : "#00e5ff"} />

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <PresentationControls 
              global 
              config={{ mass: 2, tension: 500 }} 
              snap={{ mass: 4, tension: 1500 }} 
              rotation={[0, 0.4, 0]} 
              polar={[-Math.PI / 4, Math.PI / 4]} 
              azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
            >
              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <CarSkeleton isFault={isFault} />
              </Float>
            </PresentationControls>
          )}

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          </EffectComposer>
        </Canvas>
      </div>
      
      {/* Bottom fade out to blend with next section */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"></div>
    </section>
  );
};

export default HeroScene;
