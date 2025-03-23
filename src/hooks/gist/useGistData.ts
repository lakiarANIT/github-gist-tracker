// src/hooks/useGistData.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gist, GistGroup, NewGist } from "src/types/types";
import { Octokit } from "@octokit/core";

export function useGistData(gistId: string, octokit: Octokit | null, githubUsername: string) {
  const router = useRouter();
  const [gist, setGist] = useState<Gist | null>(null);
  const [newGist, setNewGist] = useState<NewGist>({
    description: "",
    files: [{ filename: "", content: "", language: "Text" }],
    isPublic: false,
  });
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [gists, setGists] = useState<Gist[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  useEffect(() => {
    const fetchGistData = async () => {
      if (!gistId || !octokit || !githubUsername) return; // Skip if gistId is empty or dependencies are missing

      try {
        const gistResponse = await octokit.request("GET /gists/{gist_id}", {
          gist_id: gistId,
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
        });
        const gistData = gistResponse.data as Gist;
        setGist(gistData);
        setNewGist({
          description: gistData.description || "",
          files: Object.entries(gistData.files || {}).map(([filename, file]) => ({
            filename: file?.filename || filename,
            content: file?.content || "",
            language: file?.language || "Text",
          })),
          isPublic: !!gistData.public,
        });

        const groupsResponse = await fetch("/api/gist-groups", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!groupsResponse.ok) throw new Error("Failed to fetch Gist groups");
        const groupsData = await groupsResponse.json();
        setGistGroups(groupsData.groups || []);
        setGists(groupsData.gists || []);

        const groupWithGist = (groupsData.groups || []).find((group: GistGroup) =>
          group.gistIds?.some((g) => (typeof g === "string" ? g : g.id) === gistId)
        );
        if (groupWithGist) setSelectedGroupId(groupWithGist.id);
      } catch (error) {
        console.error("Error fetching gist data:", error);
        alert("Failed to load gist. Please try again.");
        router.push("/profile");
      }
    };

    fetchGistData();
  }, [gistId, octokit, githubUsername, router]);

  const fetchGroupsAndGists = async () => {
    try {
      const groupsResponse = await fetch("/api/gist-groups", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!groupsResponse.ok) throw new Error("Failed to fetch Gist groups");
      const groupsData = await groupsResponse.json();
      setGistGroups(groupsData.groups || []);
      setGists(groupsData.gists || []);
    } catch (error) {
      console.error("Error fetching groups and gists:", error);
    }
  };

  return {
    gist,
    newGist,
    setNewGist,
    gistGroups,
    setGistGroups,
    gists,
    setGists,
    selectedGroupId,
    setSelectedGroupId,
    fetchGroupsAndGists,
  };
}