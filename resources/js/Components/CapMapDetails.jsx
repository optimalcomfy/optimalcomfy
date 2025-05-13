import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

// Optional: Custom map styles
const mapStyles = [/* Your full styles here */];

export default function CarMapDetails({ car }) {
  const [contentHeight, setContentHeight] = useState(0);
  const mapRef = useRef(null);

  const lat = parseFloat(car.latitude);
  const lng = parseFloat(car.longitude);
  const carPosition = { lat, lng };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "", // Replace with env var in prod
  });

  useEffect(() => {
    const updateHeight = () => {
      const header = document.getElementById("header");
      const headerHeight = header?.offsetHeight || 0;
      setContentHeight(window.innerHeight - headerHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const mapOptions = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: false,
    gestureHandling: "greedy",
  };

  return (
    <div className="relative container mx-auto" style={{ height: contentHeight }}>
      {isLoaded && (
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={carPosition}
          zoom={14}
          options={mapOptions}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          <Marker position={carPosition} />
        </GoogleMap>
      )}
      <div className="absolute top-2 left-2 bg-white shadow-lg p-4 rounded-md max-w-xs">
        <h2 className="font-bold text-lg mb-2">{car.name}</h2>
        <div className="text-sm text-gray-600 mb-1">Type: {car.brand}</div>
        <div className="text-sm text-gray-600 mb-1">Location: {car.location}</div>
        <div className="text-sm text-gray-600">Price per night: KES {car.price_per_day}</div>
      </div>
    </div>
  );
}
