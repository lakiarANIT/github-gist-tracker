// CreateGistForm.tsx
import { FaTrash } from "react-icons/fa";
import { Gist, GistFile, GistGroup, NewGist } from "src/types/types";
import { Octokit } from "@octokit/core";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface CreateGistFormProps {
  newGist: NewGist;
  setNewGist: (gist: NewGist) => void;
  gistGroups: GistGroup[];
  setGistGroups: Dispatch<SetStateAction<GistGroup[]>>;
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  linkedGist: string | null;
  setLinkedGist: (id: string | null) => void;
  gists: Gist[];
  octokit: Octokit | null;
  setGists: Dispatch<SetStateAction<Gist[]>>;
  setActiveTab: (tab: "profile" | "postGist") => void;
  githubUsername: string;
  onCreateGroup: (groupName: string) => Promise<GistGroup>;
}

interface GitHubGistFile {
  filename?: string;
  type?: string;
  language?: string | null;
  raw_url?: string;
  size?: number;
  content?: string;
}

export default function CreateGistForm({
  newGist,
  setNewGist,
  gistGroups,
  setGistGroups,
  selectedGroupId,
  setSelectedGroupId,
  newGroupName,
  setNewGroupName,
  linkedGist,
  setLinkedGist,
  gists,
  octokit,
  setGists,
  setActiveTab,
  githubUsername,
  onCreateGroup,
}: CreateGistFormProps) {
  const router = useRouter();
  const isEditing = !!window.location.pathname.includes("/edit/");
  const gistId = isEditing ? window.location.pathname.split("/").pop() : null;

  const createGists = async (description: string, files: GistFile[], isPublic: boolean): Promise<Gist[]> => {
    if (!octokit) throw new Error("Octokit not initialized.");
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

  const updateGist = async (gistId: string, description: string, files: GistFile[]): Promise<Gist> => {
    if (!octokit) throw new Error("Octokit not initialized.");
    const gistFiles: { [key: string]: { content: string } } = {};
    files.forEach((file) => {
      if (file.filename && file.content) gistFiles[file.filename] = { content: file.content };
    });
    const response = await octokit.request("PATCH /gists/{gist_id}", {
      gist_id: gistId,
      description,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validFiles = newGist.files.filter((file) => file.filename.trim() && file.content.trim());
    if (validFiles.length === 0) {
      alert("Please provide at least one file with a filename and content.");
      return;
    }

    try {
      if (isEditing && gistId) {
        const updatedGist = await updateGist(gistId, newGist.description, validFiles);
        setGists((prev) => prev.map((g) => (g.id === updatedGist.id ? updatedGist : g)));
        alert("Gist updated successfully!");
      } else {
        const groupId = selectedGroupId || "";

        const newGists = await createGists(newGist.description, validFiles, newGist.isPublic);
        if (newGists.length === 0) throw new Error("No Gists were created.");

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
      setNewGroupName(""); // Reset even though not used for adding here
      setLinkedGist(null);
      setActiveTab("profile");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed to ${isEditing ? "update" : "create"} Gist(s): ${error.message || "An unexpected error occurred."}`);
    }
  };

  const handleAddFile = () => {
    setNewGist({
      ...newGist,
      files: [...newGist.files, { filename: "", content: "", language: "Text" }],
    });
  };

  const handleDeleteFile = (index: number) => {
    if (newGist.files.length <= 1) {
      alert("You must keep at least one file.");
      return;
    }
    const updatedFiles = newGist.files.filter((_, i) => i !== index);
    setNewGist({ ...newGist, files: updatedFiles });
  };

  const handleFileChange = (index: number, field: keyof GistFile, value: string) => {
    const updatedFiles = newGist.files.map((file, i) =>
      i === index ? { ...file, [field]: value } : file
    );
    setNewGist({ ...newGist, files: updatedFiles });
  };

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {isEditing ? "Edit Gist" : "Create Gists"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Shared description for all Gists..."
          value={newGist.description}
          onChange={(e) => setNewGist({ ...newGist, description: e.target.value })}
          className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        {newGist.files.map((file, index) => (
          <div key={index} className="mb-4 border-b pb-4 border-gray-200 dark:border-gray-700 relative">
            <input
              type="text"
              placeholder={`Gist ${index + 1} filename (e.g., file${index + 1}.txt)`}
              value={file.filename}
              onChange={(e) => handleFileChange(index, "filename", e.target.value)}
              className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <textarea
              placeholder={`Content for Gist ${index + 1}...`}
              value={file.content}
              onChange={(e) => handleFileChange(index, "content", e.target.value)}
              className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={4}
            />
            <div className="flex items-center gap-2 mb-2">
              <select
                value={file.language}
                onChange={(e) => handleFileChange(index, "language", e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {["Text", "Ruby", "Python", "JavaScript", "TypeScript"].map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              {index === 0 && (
                <select
                  value={linkedGist || ""}
                  onChange={(e) => setLinkedGist(e.target.value || null)}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Link to another Gist (optional)</option>
                  {gists.map((gist) => (
                    <option key={gist.id} value={gist.id}>
                      {gist.description || "Untitled Gist"}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDeleteFile(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Delete this Gist"
              disabled={newGist.files.length <= 1}
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={handleAddFile}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            Add another Gist
          </button>
          <select
            value={newGist.isPublic ? "public" : "secret"}
            onChange={(e) => setNewGist({ ...newGist, isPublic: e.target.value === "public" })}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="secret">Create secret gists</option>
            <option value="public">Create public gists</option>
          </select>
        </div>
        {!isEditing && (
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
              {gistGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
        >
          {isEditing ? "Update Gist" : newGist.isPublic ? "Create public gists" : "Create secret gists"}
        </button>
      </form>
    </>
  );
}