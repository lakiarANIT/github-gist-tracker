// src/app/profile/[gistId]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@hooks/gist/useAuth";
import { useGistData } from "@hooks/gist/useGistData";
import { useGroupActions } from "@hooks/gist/useGroupActions";
import CreateGistForm from "../../../components/gist/CreateGistForm";

export default function EditGistPage({ params }: { params: Promise<{ gistId: string }> }) {
  const router = useRouter();
  const { status, session, octokit, githubUsername } = useAuth();
  const [resolvedGistId, setResolvedGistId] = useState<string>("");
  const [linkedGist, setLinkedGist] = useState<string | null>(null);

  // Resolve gistId from params
  useEffect(() => {
    const resolveParams = async () => {
      const { gistId } = await params;
      setResolvedGistId(gistId);
    };
    resolveParams();
  }, [params]);

  const {
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
  } = useGistData(resolvedGistId, octokit, githubUsername);

  const { newGroupName, setNewGroupName, handleCreateGroup } = useGroupActions(
    setGistGroups,
    setSelectedGroupId,
    fetchGroupsAndGists
  );

  // Loading state
  const isLoading = status === "loading" || !resolvedGistId || !gist || !githubUsername;
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Authorization check
  if (status === "unauthenticated" || githubUsername !== gist.owner?.login) {
    return <UnauthorizedMessage />;
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
          onCreateGroup={handleCreateGroup} // Pass handleCreateGroup directly
          gistId={resolvedGistId} // Pass resolved gistId
          originalGist={gist} // Pass original gist for comparison
        />
      </div>
    </div>
  );
}

// Reusable Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-8 h-8 border-4 border-t-blue-500 dark:border-t-blue-400 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
    </div>
  );
}

// Reusable Unauthorized Message Component
function UnauthorizedMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-lg text-gray-700 dark:text-gray-300">You are not authorized to edit this gist.</p>
    </div>
  );
}