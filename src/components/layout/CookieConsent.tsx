import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Settings, X, Check, ChevronDown, ChevronUp } from "lucide-react";

type CookiePreferences = {
  accepted: boolean;
  analytical: boolean;
  marketing: boolean;
  timestamp: string;
};

const COOKIE_STORAGE_KEY = "mh-cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [prefs, setPrefs] = useState({
    analytical: true,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!stored) {
      // Graceful entry delay
      const timer = setTimeout(() => {
        setShow(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const finalPrefs: CookiePreferences = {
      accepted: true,
      analytical: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(finalPrefs));
    setShow(false);
  };

  const handleRejectAll = () => {
    const finalPrefs: CookiePreferences = {
      accepted: true,
      analytical: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(finalPrefs));
    setShow(false);
  };

  const handleSaveCustom = () => {
    const finalPrefs: CookiePreferences = {
      accepted: true,
      analytical: prefs.analytical,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(finalPrefs));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 md:bottom-6 md:left-auto md:right-6 md:max-w-md md:p-0">
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 rounded-[2rem] border border-[#eadfce] bg-white/90 backdrop-blur-md p-6 shadow-[0_20px_50px_rgba(96,68,31,0.15)] text-[#342b22]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ede6] text-[#526046]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-semibold text-[#1f1c18]">
              Respetamos tu privacidad
            </h3>
          </div>
          <button
            onClick={handleRejectAll}
            className="rounded-full p-1 text-muted-foreground hover:bg-[#fff6ee] hover:text-foreground transition-colors"
            title="Cerrar y rechazar opcionales"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#5d5144]">
          Utilizamos cookies para garantizar el correcto funcionamiento del sitio, analizar la
          navegación y ofrecerte una experiencia más calurosa y personalizada. Puedes ver los
          detalles en nuestra{" "}
          <Link to="/cookies" className="underline hover:text-[#526046] font-medium">
            Política de Cookies
          </Link>{" "}
          y{" "}
          <Link to="/privacy" className="underline hover:text-[#526046] font-medium">
            Política de Privacidad
          </Link>
          .
        </p>

        {showCustom && (
          <div className="mt-4 space-y-3 rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Technical */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#1f1c18]">Técnicas (Necesarias)</p>
                <p className="text-[11px] text-[#8c7a66]">
                  Imprescindibles para el funcionamiento web y tu acceso seguro.
                </p>
              </div>
              <span className="rounded-full bg-[#f4ede6] px-2 py-0.5 text-[10px] font-medium text-[#526046]">
                Siempre activas
              </span>
            </div>

            {/* Analytical */}
            <div className="flex items-start justify-between gap-2 border-t border-[#eadfce]/60 pt-2">
              <div>
                <p className="font-semibold text-[#1f1c18]">Análisis y Estadísticas</p>
                <p className="text-[11px] text-[#8c7a66]">
                  Nos ayudan a comprender el uso de la web para seguir mejorando.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={prefs.analytical}
                  onChange={(e) => setPrefs({ ...prefs, analytical: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-[#dfcfbd] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#526046] peer-checked:after:translate-x-full" />
              </label>
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-2 border-t border-[#eadfce]/60 pt-2">
              <div>
                <p className="font-semibold text-[#1f1c18]">Personalización y Marketing</p>
                <p className="text-[11px] text-[#8c7a66]">
                  Permiten ofrecerte contenidos o invitaciones adaptadas a tu perfil.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-[#dfcfbd] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#526046] peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 rounded-2xl bg-[#526046] py-2 px-3 text-xs font-semibold text-white hover:bg-[#434f37] active:scale-95 transition-all shadow-md shadow-[#526046]/10"
            >
              Aceptar todas
            </button>
            <button
              onClick={showCustom ? handleSaveCustom : handleRejectAll}
              className="flex-1 rounded-2xl border border-[#eadfce] bg-white py-2 px-3 text-xs font-semibold hover:bg-[#fff9f1] active:scale-95 transition-all text-[#5a4c3e]"
            >
              {showCustom ? "Guardar selección" : "Rechazar opcionales"}
            </button>
          </div>

          <button
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center justify-center gap-1 py-1.5 text-center text-[11px] font-medium text-[#8c7a66] hover:text-[#526046] transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            {showCustom ? "Ocultar personalización" : "Personalizar cookies"}
          </button>
        </div>
      </div>
    </div>
  );
}
