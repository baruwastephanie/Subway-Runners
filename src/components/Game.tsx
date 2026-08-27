import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';

import Player from './Player';
import World from './World';
import Obstacles from './Obstacles';
import Snow from './Snow';

interface GameProps {
  isPaused: boolean;
  characterId: string;
  onGameOver: () => void;
  onCoinCollect: () => void;
  onKeyCollect: () => void;
  onScoreUpdate: (score: number) => void;
}

const GAME_SPEED_START = 12;
const GAME_SPEED_MAX = 40;
const LANE_WIDTH = 2;

function GameLoop({ isPaused, characterId, onGameOver, onCoinCollect, onKeyCollect, onScoreUpdate }: GameProps) {
  const [speed, setSpeed] = useState(GAME_SPEED_START);
  const scoreRef = useRef(0);
  const lastScoreUpdate = useRef(0);
  
  // Player state passed down/managed
  const playerRef = useRef<THREE.Group>(null);
  const playerState = useRef({
    lane: 0, // -1, 0, 1
    y: 0,
    isSliding: false,
    isJumping: false,
    box: new THREE.Box3()
  });

  useFrame((state, delta) => {
    if (isPaused) return;

    scoreRef.current += speed * delta * 0.1;

    // Increase speed progressively based on distance covered (scoreRef.current)
    const targetSpeed = Math.min(GAME_SPEED_START + scoreRef.current * 0.08, GAME_SPEED_MAX);
    
    // Only update state if difference is significant to avoid excessive re-renders
    if (Math.abs(targetSpeed - speed) > 0.2) {
      setSpeed(targetSpeed);
    }
    
    // Throttle UI updates to 10hz to prevent React from re-rendering everything every frame
    if (state.clock.elapsedTime - lastScoreUpdate.current > 0.1) {
      onScoreUpdate(scoreRef.current);
      lastScoreUpdate.current = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.1} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <Environment preset="city" />

      {/* World elements (ground, tracks, viaduct, scenery) */}
      <World speed={speed} isPaused={isPaused} />

      {/* Particle System for Snow */}
      <Snow count={800} />

      {/* Player character */}
      <Player playerRef={playerRef} playerState={playerState} isPaused={isPaused} laneWidth={LANE_WIDTH} speed={speed} characterId={characterId} />

      {/* Obstacles and Coins */}
      <Obstacles 
        speed={speed} 
        isPaused={isPaused} 
        playerState={playerState} 
        laneWidth={LANE_WIDTH}
        onGameOver={onGameOver}
        onCoinCollect={onCoinCollect}
        onKeyCollect={onKeyCollect}
      />
    </>
  );
}

export default function Game(props: GameProps) {
  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 3, 7], fov: 65, rotation: [-8 * (Math.PI / 180), 0, 0] }} 
    >
      <fog attach="fog" args={['#e0f2fe', 40, 110]} />
      <GameLoop {...props} />
    </Canvas>
  );
}
