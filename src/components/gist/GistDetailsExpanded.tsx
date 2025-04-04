// src/app/profile/components/GistDetailsExpanded.tsx
import { FaChevronLeft, FaChevronRight, FaCode } from "react-icons/fa";
import { Gist } from "src/types/types";

interface LocalGistDetails {
  description: string | null;
  owner: { login: string };
  files: { [key: string]: { filename: string; language: string | null; content: string } };
  created_at: string;
  updated_at: string;
  public: boolean;
}

interface GistDetailsExpandedProps {
  gist: Gist;
  gistDetails: LocalGistDetails;
  isFirst: boolean;
  isLast: boolean;
  isOwner: boolean;
  onPreviousGist: () => void;
  onNextGist: () => void;
  onExpandGist: (gistId: string) => void;
}

export default function GistDetailsExpanded({
  gist,
  gistDetails,
  isFirst,
  isLast,
  isOwner,
  onPreviousGist,
  onNextGist,
  onExpandGist,
}: GistDetailsExpandedProps) {
  return (
    <div className="p-3 sm:p-4">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
          {gistDetails.description || "Untitled Gist"}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
        <div>
          <p>
            <span className="font-medium">Owner:</span> {gistDetails.owner.login}
          </p>
          <p>
            <span className="font-medium">Created:</span> {new Date(gistDetails.created_at).toLocaleString()}
          </p>
        </div>
        <div>
          <p>
            <span className="font-medium">Updated:</span> {new Date(gistDetails.updated_at).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Public:</span> {gistDetails.public ? "Yes" : "No"}
          </p>
        </div>
      </div>
      <h4 className="text-sm sm:text-md font-medium text-gray-900 dark:text-gray-100 mb-2">Files:</h4>
      {Object.entries(gistDetails.files).map(([filename, file]) => (
        <div
          key={filename}
          className="mb-3 sm:mb-4 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{file.filename}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Language: {file.language || "Unknown"}</p>
          <pre className="text-xs sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 rounded mt-1 sm:mt-2 font-mono overflow-x-auto max-h-40 sm:max-h-48">
            {file.content}
          </pre>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviousGist();
              }}
              disabled={isFirst}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 ${
                isFirst ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Previous
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpandGist(gist.id);
              }}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 mx-auto"
            >
              <FaCode className="w-3 h-3 sm:w-4 sm:h-4" /> Minimize
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextGist();
              }}
              disabled={isLast}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 ${
                isLast ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}