import { Dispatch, SetStateAction } from "react";
import { Gist, GistGroup, NewGist } from "src/types/types";
import { Octokit } from "@octokit/core";
import { useGistActions } from "@hooks/gist/edit/useGistActions";
import { useFileManagement } from "@hooks/gist/edit/useFileManagement";
import FileInput from "@components/gist/FileInput";
import GistGroupSelector from "@components/gist/GistGroupSelector";

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
  gistId?: string;
  originalGist?: Gist;
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
  gistId,
  originalGist,
}: CreateGistFormProps) {
  const isEditing = !!gistId;
  console.log("CreateGistForm rendered. gistId:", gistId, "isEditing:", isEditing);

  // Ensure newGist.isPublic defaults to true if not set
  const effectiveNewGist = {
    ...newGist,
    isPublic: newGist.isPublic !== undefined ? newGist.isPublic : true, // Default to true
  };

  const { handleSubmit } = useGistActions(
    octokit,
    effectiveNewGist, // Use effectiveNewGist here
    setGists,
    setNewGist,
    newGroupName,
    setNewGroupName,
    setLinkedGist,
    setActiveTab,
    gistGroups,
    onCreateGroup
  );

  const { handleAddFile, handleDeleteFile, handleFileChange } = useFileManagement(effectiveNewGist, setNewGist);

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {isEditing ? "Edit Gist" : "Create Gists"}
      </h2>
      <form onSubmit={(e) => handleSubmit(e, isEditing, gistId, originalGist, selectedGroupId)}>
        <input
          type="text"
          placeholder={isEditing ? "Gist description" : "Shared description for all Gists..."}
          value={effectiveNewGist.description}
          onChange={(e) => setNewGist({ ...effectiveNewGist, description: e.target.value })}
          className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        {effectiveNewGist.files.map((file, index) => (
          <FileInput
            key={index}
            file={file}
            index={index}
            isEditing={isEditing}
            gists={gists}
            linkedGist={linkedGist}
            setLinkedGist={setLinkedGist}
            handleFileChange={handleFileChange}
            handleDeleteFile={handleDeleteFile}
          />
        ))}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <button
            type="button"
            onClick={handleAddFile}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            Add another file
          </button>
          {!isEditing && (
            <select
              value={effectiveNewGist.isPublic ? "public" : "secret"}
              onChange={(e) => setNewGist({ ...effectiveNewGist, isPublic: e.target.value === "public" })}
              className="w-full sm:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="public">Create public gists</option>
              <option value="secret">Create secret gists</option>
            </select>
          )}
        </div>
        {!isEditing && (
          <GistGroupSelector
            gistGroups={gistGroups}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
          />
        )}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
        >
          {isEditing ? "Update Gist" : effectiveNewGist.isPublic ? "Create public gists" : "Create secret gists"}
        </button>
      </form>
    </>
  );
}