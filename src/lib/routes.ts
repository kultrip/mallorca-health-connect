export const ROUTES = {
  home: "/",
  professionals: "/professionals",
  professionalProfile: "/professionals/$slug",
  therapies: "/therapies",
  activities: "/activities",
  search: "/search",
  trust: "/trust",
  plans: "/plans",
  register: "/register",
  forProfessionals: "/for-professionals",
  login: "/login",
} as const;

export const LEGACY_ROUTE_REDIRECTS = {
  "/profesionales": ROUTES.professionals,
  "/terapias": ROUTES.therapies,
  "/actividades": ROUTES.activities,
  "/buscar": ROUTES.search,
  "/confianza": ROUTES.trust,
  "/planes": ROUTES.plans,
  "/registro": ROUTES.register,
  "/soy-profesional": ROUTES.forProfessionals,
} as const;
