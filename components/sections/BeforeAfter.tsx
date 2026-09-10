"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function BeforeAfter() {
  const [percent, setPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.min(100, Math.max(0, raw)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <section className="relative w-full bg-graphite-950 py-24 sm:py-36">
      <div className="container-edit mb-14 flex flex-col items-start gap-4 sm:mb-20">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="eyebrow"
        >
          Antes. Depois.
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="section-title text-[10vw] sm:text-[6vw] lg:text-[4vw]"
        >
          Cada projeto começa com
          <br className="hidden sm:block" /> um móvel que já possui uma
          história.
        </motion.h2>
      </div>

      <div className="container-edit">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          data-cursor="hover"
          className="relative aspect-[4/5] w-full max-w-3xl select-none overflow-hidden bg-graphite-900 sm:aspect-video sm:max-w-none touch-none"
        >
          <Image
            src="/images/chair/chair-after.jpg"
            alt="Móvel depois da restauração"
            fill
            sizes="100vw"
            className="object-cover object-center"
            draggable={false}
          />

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
          >
            <Image
              src="/images/chair/chair-before.jpg"
              alt="Móvel antes da restauração"
              fill
              sizes="100vw"
              className="object-cover object-center grayscale-[15%]"
              draggable={false}
            />
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 z-10 w-px bg-bone-50/80"
            style={{ left: `${percent}%` }}
          >
            <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone-50 bg-ink/60 backdrop-blur">
              <span className="h-3 w-3 border-b border-l border-bone-50 rotate-45" />
            </div>
          </div>

          <span className="absolute left-5 top-5 z-10 text-[11px] uppercase tracking-widest2 text-bone-50/90">
            Antes
          </span>
          <span className="absolute right-5 top-5 z-10 text-[11px] uppercase tracking-widest2 text-bone-50/90">
            Depois
          </span>
        </motion.div>
      </div>
    </section>
  );
}
