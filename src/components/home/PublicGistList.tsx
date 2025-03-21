// src/components/home/PublicGistList.tsx
import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { useSession } from "next-auth/react";
import GistCard from "src/app/profile/components/GistCard";
import GistDetailsExpanded from "src/app/profile/components/GistDetailsExpanded";
import { Gist, GistGroup } from "src/app/profile/types";

interface PublicGistListProps {
  gists: Gist[];
  selectedGroupId: string;
  gistGroups: GistGroup[];
  octokit?: Octokit | null; // Optional, for profile context
  githubUsername?: string; // Optional, for profile context
  excludeUserGists?: boolean; // Optional, to filter out user's gists in profile
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

  // Filter gists based on context
  useEffect(() => {
    let result = gists;
    if (excludeUserGists && githubUsername) {
      result = gists.filter((gist) => gist.owner.login.toLowerCase() !== githubUsername.toLowerCase());
    }
    if (selectedGroupId) {
      result = result.filter((gist) =>
        gistGroups
          .find((group) => group.id === selectedGroupId)
          ?.gistIds?.some((g) => g.id === gist.id)
      );
    }
    setFilteredGists(result);
  }, [gists, selectedGroupId, gistGroups, githubUsername, excludeUserGists]);

  // Fetch starred status if logged in and Octokit is available
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

  // Handle starring
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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {excludeUserGists ? "Other Public Gists" : "Public Gists"}{" "}
        {selectedGroupId ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name}` : ""}
      </h2>
      {filteredGists.length === 0 ? (
        <p className="text-sm text-gray-600">No gists available yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {displayedGists.map((gist) => {
            const isExpanded = expandedGistId === gist.id;
            const isStarred = starredGists.has(gist.id);
            const isFirst = filteredGists.findIndex((g) => g.id === gist.id) === 0;
            const isLast = filteredGists.findIndex((g) => g.id === gist.id) === filteredGists.length - 1;

            return (
              <div
                key={gist.id}
                className={`border border-gray-200 rounded-lg p-4 transition-all duration-300 ${
                  isExpanded ? "col-span-full shadow-lg bg-gray-50" : "hover:shadow-md relative"
                }`}
              >
                {!isExpanded && (
                  <GistCard
                    gist={gist}
                    avatarUrl={gist.owner.avatar_url}
                    isExpanded={isExpanded}
                    isStarred={isStarred}
                    isOwner={false} // No edit/delete in public view
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
      {filteredGists.length > ITEMS_PER_PAGE && totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}