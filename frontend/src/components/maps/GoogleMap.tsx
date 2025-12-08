import { useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface GoogleMapProps {
  lat: number;
  lng: number;
  height?: string;
  zoom?: number;
}

const containerStyle = {
  width: "100%",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
  overflow: "hidden" as const,
};

export function GoogleMapComponent({ 
  lat, 
  lng, 
  height = "400px", 
  zoom = 15 
}: GoogleMapProps) {
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
        style={{ height }}
      >
        <p className="text-sm text-slate-500">
          Google Maps API key is not configured
        </p>
      </div>
    );
  }

  return (
    <div style={{ height, ...containerStyle }}>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={zoom}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
            ],
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
