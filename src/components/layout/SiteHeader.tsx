import { Link, useLocation } from "@tanstack/react-router";
import { Leaf, Menu, UserCircle, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/professionals", label: "Profesionales" },
  { to: "/activities", label: "Actividades" },
  { to: "/therapies", label: "Terapias" },
  { to: "/trust", label: "Sobre nosotros" },
] as const;

const SUB_NAV_LINKS = [
  { to: "/for-professionals", label: "Soy profesional" },
  { to: "/plan-presencia", label: "Plan Presencia" },
  { to: "/profesional-fundador", label: "Profesional Verificado" },
  { to: "/comunidad-fundadora-organizaciones", label: "Centros & Org" },
  { to: "/comunidad-fundadora-acceso", label: "Invitación" },
] as const;

export function SiteHeader({ transparent: _unused }: { transparent?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const showSubNav =
    pathname.startsWith("/for-professionals") ||
    pathname.startsWith("/plan-presencia") ||
    pathname.startsWith("/profesional-fundador") ||
    pathname.startsWith("/comunidad-fundadora-");

  return (
    <header className="relative z-40 border-b border-[#eadfce]/70 bg-[#fffaf2]/92 backdrop-blur">
      <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between gap-6 px-5 md:h-[82px] md:px-10">
        <Link
          to="/"
          aria-label="Mallorca Holística — inicio"
          className="flex items-center gap-3 text-foreground no-underline"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c5aa] text-[#8d6d43] md:h-11 md:w-11">
            <Leaf className="h-5 w-5" strokeWidth={1.35} />
          </span>
          <span className="flex flex-col font-display leading-none tracking-tight">
            <span className="text-[22px] text-[#1f3326] md:text-[25px]">Mallorca</span>
            <span className="text-[13px] uppercase tracking-[0.14em] text-[#1f3326] md:text-[14px]">
              Holística
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[13px] font-medium text-[#2f2a24] transition-colors hover:text-[#8b6a42]"
              activeProps={{ className: "text-[13px] font-medium text-[#8b6a42]" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/for-professionals"
            className="rounded-full border border-[#526046] bg-[#526046] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#435039]"
          >
            Soy profesional
          </Link>
          <Link
            to="/login"
            aria-label="Acceder"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c5aa] text-[#6e5738] transition-colors hover:bg-[#f5eadb]"
          >
            <UserCircle className="h-5 w-5" strokeWidth={1.4} />
          </Link>
        </div>

        <button
          aria-label="Menú"
          className="text-[#5b4b36] md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Conditional Secondary Sub-navigation */}
      {showSubNav && (
        <div className="border-t border-[#eadfce]/50 bg-[#fff9f0]/95 py-2.5">
          <div className="mx-auto flex max-w-[1320px] items-center gap-1.5 overflow-x-auto px-5 scrollbar-none md:gap-3 md:px-10">
            {SUB_NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="shrink-0 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#524a3e] hover:bg-[#ebdcc9]/40 hover:text-[#526046] transition-all"
                activeProps={{ className: "bg-[#526046]/10 text-[#526046] font-semibold" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {open && (
        <div className="border-t border-[#eadfce] bg-[#fffaf2]">
          <nav className="mx-auto flex max-w-[1180px] flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-[#1f1c18]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/for-professionals"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-[#526046] px-5 py-3 text-center text-xs font-bold uppercase text-white"
            >
              Soy profesional
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
