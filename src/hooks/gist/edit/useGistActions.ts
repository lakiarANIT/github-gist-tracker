import { Gist, GistFile, GistGroup, NewGist } from "src/types/types";
import { Octokit } from "@octokit/core";

interface GitHubGistFile {
  filename?: string;
  type?: string;
  language?: string | null;
  raw_url?: string;
  size?: number;
  content?: string;
}

export function useGistActions(
  octokit: Octokit | null,
  newGist: NewGist,
  setGists: React.Dispatch<React.SetStateAction<Gist[]>>,
  setNewGist: (gist: NewGist) => void,
  newGroupName: string, // Added newGroupName as a parameter
  setNewGroupName: (name: string) => void,
  setLinkedGist: (id: string | null) => void,
  setActiveTab: (tab: "profile" | "postGist") => void,
  gistGroups: GistGroup[],
  onCreateGroup: (groupName: string) => Promise<GistGroup>
) {
  const createGists = async (description: string, files: GistFile[], isPublic: boolean): Promise<Gist[]> => {
    if (!octokit) throw new Error("Octokit not initialized.");
    console.log("Creating new Gists with:", { description, files, isPublic });
    const createdGists: Gist[] = [];
    for (const file of files) {
      if (!file.filename.trim() || !file.content.trim()) continue;
      const gistFiles = { [file.filename]: { content: file.content } };
      const response = await octokit.request("POST /gists", {
        description,
        public: isPublic,
        files: gistFiles,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });
      const data = response.data as {
        id: string;
        html_url: string;
        forks_url: string;
        description: string | null;
        files: { [key: string]: GitHubGistFile };
        created_at: string;
        updated_at: string;
        public: boolean;
        comments: number;
        owner?: { login: string; html_url: string };
      };
      if (!data.id || !data.html_url || !data.created_at || !data.updated_at) {
        throw new Error("Invalid Gist response from GitHub API");
      }
      createdGists.push({
        id: data.id,
        html_url: data.html_url,
        forks_url: data.forks_url,
        description: data.description ?? null,
        files: Object.fromEntries(
          Object.entries(data.files || {}).map(([filename, file]) => {
            if (!file || !file.filename || !file.raw_url || file.size === undefined) {
              throw new Error(`Invalid file data for ${filename}`);
            }
            return [
              filename,
              {
                filename: file.filename,
                language: file.language || "Text",
                raw_url: file.raw_url,
                size: file.size,
                content: file.content,
              },
            ];
          })
        ),
        created_at: data.created_at,
        updated_at: data.updated_at,
        public: data.public ?? false,
        comments: data.comments ?? 0,
        owner: {
          login: data.owner?.login || "unknown",
          html_url: data.owner?.html_url || "",
        },
      });
    }
    return createdGists;
  };

  const updateGist = async (
    gistId: string,
    description: string,
    files: GistFile[],
    originalFiles?: { [key: string]: GitHubGistFile }
  ): Promise<Gist> => {
    if (!octokit) throw new Error("Octokit not initialized.");
    console.log("Updating Gist with:", { gistId, description, files, originalFiles });

    const gistFiles: { [key: string]: { content?: string; filename?: string | null } | null } = {};
    files.forEach((file) => {
      if (file.filename) {
        gistFiles[file.filename] = { content: file.content || "" };
      }
    });
    if (originalFiles) {
      Object.keys(originalFiles).forEach((filename) => {
        if (!files.some((file) => file.filename === filename)) {
          gistFiles[filename] = null;
        }
      });
    }

    console.log("Sending PATCH request with files:", gistFiles);
    const response = await octokit.request("PATCH /gists/{gist_id}", {
      gist_id: gistId,
      description,
      files: gistFiles as { [key: string]: { content?: string; filename?: string | null } },
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });
    const data = response.data as {
      id: string;
      html_url: string;
      forks_url: string;
      description: string | null;
      files: { [key: string]: GitHubGistFile };
      created_at: string;
      updated_at: string;
      public: boolean;
      comments: number;
      owner?: { login: string; html_url: string };
    };
    if (!data.id || !data.html_url || !data.created_at || !data.updated_at) {
      throw new Error("Invalid Gist response from GitHub API");
    }
    console.log("Updated Gist response:", data);
    return {
      id: data.id,
      html_url: data.html_url,
      forks_url: data.forks_url,
      description: data.description ?? null,
      files: Object.fromEntries(
        Object.entries(data.files || {}).map(([filename, file]) => {
          if (!file || !file.filename || !file.raw_url || file.size === undefined) {
            throw new Error(`Invalid file data for ${filename}`);
          }
          return [
            filename,
            {
              filename: file.filename,
              language: file.language || "Text",
              raw_url: file.raw_url,
              size: file.size,
              content: file.content,
            },
          ];
        })
      ),
      created_at: data.created_at,
      updated_at: data.updated_at,
      public: data.public ?? false,
      comments: data.comments ?? 0,
      owner: {
        login: data.owner?.login || "unknown",
        html_url: data.owner?.html_url || "",
      },
    };
  };

  const addGistToGroup = async (groupId: string, gistId: string) => {
    if (!groupId) throw new Error("Group ID is undefined");
    const response = await fetch(`/api/gist-groups/${groupId}/gists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gistId }),
    });
    if (!response.ok) throw new Error(`Failed to add Gist to group: ${response.statusText}`);
    const data = await response.json();
    return data.group;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    isEditing: boolean,
    gistId?: string,
    originalGist?: Gist,
    selectedGroupId?: string
  ) => {
    e.preventDefault();
    const validFiles = newGist.files.filter((file) => file.filename.trim() && file.content.trim());

    if (!isEditing && validFiles.length === 0) {
      alert("Please provide at least one file with a filename and content.");
      return;
    }
    if (isEditing && newGist.files.length === 0) {
      alert("You must keep at least one file when updating a Gist.");
      return;
    }

    console.log("Submitting form. isEditing:", isEditing, "gistId:", gistId);
    try {
      if (isEditing && gistId) {
        const updatedGist = await updateGist(gistId, newGist.description, newGist.files, originalGist?.files);
        setGists((prev) => prev.map((g) => (g.id === updatedGist.id ? updatedGist : g)));
        alert("Gist updated successfully!");
      } else {
        const newGists = await createGists(newGist.description, validFiles, newGist.isPublic);
        if (newGists.length === 0) throw new Error("No Gists were created.");

        let groupId = selectedGroupId || "";
        if (!groupId && newGroupName) {
          const newGroup = await onCreateGroup(newGroupName);
          groupId = newGroup.id;
        }

        if (groupId) {
          await Promise.all(newGists.map((gist) => addGistToGroup(groupId, gist.id)));
        }

        setGists((prev) => [
          ...newGists,
          ...prev.filter((gist: Gist) => !newGists.some((newGist: Gist) => newGist.id === gist.id)),
        ]);

        alert(
          `Created ${newGists.length} Gist(s)${
            groupId
              ? ` and added to group "${gistGroups.find((g) => g.id === groupId)?.name || "selected group"}"`
              : ""
          } successfully!`
        );
      }

      setNewGist({ description: "", files: [{ filename: "", content: "", language: "Text" }], isPublic: false });
      setNewGroupName("");
      setLinkedGist(null);
      setActiveTab("profile");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed to ${isEditing ? "update" : "create"} Gist(s): ${error.message || "An unexpected error occurred."}`);
    }
  };

  return { createGists, updateGist, addGistToGroup, handleSubmit };
}