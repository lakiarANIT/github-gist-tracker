import { GistGroup } from "src/types/types";
import { FaFolder } from "react-icons/fa";

interface GroupListProps {
  gistGroups: GistGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
}

// Local type extending GistGroup to include uniqueKey
interface EnhancedGistGroup extends GistGroup {
  uniqueKey: string;
}

export default function GroupList({ gistGroups, selectedGroupId, setSelectedGroupId }: GroupListProps) {
  // Step 1: Sanitize and validate gistGroups, adding uniqueKey
  const validGroups: EnhancedGistGroup[] = gistGroups
    .filter((group) => {
      const isValid = group.id && typeof group.id === "string" && group.id.length > 0;
      if (!isValid) {
        console.warn("Invalid group detected (missing or invalid ID):", group);
      }
      return isValid;
    })
    .map((group, index) => ({
      ...group,
      uniqueKey: group.id || `fallback-${index}`, // Fallback key if ID is missing
    }))
    .filter((group, index, self) => {
      const isUnique = self.findIndex((g) => g.id === group.id) === index;
      if (!isUnique) {
        console.warn("Duplicate group ID detected:", group);
      }
      return isUnique;
    });

  // Step 2: Filter non-empty groups and sort
  const nonEmptyGroups = validGroups.filter((group) => (group.gistIds?.length ?? 0) > 0);
  const sortedGroups = [...nonEmptyGroups].sort((a, b) => a.name.localeCompare(b.name));

  // Step 3: Group by first letter
  const groupedGroups = sortedGroups.reduce((acc, group) => {
    const firstLetter = group.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(group);
    return acc;
  }, {} as Record<string, EnhancedGistGroup[]>); // Use EnhancedGistGroup here

  const letters = Object.keys(groupedGroups).sort();

  // Debugging: Log if any groups were filtered out
  if (gistGroups.length !== validGroups.length) {
    console.warn("Groups filtered due to invalid or duplicate data:", {
      original: gistGroups,
      valid: validGroups,
    });
  }

  return (
    <div className="w-full max-h-[50vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setSelectedGroupId("")}
        className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center ${
          selectedGroupId === ""
            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              key={group.uniqueKey} // Now type-safe with EnhancedGistGroup
              onClick={() => setSelectedGroupId(group.id)}
              className={`w-full px-4 py-2 text-left text-sm flex items-center ${
                selectedGroupId === group.id
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <FaFolder className="w-4 h-4 mr-2" />
              <div className="truncate flex-1">
                <span className="font-medium">{group.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({group.gistIds?.length ?? 0})
                </span>
                <span className="block text-xs text-gray-600 dark:text-gray-400 truncate">
                  @{group.owner?.login || "unknown"}
                </span>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}