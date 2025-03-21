// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";
import PublicGistList from "src/components/home/PublicGistList";
import Navbar from "src/components/ui/Navbar";
import { Gist, GistGroup } from "src/app/profile/types";

export default function Home() {
  const { data: session, status } = useSession();
  const [gists, setGists] = useState<Gist[]>([]);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [octokit, setOctokit] = useState<Octokit | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch public gists
        const response = await fetch("/api/public-gist-groups", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch public data");
        const data = await response.json();
        setGistGroups(data.groups || []);
        setGists(data.gists || []);

        // Initialize Octokit if logged in
        if (status === "authenticated" && session?.user?.email) {
          const tokenResponse = await fetch("/api/github-token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!tokenResponse.ok) throw new Error("Failed to fetch GitHub token");
          const tokenData = await tokenResponse.json();
          const { githubToken } = tokenData;
          if (githubToken) {
            setOctokit(new Octokit({ auth: githubToken }));
          }
        }
      } catch (error) {
        console.error("Error fetching public data:", error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [status, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        gistGroups={gistGroups}
        gists={gists}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
      />
      <div className="pt-[90px] relative z-0">
      
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Public Gists</h1>
              <p className="text-sm text-gray-500">
                Explore {gists.length} gists from {gistGroups.length} groups
              </p>
            </header>
            <PublicGistList
              gists={gists}
              selectedGroupId={selectedGroupId}
              gistGroups={gistGroups}
              octokit={octokit}
            />
          </div>
        </main>
      </div>
    </div>
  );
}