import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYMPTOM_CHIPS } from "@/lib/catalogs";

export function SymptomPrompt() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const go = (q: string) => {
    if (!q.trim()) return;
    navigate({ to: "/buscar", search: { q } as never });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Búsqueda por como te sientes
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Cuéntanos cómo te sientes o qué necesitas ahora… Ej: "Estoy estresado", "no duermo bien"'
          rows={3}
          className="w-full resize-none bg-transparent font-display text-xl leading-snug outline-none placeholder:text-muted-foreground/70 md:text-2xl"
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {SYMPTOM_CHIPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setText(s)}
              className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Un espacio de confianza para empezar a cuidarte.
          </p>
          <Button onClick={() => go(text)} disabled={!text.trim()}>
            Ver opciones
          </Button>
        </div>
      </div>
    </div>
  );
}
