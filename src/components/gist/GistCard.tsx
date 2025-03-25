import { FaHeart, FaComment, FaShare, FaCode, FaEdit, FaTrash, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { Gist } from "src/types/types"; 
import { useState } from "react";
import DirectionsModal from "@components/location/directionalmodal"; 

interface GistCardProps {
  gist: Gist;
  avatarUrl?: string | null | undefined;
  isExpanded: boolean;
  isStarred: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
  linkedGist?: string | null;
  relatedGistDescription?: string | null;
  relatedGistUrl?: string | null;
  onToggleStar: (gistId: string) => void;
  onExpandGist: (gistId: string) => void;
  onEditGist: (gistId: string) => void;
  onDeleteGist: (gistId: string) => void;
}

export default function GistCard({
  gist,
  avatarUrl,
  isExpanded,
  isStarred,
  isOwner,
  isLoggedIn,
  linkedGist,
  relatedGistDescription,
  relatedGistUrl,
  onToggleStar,
  onExpandGist,
  onEditGist,
  onDeleteGist,
}: GistCardProps) {
  const firstFile = Object.values(gist.files)[0];
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    origin: { lng: number; lat: number };
    destination: { lng: number; lat: number };
  } | null>(null);

  const handleShowDirections = async () => {
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
      console.error("Error in handleShowDirections:", error);
      alert("An unexpected error occurred while fetching directions.");
    }
  };
  return (
    <div
      className={`relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 transition-all duration-300 ${
        isExpanded
          ? "col-span-full shadow-lg bg-gray-50 dark:bg-gray-800"
          : "hover:shadow-md dark:hover:shadow-gray-700 h-60 sm:h-64"
      }`}
    >
      <div
        className={`${isExpanded ? "border-b pb-3 sm:pb-4 mb-3 sm:mb-4 border-gray-200 dark:border-gray-700" : "h-full flex flex-col"}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <img
              src={avatarUrl || "/default-avatar.png"}
              alt="Profile"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
              onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
            />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{gist.owner.login}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(gist.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <p
          className="text-sm sm:text-md font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 overflow-hidden text-ellipsis"
          title={gist.description || "Untitled Gist"}
        >
          {gist.description || "Untitled Gist"}
        </p>

        {!isExpanded && (
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 font-mono h-20 sm:h-24 overflow-hidden">
            <p className="text-gray-500 dark:text-gray-400">#!/usr/bin/env {firstFile.language?.toLowerCase() ?? "text"}</p>
            <p className="mt-1 sm:mt-2 italic line-clamp-2 overflow-hidden text-ellipsis">
              ** {firstFile.content || "No description"} **
            </p>
          </div>
        )}

        {linkedGist === gist.id && !isExpanded && relatedGistUrl && (
          <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-2 line-clamp-1 overflow-hidden text-ellipsis">
            <p>
              Related Gist:{" "}
              <a href={relatedGistUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {relatedGistDescription || "Untitled Gist"}
              </a>
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isLoggedIn) onToggleStar(gist.id);
            }}
            disabled={!isLoggedIn}
            className={`flex items-center gap-1 ${
              isStarred ? "text-yellow-500 dark:text-yellow-400" : "hover:text-yellow-500 dark:hover:text-yellow-400"
            } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FaStar className="w-3 h-3 sm:w-4 sm:h-4" /> {isStarred ? "Unstar" : "Star"}
          </button>
          <button className="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400">
            <FaHeart className="w-3 h-3 sm:w-4 sm:h-4" /> 0
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400">
            <FaComment className="w-3 h-3 sm:w-4 sm:h-4" /> {gist.comments}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandGist(gist.id);
            }}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <FaCode className="w-3 h-3 sm:w-4 sm:h-4" /> {isExpanded ? "Minimize" : "View Full Gist"}
          </button>
          {isLoggedIn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShowDirections();
              }}
              className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400"
            >
              <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4" /> Directions
            </button>
          )}
        </div>

        {isOwner && !isExpanded && (
          <div className="absolute top-3 sm:top-4 right-4 sm:right-6 flex gap-2 px-2 bg-white dark:bg-gray-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditGist(gist.id);
              }}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              title="Edit Gist"
            >
              <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGist(gist.id);
              }}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Delete Gist"
            >
              <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      <DirectionsModal
        isOpen={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
        coordinates={coordinates}
      />
    </div>
  );
}