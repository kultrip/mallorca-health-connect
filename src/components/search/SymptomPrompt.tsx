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
    <section className="relative mx-auto max-w-[1140px] px-4 md:px-0">
      <div className="relative border-y border-[#e8d9c6]/80 py-12 md:py-16">
        {/* Diffused golden glow pseudo backdrop behind the card */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[320px] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,120,0.20)_0%,rgba(212,175,120,0)_70%)] blur-[50px]" />

        {/* Floating Glass Card Panel with Soft Outer Glow */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[#fffdf9]/82 p-6 shadow-[0_0_60px_10px_rgba(212,175,120,0.24),0_20px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-10">
          
          {/* Header elements centered inside the card */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fbf5ec]/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a7041]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.35} />
              Búsqueda guiada
            </div>
            <h2 className="font-display text-[clamp(2.1rem,4vw,3.3rem)] leading-[1.08] text-[#17130f]">
              Cuéntanos qué estás viviendo.
            </h2>
            <p className="mt-4 max-w-[620px] text-[15px] leading-8 text-[#40372d]">
              A veces no sabemos qué necesitamos. Puedes empezar con una sensación, una pregunta o
              algo que pesa estos días.
            </p>
          </div>

          {/* Interactive input bar row */}
          <div className="mt-8 border-t border-[#eadfce]/70 pt-8">
            <div className="grid gap-5">
              <label className="flex items-start gap-4">
                <Leaf className="mt-1 h-5.5 w-5.5 shrink-0 text-[#8e774f]" strokeWidth={1.4} />
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

              <div className="flex flex-col gap-3 border-t border-[#eadfce]/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        {/* Suggestion pills centered below the card */}
        <div className="mt-10 flex flex-col items-center text-center">
          <p className="text-sm text-[#4d443b]">O elige alguna situación que resuene contigo:</p>
          <div className="mt-5 flex max-w-[840px] flex-wrap justify-center gap-2.5">
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
    </section>
  );
}

