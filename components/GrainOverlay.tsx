export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] opacity-[0.045] mix-blend-overlay noise-layer animate-grain"
    />
  );
}
