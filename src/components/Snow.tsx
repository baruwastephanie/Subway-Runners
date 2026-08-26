import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Snow({ count = 500 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 60 - 20;
      const speed = 0.5 + Math.random() * 2;
      const factor = Math.random() * 100;
      temp.push({ x, y, z, speed, factor });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    particles.forEach((particle, i) => {
      let { x, y, z, speed, factor } = particle;

      // Fall down
      y -= speed * delta * 5;
      
      // Sway slightly
      x += Math.sin(state.clock.elapsedTime + factor) * 0.05;

      if (y < -2) {
        y = 20;
      }

      particle.y = y;
      particle.x = x;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.random() * 0.5 + 0.5);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </instancedMesh>
  );
}
