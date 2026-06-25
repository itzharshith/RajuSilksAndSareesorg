'use client';
import dynamic from 'next/dynamic';

// Three.js requires browser APIs — load with no SSR inside a client wrapper
const MannequinBackground = dynamic(
  () => import('@/components/MannequinBackground'),
  { ssr: false }
);

export default function MannequinWrapper() {
  return <MannequinBackground />;
}
