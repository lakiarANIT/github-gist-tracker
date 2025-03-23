// Home.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";
import PublicGistList from "src/components/home/PublicGistList";
import PublicSearchGists from "src/components/home/PublicSearchGist";
import Navbar from "src/components/ui/Navbar";
import { Gist, GistGroup } from "src/types/types";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [gists, setGists] = useState<Gist[]>([]);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedGistId, setSelectedGistId] = useState<string | null>(null);
  const [filteredSearchGists, setFilteredSearchGists] = useState<Gist[]>([]);
  const [loading, setLoading] = useState(true);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (!loading && gists.length > 0 && gistGroups.length > 0) {
      return;
    }

    const initialize = async () => {
      try {
        const response = await fetch("/api/public-gist-groups", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 429) {
          setIsRateLimited(true);
          throw new Error("Rate limit exceeded");
        }

        if (!response.ok) throw new Error("Failed to fetch public data");
        const data = await response.json();

        setGistGroups((prev) => {
          const newGroups = data.groups || [];
          const prevIds = prev.map((g: GistGroup) => g.id).join(",");
          const newIds = newGroups.map((g: GistGroup) => g.id).join(",");
          return prevIds === newIds ? prev : newGroups;
        });
        setGists((prev) => {
          const newGists = data.gists || [];
          const prevIds = prev.map((g: Gist) => g.id).join(",");
          const newIds = newGists.map((g: Gist) => g.id).join(",");
          return prevIds === newIds ? prev : newGists;
        });

        if (status === "authenticated" && session?.user?.email) {
          const tokenResponse = await fetch("/api/github-token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (tokenResponse.status === 429) {
            setIsRateLimited(true);
            throw new Error("Rate limit exceeded");
          }
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
  }, [status, session, loading, gists.length, gistGroups.length]);

  const memoizedGists = useMemo(() => [...gists], [gists]);

  const handleGistSelect = (gistId: string) => {
    setSelectedGistId(gistId);
    setFilteredSearchGists([]);
  };

  const handleSearchSubmit = (query: string) => {
    const filtered = memoizedGists.filter((gist) =>
      gist.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSearchGists(filtered);
    setSelectedGistId(null);
  };

  const resetSearch = () => {
    setFilteredSearchGists([]);
    setSelectedGistId(null);
  };

  if (loading || isRateLimited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-blue-600 dark:border-t-blue-400 border-gray-200 dark:border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-mono text-gray-700 dark:text-gray-300">
            {isRateLimited ? "Rate limit reached, please wait..." : "Loading gists, please wait..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        gistGroups={gistGroups}
        gists={memoizedGists}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        isGistList={true}
        onGistSelect={handleGistSelect}
        onSearchSubmit={handleSearchSubmit}
        isSearchVisible={true}
      />

      {/* Introductory Content Section */}
      <div className="bg-gradient-to-b from-blue-50 to-gray-50 dark:from-blue-900/20 dark:to-gray-900 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
            Discover GitHub Gist Tracker (GGT)
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Elevate your coding workflow with a powerful tool to create, manage, and explore
            GitHub Gists—all in one place.
          </p>
          <div className="flex justify-center gap-4">
            {status === "authenticated" ? (
              <Link
                href="/profile"
                className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
              >
                Go to Profile
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
              >
                Sign In with GitHub
              </Link>
            )}
            <Link
              href="/learnmore"
              className="inline-block px-8 py-3 bg-transparent text-blue-600 dark:text-blue-400 text-lg font-semibold border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="relative z-0" id="features">
        <main className="flex-1 py-3 px-2 sm:px-2 lg:px-4">
          <div className="max-w-5xl mx-auto">
            {(selectedGistId || filteredSearchGists.length > 0) ? (
              <>
                <header className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Search Results</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {selectedGistId ? "1 selected gist" : `${filteredSearchGists.length} matching gists`}
                  </p>
                </header>
                <PublicSearchGists
                  gists={memoizedGists}
                  filteredGists={
                    selectedGistId
                      ? memoizedGists.filter((g: Gist) => g.id === selectedGistId)
                      : filteredSearchGists
                  }
                  selectedGistId={selectedGistId}
                  octokit={octokit}
                  onResetSearch={resetSearch}
                />
              </>
            ) : (
              <>
                <header className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Public Gists</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Explore {memoizedGists.length} gists from {gistGroups.length} groups
                  </p>
                </header>
                <PublicGistList
                  gists={memoizedGists}
                  selectedGroupId={selectedGroupId}
                  gistGroups={gistGroups}
                  octokit={octokit}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}