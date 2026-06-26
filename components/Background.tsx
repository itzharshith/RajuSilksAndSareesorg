'use client';
import { useEffect, useRef } from 'react';

const LOGO_URL =
  'https://res.cloudinary.com/dbdzceo6f/image/upload/v1782464841/Gemini_Generated_Image_4r4oq14r4oq14r4o_2_cefvos.png';

/**
 * Globally-mounted fullscreen background.
 * - Fixed, covers entire viewport, never interferes with pointer events.
 * - Mouse-follow parallax: ±12px smooth GPU-accelerated movement.
 * - Dark cinematic overlay for readability across all pages.
 */
export default function Background() {
  const imgRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const MAX = 12; // max parallax offset in px

    const onMouseMove = (e: MouseEvent) => {
      // Normalise cursor to –1..1 relative to screen center
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      target.current = { x: nx * MAX, y: ny * MAX };
    };

    const tick = () => {
      // Lerp toward target — factor 0.04 = ultra-smooth 25-40s effective period
      pos.current.x += (target.current.x - pos.current.x) * 0.04;
      pos.current.y += (target.current.y - pos.current.y) * 0.04;

      if (imgRef.current) {
        // scale(0.8) keeps the watermark fully visible and centered with margins
        imgRef.current.style.transform =
          `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(0.8)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#07111E]"
    >
      {/* Silk background image */}
      <img
        ref={imgRef}
        src={LOGO_URL}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-contain object-center select-none"
        style={{ willChange: 'transform', transform: 'scale(0.8)' }}
        draggable={false}
      />
      {/* Cinematic dark overlay — ensures text readability on every page */}
      <div className="absolute inset-0 bg-brand-blue-deep/72" />
    </div>
  );
}
