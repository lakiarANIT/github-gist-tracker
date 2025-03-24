import { GistGroup } from "src/types/types";

interface EditDeleteGroupFormProps {
  gistGroups: GistGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  editGroupName: string;
  setEditGroupName: (name: string) => void;
  handleEditGroup: () => void;
  handleDeleteGroup: () => void;
}

export default function EditDeleteGroupForm({
  gistGroups,
  selectedGroupId,
  setSelectedGroupId,
  editGroupName,
  setEditGroupName,
  handleEditGroup,
  handleDeleteGroup,
}: EditDeleteGroupFormProps) {
  // Filter and assign unique keys if needed
  const validGistGroups = gistGroups
    .filter((group) => group.id && typeof group.id === "string" && group.id.length > 0)
    .map((group, index) => ({
      ...group,
      uniqueKey: group.id || `fallback-${index}`, // Fallback key if id is missing
    }))
    .filter((group, index, self) => self.findIndex((g) => g.id === group.id) === index); // Remove duplicates

  if (gistGroups.length !== validGistGroups.length) {
    console.warn("Filtered out invalid or duplicate groups:", {
      original: gistGroups,
      filtered: validGistGroups,
    });
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Edit or Delete Group</h3>
      <div className="space-y-4">
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Select a group</option>
          {validGistGroups.map((group) => (
            <option key={group.uniqueKey} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {selectedGroupId && (
          <div className="space-y-4">
            <input
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              placeholder="Edit group name"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditGroup}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
              >
                Update Group
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
              >
                Delete Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}