import { useState, useEffect } from "react";
import { GistGroup } from "src/types/types";

export function useGistGroupActions(gistGroups: GistGroup[], setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>) {
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [editGroupName, setEditGroupName] = useState("");

  useEffect(() => {
    const selectedGroup = gistGroups.find((group) => group.id === selectedGroupId);
    setEditGroupName(selectedGroup?.name || "");
  }, [selectedGroupId, gistGroups]);

  // Function to refetch all groups from the server
  const refetchGroups = async () => {
    try {
      const response = await fetch("/api/gist-groups", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }
      const data = await response.json();
      setGistGroups(data.groups || []); // Adjust based on your API response structure
    } catch (error) {
      console.error("Error refetching groups:", error);
    }
  };

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
      console.log("New group added:", newGroup);
      setGistGroups((prev) => {
        const updatedGroups = [...prev, newGroup];
        console.log("Updated gistGroups:", updatedGroups);
        return updatedGroups;
      });
      setNewGroupName("");
      await refetchGroups(); // Refetch groups to ensure UI is in sync with server
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
      console.log("Editing group with ID:", selectedGroupId);
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
      await refetchGroups(); // Refetch groups to ensure UI is in sync with server
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
      console.log("Deleting group with ID:", selectedGroupId);
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
      await refetchGroups(); // Refetch groups to ensure UI is in sync with server
      alert("Group deleted successfully!");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert(`Failed to delete group: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return {
    newGroupName,
    setNewGroupName,
    selectedGroupId,
    setSelectedGroupId,
    editGroupName,
    setEditGroupName,
    handleAddGroup,
    handleEditGroup,
    handleDeleteGroup,
  };
}