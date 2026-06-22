import type { Therapy } from "./types";

const defaultShortDescription = "Pronto incorporaremos más información sobre esta terapia.";

export const canvaTherapies: Therapy[] = [
  { id: "local-acupuntura", slug: "acupuntura", name: "Acupuntura" },
  { id: "local-acupresion", slug: "acupresion", name: "Acupresión" },
  { id: "local-aromaterapia", slug: "aromaterapia", name: "Aromaterapia" },
  { id: "local-arteterapia", slug: "arteterapia", name: "Arteterapia" },
  { id: "local-ayurveda", slug: "ayurveda", name: "Ayurveda" },
  { id: "local-biodescodificacion", slug: "biodescodificacion", name: "Biodescodificación" },
  { id: "local-biomagnetismo", slug: "biomagnetismo", name: "Biomagnetismo" },
  { id: "local-coaching-emocional", slug: "coaching-emocional", name: "Coaching emocional" },
  { id: "local-coaching-de-vida", slug: "coaching-de-vida", name: "Coaching de vida" },
  { id: "local-comunicacion-animal", slug: "comunicacion-animal", name: "Comunicación animal" },
  {
    id: "local-constelaciones-familiares",
    slug: "constelaciones-familiares",
    name: "Constelaciones familiares",
  },
  { id: "local-cromoterapia", slug: "cromoterapia", name: "Cromoterapia" },
  { id: "local-danza-terapia", slug: "danza-terapia", name: "Danza terapia" },
  {
    id: "local-drenaje-linfatico-manual",
    slug: "drenaje-linfatico-manual",
    name: "Drenaje linfático manual",
  },
  {
    id: "local-eft-liberacion-emocional",
    slug: "eft-liberacion-emocional",
    name: "EFT (liberación emocional)",
  },
  { id: "local-emdr", slug: "emdr", name: "EMDR" },
  { id: "local-eneagrama", slug: "eneagrama", name: "Eneagrama" },
  {
    id: "local-equilibrio-energetico",
    slug: "equilibrio-energetico",
    name: "Equilibrio energético",
  },
  { id: "local-equinoterapia", slug: "equinoterapia", name: "Equinoterapia" },
  { id: "local-fasciaterapia", slug: "fasciaterapia", name: "Fasciaterapia" },
  { id: "local-feng-shui", slug: "feng-shui", name: "Feng Shui" },
  { id: "local-fitoterapia", slug: "fitoterapia", name: "Fitoterapia" },
  { id: "local-flores-de-bach", slug: "flores-de-bach", name: "Flores de Bach" },
  { id: "local-gestalt", slug: "gestalt", name: "Gestalt" },
  {
    id: "local-ginecologia-holistica",
    slug: "ginecologia-holistica",
    name: "Ginecología holística",
  },
  { id: "local-hipnosis", slug: "hipnosis", name: "Hipnosis" },
  { id: "local-homeopatia", slug: "homeopatia", name: "Homeopatía" },
  { id: "local-iridologia", slug: "iridologia", name: "Iridología" },
  { id: "local-kinesiologia", slug: "kinesiologia", name: "Kinesiología" },
  { id: "local-masaje-relajante", slug: "masaje-relajante", name: "Masaje relajante" },
  { id: "local-masaje-terapeutico", slug: "masaje-terapeutico", name: "Masaje terapéutico" },
  { id: "local-meditacion", slug: "meditacion", name: "Meditación" },
  {
    id: "local-medicina-tradicional-china",
    slug: "medicina-tradicional-china",
    name: "Medicina tradicional china",
  },
  { id: "local-mindfulness", slug: "mindfulness", name: "Mindfulness" },
  { id: "local-naturopatia", slug: "naturopatia", name: "Naturopatía" },
  { id: "local-nutricion-consciente", slug: "nutricion-consciente", name: "Nutrición consciente" },
  { id: "local-osteopatia", slug: "osteopatia", name: "Osteopatía" },
  {
    id: "local-pnl-programacion-neurolinguistica",
    slug: "pnl-programacion-neurolinguistica",
    name: "PNL (Programación Neurolingüística)",
  },
  {
    id: "local-psicologia-integrativa",
    slug: "psicologia-integrativa",
    name: "Psicología integrativa",
  },
  { id: "local-quiromasaje", slug: "quiromasaje", name: "Quiromasaje" },
  { id: "local-reflexologia", slug: "reflexologia", name: "Reflexología" },
  { id: "local-reiki", slug: "reiki", name: "Reiki" },
  { id: "local-relajacion-guiada", slug: "relajacion-guiada", name: "Relajación guiada" },
  {
    id: "local-respiracion-consciente",
    slug: "respiracion-consciente",
    name: "Respiración consciente",
  },
  { id: "local-salud-bucodental", slug: "salud-bucodental", name: "Salud bucodental" },
  { id: "local-sanacion-energetica", slug: "sanacion-energetica", name: "Sanación energética" },
  { id: "local-shiatsu", slug: "shiatsu", name: "Shiatsu" },
  { id: "local-sonoterapia", slug: "sonoterapia", name: "Sonoterapia" },
  { id: "local-terapia-craneosacral", slug: "terapia-craneosacral", name: "Terapia craneosacral" },
  { id: "local-terapia-de-pareja", slug: "terapia-de-pareja", name: "Terapia de pareja" },
  { id: "local-terapia-emocional", slug: "terapia-emocional", name: "Terapia emocional" },
  { id: "local-terapia-familiar", slug: "terapia-familiar", name: "Terapia familiar" },
  {
    id: "local-terapia-transpersonal",
    slug: "terapia-transpersonal",
    name: "Terapia transpersonal",
  },
  { id: "local-yoga", slug: "yoga", name: "Yoga" },
].map((therapy) => ({
  short_description: defaultShortDescription,
  ...therapy,
}));

