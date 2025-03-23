// src/app/profile/[gistId]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup, NewGist } from "src/types/types";
import CreateGistForm from "../components/CreateGistForm";
import Navbar from "@components/ui/Navbar";

export default function EditGistPage({ params }: { params: Promise<{ gistId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gist, setGist] = useState<Gist | null>(null);
  const [newGist, setNewGist] = useState<NewGist>({
    description: "",
    files: [{ filename: "", content: "", language: "Text" }],
    isPublic: false,
  });
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [linkedGist, setLinkedGist] = useState<string | null>(null);
  const [gists, setGists] = useState<Gist[]>([]);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [githubUsername, setGithubUsername] = useState<string>("");

  useEffect(() => {
    const initialize = async () => {
      const { gistId } = await params;
      if (status !== "authenticated" || !session) return;

      try {
        const tokenResponse = await fetch("/api/github-token", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!tokenResponse.ok) throw new Error("Failed to fetch GitHub token");
        const tokenData = await tokenResponse.json();
        const { githubToken } = tokenData;

        if (!githubToken) throw new Error("GitHub token not found");

        const octo = new Octokit({ auth: githubToken });
        setOctokit(octo);

        const userResponse = await octo.request("GET /user", {
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
        });
        setGithubUsername(userResponse.data.login);

        const gistResponse = await octo.request("GET /gists/{gist_id}", {
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
        console.error("Error initializing:", error);
        alert("Failed to load gist. Please try again.");
        router.push("/profile");
      }
    };

    initialize();
  }, [status, session, params]);

  const handleCreateGroup = async (groupName: string): Promise<GistGroup> => {
    if (!groupName.trim()) {
      throw new Error("Group name cannot be empty");
    }

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

  if (status === "loading" || !gist || !githubUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-t-blue-500 dark:border-t-blue-400 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || githubUsername !== gist.owner?.login) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">You are not authorized to edit this gist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Gist</h1>
        <CreateGistForm
          newGist={newGist}
          setNewGist={setNewGist}
          gistGroups={gistGroups}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          linkedGist={linkedGist}
          setLinkedGist={setLinkedGist}
          gists={gists}
          octokit={octokit}
          setGists={setGists}
          setGistGroups={setGistGroups}
          setActiveTab={() => router.push("/profile")}
          githubUsername={githubUsername}
          onCreateGroup={handleCreateGroup}
        />
      </div>
    </div>
  );
}