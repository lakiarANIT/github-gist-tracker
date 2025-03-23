import { useState } from "react";
import { GistGroup } from "src/types/types";
import ManageGistGroups from "@app/gist/components/ManageGistGroups";

interface ManageGistGroupsContainerProps {
  gistGroups: GistGroup[];
  setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>;
}

export default function ManageGistGroupsContainer({ gistGroups, setGistGroups }: ManageGistGroupsContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
      >
        {isExpanded ? "Hide Manage Groups" : "Manage Groups"}
      </button>
      {isExpanded && (
        <div className="mt-4">
          <ManageGistGroups gistGroups={gistGroups} setGistGroups={setGistGroups} />
        </div>
      )}
    </div>
  );
}