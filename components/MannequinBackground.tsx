'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Scroll tracker (shared across renders) ──────────────────────────────────
function useScrollRotation() {
  const targetY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      // Full rotation: 0 → 2π as page scrolls top → bottom
      targetY.current = progress * Math.PI * 2;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return targetY;
}

// ─── Silk material colours ────────────────────────────────────────────────────
const SILK_MAROON   = new THREE.Color('#7B1D2A');   // Kanchi deep crimson
const SILK_GOLD     = new THREE.Color('#D4AF37');   // Gold zari border
const SILK_PALLU    = new THREE.Color('#5C0E14');   // Darker pallu
const SILK_BLOUSE   = new THREE.Color('#8B1A1A');   // Blouse
const BODY_COLOR    = new THREE.Color('#D4A574');   // Warm skin tone
const HAIR_COLOR    = new THREE.Color('#1A0A00');   // Deep black hair

// ─── Mannequin parts ─────────────────────────────────────────────────────────
function Mannequin({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const currentY = useRef(0);
  const floatOffset = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Smooth lerp toward scroll target
    currentY.current = THREE.MathUtils.lerp(currentY.current, scrollY.current, 0.04);
    groupRef.current.rotation.y = currentY.current;
    // Gentle floating bob
    floatOffset.current += delta * 0.4;
    groupRef.current.position.y = Math.sin(floatOffset.current) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>

      {/* ── HEAD ── */}
      <mesh position={[0, 2.52, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} metalness={0.0} />
      </mesh>

      {/* Hair bun */}
      <mesh position={[0, 2.78, -0.06]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
      </mesh>
      {/* Hair cap */}
      <mesh position={[0, 2.60, 0]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.22, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={HAIR_COLOR} roughness={0.7} />
      </mesh>

      {/* ── NECK ── */}
      <mesh position={[0, 2.28, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.22, 16]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>

      {/* ── BLOUSE / UPPER TORSO ── */}
      <mesh position={[0, 1.88, 0]}>
        <cylinderGeometry args={[0.24, 0.22, 0.52, 24]} />
        <meshStandardMaterial color={SILK_BLOUSE} roughness={0.3} metalness={0.15} />
      </mesh>
      {/* Bust shaping */}
      <mesh position={[0.10, 1.95, 0.18]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={SILK_BLOUSE} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[-0.10, 1.95, 0.18]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={SILK_BLOUSE} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* ── GOLD NECKLINE BORDER ── */}
      <mesh position={[0, 2.12, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 10, 40, Math.PI * 1.1]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* ── SAREE DRAPE — MAIN BODY ── */}
      {/* Waist wrap cylinder */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.18, 24]} />
        <meshStandardMaterial color={SILK_MAROON} roughness={0.25} metalness={0.2} />
      </mesh>

      {/* Skirt — tapered flare */}
      <mesh position={[0, 0.90, 0]}>
        <cylinderGeometry args={[0.36, 0.50, 1.28, 32]} />
        <meshStandardMaterial color={SILK_MAROON} roughness={0.25} metalness={0.18} />
      </mesh>
      {/* Skirt lower flare */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.50, 0.54, 0.28, 32]} />
        <meshStandardMaterial color={SILK_MAROON} roughness={0.25} metalness={0.18} />
      </mesh>

      {/* Gold border hem */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 32]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.15} metalness={0.85} />
      </mesh>
      {/* Second gold stripe */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.535, 0.535, 0.03, 32]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.15} metalness={0.85} />
      </mesh>
      {/* Third gold stripe */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.02, 32]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Gold waist belt */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.055, 32]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.15} metalness={0.9} />
      </mesh>

      {/* ── PALLU — draped over left shoulder ── */}
      {/* Main pallu strip angled over left shoulder */}
      <mesh position={[-0.14, 1.80, 0.06]} rotation={[0.1, 0.15, -0.5]}>
        <boxGeometry args={[0.14, 0.90, 0.03]} />
        <meshStandardMaterial color={SILK_PALLU} roughness={0.2} metalness={0.22} side={THREE.DoubleSide} />
      </mesh>
      {/* Pallu gold border strip */}
      <mesh position={[-0.22, 1.78, 0.08]} rotation={[0.1, 0.15, -0.5]}>
        <boxGeometry args={[0.025, 0.90, 0.032]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Pallu trailing down (lower fabric folds) */}
      <mesh position={[-0.30, 1.22, 0.14]} rotation={[0.25, 0.2, -0.6]}>
        <boxGeometry args={[0.12, 0.68, 0.03]} />
        <meshStandardMaterial color={SILK_PALLU} roughness={0.2} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.38, 0.72, 0.18]} rotation={[0.4, 0.2, -0.55]}>
        <boxGeometry args={[0.10, 0.46, 0.03]} />
        <meshStandardMaterial color={SILK_PALLU} roughness={0.22} metalness={0.18} side={THREE.DoubleSide} />
      </mesh>

      {/* ── LEFT ARM (saree shoulder side) ── */}
      <mesh position={[-0.34, 1.82, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.075, 0.065, 0.58, 14]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
      {/* Left forearm */}
      <mesh position={[-0.44, 1.44, 0]} rotation={[0.3, 0, 0.18]}>
        <cylinderGeometry args={[0.06, 0.05, 0.46, 14]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>

      {/* ── RIGHT ARM ── */}
      <mesh position={[0.34, 1.82, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.075, 0.065, 0.58, 14]} />
        <meshStandardMaterial color={SILK_BLOUSE} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Right forearm */}
      <mesh position={[0.44, 1.44, 0]} rotation={[-0.15, 0, -0.18]}>
        <cylinderGeometry args={[0.06, 0.05, 0.46, 14]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>

      {/* Gold bangles on right wrist */}
      {[0, 0.05, 0.10].map((offset, i) => (
        <mesh key={i} position={[0.50, 1.22 + offset, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.052, 0.008, 8, 24]} />
          <meshStandardMaterial color={SILK_GOLD} roughness={0.1} metalness={0.95} />
        </mesh>
      ))}

      {/* ── PLEATS (fabric folds in front) ── */}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 1.12, 0.36]} rotation={[0.05, 0, 0]}>
          <boxGeometry args={[0.055, 0.78, 0.018]} />
          <meshStandardMaterial
            color={i === 1 ? SILK_GOLD : SILK_MAROON}
            roughness={0.2}
            metalness={i === 1 ? 0.8 : 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Gold pottu / bindi */}
      <mesh position={[0, 2.56, 0.21]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.1} metalness={1.0} />
      </mesh>

      {/* Maang tikka chain */}
      <mesh position={[0, 2.68, 0.10]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.005, 6, 20, Math.PI * 0.6]} />
        <meshStandardMaterial color={SILK_GOLD} roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Earrings */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.22, 2.46, 0.04]}>
          <cylinderGeometry args={[0.012, 0.022, 0.07, 10]} />
          <meshStandardMaterial color={SILK_GOLD} roughness={0.1} metalness={0.95} />
        </mesh>
      ))}

    </group>
  );
}

