import { useState } from "react";
import { Gist } from "src/types/types";

interface Coordinates {
  origin: { lng: number; lat: number };
  destination: { lng: number; lat: number };
}

export const useDirections = (gist: Gist) => {
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const fetchDirections = async () => {
    try {
      if (!gist.owner.login) {
        alert("Gist owner login is missing.");
        return;
      }

      const response = await fetch(`/api/users?login=${encodeURIComponent(gist.owner.login)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} - ${errorText}`);
        alert(`Failed to fetch owner location: ${response.statusText}`);
        return;
      }

      const owner = await response.json();
      console.log("Owner data:", owner);

      if (!owner?.location) {
        alert("Gist owner has no location data available.");
        return;
      }

      const ownerLocation = owner.location;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lng: position.coords.longitude,
              lat: position.coords.latitude,
            };
            setCoordinates({
              origin: userLocation,
              destination: ownerLocation,
            });
            setShowDirectionsModal(true);
          },
          (error) => {
            alert("Please allow location access to see directions.");
            console.error("Geolocation error:", error);
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    } catch (error) {
      console.error("Error in fetchDirections:", error);
      alert("An unexpected error occurred while fetching directions.");
    }
  };

  const closeDirectionsModal = () => setShowDirectionsModal(false);

  return { showDirectionsModal, coordinates, fetchDirections, closeDirectionsModal };
};