import { useEffect, useRef } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

const sewerPoints: Array<[number, number, string, number, string]> = [
  [13.1052, 80.2874, "MH-0427", 97, "Critical"],
  [13.0921, 80.2445, "MH-0312", 88, "Pre-alert"],
  [13.0678, 80.2834, "MH-0198", 74, "Normal"],
  [13.1194, 80.2158, "MH-0534", 96, "Critical"],
  [13.0549, 80.2618, "MH-0271", 82, "Pre-alert"],
  [13.0712, 80.2349, "MH-0449", 61, "Normal"],
  [13.1148, 80.2645, "MH-0622", 91, "Pre-alert"],
  [13.0836, 80.3057, "MH-0710", 78, "Normal"],
  [13.1452, 80.254, "MH-0814", 69, "Normal"],
  [13.0401, 80.2788, "MH-0917", 94, "Pre-alert"],
  [13.0225, 80.2183, "MH-1034", 77, "Normal"],
  [13.158, 80.2921, "MH-1148", 95, "Critical"],
];

type Props = { onPointSelect?: (point: { id: string; fill: number; status: string }) => void };

function markerColor(fill: number) {
  return fill >= 95 ? "#f25567" : fill >= 80 ? "#e9ad35" : "#25c9ad";
}

export default function GoogleChennaiMap({ onPointSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!API_KEY || !containerRef.current) return;
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps]");
    const load = () => {
      if (!window.google?.maps || !containerRef.current || mapRef.current) return;
      const map = new window.google.maps.Map(containerRef.current, {
        center: CHENNAI_CENTER,
        zoom: 12,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
        mapTypeId: "roadmap",
      });
      mapRef.current = map;
      sewerPoints.forEach(([lat, lng, id, fill, status]) => {
        const marker = new window.google.maps.Marker({
          map,
          position: { lat, lng },
          title: `${id} · ${fill}% full`,
          label: { text: String(fill), color: "#ffffff", fontSize: "10px", fontWeight: "700" },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor(fill),
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 12,
          },
        });
        marker.addListener("click", () => onPointSelect?.({ id, fill, status }));
        markersRef.current.push(marker);
      });
    };

    if (window.google?.maps) load();
    else if (existing) existing.addEventListener("load", load, { once: true });
    else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = "true";
      script.addEventListener("load", load, { once: true });
      document.head.appendChild(script);
    }
    return () => { markersRef.current.forEach((marker) => marker.setMap(null)); markersRef.current = []; mapRef.current = null; };
  }, [onPointSelect]);

  if (!API_KEY) return <div className="map-missing">Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to load Google Maps.</div>;
  return <div ref={containerRef} className="google-map" aria-label="Google Maps centered on Chennai" />;
}
