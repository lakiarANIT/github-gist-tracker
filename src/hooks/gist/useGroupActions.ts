import { useState } from "react";
import { GistGroup } from "src/types/types";

export function useGroupActions(
  setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>,
  setSelectedGroupId: React.Dispatch<React.SetStateAction<string>>,
  fetchGroupsAndGists: () => Promise<void>
) {
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = async (groupName: string): Promise<GistGroup> => {
    if (!groupName.trim()) throw new Error("Group name cannot be empty");

    try {
      const response = await fetch("/api/gist-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create group");
      const { group } = await response.json();

      setGistGroups((prev) => [...prev, group]);
      setSelectedGroupId(group.id);
      setNewGroupName("");
      await fetchGroupsAndGists();

      return group;
    } catch (error) {
      console.error("Error creating group:", error);
      throw new Error("Failed to create group. Please try again.");
    }
  };

  return { newGroupName, setNewGroupName, handleCreateGroup };
}