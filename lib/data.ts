export const WHATSAPP_NUMBER = "5511999999999";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Projetos", href: "#projetos" },
  { label: "Materiais", href: "#materiais" },
  { label: "Processo", href: "#processo" },
  { label: "Sobre", href: "#sobre" },
  { label: "Orçamento", href: "#orcamento" },
];

export type Material = {
  id: string;
  name: string;
  description: string;
  texture: "linen" | "velvet" | "bouclé" | "suede" | "leather" | "custom";
  image?: string;
};

export const materials: Material[] = [
  {
    id: "linho",
    name: "Linho",
    description: "Leveza natural e caimento impecável, para um visual atemporal.",
    texture: "linen",
  },
  {
    id: "veludo",
    name: "Veludo",
    description: "Profundidade visual e toque sofisticado.",
    texture: "velvet",
  },
  {
    id: "boucle",
    name: "Bouclé",
    description: "Textura tátil e contemporânea, com conforto encorpado.",
    texture: "bouclé",
    image: "/images/chair/fabric-macro.jpg",
  },
  {
    id: "suede",
    name: "Suede",
    description: "Toque aveludado e discreto, elegância silenciosa.",
    texture: "suede",
  },
  {
    id: "couro",
    name: "Couro",
    description: "Caráter e durabilidade que ganham vida com o tempo.",
    texture: "leather",
  },
  {
    id: "personalizados",
    name: "Tecidos Personalizados",
    description: "Sua visão, curada por nós — em qualquer textura ou tom.",
    texture: "custom",
  },
];

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
  image: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Avaliação",
    description:
      "Estudamos a estrutura, a história e o potencial de cada peça antes de tocar nela.",
    image: "/images/chair/chair-assembled.jpg",
  },
  {
    number: "02",
    title: "Desmontagem",
    description:
      "Cada camada é removida com cuidado, revelando o que sustenta o móvel.",
    image: "/images/chair/chair-cushion-sep.jpg",
  },
  {
    number: "03",
    title: "Estrutura",
    description:
      "Madeira e encaixes são reforçados, restaurando a base para durar décadas.",
    image: "/images/chair/chair-explode-deep.jpg",
  },
  {
    number: "04",
    title: "Espuma",
    description:
      "Densidade e curva recalculadas para o conforto exato da peça original.",
    image: "/images/chair/chair-explode-mid.jpg",
  },
  {
    number: "05",
    title: "Costura",
    description:
      "Costuras artesanais, ponto a ponto, alinhadas ao desenho do móvel.",
    image: "/images/chair/stitch-macro.jpg",
  },
  {
    number: "06",
    title: "Revestimento",
    description:
      "O tecido escolhido ganha forma, tensionado com precisão milimétrica.",
    image: "/images/chair/chair-explode-soft.jpg",
  },
  {
    number: "07",
    title: "Acabamento",
    description:
      "Últimos ajustes, detalhes finais — e uma nova história pronta para começar.",
    image: "/images/chair/chair-after.jpg",
  },
];

export type Project = {
  id: string;
  title: string;
  category: string;
  material: string;
  year: string;
  size: "lg" | "md" | "sm";
  image: string;
  before?: string;
  description: string;
  kind: "photo" | "studio";
};

export const projects: Project[] = [
  {
    id: "poltrona-retro",
    title: "Poltrona Retrô",
    category: "Poltronas",
    material: "Bouclé Natural",
    year: "2025",
    size: "lg",
    image: "/images/chair/chair-assembled.jpg",
    before: "/images/chair/chair-before.jpg",
    description:
      "Uma poltrona de base em madeira maciça, reconstruída camada por camada — estrutura, espuma e revestimento em bouclé natural.",
    kind: "photo",
  },
  {
    id: "poltrona-lounge",
    title: "Poltrona Lounge",
    category: "Poltronas",
    material: "Linho Cru",
    year: "2025",
    size: "sm",
    image: "/images/chair/chair-cushion-sep.jpg",
    description:
      "Revisão completa de costuras e acabamento, mantendo a base de madeira torneada original.",
    kind: "photo",
  },
  {
    id: "cadeira-estrutura",
    title: "Cadeira de Estúdio",
    category: "Cadeiras",
    material: "Suede Grafite",
    year: "2024",
    size: "md",
    image: "/images/chair/chair-explode-struct.jpg",
    description:
      "Documentamos cada etapa da reconstrução estrutural para preservar o desenho original da cadeira.",
    kind: "photo",
  },
  {
    id: "sofas-estudio",
    title: "Sofás Sob Medida",
    category: "Sofás",
    material: "Veludo & Linho",
    year: "2025",
    size: "md",
    image: "",
    description:
      "Projetos autorais de sofás, do desenho da estrutura ao revestimento final. Consulte disponibilidade.",
    kind: "studio",
  },
  {
    id: "cabeceiras-estudio",
    title: "Cabeceiras Exclusivas",
    category: "Cabeceiras",
    material: "Couro & Bouclé",
    year: "2025",
    size: "sm",
    image: "",
    description:
      "Cabeceiras estofadas sob medida, com costuras decorativas e capitonê artesanal.",
    kind: "studio",
  },
  {
    id: "classicos-estudio",
    title: "Móveis Clássicos",
    category: "Móveis Clássicos",
    material: "Couro Envelhecido",
    year: "2024",
    size: "lg",
    image: "/images/chair/chair-explode-full.jpg",
    description:
      "Restauração de peças de época, preservando ferragens, entalhes e a alma original do móvel.",
    kind: "photo",
  },
  {
    id: "personalizados-estudio",
    title: "Projetos Personalizados",
    category: "Projetos Personalizados",
    material: "Curadoria sob medida",
    year: "2025",
    size: "sm",
    image: "",
    description:
      "Da ideia ao protótipo: desenvolvemos soluções exclusivas para peças únicas.",
    kind: "studio",
  },
];

export const storyScenes = [
  {
    id: "materia",
    title: "Matéria",
    caption: "O ponto de partida de toda transformação.",
    image: "/images/chair/fabric-macro.jpg",
  },
  {
    id: "textura",
    title: "Textura",
    caption: "A superfície revela o caráter do material.",
    image: "/images/chair/chair-cushion-sep.jpg",
  },
  {
    id: "precisao",
    title: "Precisão",
    caption: "Cada costura, alinhada com intenção.",
    image: "/images/chair/stitch-macro.jpg",
  },
  {
    id: "artesanato",
    title: "Artesanato",
    caption: "A construção que sustenta décadas de uso.",
    image: "/images/chair/chair-explode-deep.jpg",
  },
  {
    id: "transformacao",
    title: "Transformação",
    caption: "O móvel, inteiro — e novo outra vez.",
    image: "/images/chair/chair-after.jpg",
  },
];
