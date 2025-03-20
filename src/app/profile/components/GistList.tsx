// File: /app/profile/components/GistList.tsx
import { FaHeart, FaComment, FaShare, FaCode, FaEdit, FaTrash } from "react-icons/fa";
import { Gist, GistGroup } from "../types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";

interface GistListProps {
  gists: Gist[];
  selectedGroupId: string;
  gistGroups: GistGroup[];
  linkedGist: string | null;
  onDeleteGist: (gistId: string) => Promise<void>;
}

export default function GistList({ gists, selectedGroupId, gistGroups, linkedGist, onDeleteGist }: GistListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch GitHub token and username on mount
  useEffect(() => {
    const fetchGithubUsername = async () => {
      if (session) {
        try {
          const tokenResponse = await fetch("/api/github-token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok) throw new Error(tokenData.error || "Failed to fetch GitHub token");

          const { githubToken } = tokenData;
          if (githubToken) {
            const octokit = new Octokit({ auth: githubToken });
            const userResponse = await octokit.request("GET /user", {
              headers: { "X-GitHub-Api-Version": "2022-11-28" },
            });
            setGithubUsername(userResponse.data.login);
          }
        } catch (error) {
          console.error("Error fetching GitHub username:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGithubUsername();
  }, [session]);

  // Check if the current user is the owner of the gist
  const isOwner = (gist: Gist) => {
    const gistOwner = gist.owner.login;
    console.log("Checking ownership - User:", githubUsername, "Gist Owner:", gistOwner); // Debug log
    return githubUsername && gistOwner && githubUsername.toLowerCase() === gistOwner.toLowerCase();
  };

  if (loading) {
    return <div>Loading gists...</div>; // Optional loading state
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Gists {selectedGroupId ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name}` : "from All Groups"}
      </h2>
      <div className="max-h-[60vh] overflow-y-auto">
        {gists.length === 0 ? (
          <p className="text-sm text-gray-600">No gists available yet. Share one!</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gists.map((gist) => {
              const firstFile = Object.values(gist.files)[0];
              return (
                <div
                  key={gist.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={session?.user?.image || "/default-avatar.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                      onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{gist.owner.login}</p>
                      <p className="text-xs text-gray-500">{new Date(gist.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-md font-medium text-gray-900 mb-2">{gist.description || "Untitled Gist"}</p>
                  {gist.description && <p className="text-sm text-gray-600 mb-2">{gist.description}</p>}
                  <div className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                    <p className="text-gray-500">#!/usr/bin/env {firstFile.language?.toLowerCase() ?? "text"}</p>
                    <p className="mt-2 italic">** {gist.description || "No description"} **</p>
                  </div>
                  {linkedGist === gist.id && (
                    <div className="text-sm text-blue-600 mb-2">
                      <p>
                        Related Gist:{" "}
                        <a
                          href={gists.find((g) => g.id === linkedGist)?.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {gists.find((g) => g.id === linkedGist)?.description || "Untitled Gist"}
                        </a>
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-red-500">
                      <FaHeart className="w-4 h-4" /> 24
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500">
                      <FaComment className="w-4 h-4" /> {gist.comments}
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-500">
                      <FaShare className="w-4 h-4" /> 2
                    </button>
                    <a
                      href={gist.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <FaCode className="w-4 h-4" /> View Full Gist
                    </a>
                  </div>
                  {githubUsername && isOwner(gist) && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => router.push(`/profile/edit/${gist.id}`)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit Gist"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDeleteGist(gist.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Gist"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}