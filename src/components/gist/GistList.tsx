import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gist, GistGroup } from "src/types/types";
import { useAuth } from "@hooks/gist/useAuth";
import { useGistStars } from "@hooks/home/publicgistlist/useGistStars";
import { useGistPagination } from "@hooks/home/publicgistlist/useGistPagination";
import { useGistDetails } from "@hooks/gist/useGistDetails";
import Pagination from "@components/home/publicgistlist/Pagination";
import GistCard from "@components/gist/GistCard";
import GistDetailsExpanded from "./GistDetailsExpanded";

interface GistListProps {
  gists: Gist[];
  selectedGroupId: string;
  gistGroups: GistGroup[];
  linkedGist: string | null;
  onDeleteGist: (gistId: string) => Promise<void>;
}

export default function GistList({
  gists,
  selectedGroupId,
  gistGroups,
  linkedGist,
  onDeleteGist,
}: GistListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { status, octokit, githubUsername } = useAuth();

  const {
    currentPage,
    totalPages,
    expandedGistId,
    getPaginatedGists,
    handleExpandGist,
    handleNextGist,
    handlePreviousGist,
    handlePageChange,
  } = useGistPagination(gists);

  const { starredGists, loadingStars, toggleStar } = useGistStars(gists, octokit);

  const { loading: loadingDetails, error, gistDetailsMap } = useGistDetails(octokit, gists, currentPage, status);

  const isOwner = (gist: Gist): boolean => {
    const ownerLogin = gist.owner?.login?.toLowerCase();
    const userLogin = githubUsername?.toLowerCase();
    return !!userLogin && ownerLogin === userLogin;
  };

  const handleEditGist = (gistId: string) => {
    router.push(`/gist/${gistId}`);
  };

  const displayedGists = getPaginatedGists();
  const isLoggedIn = status === "authenticated"; // Determine login status

  if (loadingDetails || loadingStars) {
    return <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading gists...</div>;
  }
  if (error) {
    return <div className="text-red-500 dark:text-red-400 text-sm sm:text-base">Error: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 max-w-full mx-auto">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
        Gists{" "}
        {selectedGroupId
          ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name || "Unknown"}`
          : "from All Groups"}
      </h2>
      {displayedGists.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No gists available yet. Share one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {displayedGists.map((gist, index) => {
            const isExpanded = expandedGistId === gist.id;
            const isStarred = starredGists.has(gist.id);
            const gistDetails = gistDetailsMap.get(gist.id);
            const isFirst = gists.findIndex((g) => g.id === gist.id) === 0;
            const isLast = gists.findIndex((g) => g.id === gist.id) === gists.length - 1;
            const relatedGist = gists.find((g) => g.id === linkedGist);

            return (
              <div
                key={gist.id ? `${gist.id}-${index}` : `gist-${index}`}
                className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 transition-all duration-300 ${
                  isExpanded
                    ? "col-span-full shadow-lg bg-gray-50 dark:bg-gray-800"
                    : "hover:shadow-md dark:hover:shadow-gray-700"
                }`}
              >
                {!isExpanded && (
                  <GistCard
                    gist={gist}
                    avatarUrl={session?.user?.image}
                    isExpanded={isExpanded}
                    isStarred={isStarred}
                    isOwner={isOwner(gist)}
                    isLoggedIn={isLoggedIn} // Pass authentication status
                    linkedGist={linkedGist}
                    relatedGistDescription={relatedGist?.description}
                    relatedGistUrl={relatedGist?.html_url}
                    onToggleStar={toggleStar} // Pass toggleStar directly
                    onExpandGist={handleExpandGist}
                    onEditGist={handleEditGist}
                    onDeleteGist={onDeleteGist}
                  />
                )}
                {isExpanded && gistDetails && (
                  <GistDetailsExpanded
                    gist={gist}
                    gistDetails={gistDetails}
                    isFirst={isFirst}
                    isLast={isLast}
                    isOwner={isOwner(gist)}
                    onPreviousGist={handlePreviousGist}
                    onNextGist={handleNextGist}
                    onExpandGist={handleExpandGist}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      {!expandedGistId && gists.length > 6 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
}