import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

const Wheel = ({ position, color, emissiveColor, isFault }) => {
  const wheelRef = useRef();
  
  useFrame((state, delta) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x += delta * 4;
    }
  });

  return (
    <group position={position}>
      <mesh ref={wheelRef} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.5, 0.15, 16, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissiveColor}
          emissiveIntensity={isFault ? 3 : 2}
          wireframe={true}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Inner hub */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
         <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
         <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={1} wireframe />
      </mesh>
    </group>
  );
};

const CarSkeleton = ({ isFault }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating/rotating effect
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // Colors based on status
  const color = isFault ? '#ff2a2a' : '#00e5ff';
  const emissiveColor = isFault ? '#ff0000' : '#00e5ff';
  const secondaryColor = '#9d00ff';

  // Create a stylized wireframe chassis using Line
  const chassisPoints = useMemo(() => {
    return [
      [-2.2, -0.2, -1.1], [2.2, -0.2, -1.1], [2.2, -0.2, 1.1], [-2.2, -0.2, 1.1], [-2.2, -0.2, -1.1], // Base
      [-2.4, 0.4, -1.1], [2.4, 0.4, -1.1], [2.4, 0.4, 1.1], [-2.4, 0.4, 1.1], [-2.4, 0.4, -1.1], // Mid section
      [-1.2, 1.2, -0.9], [0.8, 1.2, -0.9], [0.8, 1.2, 0.9], [-1.2, 1.2, 0.9], [-1.2, 1.2, -0.9] // Roof
    ];
  }, []);

  const strutPoints = useMemo(() => {
    return [
      [-2.2, -0.2, -1.1], [-2.4, 0.4, -1.1], [-1.2, 1.2, -0.9],
      [2.2, -0.2, -1.1], [2.4, 0.4, -1.1], [0.8, 1.2, -0.9],
      [2.2, -0.2, 1.1], [2.4, 0.4, 1.1], [0.8, 1.2, 0.9],
      [-2.2, -0.2, 1.1], [-2.4, 0.4, 1.1], [-1.2, 1.2, 0.9]
    ];
  }, []);

  return (
    <group ref={groupRef} scale={[1.3, 1.3, 1.3]}>
      
      {/* Holographic Body Blocks */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4.8, 0.6, 2.2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissiveColor}
          emissiveIntensity={isFault ? 2 : 1.5}
          wireframe={true}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-0.2, 0.8, 0]}>
        <boxGeometry args={[2.0, 0.8, 1.8]} />
        <meshStandardMaterial 
          color={secondaryColor} 
          emissive={secondaryColor}
          emissiveIntensity={1}
          wireframe={true}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Chassis connecting lines */}
      <Line points={chassisPoints} color={color} lineWidth={3} transparent opacity={0.8} />
      <Line points={strutPoints.slice(0, 3)} color={color} lineWidth={2} transparent opacity={0.5} />
      <Line points={strutPoints.slice(3, 6)} color={color} lineWidth={2} transparent opacity={0.5} />
      <Line points={strutPoints.slice(6, 9)} color={color} lineWidth={2} transparent opacity={0.5} />
      <Line points={strutPoints.slice(9, 12)} color={color} lineWidth={2} transparent opacity={0.5} />

      {/* Glowing Engine/Sensor Core */}
      <mesh position={[1.8, 0.2, 0]}>
         <octahedronGeometry args={[0.4, 0]} />
         <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={3} wireframe />
      </mesh>
      
      {/* Inner intense core */}
      <mesh position={[1.8, 0.2, 0]}>
         <sphereGeometry args={[0.15, 16, 16]} />
         <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Wheels */}
      <Wheel position={[-1.6, -0.3, 1.2]} color={color} emissiveColor={emissiveColor} isFault={isFault} />
      <Wheel position={[1.6, -0.3, 1.2]} color={color} emissiveColor={emissiveColor} isFault={isFault} />
      <Wheel position={[-1.6, -0.3, -1.2]} color={color} emissiveColor={emissiveColor} isFault={isFault} />
      <Wheel position={[1.6, -0.3, -1.2]} color={color} emissiveColor={emissiveColor} isFault={isFault} />

      {/* Hover/Ground Grid Effect directly under car */}
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 6, 20, 12]} />
        <meshBasicMaterial 
          color={secondaryColor} 
          wireframe 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

    </group>
  );
};

export default CarSkeleton;
