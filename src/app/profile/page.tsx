// /app/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.location === null) {
      setShowLocationPrompt(true);
    }
  }, [status, session]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch("/api/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ location: { lat: latitude, lng: longitude } }),
            });
            if (response.ok) {
              setShowLocationPrompt(false);
              window.location.reload();
            } else {
              console.error("Failed to update location");
            }
          } catch (error) {
            console.error("Error updating location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to access location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <p>
        Please <a href="/auth/login" className="text-purple-700">sign in</a> to view your profile.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <p>Email: {session?.user?.email}</p>
      <p>Name: {session?.user?.name || "Not set"}</p>
      <p>
        Location:{" "}
        {session?.user?.location
          ? `${session.user.location.lat}, ${session.user.location.lng}`
          : "Not set"}
      </p>

      {showLocationPrompt && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md">
          <p className="text-yellow-800">
            For better services, please enable location access.
          </p>
          <button
            onClick={requestLocation}
            className="mt-2 bg-purple-700 text-white p-2 rounded-md hover:bg-purple-600"
          >
            Enable Location
          </button>
          <button
            onClick={() => setShowLocationPrompt(false)}
            className="mt-2 ml-2 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}