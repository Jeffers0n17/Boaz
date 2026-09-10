"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGsap } from "@/lib/gsap";

export default function Impact() {
  useGsap();
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      gsap.fromTo(
        line1Ref.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "top 20%",
            scrub: 0.5,
          },
        }
      );
      gsap.fromTo(
        line2Ref.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 40%",
            end: "center 30%",
            scrub: 0.5,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[560px] w-full items-center overflow-hidden bg-graphite-950"
    >
      <div ref={imgRef} className="absolute inset-0 h-[120%] w-full -top-[10%]">
        <Image
          src="/images/chair/chair-explode-full.jpg"
          alt="Móvel restaurado, camadas de construção reveladas"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/50" />
      </div>

      <div className="container-edit relative z-10 flex flex-col gap-2">
        <h2
          ref={line1Ref}
          className="section-title text-[11vw] sm:text-[7vw] lg:text-[5vw]"
        >
          O tempo deixa marcas.
        </h2>
        <h2
          ref={line2Ref}
          className="section-title text-[11vw] text-brass-400 sm:text-[7vw] lg:text-[5vw]"
        >
          Nós transformamos elas.
        </h2>
      </div>
    </section>
  );
}
