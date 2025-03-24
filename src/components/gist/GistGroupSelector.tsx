import { GistGroup } from "src/types/types";

interface GistGroupSelectorProps {
  gistGroups: GistGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
}

export default function GistGroupSelector({
  gistGroups,
  selectedGroupId, // Fixed typo from 'selectedGroupIdcircumventing'
  setSelectedGroupId,
  newGroupName,
  setNewGroupName,
}: GistGroupSelectorProps) {
  // Validate and sanitize gistGroups
  const validGroups = gistGroups
    .filter((group) => {
      const isValid = group.id && typeof group.id === "string" && group.id.length > 0;
      if (!isValid) {
        console.warn("Invalid group detected in GistGroupSelector (missing or invalid ID):", group);
      }
      return isValid;
    })
    .filter((group, index, self) => {
      const isUnique = self.findIndex((g) => g.id === group.id) === index;
      if (!isUnique) {
        console.warn("Duplicate group ID detected in GistGroupSelector:", group);
      }
      return isUnique;
    });

  // Log if any groups were filtered out
  if (gistGroups.length !== validGroups.length) {
    console.warn("Groups filtered due to invalid or duplicate data in GistGroupSelector:", {
      original: gistGroups,
      valid: validGroups,
    });
  }

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Add to Gist Group
      </label>
      <select
        value={selectedGroupId}
        onChange={(e) => setSelectedGroupId(e.target.value)}
        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="">Select a group (optional)</option>
        {validGroups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
      {newGroupName && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Or enter new group name..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}
    </div>
  );
}