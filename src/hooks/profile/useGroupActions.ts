import { useState } from "react";
import { GistGroup } from "src/types/types";

export function useGroupActions(setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>) {
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = async (groupName: string): Promise<GistGroup> => {
    if (!groupName.trim()) throw new Error("Group name cannot be empty");

    try {
      const response = await fetch("/api/gist-groups/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create group: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const group: GistGroup = data.group;

      if (!group || !group.id) throw new Error("API did not return a valid group with an ID");

      setGistGroups((prev) => [...prev, group]);
      setNewGroupName("");
      return group;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  return { newGroupName, setNewGroupName, handleCreateGroup };
}