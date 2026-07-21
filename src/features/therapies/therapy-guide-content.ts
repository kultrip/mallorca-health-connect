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

fallbackTherapiesBySlug.set("yoga", {
  id: "local-yoga",
  slug: "yoga",
  name: "Yoga",
  category: "Cuerpo y mente",
  short_description:
    "Práctica milenaria que integra el movimiento corporal, la respiración consciente y la meditación para cultivar un estado de presencia, calma y equilibrio integral.",
  detail_sections: [
    {
      title: "Qué es",
      body: "El Yoga es una disciplina milenaria originaria de la India que busca la unión armónica entre el cuerpo, la mente y el espíritu. A través de posturas físicas (asanas), ejercicios de respiración (pranayama) y técnicas de meditación, el Yoga nos invita a cultivar la presencia plena, la autoconciencia y un profundo bienestar interior.",
    },
    {
      title: "Cómo funciona",
      body: "Una sesión de Yoga se adapta al ritmo y condiciones de cada persona. Se realiza una secuencia de movimientos suaves y fluidos sincronizados con la respiración, alternando posturas activas con momentos de relajación y quietud mental. El enfoque principal es escuchar el propio cuerpo con amabilidad, sin juicios ni sobreesfuerzos.",
    },
  ],
  benefits: [
    "Estrés y fatiga acumulada",
    "Flexibilidad y movilidad física",
    "Tensión y rigidez corporal",
    "Calma mental y claridad emocional",
    "Postura y consciencia corporal",
  ],
  session_description:
    "Las sesiones se desarrollan en un espacio cómodo y tranquilo. Comienzan con una toma de contacto para conectar con la respiración, seguidas de una práctica de asanas guiada de forma gradual, y finalizan con una relajación profunda o meditación que asienta los beneficios de la sesión.",
  medical_disclaimer:
    "Las terapias complementarias acompañan procesos de salud, pero no sustituyen la atención médica cuando es necesaria.",
  empty_professionals_message:
    "Estamos ampliando nuestra red de profesionales con mucho cuidado. Muy pronto encontrarás aquí a la persona adecuada para ti.",
});

fallbackTherapiesBySlug.set("osteopatia", {
  id: "local-osteopatia",
  slug: "osteopatia",
  name: "Osteopatía",
  category: "Terapia manual",
  short_description:
    "Disciplina terapéutica manual que se centra en el restablecimiento de la movilidad global del cuerpo para favorecer su capacidad de autorregulación y bienestar natural.",
  detail_sections: [
    {
      title: "Qué es",
      body: "La osteopatía es un enfoque terapéutico manual que considera al cuerpo como una unidad interconectada. Mediante técnicas suaves y precisas de palpación y movilización, el osteópata busca identificar y liberar tensiones en las estructuras músculo-esqueléticas, viscerales y craneales para acompañar la salud y el equilibrio del organismo.",
    },
    {
      title: "Cómo funciona",
      body: "El osteópata trabaja con sus manos de forma sumamente sutil e indolora. Evalúa las zonas de menor movilidad del cuerpo y aplica movilizaciones y estiramientos que ayudan a liberar las restricciones y tensiones acumuladas. El objetivo no es forzar la estructura, sino acompañar al cuerpo hacia su propia homeostasis y rango natural de movimiento.",
    },
  ],
  benefits: [
    "Sobrecarga muscular o articular",
    "Trastornos posturales o digestivos",
    "Estrés físico y fatiga",
    "Dolor cervical, lumbar o de espalda",
    "Restricciones de movilidad funcional",
  ],
  session_description:
    "Una sesión típica se inicia con una entrevista detallada sobre la historia de salud de la persona. Luego, se realiza una valoración postural y funcional mediante palpación manual suave. A continuación, se aplican las movilizaciones específicas adaptadas a las necesidades del momento, finalizando con un espacio de reposo e integración.",
  medical_disclaimer:
    "Las terapias complementarias acompañan procesos de salud, pero no sustituyen la atención médica cuando es necesaria.",
  empty_professionals_message:
    "Estamos ampliando nuestra red de profesionales con mucho cuidado. Muy pronto encontrarás aquí a la persona adecuada para ti.",
});

// Synchronize detailed descriptions back into the main canvaTherapies list
for (const [slug, customTherapy] of fallbackTherapiesBySlug.entries()) {
  const index = canvaTherapies.findIndex((t) => t.slug === slug);
  if (index !== -1) {
    canvaTherapies[index] = {
      ...canvaTherapies[index],
      ...customTherapy,
    };
  }
}

