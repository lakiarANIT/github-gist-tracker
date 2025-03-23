import { GistGroup } from "src/types/types";
import { FaFolder } from "react-icons/fa";

interface GroupListProps {
  gistGroups: GistGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
}

export default function GroupList({ gistGroups, selectedGroupId, setSelectedGroupId }: GroupListProps) {
  const nonEmptyGroups = gistGroups.filter((group) => (group.gistIds?.length ?? 0) > 0);
  const sortedGroups = [...nonEmptyGroups].sort((a, b) => a.name.localeCompare(b.name));
  const groupedGroups = sortedGroups.reduce((acc, group) => {
    const firstLetter = group.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(group);
    return acc;
  }, {} as Record<string, GistGroup[]>);

  const letters = Object.keys(groupedGroups).sort();

  return (
    <div className="w-full max-h-[50vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setSelectedGroupId("")}
        className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center ${
          selectedGroupId === "" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
        }`}
      >
        <FaFolder className="w-4 h-4 mr-2" />
        <span>All Gists</span>
      </button>
      {letters.map((letter) => (
        <div key={letter}>
          <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            {letter}
          </h3>
          {groupedGroups[letter].map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`w-full px-4 py-2 text-left text-sm flex items-center ${
                selectedGroupId === group.id ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <FaFolder className="w-4 h-4 mr-2" />
              <div className="truncate flex-1">
                <span className="font-medium">{group.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({group.gistIds?.length ?? 0})</span>
                <span className="block text-xs text-gray-600 dark:text-gray-400 truncate">@{group.owner?.login || "unknown"}</span>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}