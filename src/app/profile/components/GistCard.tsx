import { FaHeart, FaComment, FaShare, FaCode, FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { Gist } from "../types";

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

  return (
    <div
      className={`border border-gray-200 rounded-lg p-8 transition-all duration-300 ${
        isExpanded ? "col-span-full shadow-lg bg-gray-50" : "hover:shadow-md"
      }`}
    >
      <div className={`${isExpanded ? "border-b pb-4 mb-4" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={avatarUrl || "/default-avatar.png"}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-gray-300 object-cover"
              onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{gist.owner.login}</p>
              <p className="text-xs text-gray-500">{new Date(gist.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <FaStar className={`w-5 h-5 ${isStarred ? "text-yellow-500" : "text-gray-400"}`} />
        </div>
        <p className="text-md font-medium text-gray-900 mb-2">{gist.description || "Untitled Gist"}</p>
        {!isExpanded && (
          <div className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
            <p className="text-gray-500">#!/usr/bin/env {firstFile.language?.toLowerCase() ?? "text"}</p>
            <p className="mt-2 italic">** {gist.description || "No description"} **</p>
          </div>
        )}
        {linkedGist === gist.id && !isExpanded && relatedGistUrl && (
          <div className="text-sm text-blue-600 mb-2">
            <p>
              Related Gist:{" "}
              <a href={relatedGistUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {relatedGistDescription || "Untitled Gist"}
              </a>
            </p>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(gist.id);
            }}
            className={`flex items-center gap-1 ${isStarred ? "text-yellow-500" : "hover:text-yellow-500"}`}
          >
            <FaStar className="w-4 h-4" /> {isStarred ? "Unstar" : "Star"}
          </button>
          <button className="flex items-center gap-1 hover:text-red-500">
            <FaHeart className="w-4 h-4" /> 0 {/* No API for likes, hardcoded to 0 */}
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500">
            <FaComment className="w-4 h-4" /> {gist.comments}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandGist(gist.id);
            }}
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <FaCode className="w-4 h-4" /> {isExpanded ? "Minimize" : "View Full Gist"}
          </button>
        </div>
        {isOwner && !isExpanded && (
          <div className="absolute px-2 top-5 right-7 flex gap-2"> {/* Changed top-2 to top-4 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditGist(gist.id);
              }}
              className="text-blue-500 hover:text-blue-700"
              title="Edit Gist"
            >
              <FaEdit className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGist(gist.id);
              }}
              className="text-red-500 hover:text-red-700"
              title="Delete Gist"
            >
              <FaTrash className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}