import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import type { TherapistCardData } from "./TherapistCard";
import { getProfessionalMapPins } from "./professional-map-utils";

type ProfessionalsMapProps = {
  professionals: TherapistCardData[];
  title?: string;
};

// Center on Mallorca
const MALLORCA_CENTER: [number, number] = [3.01, 39.69];

function getCoordinatesForPin(pin: { id: string }, professionals: TherapistCardData[]) {
  const p = professionals.find((item) => item.id === pin.id);
  if (!p) return null;
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return { lat: p.lat, lng: p.lng };
  }
  if (typeof p.municipalities?.lat === "number" && typeof p.municipalities?.lng === "number") {
    return { lat: p.municipalities.lat, lng: p.municipalities.lng };
  }
  return null;
}

export function ProfessionalsMap({
  professionals,
  title = "Mapa de profesionales",
}: ProfessionalsMapProps) {
  const pins = useMemo(() => getProfessionalMapPins(professionals), [professionals]);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const selectedPin = pins.find((pin) => pin.id === selectedPinId) ?? pins[0];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) return;

    let map: any = null;

    // SSR Safe dynamic import of mapbox-gl
    import("mapbox-gl").then((mapboxglModule) => {
      const mapboxgl = mapboxglModule.default;
      mapboxgl.accessToken = mapboxToken;

      map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: MALLORCA_CENTER,
        zoom: 8.5,
        cooperativeGestures: true,
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        syncMarkers(mapboxgl);
      });
    });

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Sync markers when pins change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      import("mapbox-gl").then((mapboxglModule) => {
        syncMarkers(mapboxglModule.default);
      });
    } else {
      map.once("idle", () => {
        import("mapbox-gl").then((mapboxglModule) => {
          syncMarkers(mapboxglModule.default);
        });
      });
    }
  }, [pins]);

  const syncMarkers = (mapboxgl: any) => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (pins.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    let extendedBounds = false;

    pins.forEach((pin) => {
      const coordinates = getCoordinatesForPin(pin, professionals);
      if (!coordinates) return;

      const { lat, lng } = coordinates;
      bounds.extend([lng, lat]);
      extendedBounds = true;

      // Create beautiful custom pin element
      const el = document.createElement("div");
      el.className = "flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-115";
      el.style.width = "28px";
      el.style.height = "28px";
      el.innerHTML = `
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#8a6550] shadow-md">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
          <div class="absolute -bottom-1 border-4 border-transparent border-t-white"></div>
        </div>
      `;

      // Find professional details for popup
      const professional = professionals.find((p) => p.id === pin.id);
      const photoUrl = professional?.photo_url || "";
      const especialidad = professional?.especialidad || "Terapeuta";

      // Popup content with rich styling matching the design system
      const popupHtml = `
        <div class="p-2.5 max-w-[210px] font-sans" style="font-family: inherit;">
          <div class="flex items-center gap-3">
            ${photoUrl ? `
              <img src="${photoUrl}" class="w-10 h-10 rounded-full object-cover border border-[#eadfce]" alt="${pin.name}" style="width: 40px; height: 40px; border-radius: 9999px; object-fit: cover; border: 1px solid #eadfce;" />
            ` : `
              <div class="w-10 h-10 rounded-full bg-[#eadfce]/30 flex items-center justify-center text-xs font-semibold text-[#5d5144]" style="width: 40px; height: 40px; border-radius: 9999px; background-color: rgba(234, 223, 206, 0.3); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #5d5144;">
                ${pin.name[0] || "·"}
              </div>
            `}
            <div class="flex-1 min-w-0 text-left">
              <div class="text-[10px] uppercase tracking-wider truncate" style="color: #8c7a66; letter-spacing: 0.05em;">${especialidad}</div>
              <h4 class="font-display font-semibold text-sm leading-tight text-[#11100e] truncate mt-0.5" style="margin: 2px 0 0 0; font-weight: 600; color: #11100e; font-size: 14px;">${pin.name}</h4>
            </div>
          </div>
          <p class="mt-2 text-xs flex items-center gap-1" style="color: #6d5b43; margin: 8px 0 0 0; display: flex; align-items: center; gap: 4px; font-size: 12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #8a6550; flex-shrink: 0;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="truncate" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${pin.locationLabel}</span>
          </p>
          <a href="/professionals/${pin.slug}" class="mt-2.5 block text-center text-xs font-medium text-white bg-[#8a6550] hover:bg-[#725343] py-1.5 px-3 rounded-full transition-colors" style="text-decoration: none; color: white; background-color: #8a6550; display: block; text-align: center; font-size: 12px; font-weight: 500; border-radius: 9999px; padding: 6px 12px; margin-top: 10px; transition: background-color 0.2s;">
            Ver perfil
          </a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(popupHtml);

      // Create and add marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => {
        setSelectedPinId(pin.id);
      });

      markersRef.current.push(marker);
    });

    if (extendedBounds) {
      map.fitBounds(bounds, {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        maxZoom: 12,
        duration: 800,
      });
    }
  };

  if (pins.length === 0) return null;

  // Custom premium fallback styling if token is missing
  if (!mapboxToken) {
    return (
      <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-24">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">{title}</h2>
            <p className="text-xs text-muted-foreground">
              {pins.length} ubicación{pins.length === 1 ? "" : "es"} en Mallorca
            </p>
          </div>
          <MapPin className="h-5 w-5 text-primary" />
        </div>

        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border bg-[#fffaf4]/50 rounded-2xl aspect-[1.1/1]">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3 animate-pulse">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="font-display text-base font-semibold text-[#11100e]">Configuración de Mapa</h3>
          <p className="mt-1 text-xs text-[#6d5b43] max-w-xs leading-normal">
            Por favor, añade tu clave de acceso de Mapbox en tu archivo <code className="bg-muted px-1 py-0.5 rounded text-red-500 text-[10px]">.env</code> para habilitar el mapa interactivo premium:
          </p>
          <pre className="mt-3 bg-muted p-2 rounded text-[10px] text-left font-mono border border-border select-all w-full text-foreground/80 overflow-x-auto">
            VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1I...
          </pre>
        </div>

        {selectedPin && (
          <div className="mt-4 rounded-2xl border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {selectedPin.source === "municipality" ? "Zona aproximada" : "Ubicación"}
            </p>
            <Link
              to="/professionals/$slug"
              params={{ slug: selectedPin.slug }}
              className="mt-1 block font-display text-lg leading-tight hover:text-primary text-[#11100e] font-semibold"
            >
              {selectedPin.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{selectedPin.locationLabel}</p>
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {pins.length} ubicación{pins.length === 1 ? "" : "es"} en Mallorca
          </p>
        </div>
        <MapPin className="h-5 w-5 text-primary" />
      </div>

      <div className="relative aspect-[1.1/1] overflow-hidden rounded-2xl border border-border bg-muted/30">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
      </div>

      {selectedPin && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {selectedPin.source === "municipality" ? "Zona aproximada" : "Ubicación"}
          </p>
          <Link
            to="/professionals/$slug"
            params={{ slug: selectedPin.slug }}
            className="mt-1 block font-display text-lg leading-tight hover:text-primary text-[#11100e] font-semibold"
          >
            {selectedPin.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{selectedPin.locationLabel}</p>
        </div>
      )}
    </aside>
  );
}
