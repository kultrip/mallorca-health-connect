import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/professionals", label: "Profesionales" },
  { to: "/activities", label: "Actividades" },
  { to: "/therapies", label: "Terapias" },
  { to: "/for-professionals", label: "Soy profesional" },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 z-30",
        !transparent && "relative border-b border-border bg-background",
      )}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl tracking-tight text-foreground">
            Mallorca Holística
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-foreground/80 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            Acceder
          </Link>
        </nav>

        <button aria-label="Menú" className="md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-[1180px] flex-col gap-1 px-6 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-foreground/70 hover:bg-muted"
            >
              Acceder
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
