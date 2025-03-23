import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup } from "src/types/types";
import { useGistStars } from "@hooks/home/publicgistlist/useGistStars";
import { useGistPagination } from "@hooks/home/publicgistlist/useGistPagination";
import GistGrid from "@components/home/publicgistlist/GistGrid";
import Pagination from "@components/home/publicgistlist/Pagination";
import SearchHeader from "./publicsearchgist/SearchHeader";
import { useSelectedGist } from "@hooks/home/publicgistlist/useSelectedGist";

interface PublicSearchGistsProps {
  gists: Gist[];
  filteredGists: Gist[];
  selectedGistId?: string | null;
  octokit?: Octokit | null;
  onResetSearch?: () => void;
}

export default function PublicSearchGists({
  gists,
  filteredGists,
  selectedGistId,
  octokit,
  onResetSearch,
}: PublicSearchGistsProps) {
  const { status } = useSession();
  const { starredGists, toggleStar } = useGistStars(filteredGists, octokit);
  const { expandedGistId, handleExpandGist } = useSelectedGist(selectedGistId);
  const {
    currentPage,
    totalPages,
    getPaginatedGists,
    handleNextGist,
    handlePreviousGist,
    handlePageChange,
    handleResetSearch,
  } = useGistPagination(filteredGists, 6, onResetSearch);

  const displayedGists = getPaginatedGists();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 sm:p-2 border border-gray-200 dark:border-gray-700 max-w-full mx-auto pt-10 sm:pt-12">
      <SearchHeader filteredGistsLength={filteredGists.length} handleResetSearch={handleResetSearch} />
      {filteredGists.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No gists match your search.</p>
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
          {filteredGists.length > 6 && totalPages > 1 && !expandedGistId && (
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

