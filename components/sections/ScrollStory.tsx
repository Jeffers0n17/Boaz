"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGsap } from "@/lib/gsap";
import { storyScenes } from "@/lib/data";

export default function ScrollStory() {
  useGsap();
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const railRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = storyScenes.length;
    const ctx = gsap.context(() => {
      gsap.set(sceneRefs.current[0], { opacity: 1 });
      gsap.set(railRefs.current[0], { opacity: 1 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=" + n * 90 + "%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;

          if (lineRef.current) {
            lineRef.current.style.transform = `scaleY(${p})`;
          }

          for (let i = 0; i < n; i++) {
            const center = (i + 0.5) / n;
            const dist = Math.abs(p - center) * n;
            const opacity = Math.max(0, 1 - dist * 1.15);
            const scale = 1.06 + Math.min(0.14, (1 - opacity) * 0.06) + (1 - dist) * 0.02;

            const scene = sceneRefs.current[i];
            const img = imageRefs.current[i];
            const rail = railRefs.current[i];

            if (scene) {
              scene.style.opacity = String(opacity);
              scene.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
            }
            if (img) {
              img.style.transform = `scale(${Math.max(1.02, scale)})`;
            }
            if (rail) {
              rail.style.opacity = opacity > 0.5 ? "1" : "0.35";
            }
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-graphite-950"
    >
      {storyScenes.map((scene, i) => (
        <div
          key={scene.id}
          ref={(el) => {
            sceneRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <div
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            className="absolute inset-0 h-full w-full will-change-transform"
          >
            <Image
              src={scene.image}
              alt={`${scene.title} — HORIZONTEX`}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority={i === 0}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/30" />

          <div className="container-edit relative z-10 flex h-full flex-col justify-end pb-24 pt-32 sm:pb-32">
            <span className="eyebrow mb-4">
              0{i + 1} — Cena {i + 1} de {storyScenes.length}
            </span>
            <h3 className="section-title text-[15vw] sm:text-[9vw] lg:text-[6.5vw]">
              {scene.title}
            </h3>
            <p className="mt-4 max-w-sm text-sm text-bone-100/70 sm:text-base">
              {scene.caption}
            </p>
          </div>
        </div>
      ))}

      <div className="pointer-events-none absolute inset-y-0 right-6 z-20 hidden flex-col items-end justify-center gap-6 sm:right-10 lg:flex">
        <div className="relative h-40 w-px bg-bone-100/15">
          <div
            ref={lineRef}
            className="absolute left-0 top-0 h-full w-px origin-top bg-bone-50"
            style={{ transform: "scaleY(0)" }}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-32 z-20 hidden flex-col items-end gap-3 sm:right-10 lg:flex">
        {storyScenes.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => {
              railRefs.current[i] = el;
            }}
            className="text-right text-[10px] uppercase tracking-widest2 text-bone-100/40 opacity-35 transition-colors"
          >
            0{i + 1} {scene.title}
          </div>
        ))}
      </div>
    </section>
  );
}
