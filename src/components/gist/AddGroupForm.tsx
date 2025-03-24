interface AddGroupFormProps {
    newGroupName: string;
    setNewGroupName: (name: string) => void;
    handleAddGroup: () => void;
  }
  
  export default function AddGroupForm({ newGroupName, setNewGroupName, handleAddGroup }: AddGroupFormProps) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Add New Group</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter new group name"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          >
            Add Group
          </button>
        </div>
      </div>
    );
  }