export const fallbackTherapiesBySlug = new Map(
  canvaTherapies.map((therapy) => [therapy.slug, therapy]),
);

fallbackTherapiesBySlug.set("acupuntura", {
  id: "local-acupuntura",
  slug: "acupuntura",
  name: "Acupuntura",
  category: "Medicina tradicional china",
  short_description:
    "Práctica terapéutica de origen milenario que estimula puntos específicos del cuerpo para favorecer el equilibrio y acompañar los procesos naturales del organismo.",
  detail_sections: [
    {
      title: "Qué es",
      body: "La acupuntura es una práctica terapéutica de origen milenario que forma parte de la medicina tradicional china. Se basa en la estimulación de puntos específicos del cuerpo mediante agujas muy finas, con el objetivo de favorecer el equilibrio y acompañar los procesos naturales del organismo.",
    },
    {
      title: "Cómo funciona",
      body: "Durante una sesión, el profesional selecciona distintos puntos del cuerpo según las necesidades de la persona. Las agujas se colocan de forma suave y permanecen durante unos minutos mientras el cuerpo entra en un estado de relajación. Las sesiones suelen desarrollarse en un ambiente tranquilo, cuidando el ritmo y el bienestar de la persona.",
    },
  ],
  benefits: [
    "Tensiones musculares o articulares",
    "Dolores de espalda o cervicales",
    "Migrañas o dolores de cabeza",
    "Estrés y ansiedad",
    "Fatiga o falta de energía",
  ],
  session_description:
    "Una sesión suele comenzar con una conversación para comprender la situación y las necesidades de la persona. A partir de ahí, el profesional define el enfoque más adecuado y realiza la sesión adaptándola a cada caso. La experiencia suele ser suave y, en la mayoría de los casos, poco o nada dolorosa.",
  medical_disclaimer:
    "Las terapias complementarias acompañan procesos de salud, pero no sustituyen la atención médica cuando es necesaria.",
  empty_professionals_message:
    "Estamos ampliando nuestra red de profesionales con mucho cuidado. Muy pronto encontrarás aquí a la persona adecuada para ti.",
});