// ─── Floating particle dots for silk shimmer ─────────────────────────────────
function SilkParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 80;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 2.4;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={SILK_GOLD} size={0.022} sizeAttenuation transparent opacity={0.55} />
    </points>
  );
}

// ─── Scene wrapper ────────────────────────────────────────────────────────────
function Scene({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  return (
    <>
      <ambientLight intensity={0.9} color="#ffe8cc" />
      <directionalLight position={[3, 5, 3]} intensity={2.0} color="#fff5e0" castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#ffd0a0" />
      <pointLight position={[0, 3, 2]} intensity={1.2} color="#D4AF37" distance={8} />
      <spotLight position={[0, 6, 0]} intensity={1.8} angle={0.4} penumbra={0.8} color="#fffce8" />
      {/* Rim lights for silk sheen */}
      <pointLight position={[2, 1, -1]} intensity={0.6} color="#D4AF37" />
      <pointLight position={[-2, 1, -1]} intensity={0.5} color="#c0392b" />
      <Environment preset="sunset" />
      <SilkParticles />
      <Mannequin scrollY={scrollY} />
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function MannequinBackground() {
  const scrollY = useScrollRotation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '480px',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Soft radial glow so mannequin is visible on dark backgrounds */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 80% at 70% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Canvas
        camera={{ position: [0, 1.2, 3.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', opacity: 0.80 }}
      >
        <Scene scrollY={scrollY} />
      </Canvas>
    </div>
  );
}
