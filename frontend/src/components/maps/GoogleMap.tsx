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

  // Debug: Log the API key status (only in development)
  if (import.meta.env.DEV) {
    console.log("Google Maps API Key:", GOOGLE_MAPS_API_KEY ? "Loaded" : "Missing");
    console.log("Environment variable:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Set" : "Not set");
  }

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.trim() === "") {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-2">
            Google Maps API key is not configured
          </p>
          <p className="text-xs text-slate-400">
            Please set VITE_GOOGLE_MAPS_API_KEY in your .env file and restart the dev server
          </p>
        </div>
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
