// components/ManageGistGroups.tsx
import { useState, useEffect } from "react";
import { GistGroup } from "src/types/types";

interface ManageGistGroupsProps {
  gistGroups: GistGroup[];
  setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>;
}

export default function ManageGistGroups({ gistGroups, setGistGroups }: ManageGistGroupsProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [editGroupName, setEditGroupName] = useState("");

  useEffect(() => {
    const selectedGroup = gistGroups.find((group) => group.id === selectedGroupId);
    setEditGroupName(selectedGroup?.name || "");
  }, [selectedGroupId, gistGroups]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    try {
      const response = await fetch("/api/gist-groups/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create group");
      }

      const newGroup = await response.json().then((data) => data.group);
      console.log("New group added:", newGroup); // Debug log
      setGistGroups((prev) => {
        const updatedGroups = [...prev, newGroup];
        console.log("Updated gistGroups:", updatedGroups); // Debug log
        return updatedGroups;
      });
      setNewGroupName("");
      alert("Group added successfully!");
    } catch (error) {
      console.error("Error adding group:", error);
      alert(`Failed to add group: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroupId) {
      alert("Please select a group to edit.");
      return;
    }
    if (!editGroupName.trim()) {
      alert("Please enter a new group name.");
      return;
    }

    try {
      console.log("Editing group with ID:", selectedGroupId); // Debug log
      const response = await fetch(`/api/gist-groups/edit/${selectedGroupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editGroupName }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update group");
      }

      const updatedGroup = await response.json().then((data) => data.group);
      setGistGroups((prev) =>
        prev.map((group) => (group.id === selectedGroupId ? updatedGroup : group))
      );
      alert("Group updated successfully!");
    } catch (error) {
      console.error("Error editing group:", error);
      alert(`Failed to edit group: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupId) {
      alert("Please select a group to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete this group?")) {
      return;
    }

    try {
      console.log("Deleting group with ID:", selectedGroupId); // Debug log
      const response = await fetch(`/api/gist-groups/delete/${selectedGroupId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete group");
      }

      setGistGroups((prev) => prev.filter((group) => group.id !== selectedGroupId));
      setSelectedGroupId("");
      setEditGroupName("");
      alert("Group deleted successfully!");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert(`Failed to delete group: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Filter out groups with invalid or duplicate IDs and log for debugging
  const validGistGroups = gistGroups.filter((group, index, self) => {
    const isValid = group.id && typeof group.id === "string" && group.id.length > 0;
    const isUnique = self.findIndex((g) => g.id === group.id) === index;
    if (!isValid || !isUnique) {
      console.warn("Invalid or duplicate group detected:", group);
    }
    return isValid && isUnique;
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Gist Groups</h2>

      {/* Add New Group */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Add New Group</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter new group name"
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add Group
          </button>
        </div>
      </div>

      {/* Edit/Delete Existing Group */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Edit or Delete Group</h3>
        <div className="space-y-4">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a group</option>
            {validGistGroups.map((group) => (
              <option key={group.id} value={group.id}>
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditGroup}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Update Group
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}