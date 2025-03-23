import { FaHeart, FaComment, FaShare, FaCode, FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { Gist } from "src/types/types";

interface GistCardProps {
  gist: Gist;
  avatarUrl?: string | null | undefined;
  isExpanded: boolean;
  isStarred: boolean;
  isOwner: boolean;
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
  linkedGist,
  relatedGistDescription,
  relatedGistUrl,
  onToggleStar,
  onExpandGist,
  onEditGist,
  onDeleteGist,
}: GistCardProps) {
  const firstFile = Object.values(gist.files)[0];

  console.log("GistCard - gist.id:", gist.id, "isOwner:", isOwner, "isExpanded:", isExpanded); // Debug
  console.log("GistCard - should show buttons:", isOwner && !isExpanded); // Debug

  return (
    <div
      className={`relative border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-300 ${
        isExpanded ? "col-span-full shadow-lg bg-gray-50" : "hover:shadow-md h-60 sm:h-64"
      }`}
    >
      <div className={`${isExpanded ? "border-b pb-3 sm:pb-4 mb-3 sm:mb-4" : "h-full flex flex-col"}`}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <img
              src={avatarUrl || "/default-avatar.png"}
              alt="Profile"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 object-cover"
              onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
            />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">{gist.owner.login}</p>
              <p className="text-xs text-gray-500">{new Date(gist.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Description Section - Strictly Two Lines */}
        <p
          className="text-sm sm:text-md font-medium text-gray-900 mb-2 line-clamp-2 overflow-hidden text-ellipsis"
          title={gist.description || "Untitled Gist"}
        >
          {gist.description || "Untitled Gist"}
        </p>

        {/* Code Preview Section - Constrained Height */}
        {!isExpanded && (
          <div className="text-xs sm:text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono h-20 sm:h-24 overflow-hidden">
            <p className="text-gray-500">#!/usr/bin/env {firstFile.language?.toLowerCase() ?? "text"}</p>
            <p className="mt-1 sm:mt-2 italic line-clamp-2 overflow-hidden text-ellipsis">
              ** {firstFile.content || "No description"} **
            </p>
          </div>
        )}

        {/* Related Gist Link - Constrained */}
        {linkedGist === gist.id && !isExpanded && relatedGistUrl && (
          <div className="text-xs sm:text-sm text-blue-600 mb-2 line-clamp-1 overflow-hidden text-ellipsis">
            <p>
              Related Gist:{" "}
              <a href={relatedGistUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {relatedGistDescription || "Untitled Gist"}
              </a>
            </p>
          </div>
        )}

        {/* Action Buttons - Fixed at Bottom */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(gist.id);
            }}
            className={`flex items-center gap-1 ${isStarred ? "text-yellow-500" : "hover:text-yellow-500"}`}
          >
            <FaStar className="w-3 h-3 sm:w-4 sm:h-4" /> {isStarred ? "Unstar" : "Star"}
          </button>
          <button className="flex items-center gap-1 hover:text-red-500">
            <FaHeart className="w-3 h-3 sm:w-4 sm:h-4" /> 0
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500">
            <FaComment className="w-3 h-3 sm:w-4 sm:h-4" /> {gist.comments}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandGist(gist.id);
            }}
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <FaCode className="w-3 h-3 sm:w-4 sm:h-4" /> {isExpanded ? "Minimize" : "View Full Gist"}
          </button>
        </div>

        {/* Edit/Delete Buttons */}
        {isOwner && !isExpanded && (
          <div className="absolute top-3 sm:top-4 right-4 sm:right-6 flex gap-2 px-2 bg-white">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditGist(gist.id);
              }}
              className="text-blue-500 hover:text-blue-700"
              title="Edit Gist"
            >
              <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGist(gist.id);
              }}
              className="text-red-500 hover:text-red-700"
              title="Delete Gist"
            >
              <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}