// src/components/profile/ProfilePage.tsx
"use client";

import { useState } from "react";
import { NewGist } from "src/types/types";
import Navbar from "@components/ui/Navbar";
import ProfileView from "@components/profile/ProfileView";
import ManageGistGroupsContainer from "@components/profile/ManageGistGroupsContainer";
import GroupList from "@components/profile/GroupList";
import CreateGistForm from "@app/gist/components/CreateGistForm";
import GistList from "@app/gist/components/GistList";
import PublicGistList from "src/components/home/PublicGistList";
import { useProfileData } from "@hooks/profile/useProfileData"; // Adjusted path
import { useGistActions } from "@hooks/profile/useGistActions"; // Adjusted path
import { useGroupActions } from "@hooks/profile/useGroupActions"; // Adjusted path

export default function ProfilePage() {
  const {
    status,
    session,
    gists,
    setGists,
    publicGists,
    setPublicGists,
    gistGroups,
    setGistGroups,
    octokit,
    githubUsername,
    showLocationPrompt,
    setShowLocationPrompt,
    requestLocation,
  } = useProfileData();

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [showCreateGist, setShowCreateGist] = useState(false);
  const [newGist, setNewGist] = useState<NewGist>({
    description: "",
    files: [{ filename: "", content: "", language: "Text" }],
    isPublic: false,
  });
  const [linkedGist, setLinkedGist] = useState<string | null>(null);

  const { handleDeleteGist } = useGistActions({
    selectedGroupId,
    status,
    octokit,
    setGists,
    gistGroups,
    setGistGroups,
  });

  const { newGroupName, setNewGroupName, handleCreateGroup } = useGroupActions(setGistGroups);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-t-blue-500 dark:border-t-blue-400 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            <span className="typewriter inline-block">
              Please sign in to view your profile.
            </span>
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="fixed top-0 left-0 w-full z-20">
        <Navbar
          gistGroups={gistGroups}
          gists={gists}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          isGistList={false}
        />
      </div>
      <div className="pt-[4rem] max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <ProfileView
            showLocationPrompt={showLocationPrompt}
            setShowLocationPrompt={setShowLocationPrompt}
            requestLocation={requestLocation} // Passed from useProfileData
          />
        </div>
        <ManageGistGroupsContainer gistGroups={gistGroups} setGistGroups={setGistGroups} />
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <button
            onClick={() => setShowCreateGist(!showCreateGist)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          >
            {showCreateGist ? "Hide Create Gist" : "Create Gist"}
          </button>
          {showCreateGist && (
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Create a New Gist</h2>
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
                setActiveTab={() => {}}
                githubUsername={githubUsername}
                onCreateGroup={handleCreateGroup}
              />
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Groups</h2>
          <GroupList
            gistGroups={gistGroups}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {selectedGroupId === "" ? "All Gists" : gistGroups.find((g) => g.id === selectedGroupId)?.name || "Selected Group"} ({gists.length})
          </h2>
          {gists.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">No gists found for this selection. Create one above!</p>
          ) : (
            <GistList
              gists={gists}
              selectedGroupId={selectedGroupId}
              gistGroups={gistGroups}
              linkedGist={linkedGist}
              onDeleteGist={handleDeleteGist}
            />
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Public Gists</h2>
          <PublicGistList
            gists={publicGists}
            selectedGroupId={selectedGroupId}
            gistGroups={gistGroups}
            octokit={octokit}
            githubUsername={githubUsername}
            excludeUserGists={true}
          />
        </div>
      </div>
    </div>
  );
}