"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Define the props interface
interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: {
    origin: { lng: number; lat: number };
    destination: { lng: number; lat: number };
  } | null; // Allow null since coordinates might not be set initially
}

const DirectionsModal = ({ isOpen, onClose, coordinates }: DirectionsModalProps) => {
  // Type the refs correctly
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!isOpen || !coordinates?.origin || !coordinates?.destination) return;

    // Use the access token from the environment variable
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current!, // Non-null assertion since we know it’s set in the DOM
      style: "mapbox://styles/mapbox/streets-v12", // Light theme by default
      center: [
        (coordinates.origin.lng + coordinates.destination.lng) / 2,
        (coordinates.origin.lat + coordinates.destination.lat) / 2,
      ],
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Switch to dark style in dark mode (optional: requires theme detection)
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      map.current.setStyle("mapbox://styles/mapbox/dark-v11");
    }

    map.current.on("load", async () => {
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat([coordinates.origin.lng, coordinates.origin.lat])
        .setPopup(new mapboxgl.Popup().setText("Your Location"))
        .addTo(map.current!);

      new mapboxgl.Marker({ color: "red" })
        .setLngLat([coordinates.destination.lng, coordinates.destination.lat])
        .setPopup(new mapboxgl.Popup().setText("Gist Owner"))
        .addTo(map.current!);

      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.origin.lng}%2C${coordinates.origin.lat}%3B${coordinates.destination.lng}%2C${coordinates.destination.lat}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();
      const data = json.routes[0].geometry;

      map.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: data,
        },
      });

      map.current!.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([coordinates.origin.lng, coordinates.origin.lat]);
      bounds.extend([coordinates.destination.lng, coordinates.destination.lat]);
      map.current!.fitBounds(bounds, { padding: { top: 50, bottom: 50, left: 20, right: 20 } });
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isOpen, coordinates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl mx-auto p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
        <div ref={mapContainer} className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] rounded-md overflow-hidden" />
      </div>
    </div>
  );
};

export default DirectionsModal;