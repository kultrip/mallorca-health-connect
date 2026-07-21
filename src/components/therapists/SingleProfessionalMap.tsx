import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

type SingleProfessionalMapProps = {
  lat: number;
  lng: number;
  name: string;
  isApproximate?: boolean;
};

export function SingleProfessionalMap({
  lat,
  lng,
  name,
  isApproximate = false,
}: SingleProfessionalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
        center: [lng, lat],
        zoom: isApproximate ? 11.5 : 13.5,
        cooperativeGestures: true,
        scrollZoom: false, // Prevent accidental scrolling on details page
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        // Create custom HTML marker
        const el = document.createElement("div");
        el.className = "flex items-center justify-center";

        if (isApproximate) {
          // Beautiful pulsing approximate zone marker
          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-20 h-24 rounded-full bg-[#8a6550]/15 border border-[#8a6550]/30 animate-pulse" style="width: 90px; height: 90px; border-radius: 9999px;"></div>
              <div class="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#8a6550] shadow-md" style="width: 14px; height: 14px; border-radius: 9999px;"></div>
            </div>
          `;
        } else {
          // Precise coordinate pin marker
          el.style.width = "28px";
          el.style.height = "28px";
          el.innerHTML = `
            <div class="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#8a6550] shadow-md" style="width: 24px; height: 24px; border-radius: 9999px;">
              <span class="w-1.5 h-1.5 rounded-full bg-white" style="width: 6px; height: 6px; border-radius: 9999px;"></span>
              <div class="absolute -bottom-1 border-4 border-transparent border-t-white" style="bottom: -4px;"></div>
            </div>
          `;
        }

        const marker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);

        markerRef.current = marker;
      });
    });

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [lat, lng, isApproximate]);

  if (!mapboxToken) {
    // Elegant fallback design for missing Mapbox access token
    return (
      <div className="flex flex-col items-center justify-center p-5 text-center border border-dashed border-[#eadfce] bg-[#fffaf4] rounded-2xl min-h-44">
        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
          <MapPin className="h-5 w-5" />
        </div>
        <h4 className="font-display text-sm font-semibold text-[#11100e]">Mapa no disponible</h4>
        <p className="mt-1 text-[11px] text-[#6d5b43] max-w-xs leading-normal">
          Configura la clave{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-red-500 text-[9px]">
            VITE_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          en <code className="bg-muted px-1 py-0.5 rounded text-[9px]">.env</code> para ver la
          ubicación interactiva.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-44 w-full overflow-hidden rounded-2xl border border-[#eadfce] bg-muted/30">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
