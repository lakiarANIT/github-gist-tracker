// src/components/home/PublicGistList/PublicGistList.tsx
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup } from "src/types/types";
import { useGistFiltering } from "@hooks/home/publicgistlist/useGistFiltering";
import { useGistStars } from "@hooks/home/publicgistlist/useGistStars";
import { useGistPagination } from "@hooks/home/publicgistlist/useGistPagination";
import GistGrid from "@components/home/publicgistlist/GistGrid";
import Pagination from "@components/home/publicgistlist/Pagination";

interface PublicGistListProps {
  gists: Gist[];
  selectedGroupId: string;
  gistGroups: GistGroup[];
  octokit?: Octokit | null;
  githubUsername?: string;
  excludeUserGists?: boolean;
}

export default function PublicGistList({
  gists,
  selectedGroupId,
  gistGroups,
  octokit,
  githubUsername,
  excludeUserGists = false,
}: PublicGistListProps) {
  const { status } = useSession();
  const filteredGists = useGistFiltering({
    gists,
    selectedGroupId,
    gistGroups,
    githubUsername,
    excludeUserGists,
  });
  const { starredGists, toggleStar } = useGistStars(filteredGists, octokit);
  const {
    currentPage,
    totalPages,
    expandedGistId,
    getPaginatedGists,
    handleExpandGist,
    handleNextGist,
    handlePreviousGist,
    handlePageChange,
  } = useGistPagination(filteredGists, 6);

  const displayedGists = getPaginatedGists();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 sm:p-2 border border-gray-200 dark:border-gray-600 max-w-full mx-auto pt-10 sm:pt-12">
      <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mt-0 sm:mt-1 mb-1 sm:mb-2">
        {excludeUserGists ? "Other Public Gists" : "Public Gists"}{" "}
        {selectedGroupId ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name}` : ""}
      </h2>
      {filteredGists.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">No gists available yet.</p>
      ) : (
        <>
          <GistGrid
            displayedGists={displayedGists}
            filteredGists={filteredGists}
            starredGists={starredGists}
            expandedGistId={expandedGistId}
            toggleStar={toggleStar}
            handleExpandGist={handleExpandGist}
            handleNextGist={handleNextGist}
            handlePreviousGist={handlePreviousGist}
            isAuthenticated={status === "authenticated"}
          />
          {!expandedGistId && filteredGists.length > 6 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}