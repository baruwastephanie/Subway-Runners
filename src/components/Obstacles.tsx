import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ObstaclesProps {
  speed: number;
  isPaused: boolean;
  playerState: React.MutableRefObject<{
    lane: number;
    y: number;
    isSliding: boolean;
    isJumping: boolean;
    box: THREE.Box3;
  }>;
  laneWidth: number;
  onGameOver: () => void;
  onCoinCollect: () => void;
  onKeyCollect: () => void;
}

type ObstacleType = 'train' | 'jump' | 'slide' | 'coin' | 'key';

interface Entity {
  id: number;
  type: ObstacleType;
  lane: number;
  z: number;
  box: THREE.Box3;
  collected?: boolean;
}

const SPAWN_Z = -100;
const DESPAWN_Z = 10;

export default function Obstacles({ speed, isPaused, playerState, laneWidth, onGameOver, onCoinCollect, onKeyCollect }: ObstaclesProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const entitiesRef = useRef<Entity[]>([]);
  const nextId = useRef(0);
  const timeSinceLastSpawn = useRef(0);

  const spawnEntity = () => {
    // Randomize pattern
    const rand = Math.random();
    let type: ObstacleType = 'coin';
    if (rand < 0.3) type = 'train';
    else if (rand < 0.5) type = 'jump';
    else if (rand < 0.7) type = 'slide';
    else if (rand < 0.75) type = 'key'; // 5% chance for a key, very scarce compared to coins (25%)

    const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1

    const entity: Entity = {
      id: nextId.current++,
      type,
      lane,
      z: SPAWN_Z,
      box: new THREE.Box3()
    };

    if (type === 'coin') {
      // Spawn a line of coins
      const coins: Entity[] = [];
      for (let i = 0; i < 5; i++) {
        coins.push({
          id: nextId.current++,
          type: 'coin',
          lane,
          z: SPAWN_Z - i * 1.5,
          box: new THREE.Box3()
        });
      }
      return coins;
    }

    return [entity];
  };

  useFrame((_, delta) => {
    if (isPaused) return;

    timeSinceLastSpawn.current += delta;
    
    // Spawn logic based on speed (spawn more frequently as speed increases)
    const spawnRate = Math.max(0.5, 15 / speed);
    let changed = false;
    if (timeSinceLastSpawn.current > spawnRate) {
      const newEnts = spawnEntity();
      entitiesRef.current.push(...newEnts);
      timeSinceLastSpawn.current = 0;
      changed = true;
    }

    const remaining: Entity[] = [];
    let collision = false;
    let newlyCollected = 0;
    const playerBox = playerState.current.box;
    const currentEntities = entitiesRef.current;

    for (let i = 0; i < currentEntities.length; i++) {
      const entity = currentEntities[i];
      if (entity.collected) continue; // Skip collected coins/keys

      // Move entity
      entity.z += speed * delta;

      // Despawn if past camera
      if (entity.z > DESPAWN_Z) {
        changed = true;
        continue; // Don't add to remaining
      }

      // Check collision
      if (entity.box.intersectsBox(playerBox)) {
        if (entity.type === 'coin') {
          entity.collected = true;
          newlyCollected++;
          changed = true;
          continue; // Will be removed visually next frame
        } else if (entity.type === 'key') {
          entity.collected = true;
          // We can call onKeyCollect immediately or track it
          onKeyCollect();
          changed = true;
          continue;
        } else if (entity.type === 'slide' && playerState.current.isSliding) {
          // Player successfully slid under the barrier!
          // We ignore the collision.
        } else {
          collision = true;
        }
      }

      if (!entity.collected) {
        remaining.push(entity);
      }
    }

    if (newlyCollected > 0) {
      for (let i = 0; i < newlyCollected; i++) {
        onCoinCollect();
      }
    }
    if (collision) {
      onGameOver();
    }

    entitiesRef.current = remaining;
    if (changed) {
      setEntities([...remaining]); // Only trigger re-render if array actually changed (spawn/despawn/collect)
    }
  });

  return (
    <group>
      {entities.map(entity => {
        if (entity.type === 'train') {
          return <Train key={entity.id} entity={entity} laneWidth={laneWidth} />;
        }
        if (entity.type === 'jump') {
          return <JumpBarrier key={entity.id} entity={entity} laneWidth={laneWidth} />;
        }
        if (entity.type === 'slide') {
          return <SlideBarrier key={entity.id} entity={entity} laneWidth={laneWidth} />;
        }
        if (entity.type === 'coin') {
          return <Coin key={entity.id} entity={entity} laneWidth={laneWidth} />;
        }
        if (entity.type === 'key') {
          return <KeyItem key={entity.id} entity={entity} laneWidth={laneWidth} />;
        }
        return null;
      })}
    </group>
  );
}

