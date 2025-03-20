import { FaChevronLeft, FaChevronRight, FaCode } from "react-icons/fa";
import { Gist } from "../types";

// Define the GistDetails type locally since it's not in ../types
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
  onExpandGist: (gistId: string) => void; // For Minimize button
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{gistDetails.description || "Untitled Gist"}</h3>
        <div className="flex gap-4">
          {!isFirst && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviousGist();
              }}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              <FaChevronLeft className="w-4 h-4" /> Previous
            </button>
          )}
          {!isLast && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextGist();
              }}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Next <FaChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandGist(gist.id); // Toggle expansion back to minimized state
            }}
            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <FaCode className="w-4 h-4" /> Minimize
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
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
      <h4 className="text-md font-medium text-gray-900 mb-2">Files:</h4>
      {Object.entries(gistDetails.files).map(([filename, file]) => (
        <div key={filename} className="mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{file.filename}</p>
          <p className="text-xs text-gray-500">Language: {file.language || "Unknown"}</p>
          <pre className="text-sm bg-gray-100 p-2 rounded mt-2 font-mono overflow-x-auto max-h-48">
            {file.content}
          </pre>
        </div>
      ))}
    </div>
  );
}