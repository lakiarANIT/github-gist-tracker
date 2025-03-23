"use client";

import { useState } from "react";
import Navbar from "src/components/ui/Navbar";
import PublicGistList from "src/components/home/PublicGistList";
import PublicSearchGists from "@components/home/PublicSearchGist";
import IntroSection from "@components/home/IntroSection";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import { useGistData } from "@hooks/home/useGistData";
import { useGistSearch } from "@hooks/home/useGistSearch";

export default function Home() {
  const { gists, gistGroups, loading, octokit, isRateLimited } = useGistData();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const {
    memoizedGists,
    selectedGistId,
    filteredSearchGists,
    handleGistSelect,
    handleSearchSubmit,
    resetSearch,
  } = useGistSearch(gists);

  if (loading || isRateLimited) {
    return <LoadingSpinner isRateLimited={isRateLimited} />;
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
      <IntroSection />
      <div className="relative z-0" id="features">
        <main className="flex-1 py-3 px-2 sm:px-2 lg:px-4">
          <div className="max-w-5xl mx-auto">
            {selectedGistId || filteredSearchGists.length > 0 ? (
              <>
                <header className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Search Results
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing{" "}
                    {selectedGistId
                      ? "1 selected gist"
                      : `${filteredSearchGists.length} matching gists`}
                  </p>
                </header>
                <PublicSearchGists
                  gists={memoizedGists}
                  filteredGists={
                    selectedGistId
                      ? memoizedGists.filter((g) => g.id === selectedGistId)
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Public Gists
                  </h1>
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