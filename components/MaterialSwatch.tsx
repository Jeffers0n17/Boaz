import Image from "next/image";
import type { Material } from "@/lib/data";

const backgrounds: Record<Material["texture"], string> = {
  linen:
    "repeating-linear-gradient(115deg, #cbb996 0px, #cbb996 2px, #b9a37c 3px, #cbb996 4px), linear-gradient(160deg, #d8c8a4, #a98f66)",
  velvet:
    "radial-gradient(140% 100% at 20% 0%, rgba(255,255,255,0.16), rgba(255,255,255,0) 45%), linear-gradient(155deg, #4a1620, #200a10 70%)",
  suede:
    "radial-gradient(120% 90% at 30% 10%, rgba(255,255,255,0.08), rgba(0,0,0,0) 55%), linear-gradient(150deg, #8a7458, #4f4133)",
  leather:
    "radial-gradient(120% 90% at 75% 10%, rgba(255,255,255,0.14), rgba(0,0,0,0) 50%), linear-gradient(160deg, #5b3a24, #26160c)",
  custom:
    "linear-gradient(100deg, #cbb996 0%, #cbb996 16%, #4a1620 16%, #4a1620 33%, #5b3a24 33%, #5b3a24 50%, #8a7458 50%, #8a7458 66%, #2e2c28 66%, #2e2c28 83%, #c9a15f 83%, #c9a15f 100%)",
  "bouclé": "",
};

export default function MaterialSwatch({ material }: { material: Material }) {
  if (material.image) {
    return (
      <div className="absolute inset-0">
        <Image
          src={material.image}
          alt={`Textura macro de ${material.name}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundImage: backgrounds[material.texture] }}
    >
      <div className="noise-layer absolute inset-0 opacity-[0.18] mix-blend-overlay" />
    </div>
  );
}
