"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Octokit } from "@octokit/core";
import { Gist, GistFile, NewGist } from "../../types";
import CreateGistForm from "../../components/CreateGistForm";

export default function EditGistPage({ params }: { params: Promise<{ gistId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gist, setGist] = useState<Gist | null>(null);
  const [newGist, setNewGist] = useState<NewGist>({
    description: "",
    files: [{ filename: "", content: "", language: "Text" }],
    isPublic: false,
  });
  const [gistGroups, setGistGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [linkedGist, setLinkedGist] = useState<string | null>(null);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const { gistId } = await params;
      if (status === "authenticated" && session) {
        try {
          const tokenResponse = await fetch("/api/github-token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok) throw new Error(tokenData.error || "Failed to fetch GitHub token");

          const { githubToken } = tokenData;
          if (githubToken) {
            const octo = new Octokit({ auth: githubToken });
            setOctokit(octo);

            // Fetch authenticated user's GitHub username
            const userResponse = await octo.request("GET /user", {
              headers: { "X-GitHub-Api-Version": "2022-11-28" },
            });
            setGithubUsername(userResponse.data.login);

            // Fetch the gist
            const gistResponse = await octo.request("GET /gists/{gist_id}", {
              gist_id: gistId,
              headers: { "X-GitHub-Api-Version": "2022-11-28" },
            });
            const gistData = gistResponse.data;
            setGist(gistData as Gist);
            setNewGist({
              description: gistData.description || "",
              files: Object.entries(gistData.files || {}).map(([filename, file]) => {
                if (!file) {
                  throw new Error(`File data for ${filename} is null`);
                }
                return {
                  filename: file.filename || filename,
                  content: file.content || "",
                  language: file.language || "Text",
                };
              }),
              isPublic: gistData.public || false,
            });

            // Fetch gist groups
            const groupsResponse = await fetch("/api/gist-groups", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            if (!groupsResponse.ok) throw new Error("Failed to fetch Gist groups");
            const groupsData = await groupsResponse.json();
            const fetchedGroups = (groupsData.groups || []).map((group: any) => ({
              id: group._id.toString(),
              name: group.name,
            }));
            setGistGroups(fetchedGroups);
          }
        } catch (error) {
          console.error("Error initializing:", error);
          alert("Failed to load gist. Please try again.");
          router.push("/profile");
        }
      }
    };

    initialize();
  }, [status, session, params]);

  if (status === "loading" || !gist || !githubUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || githubUsername !== gist.owner.login) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">You are not authorized to edit this gist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Gist</h1>
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
          gists={[]}
          octokit={octokit}
          setGists={() => {}}
          setGistGroups={setGistGroups}
          setActiveTab={() => router.push("/profile")}
        />
      </div>
    </div>
  );
}