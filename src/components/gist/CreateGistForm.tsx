// src/app/profile/components/CreateGistForm.tsx
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

  const { handleSubmit } = useGistActions(
    octokit,
    newGist, // Added newGist
    setGists,
    setNewGist,
    newGroupName, // Added newGroupName
    setNewGroupName,
    setLinkedGist,
    setActiveTab,
    gistGroups,
    onCreateGroup
  );

  const { handleAddFile, handleDeleteFile, handleFileChange } = useFileManagement(newGist, setNewGist);

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {isEditing ? "Edit Gist" : "Create Gists"}
      </h2>
      <form onSubmit={(e) => handleSubmit(e, isEditing, gistId, originalGist, selectedGroupId)}>
        <input
          type="text"
          placeholder={isEditing ? "Gist description" : "Shared description for all Gists..."}
          value={newGist.description}
          onChange={(e) => setNewGist({ ...newGist, description: e.target.value })}
          className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        {newGist.files.map((file, index) => (
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
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={handleAddFile}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            Add another file
          </button>
          {!isEditing && (
            <select
              value={newGist.isPublic ? "public" : "secret"}
              onChange={(e) => setNewGist({ ...newGist, isPublic: e.target.value === "public" })}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="secret">Create secret gists</option>
              <option value="public">Create public gists</option>
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
          {isEditing ? "Update Gist" : newGist.isPublic ? "Create public gists" : "Create secret gists"}
        </button>
      </form>
    </>
  );
}