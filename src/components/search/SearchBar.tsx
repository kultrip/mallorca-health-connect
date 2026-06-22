import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Leaf, MapPin } from "lucide-react";
import { useState } from "react";

import { MUNICIPALITIES, POPULAR_THERAPIES } from "@/lib/catalogs";

export function SearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [showQ, setShowQ] = useState(false);
  const [showLoc, setShowLoc] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({
      to: "/professionals",
      search: { q: q || undefined, municipio: loc || undefined } as never,
    });
  };

  const filteredTherapies = q
    ? POPULAR_THERAPIES.filter((therapy) => therapy.toLowerCase().includes(q.toLowerCase()))
    : POPULAR_THERAPIES;
  const filteredMunicipalities = loc
    ? MUNICIPALITIES.filter((municipality) =>
        municipality.toLowerCase().includes(loc.toLowerCase()),
      )
    : MUNICIPALITIES;

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2.5 rounded-[1.4rem] border border-[#e4d4bf] bg-[#fffdf9]/84 p-2.5 backdrop-blur md:flex-row md:items-center"
    >
      <SearchField
        icon={<Leaf className="h-5 w-5" strokeWidth={1.4} />}
        value={q}
        onChange={setQ}
        onFocus={() => setShowQ(true)}
        onBlur={() => setTimeout(() => setShowQ(false), 150)}
        placeholder="Terapia, síntoma o nombre"
      >
        {showQ && (
          <Suggestions
            items={filteredTherapies.slice(0, 8)}
            onPick={setQ}
            label="Terapias más buscadas"
          />
        )}
      </SearchField>

      <SearchField
        icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
        value={loc}
        onChange={setLoc}
        onFocus={() => setShowLoc(true)}
        onBlur={() => setTimeout(() => setShowLoc(false), 150)}
        placeholder="Cerca de mí, Código Postal..."
        suffix={<ChevronDown className="h-4 w-4" strokeWidth={1.5} />}
      >
        {showLoc && (
          <Suggestions
            items={["Cerca de mí", "Toda Mallorca", ...filteredMunicipalities.slice(0, 10)]}
            onPick={(value) =>
              setLoc(value === "Cerca de mí" || value === "Toda Mallorca" ? "" : value)
            }
            label="Municipios"
          />
        )}
      </SearchField>

      <button
        type="submit"
        className="min-h-12 rounded-[1rem] bg-[#526046] px-7 text-[11px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#435039] md:min-w-[176px]"
      >
        Ver profesionales
      </button>
    </form>
  );
}

function SearchField({
  icon,
  suffix,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  children,
}: {
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-12 flex-1 items-center gap-3 rounded-[1rem] bg-white/88 px-4 text-[#7b6547]">
      {icon}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1f1c18] outline-none placeholder:text-[#776b5e]"
      />
      {suffix}
      {children}
    </div>
  );
}

function Suggestions({
  items,
  onPick,
  label,
}: {
  items: string[];
  onPick: (value: string) => void;
  label: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[1rem] border border-[#dfceb8] bg-white shadow-[0_16px_32px_rgba(55,39,21,0.10)]">
      <div className="border-b border-[#eadfce] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9a866a]">
        {label}
      </div>
      <ul className="m-0 max-h-72 list-none overflow-y-auto p-1">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                onPick(item);
              }}
              className="w-full rounded-xl px-4 py-2 text-left text-[13px] text-[#1f1c18] hover:bg-[#f8efe4]"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
