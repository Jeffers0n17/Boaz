"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger, useGsap } from "@/lib/gsap";
import { whatsappLink } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.5 + i * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero() {
  useGsap();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        scale: 1.28,
        yPercent: 8,
        filter: "brightness(0.55) saturate(0.95)",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-graphite-950"
    >
      <div ref={imageRef} className="absolute inset-0 h-full w-full scale-[1.06]">
        <Image
          src="/images/chair/chair-assembled.jpg"
          alt="Poltrona sofisticada revestida em tecido premium, fotografada como objeto de design"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-ink/40" />
      </div>

      <div className="container-edit relative z-10 flex w-full flex-col gap-8 pb-20 pt-40 sm:pb-28">
        <motion.p
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="eyebrow font-serif text-lg italic tracking-normal text-bone-100/90 sm:text-2xl"
        >
          Seu móvel.
        </motion.p>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="section-title max-w-4xl text-[13vw] sm:text-[9vw] lg:text-[6.4vw]"
        >
          Uma nova
          <br />
          história.
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="max-w-md text-sm text-bone-100/70 sm:text-base"
        >
          Restauração e tapeçaria artesanal para móveis que merecem
          permanecer.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <a
            href={whatsappLink("Olá! Quero transformar meu móvel.")}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="btn-solid"
          >
            Transformar Meu Móvel
          </a>
          <a href="#projetos" data-cursor="hover" className="btn-line">
            Ver Projetos
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 right-6 z-10 hidden flex-col items-center gap-3 sm:right-10 lg:flex"
      >
        <span className="text-[10px] uppercase tracking-widest2 text-bone-100/50">
          Role
        </span>
        <span className="relative h-14 w-px overflow-hidden bg-bone-100/20">
          <span className="absolute inset-x-0 top-0 h-1/2 w-px animate-[fadeUp_1.8s_ease-in-out_infinite] bg-bone-50" />
        </span>
      </motion.div>
    </section>
  );
}
