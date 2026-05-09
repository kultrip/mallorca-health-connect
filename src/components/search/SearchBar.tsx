import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MUNICIPALITIES, POPULAR_THERAPIES } from "@/lib/catalogs";

export function SearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [showQ, setShowQ] = useState(false);
  const [showLoc, setShowLoc] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/profesionales",
      search: { q: q || undefined, municipio: loc || undefined } as never,
    });
  };

  const filteredTherapies = q
    ? POPULAR_THERAPIES.filter((t) => t.toLowerCase().includes(q.toLowerCase()))
    : POPULAR_THERAPIES;
  const filteredMunis = loc
    ? MUNICIPALITIES.filter((m) => m.toLowerCase().includes(loc.toLowerCase()))
    : MUNICIPALITIES;

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:flex-row md:items-stretch md:gap-0 md:rounded-full md:p-2"
    >
      <div className="relative flex flex-1 items-center gap-3 rounded-full px-4 py-2 md:px-5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setShowQ(true)}
          onBlur={() => setTimeout(() => setShowQ(false), 150)}
          placeholder="Terapia, síntoma o nombre"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {showQ && (
          <Suggestions
            items={filteredTherapies.slice(0, 8)}
            onPick={(v) => setQ(v)}
            label="Terapias más buscadas"
          />
        )}
      </div>

      <div className="hidden h-9 w-px self-center bg-border md:block" />

      <div className="relative flex flex-1 items-center gap-3 rounded-full px-4 py-2 md:px-5">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          onFocus={() => setShowLoc(true)}
          onBlur={() => setTimeout(() => setShowLoc(false), 150)}
          placeholder="Cerca de mí, código postal…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
        {showLoc && (
          <Suggestions
            items={["Cerca de mí", "Toda Mallorca", ...filteredMunis.slice(0, 10)]}
            onPick={(v) => setLoc(v === "Cerca de mí" || v === "Toda Mallorca" ? "" : v)}
            label="Municipios"
          />
        )}
      </div>

      <Button type="submit" size="lg" className="md:ml-1">
        Ver profesionales
      </Button>
    </form>
  );
}

function Suggestions({
  items,
  onPick,
  label,
}: {
  items: string[];
  onPick: (v: string) => void;
  label: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
      <div className="border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="max-h-72 overflow-auto py-1">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(item);
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
