import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { useSession } from "next-auth/react";
import GistCard from "@components/gist/GistCard";
import GistDetailsExpanded from "@app/gist/components/GistDetailsExpanded";
import { Gist, GistGroup } from "src/types/types";

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
  const { data: session, status } = useSession();
  const [filteredGists, setFilteredGists] = useState<Gist[]>([]);
  const [starredGists, setStarredGists] = useState<Set<string>>(new Set());
  const [expandedGistId, setExpandedGistId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStars, setLoadingStars] = useState(false);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let result = [...gists];
    if (excludeUserGists && githubUsername) {
      result = result.filter((gist) => gist.owner.login.toLowerCase() !== githubUsername.toLowerCase());
    }
    if (selectedGroupId) {
      result = result.filter((gist) =>
        gistGroups
          .find((group) => group.id === selectedGroupId)
          ?.gistIds?.some((g) => g.id === gist.id)
      );
    }
    result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    setFilteredGists(result);
  }, [gists, selectedGroupId, gistGroups, githubUsername, excludeUserGists]);

  useEffect(() => {
    const fetchStarredStatus = async () => {
      if (!octokit || status !== "authenticated" || !filteredGists.length) return;
      setLoadingStars(true);
      try {
        const starPromises = filteredGists.map((gist) =>
          octokit
            .request("GET /gists/{gist_id}/star", {
              gist_id: gist.id,
              headers: { "X-GitHub-Api-Version": "2022-11-28" },
            })
            .then((response) => ({ gistId: gist.id, isStarred: response.status === 204 }))
            .catch(() => ({ gistId: gist.id, isStarred: false }))
        );
        const starResponses = await Promise.all(starPromises);
        setStarredGists(new Set(starResponses.filter((res) => res.isStarred).map((res) => res.gistId)));
      } catch (error) {
        console.error("Error fetching starred status:", error);
      } finally {
        setLoadingStars(false);
      }
    };
    fetchStarredStatus();
  }, [octokit, status, filteredGists]);

  const toggleStar = async (gistId: string) => {
    if (!octokit || status !== "authenticated") return;
    const isStarred = starredGists.has(gistId);
    try {
      const response = await octokit.request(`${isStarred ? "DELETE" : "PUT"} /gists/{gist_id}/star`, {
        gist_id: gistId,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });
      if (response.status === 204) {
        setStarredGists((prev) => {
          const newSet = new Set(prev);
          isStarred ? newSet.delete(gistId) : newSet.add(gistId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      alert("Failed to update star status.");
    }
  };

  const handleExpandGist = (gistId: string) => {
    setExpandedGistId(expandedGistId === gistId ? null : gistId);
  };

  const handleNextGist = () => {
    const currentIndex = filteredGists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex < filteredGists.length - 1) setExpandedGistId(filteredGists[currentIndex + 1].id);
  };

  const handlePreviousGist = () => {
    const currentIndex = filteredGists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex > 0) setExpandedGistId(filteredGists[currentIndex - 1].id);
  };

  const getPaginatedGists = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredGists.length);
    return expandedGistId
      ? filteredGists.filter((gist) => gist.id === expandedGistId)
      : filteredGists.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredGists.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedGistId(null);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4">
          {displayedGists.map((gist) => {
            const isExpanded = expandedGistId === gist.id;
            const isStarred = starredGists.has(gist.id);
            const isFirst = filteredGists.findIndex((g) => g.id === gist.id) === 0;
            const isLast = filteredGists.findIndex((g) => g.id === gist.id) === filteredGists.length - 1;

            return (
              <div
                key={gist.id}
                className={`border border-gray-200 dark:border-gray-600 rounded-lg p-2 sm:p-3 transition-all duration-300 ${
                  isExpanded ? "col-span-full shadow-lg bg-gray-50 dark:bg-gray-700" : "hover:shadow-md"
                }`}
              >
                {!isExpanded && (
                  <GistCard
                    gist={gist}
                    avatarUrl={gist.owner.avatar_url}
                    isExpanded={isExpanded}
                    isStarred={isStarred}
                    isOwner={false}
                    linkedGist={null}
                    relatedGistDescription={null}
                    relatedGistUrl={null}
                    onToggleStar={octokit && status === "authenticated" ? () => toggleStar(gist.id) : () => {}}
                    onExpandGist={handleExpandGist}
                    onEditGist={() => {}}
                    onDeleteGist={() => {}}
                  />
                )}
                {isExpanded && (
                  <GistDetailsExpanded
                    gist={gist}
                    gistDetails={{
                      ...gist,
                      files: Object.fromEntries(
                        Object.entries(gist.files).map(([key, file]) => [
                          key,
                          { ...file, language: file.language || null, content: file.content || "" },
                        ])
                      ),
                    }}
                    isFirst={isFirst}
                    isLast={isLast}
                    isOwner={false}
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
      {!expandedGistId && filteredGists.length > ITEMS_PER_PAGE && totalPages > 1 && (
        <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-1 sm:px-2 py-1 rounded text-xs sm:text-sm ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}