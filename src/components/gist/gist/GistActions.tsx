import { FaHeart, FaComment, FaCode, FaEdit, FaTrash, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { Gist } from "src/types/types";

interface GistActionsProps {
  gist: Gist;
  isExpanded: boolean;
  isStarred: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
  onToggleStar: (gistId: string) => void;
  onExpandGist: (gistId: string) => void;
  onEditGist: (gistId: string) => void;
  onDeleteGist: (gistId: string) => void;
  onShowDirections: () => void;
}

export const GistActions = ({
  gist,
  isExpanded,
  isStarred,
  isOwner,
  isLoggedIn,
  onToggleStar,
  onExpandGist,
  onEditGist,
  onDeleteGist,
  onShowDirections,
}: GistActionsProps) => (
  <>
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
            onShowDirections();
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
  </>
);