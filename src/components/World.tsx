import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldProps {
  speed: number;
  isPaused: boolean;
}

const TRACK_LENGTH = 60;
const TILE_COUNT = 8;

export default function World({ speed, isPaused }: WorldProps) {
  const tracksRef = useRef<THREE.Group>(null);
  const sceneryRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isPaused) return;
    
    const moveZ = speed * delta;

    if (tracksRef.current) {
      tracksRef.current.children.forEach((child) => {
        child.position.z += moveZ;
        if (child.position.z > TRACK_LENGTH * 1.5) {
          child.position.z -= TRACK_LENGTH * TILE_COUNT;
        }
      });
    }

    if (sceneryRef.current) {
      sceneryRef.current.children.forEach((child) => {
        child.position.z += moveZ;
        if (child.position.z > TRACK_LENGTH * 1.5) {
          child.position.z -= TRACK_LENGTH * TILE_COUNT;
        }
      });
    }
  });

  return (
    <group>
      {/* Global Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -250]} receiveShadow>
        <planeGeometry args={[100, 600]} />
        <meshStandardMaterial color="#f8fafc" /> {/* Snow color */}
      </mesh>

      {/* Track Bed (Orange/Brownish dirt under tracks) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -250]} receiveShadow>
        <planeGeometry args={[6.5, 600]} />
        <meshStandardMaterial color="#c2410c" />
      </mesh>

      {/* Viaduct Arch in background (Stationary) */}
      <group position={[0, 0, -150]}>
        {/* Left Pillar */}
        <mesh position={[-13, 10, 0]} castShadow>
          <boxGeometry args={[4, 20, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Right Pillar */}
        <mesh position={[13, 10, 0]} castShadow>
          <boxGeometry args={[4, 20, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Top span */}
        <mesh position={[0, 22, 0]} castShadow>
          <boxGeometry args={[40, 4, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Arches */}
        <mesh position={[0, 9, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[11, 11, 4, 32, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#94a3b8" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Moving Tracks */}
      <group ref={tracksRef}>
        {Array.from({ length: TILE_COUNT }).map((_, i) => (
          <TrackTile key={`track-${i}`} zOffset={TRACK_LENGTH - i * TRACK_LENGTH} />
        ))}
      </group>

      {/* Moving Scenery (Houses, Trees, Poles) */}
      <group ref={sceneryRef}>
        {Array.from({ length: TILE_COUNT }).map((_, i) => (
          <SceneryTile key={`scene-${i}`} zOffset={TRACK_LENGTH - i * TRACK_LENGTH} />
        ))}
      </group>
    </group>
  );
}

function TrackTile({ zOffset }: { zOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, 0, zOffset);
    }
  }, [zOffset]);

  const rails = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  
  return (
    <group ref={groupRef}>
      {/* Rails */}
      {rails.map((x, i) => (
        <mesh key={`rail-${i}`} position={[x, 0.05, -TRACK_LENGTH / 2]} receiveShadow>
          <boxGeometry args={[0.1, 0.1, TRACK_LENGTH + 0.1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Wooden Ties */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={`tie-${i}`} position={[0, 0, -i * 2]} receiveShadow>
          <boxGeometry args={[6, 0.08, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
    </group>
  );
}

function SceneryTile({ zOffset }: { zOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, 0, zOffset);
    }
  }, [zOffset]);

  return (
    <group ref={groupRef}>
      {/* Left side houses */}
      <House position={[-6, 0, -10]} />
      <House position={[-6, 0, -30]} />
      <House position={[-6, 0, -50]} />
      
      {/* Right side houses */}
      <House position={[6, 0, -20]} rotation={[0, Math.PI, 0]} />
      <House position={[6, 0, -40]} rotation={[0, Math.PI, 0]} />
      
      {/* Presents */}
      <Present position={[-4, 0.5, -20]} color="#ef4444" ribbonColor="#fef08a" />
      <Present position={[-4.5, 0.5, -21]} color="#3b82f6" ribbonColor="#ef4444" />
      <Present position={[4.5, 0.5, -10]} color="#22c55e" ribbonColor="#ef4444" />
      <Present position={[4, 0.5, -30]} color="#eab308" ribbonColor="#ef4444" />
      
      {/* Festive Poles & Overhead Cables */}
      <Pole position={[-3.5, 0, -15]} />
      <Pole position={[3.5, 0, -15]} />
      <OverheadCables position={[0, 5, -15]} />

      <Pole position={[-3.5, 0, -45]} />
      <Pole position={[3.5, 0, -45]} />
      <OverheadCables position={[0, 5, -45]} />
    </group>
  );
}

function Present({ position, color, ribbonColor }: any) {
  return (
    <group position={position} castShadow>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Ribbons */}
      <mesh position={[0, 0.51, 0]} castShadow>
        <boxGeometry args={[1.02, 0.05, 0.2]} />
        <meshStandardMaterial color={ribbonColor} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.02, 1.02, 0.2]} />
        <meshStandardMaterial color={ribbonColor} />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={ribbonColor} />
      </mesh>
    </group>
  );
}

function OverheadCables({ position }: any) {
  return (
    <group position={position}>
      {/* Top wire */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[7, 0.05, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Center wreath */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <torusGeometry args={[0.5, 0.1, 8, 24]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      {/* Wreath Bow */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
    </group>
  );
}

function House(props: any) {
  return (
    <group {...props}>
      {/* Main Body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[2.8, 1.6, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Wreath */}
      <mesh position={[1.51, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.4, 0.1, 8, 24]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
    </group>
  );
}

function Pole(props: any) {
  return (
    <group {...props}>
      {/* Base */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.5, 8]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 3, 0.15]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.1]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
    </group>
  );
}
