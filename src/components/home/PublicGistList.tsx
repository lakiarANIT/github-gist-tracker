import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";
import GistCard from "src/app/profile/components/GistCard";
import GistDetailsExpanded from "src/app/profile/components/GistDetailsExpanded";
import { Gist, GistGroup } from "src/app/profile/types";

interface LocalGistDetails {
  id: string;
  description: string | null;
  owner: { login: string };
  files: { [key: string]: { filename: string; language: string | null; content: string } };
  created_at: string;
  updated_at: string;
  public: boolean;
  forks_url: string;
  comments: number;
  [key: string]: any;
}

interface PublicGistListProps {
  gists: Gist[];
  selectedGroupId: string;
  gistGroups: GistGroup[];
}

export default function PublicGistList({ gists, selectedGroupId, gistGroups }: PublicGistListProps) {
  const [loading, setLoading] = useState(true);
  const [expandedGistId, setExpandedGistId] = useState<string | null>(null);
  const [gistDetailsMap, setGistDetailsMap] = useState<Map<string, LocalGistDetails>>(new Map());
  const [octokit] = useState(new Octokit());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchGistDetails = async () => {
      if (!gists.length) return;

      setLoading(true);
      try {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, gists.length);
        const currentGists = gists.slice(startIndex, endIndex);

        type GistResponse = Endpoints["GET /gists/{gist_id}"]["response"];
        const detailsPromises = currentGists.map((gist) =>
          octokit
            .request("GET /gists/{gist_id}", { gist_id: gist.id, headers: { "X-GitHub-Api-Version": "2022-11-28" } })
            .then((response: GistResponse) => response)
            .catch((err) => {
              console.error(`Failed to fetch details for gist ${gist.id}:`, err);
              return null;
            })
        );

        const detailsResponses = await Promise.all(detailsPromises);
        const detailsArray: [string, LocalGistDetails][] = detailsResponses
          .filter((res): res is GistResponse => res !== null && typeof res.data.id === "string")
          .map((res) => [res.data.id as string, res.data as LocalGistDetails]);
        setGistDetailsMap((prev) => new Map([...prev, ...detailsArray]));
      } catch (error) {
        console.error("Error fetching gist details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGistDetails();
  }, [gists, currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 60) {
        window.scrollTo({ top: 60, behavior: "smooth" });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleExpandGist = (gistId: string) => {
    setExpandedGistId(expandedGistId === gistId ? null : gistId);
  };

  const handleNextGist = () => {
    const currentIndex = gists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex < gists.length - 1) setExpandedGistId(gists[currentIndex + 1].id);
  };

  const handlePreviousGist = () => {
    const currentIndex = gists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex > 0) setExpandedGistId(gists[currentIndex - 1].id);
  };

  const getPaginatedGists = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, gists.length);
    return expandedGistId ? gists.filter((gist) => gist.id === expandedGistId) : gists.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(gists.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedGistId(null);
    setLoading(true);
  };

  if (loading) return <div>Loading gists...</div>;

  const displayedGists = getPaginatedGists();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Gists {selectedGroupId ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name}` : "from All Groups"}
      </h2>
      {gists.length === 0 ? (
        <p className="text-sm text-gray-600">No gists available yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {displayedGists.map((gist) => {
            const isExpanded = expandedGistId === gist.id;
            const gistDetails = gistDetailsMap.get(gist.id);
            const isFirst = gists.findIndex((g) => g.id === gist.id) === 0;
            const isLast = gists.findIndex((g) => g.id === gist.id) === gists.length - 1;

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
                    isStarred={false}
                    isOwner={false}
                    linkedGist={null}
                    relatedGistDescription={null}
                    relatedGistUrl={null}
                    onToggleStar={() => {}}
                    onExpandGist={handleExpandGist}
                    onEditGist={() => {}}
                    onDeleteGist={() => {}}
                  />
                )}
                {isExpanded && gistDetails && (
                  <GistDetailsExpanded
                    gist={gist}
                    gistDetails={gistDetails}
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
      {gists.length > ITEMS_PER_PAGE && totalPages > 1 && (
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