function Train({ entity, laneWidth }: { entity: Entity, laneWidth: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = entity.z;
      entity.box.setFromObject(meshRef.current);
      // Make hitbox slightly smaller to be forgiving
      entity.box.expandByScalar(-0.2); 
    }
  });

  return (
    <group ref={meshRef} position={[entity.lane * laneWidth, 1.5, entity.z]}>
      {/* Train Body (Gray) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 3, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Train Roof (Blue) */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.9, 0.2, 8.1]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      {/* Front Window */}
      <mesh position={[0, 0.5, 4.01]} castShadow>
        <planeGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.6, -0.8, 4.01]} castShadow>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.6, -0.8, 4.01]} castShadow>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
      {/* Gold Crown/Shield detail */}
      <mesh position={[0, 1.2, 4.01]} castShadow>
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

function JumpBarrier({ entity, laneWidth }: { entity: Entity, laneWidth: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = entity.z;
      meshRef.current.updateMatrixWorld(true);
      entity.box.setFromObject(meshRef.current);
      entity.box.expandByScalar(-0.1);
      entity.box.min.z -= 0.3;
      entity.box.max.z += 0.3;
    }
  });

  return (
    <group ref={meshRef} position={[entity.lane * laneWidth, 0.5, entity.z]}>
      {/* Stand poles */}
      <mesh position={[-0.8, -0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0.8, -0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      
      {/* Main Bar (Striped visually by multiple boxes) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.6, 0, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.31, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.31, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.6, 0, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.31, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function SlideBarrier({ entity, laneWidth }: { entity: Entity, laneWidth: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = entity.z;
      meshRef.current.updateMatrixWorld(true);
      entity.box.setFromObject(meshRef.current);
      entity.box.expandByScalar(-0.1);
      entity.box.min.z -= 0.3;
      entity.box.max.z += 0.3;
    }
  });

  return (
    <group ref={meshRef} position={[entity.lane * laneWidth, 1.5, entity.z]}>
      {/* Side poles */}
      <mesh position={[-0.8, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0.8, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* Main Bar (Striped) */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.6, 0.5, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.31, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0.5, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.31, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.6, 0.5, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.31, 0.1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function Coin({ entity, laneWidth }: { entity: Entity, laneWidth: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      if (entity.collected) {
        meshRef.current.visible = false;
        return;
      }
      meshRef.current.position.z = entity.z;
      meshRef.current.rotation.y += delta * 3;
      entity.box.setFromObject(meshRef.current);
      
      // Expand hit box to prevent high-speed tunneling
      entity.box.min.z -= 0.8;
      entity.box.max.z += 0.8;
    }
  });

  return (
    <group ref={meshRef} position={[entity.lane * laneWidth, 0.5, entity.z]}>
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Inner design */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.05, 0, 0]}>
         <cylinderGeometry args={[0.15, 0.15, 0.11, 16]} />
         <meshStandardMaterial color="#fef08a" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.05, 0, 0]}>
         <cylinderGeometry args={[0.15, 0.15, 0.11, 16]} />
         <meshStandardMaterial color="#fef08a" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

function KeyItem({ entity, laneWidth }: { entity: Entity, laneWidth: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      if (entity.collected) {
        meshRef.current.visible = false;
        return;
      }
      meshRef.current.position.z = entity.z;
      // Bob up and down and rotate
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.position.y = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
      
      entity.box.setFromObject(meshRef.current);
      
      // Expand hit box to prevent high-speed tunneling
      entity.box.min.z -= 0.8;
      entity.box.max.z += 0.8;
    }
  });

  return (
    <group ref={meshRef} position={[entity.lane * laneWidth, 0.8, entity.z]}>
      {/* Key handle (round part) */}
      <mesh castShadow receiveShadow position={[-0.2, 0, 0]}>
        <torusGeometry args={[0.15, 0.05, 16, 32]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Key shaft */}
      <mesh castShadow receiveShadow position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Key teeth */}
      <mesh castShadow receiveShadow position={[0.2, -0.1, 0]}>
        <boxGeometry args={[0.05, 0.15, 0.04]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.1, -0.1, 0]}>
        <boxGeometry args={[0.05, 0.15, 0.04]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}
