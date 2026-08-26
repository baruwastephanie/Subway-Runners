import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHARACTERS } from '../data/characters';

interface PlayerProps {
  playerRef: React.RefObject<THREE.Group>;
  playerState: React.MutableRefObject<{
    lane: number;
    y: number;
    isSliding: boolean;
    isJumping: boolean;
    box: THREE.Box3;
  }>;
  isPaused: boolean;
  laneWidth: number;
  speed: number;
  characterId?: string;
}

const GRAVITY = -60;
const JUMP_FORCE = 20;
const SLIDE_DURATION = 0.65;

export default function Player({ playerRef, playerState, isPaused, laneWidth, speed, characterId = 'default' }: PlayerProps) {
  const characterData = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
  const { primary, secondary, skin, hair, shoes } = characterData.colors;

  const velocityY = useRef(0);

  const slideTimer = useRef(0);
  
  // Animation refs
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftCalfRef = useRef<THREE.Group>(null);
  const rightCalfRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const hairRef = useRef<THREE.Group>(null);
  const characterGroupRef = useRef<THREE.Group>(null);
  const hitboxRef = useRef<THREE.Mesh>(null);
  const clockRef = useRef(0);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      const state = playerState.current;
      
      switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          if (state.lane > -1) state.lane -= 1;
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (state.lane < 1) state.lane += 1;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          if (!state.isJumping && !state.isSliding) {
            state.isJumping = true;
            velocityY.current = JUMP_FORCE;
          }
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (!state.isJumping && !state.isSliding) {
            state.isSliding = true;
            slideTimer.current = SLIDE_DURATION;
          } else if (state.isJumping) {
            // Fast fall
            velocityY.current = -JUMP_FORCE;
          }
          break;
      }
    };

    let pointerStartX = 0;
    let pointerStartY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      pointerStartX = e.touches[0].clientX;
      pointerStartY = e.touches[0].clientY;
    };

    let lastSwipeTime = 0;

    const processSwipe = (endX: number, endY: number) => {
      if (isPaused) return;
      const now = Date.now();
      if (now - lastSwipeTime < 50) return; // Prevent double-fire from touch+pointer events
      
      const dx = endX - pointerStartX;
      const dy = endY - pointerStartY;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (Math.abs(dx) > 20) {
          const state = playerState.current;
          if (dx > 0 && state.lane < 1) state.lane += 1;
          else if (dx < 0 && state.lane > -1) state.lane -= 1;
          lastSwipeTime = now;
        }
      } else {
        // Vertical swipe
        if (Math.abs(dy) > 20) {
          const state = playerState.current;
          if (dy < 0 && !state.isJumping && !state.isSliding) {
            // Swipe Up -> Jump
            state.isJumping = true;
            velocityY.current = JUMP_FORCE;
            lastSwipeTime = now;
          } else if (dy > 0) {
            // Swipe Down -> Slide
            if (!state.isJumping && !state.isSliding) {
              state.isSliding = true;
              slideTimer.current = SLIDE_DURATION;
              lastSwipeTime = now;
            } else if (state.isJumping) {
              velocityY.current = -JUMP_FORCE;
              lastSwipeTime = now;
            }
          }
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      processSwipe(e.clientX, e.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      processSwipe(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPaused, playerState]);

  useFrame((_, delta) => {
    if (isPaused || !playerRef.current) return;

    const state = playerState.current;
    const group = playerRef.current;
    
    // Scale animation speed with the game speed
    clockRef.current += delta * speed; 

    // Handle lane movement (lerp)
    const targetX = state.lane * laneWidth;
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, 25 * delta);

    // Handle jumping & gravity
    if (state.isJumping) {
      velocityY.current += GRAVITY * delta;
      state.y += velocityY.current * delta;

      if (state.y <= 0) {
        state.y = 0;
        state.isJumping = false;
        velocityY.current = 0;
      }
    }

    // Handle sliding
    if (state.isSliding) {
      slideTimer.current -= delta;
      if (slideTimer.current <= 0) {
        state.isSliding = false;
      }
    }

    // Apply Y position
    group.position.y = state.y;
    
    // Scale down character group for sliding (ducking)
    const targetScaleY = state.isSliding ? 0.5 : 1;
    if (characterGroupRef.current) {
      characterGroupRef.current.scale.y = THREE.MathUtils.lerp(characterGroupRef.current.scale.y, targetScaleY, 15 * delta);
      // Pitch forward slightly when sliding for dynamic feel, return to upright when not
      const targetPitch = state.isSliding ? 0.4 : 0;
      characterGroupRef.current.rotation.x = THREE.MathUtils.lerp(characterGroupRef.current.rotation.x, targetPitch, 15 * delta);
    }
    
    // Animation: Legs and Arms
    if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current && bodyRef.current && characterGroupRef.current) {
      if (state.isJumping) {
        // Jump pose: legs point slightly forward, knees bent backward
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.4, 10 * delta);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0.1, 10 * delta);
        if (leftCalfRef.current) leftCalfRef.current.rotation.x = THREE.MathUtils.lerp(leftCalfRef.current.rotation.x, -0.6, 10 * delta);
        if (rightCalfRef.current) rightCalfRef.current.rotation.x = THREE.MathUtils.lerp(rightCalfRef.current.rotation.x, -0.2, 10 * delta);
        
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, Math.PI - 0.5, 10 * delta); // arms up
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, Math.PI - 0.5, 10 * delta);
        
        bodyRef.current.rotation.y = 0;
        // Don't modify characterGroupRef position.y here, it ruins the bounce
      } else if (state.isSliding) {
        // Slide pose: tuck arms and legs
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.8, 15 * delta); // legs forward
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0.8, 15 * delta);
        if (leftCalfRef.current) leftCalfRef.current.rotation.x = THREE.MathUtils.lerp(leftCalfRef.current.rotation.x, 0, 15 * delta);
        if (rightCalfRef.current) rightCalfRef.current.rotation.x = THREE.MathUtils.lerp(rightCalfRef.current.rotation.x, 0, 15 * delta);

        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.5, 15 * delta); // arms tucked forward
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 15 * delta);
      } else {
        // Running animation
        const runSpeed = 1.8;
        const runCycle = Math.sin(clockRef.current * runSpeed);
        const runCycleCos = Math.cos(clockRef.current * runSpeed);
        
        // Leg swing (positive = forward)
        leftLegRef.current.rotation.x = runCycle * 0.7;
        rightLegRef.current.rotation.x = -runCycle * 0.7;
        
        // Knee bend (bend backward, which is negative X rotation)
        // We bend the knee when the leg is moving backward (runCycle is negative for left leg)
        if (leftCalfRef.current) leftCalfRef.current.rotation.x = Math.min(0, runCycle * 1.5);
        if (rightCalfRef.current) rightCalfRef.current.rotation.x = Math.min(0, -runCycle * 1.5);
        
        // Arm swing (opposite of legs)
        leftArmRef.current.rotation.x = -runCycle * 0.6;
        rightArmRef.current.rotation.x = runCycle * 0.6;
        
        // Slight body twist
        bodyRef.current.rotation.y = Math.sin(clockRef.current * runSpeed) * 0.1;

        // Body bounce
        characterGroupRef.current.position.y = Math.abs(runCycleCos) * 0.15;
        
        // Hair bounce
        if (hairRef.current) {
          hairRef.current.rotation.x = 0.2 + Math.abs(runCycleCos) * 0.15;
          hairRef.current.rotation.z = -runCycle * 0.1;
        }
      }
    }

    // Update bounding box for collision detection
    if (hitboxRef.current) {
      hitboxRef.current.updateMatrixWorld(true);
      state.box.setFromObject(hitboxRef.current);
    } else {
      group.updateMatrixWorld(true);
      state.box.setFromObject(group);
      state.box.expandByScalar(-0.2); 
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      {/* 3D Character Model (Animated Santa Girl) */}
      
      <group ref={characterGroupRef}>
        {/* Invisible Exact Hitbox */}
        <mesh ref={hitboxRef} position={[0, 0.8, 0]} visible={false}>
          <boxGeometry args={[0.5, 1.4, 0.4]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        <group ref={bodyRef}>
          {/* Torso Base */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <capsuleGeometry args={[0.18, 0.35, 16, 16]} />
            <meshStandardMaterial color={primary} roughness={0.7} />
          </mesh>
          
          {/* Belt */}
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.19, 0.19, 0.12, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.72, 0.17]} castShadow>
            <boxGeometry args={[0.14, 0.14, 0.06]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Skirt / Coat Bottom */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <coneGeometry args={[0.35, 0.35, 32, 1, true]} />
            <meshStandardMaterial color={primary} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>

          {/* Head & Neck */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial color={skin} roughness={0.4} />
          </mesh>
          
          {/* Hair */}
          <group ref={hairRef} position={[0, 1.25, -0.05]}>
            {/* Hair Cap */}
            <mesh castShadow>
              <sphereGeometry args={[0.19, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
              <meshStandardMaterial color={hair} roughness={0.8} />
            </mesh>
            {/* Ponytail / Back Hair */}
            <mesh position={[0, -0.25, -0.15]} rotation={[0.2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.14, 0.4, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.8} />
            </mesh>
          </group>

          {/* Hat */}
          <group position={[0, 1.38, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.17, 0.06, 16, 32]} />
              <meshStandardMaterial color={secondary} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.18, -0.05]} rotation={[-0.2, 0, 0]} castShadow>
              <coneGeometry args={[0.16, 0.4, 32]} />
              <meshStandardMaterial color={primary} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.38, -0.15]} castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color={secondary} roughness={0.9} />
            </mesh>
          </group>

          {/* Left Arm (Jointed) */}
          <group position={[-0.24, 1.05, 0]} ref={leftArmRef}>
            {/* Shoulder to Elbow */}
            <mesh position={[-0.02, -0.12, 0]} rotation={[0, 0, 0.2]} castShadow>
              <capsuleGeometry args={[0.05, 0.18, 16, 16]} />
              <meshStandardMaterial color={primary} roughness={0.7} />
            </mesh>
            <group position={[-0.05, -0.26, 0]} ref={leftForearmRef} rotation={[-0.2, 0, 0]}>
              <mesh position={[0, -0.08, 0]} castShadow>
                <capsuleGeometry args={[0.045, 0.15, 16, 16]} />
                <meshStandardMaterial color={primary} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.18, 0]} castShadow>
                <sphereGeometry args={[0.055, 16, 16]} />
                <meshStandardMaterial color={secondary} roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.24, 0]} castShadow>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshStandardMaterial color={skin} roughness={0.4} />
              </mesh>
            </group>
          </group>

          {/* Right Arm (Jointed) */}
          <group position={[0.24, 1.05, 0]} ref={rightArmRef}>
            {/* Shoulder to Elbow */}
            <mesh position={[0.02, -0.12, 0]} rotation={[0, 0, -0.2]} castShadow>
              <capsuleGeometry args={[0.05, 0.18, 16, 16]} />
              <meshStandardMaterial color={primary} roughness={0.7} />
            </mesh>
            <group position={[0.05, -0.26, 0]} ref={rightForearmRef} rotation={[-0.2, 0, 0]}>
              <mesh position={[0, -0.08, 0]} castShadow>
                <capsuleGeometry args={[0.045, 0.15, 16, 16]} />
                <meshStandardMaterial color={primary} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.18, 0]} castShadow>
                <sphereGeometry args={[0.055, 16, 16]} />
                <meshStandardMaterial color={secondary} roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.24, 0]} castShadow>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshStandardMaterial color={skin} roughness={0.4} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Left Leg (Jointed & Striped) */}
        <group position={[-0.12, 0.45, 0]} ref={leftLegRef}>
          <mesh position={[0, -0.1, 0]} castShadow><cylinderGeometry args={[0.06, 0.055, 0.1, 16]} /><meshStandardMaterial color={primary} /></mesh>
          <mesh position={[0, -0.2, 0]} castShadow><cylinderGeometry args={[0.055, 0.05, 0.1, 16]} /><meshStandardMaterial color={secondary} /></mesh>
          
          <group position={[0, -0.25, 0]} ref={leftCalfRef}>
            <mesh position={[0, -0.05, 0]} castShadow><cylinderGeometry args={[0.05, 0.045, 0.1, 16]} /><meshStandardMaterial color={primary} /></mesh>
            <mesh position={[0, -0.15, 0]} castShadow><cylinderGeometry args={[0.045, 0.04, 0.1, 16]} /><meshStandardMaterial color={secondary} /></mesh>
            <mesh position={[0, -0.25, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.1, 16]} /><meshStandardMaterial color={primary} /></mesh>
            {/* Shoe */}
            <mesh position={[0, -0.35, 0.04]} castShadow><capsuleGeometry args={[0.06, 0.12, 16, 16]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color={shoes} /></mesh>
            <mesh position={[0, -0.4, 0.04]} castShadow><boxGeometry args={[0.13, 0.04, 0.25]} /><meshStandardMaterial color={secondary} /></mesh>
          </group>
        </group>

        {/* Right Leg (Jointed & Striped) */}
        <group position={[0.12, 0.45, 0]} ref={rightLegRef}>
          <mesh position={[0, -0.1, 0]} castShadow><cylinderGeometry args={[0.06, 0.055, 0.1, 16]} /><meshStandardMaterial color={primary} /></mesh>
          <mesh position={[0, -0.2, 0]} castShadow><cylinderGeometry args={[0.055, 0.05, 0.1, 16]} /><meshStandardMaterial color={secondary} /></mesh>
          
          <group position={[0, -0.25, 0]} ref={rightCalfRef}>
            <mesh position={[0, -0.05, 0]} castShadow><cylinderGeometry args={[0.05, 0.045, 0.1, 16]} /><meshStandardMaterial color={primary} /></mesh>
            <mesh position={[0, -0.15, 0]} castShadow><cylinderGeometry args={[0.045, 0.04, 0.1, 16]} /><meshStandardMaterial color={secondary} /></mesh>
            <mesh position={[0, -0.25, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.1, 16]} /><meshStandardMaterial color={primary} /></mesh>
            {/* Shoe */}
            <mesh position={[0, -0.35, 0.04]} castShadow><capsuleGeometry args={[0.06, 0.12, 16, 16]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color={shoes} /></mesh>
            <mesh position={[0, -0.4, 0.04]} castShadow><boxGeometry args={[0.13, 0.04, 0.25]} /><meshStandardMaterial color={secondary} /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
