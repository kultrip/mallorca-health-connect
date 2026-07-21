import { useNavigate } from "@tanstack/react-router";
import { Leaf, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MOCK_CHIPS = [
  "Me siento estresad@",
  "Tengo ansiedad",
  "Tengo problemas de sueño",
  "Necesito aliviar el dolor",
  "Quiero equilibrar mi energía",
  "Busco desarrollo personal",
];

export function SymptomPrompt() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const go = (query: string) => {
    if (!query.trim()) return;
    navigate({ to: "/search", search: { q: query } as never });
  };

  const handleChipClick = (chip: string) => {
    setText(chip);
    go(chip);
  };

  return (
    <section className="relative mx-auto max-w-[1140px] px-4 md:px-0">
      <div className="relative border-y border-[#e8d9c6]/80 py-12 md:py-16">
        {/* Diffused golden glow pseudo backdrop behind the card */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[320px] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,120,0.18)_0%,rgba(212,175,120,0)_70%)] blur-[50px]" />

        {/* Floating Glass Card Panel with Soft Outer Glow */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-[#fffdf9]/82 p-6 shadow-[0_0_60px_10px_rgba(212,175,120,0.22),0_20px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl md:p-12">
          
          {/* Header elements centered inside the card */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fbf5ec]/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a7041]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.35} />
              Búsqueda guiada
            </div>
            
            <h2 className="font-display text-[clamp(2.1rem,4vw,3.1rem)] leading-[1.1] text-[#1f3326] font-bold">
              ¿Cómo te sientes hoy?
            </h2>
            
            <p className="mt-4 max-w-[620px] text-[15px] leading-relaxed text-[#4d443b]">
              A veces, encontrar lo que necesitas empieza cuando te tomas un momento para escucharte. Te ayudamos a conectar con lo que ahora mismo necesitas.
            </p>
          </div>

          {/* Interactive input bar row */}
          <div className="mt-10 border-t border-[#eadfce]/60 pt-10">
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <Leaf className="mt-1.5 h-6 w-6 shrink-0 text-[#8e774f]" strokeWidth={1.4} />
                <div className="flex-1">
                  <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Cuéntanos cómo te sientes o qué necesitas ahora...&#10;Ej. Estrés, ansiedad, insomnio, dolor de espalda, conectar conmigo..."
                    rows={3}
                    className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-[#1f1c18] outline-none placeholder:text-[#888075]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-[#eadfce]/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#6e5e50]">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Privado y confidencial
                </span>
                <Button
                  onClick={() => go(text)}
                  disabled={!text.trim()}
                  className="min-h-12 rounded-full bg-[#526046] px-8 text-[13px] font-medium uppercase tracking-wider text-white hover:bg-[#435039] transition-all flex items-center gap-2 shadow-sm"
                >
                  Comenzar búsqueda <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion pills centered below the card */}
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-[13px] font-medium tracking-wide text-[#776c5f] uppercase">
            O elige alguna de las opciones más comunes
          </p>
          <div className="mt-6 flex max-w-[880px] flex-wrap justify-center gap-3">
            {MOCK_CHIPS.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => handleChipClick(symptom)}
                className="inline-flex min-h-10 items-center rounded-full border border-[#e5d8c9] bg-white/50 px-5 text-[13px] text-[#3f352a] transition-all hover:border-[#8b6a42] hover:bg-white hover:text-[#8b6a42] shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
