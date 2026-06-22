import { useNavigate } from "@tanstack/react-router";
import { Leaf, Lock, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SYMPTOM_CHIPS } from "@/lib/catalogs";

export function SymptomPrompt() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const go = (query: string) => {
    if (!query.trim()) return;
    navigate({ to: "/search", search: { q: query } as never });
  };

  return (
    <section className="relative mx-auto max-w-[1040px]">
      <div className="border-y border-[#e8d9c6] px-0 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[0.72fr_1.28fr] md:items-start">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a7041]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.35} />
              Búsqueda guiada
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.3rem)] leading-[1.08] text-[#17130f]">
              Cuéntanos qué estás viviendo.
            </h2>
            <p className="mt-5 max-w-[390px] text-[15px] leading-8 text-[#40372d]">
              A veces no sabemos qué necesitamos. Puedes empezar con una sensación, una pregunta o
              algo que pesa estos días.
            </p>
          </div>

          <div>
            <div className="rounded-[1.3rem] border border-[#d8c7b1] bg-[#fffdf9]/76 p-5 md:p-7">
              <div className="grid gap-5">
                <label className="flex items-start gap-4">
                  <Leaf className="mt-1 h-5 w-5 shrink-0 text-[#8e774f]" strokeWidth={1.4} />
                  <span className="flex-1">
                    <span className="block font-display text-xl text-[#1f1c18] md:text-2xl">
                      ¿Cómo te sientes ahora?
                    </span>
                    <textarea
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder='Ej: "me cuesta dormir", "necesito parar", "estoy atravesando un duelo"...'
                      rows={3}
                      className="mt-4 w-full resize-none bg-transparent text-sm leading-relaxed text-[#1f1c18] outline-none placeholder:text-[#77706a] md:text-base"
                    />
                  </span>
                </label>

                <div className="flex flex-col gap-3 border-t border-[#eadfce] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#5e5245]">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Privado y confidencial
                  </span>
                  <Button
                    onClick={() => go(text)}
                    disabled={!text.trim()}
                    className="min-h-11 rounded-full bg-[#526046] px-7 text-white hover:bg-[#435039]"
                  >
                    Explorar caminos
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <p className="text-sm text-[#4d443b]">O elige alguna situación que resuene contigo:</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {SYMPTOM_CHIPS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setText(symptom)}
                    className="inline-flex min-h-9 items-center rounded-full border border-[#e5d8c9] bg-transparent px-4 text-[13px] text-[#3f352a] transition-colors hover:bg-[#f4ede6]"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
