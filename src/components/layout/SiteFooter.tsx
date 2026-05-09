import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-lg tracking-tight">Mallorca Holística</div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Un espacio de confianza para encontrar profesionales verificados de
              terapias naturales y complementarias en Mallorca.
            </p>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Explora
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/profesionales" className="hover:text-foreground">Profesionales</Link></li>
              <li><Link to="/terapias" className="hover:text-foreground">Terapias</Link></li>
              <li><Link to="/actividades" className="hover:text-foreground">Actividades</Link></li>
              <li><Link to="/confianza" className="hover:text-foreground">Verificación</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Profesionales
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/soy-profesional" className="hover:text-foreground">Soy profesional</Link></li>
              <li><Link to="/planes" className="hover:text-foreground">Planes</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Acceder</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            Orientación informativa. No sustituye diagnóstico médico.
          </p>
          <p>© {new Date().getFullYear()} Mallorca Holística</p>
        </div>
      </div>
    </footer>
  );
}
