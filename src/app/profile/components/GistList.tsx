import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";
import GistCard from "./GistCard";
import GistDetailsExpanded from "./GistDetailsExpanded";
import { Gist, GistGroup } from "../types";

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
  const [starredGists, setStarredGists] = useState<Set<string>>(new Set());
  const [expandedGistId, setExpandedGistId] = useState<string | null>(null);
  const [gistDetailsMap, setGistDetailsMap] = useState<Map<string, LocalGistDetails>>(new Map());
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session) return;

      try {
        const tokenResponse = await fetch("/api/github-token", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!tokenResponse.ok) throw new Error("Failed to fetch GitHub token");
        const tokenData = await tokenResponse.json();
        const { githubToken } = tokenData;

        if (!githubToken) throw new Error("No GitHub token provided");

        const okt = new Octokit({ auth: githubToken });
        setOctokit(okt);

        const userResponse = await okt.request("GET /user", { headers: { "X-GitHub-Api-Version": "2022-11-28" } });
        setGithubUsername(userResponse.data.login);
      } catch (error) {
        console.error("Error in fetchInitialData:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [session]);

  // Fetch gists for the current page
  useEffect(() => {
    const fetchPageData = async () => {
      if (!octokit || !gists.length) return;

      setLoading(true);
      try {
        const filteredGists = selectedGroupId
          ? gists.filter((gist) =>
              gistGroups
                .find((group) => group.id === selectedGroupId)
                ?.gistIds?.some((g) => g.id === gist.id)
            )
          : gists;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredGists.length);
        const currentGists = filteredGists.slice(startIndex, endIndex);

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

        const starPromises = currentGists.map((gist) =>
          octokit
            .request("GET /gists/{gist_id}/star", { gist_id: gist.id, headers: { "X-GitHub-Api-Version": "2022-11-28" } })
            .then((response) => ({ gistId: gist.id, isStarred: response.status === 204 }))
            .catch(() => ({ gistId: gist.id, isStarred: false }))
        );

        const [detailsResponses, starResponses] = await Promise.all([
          Promise.all(detailsPromises),
          Promise.all(starPromises),
        ]);

        const detailsArray: [string, LocalGistDetails][] = detailsResponses
          .filter((res): res is GistResponse => res !== null && typeof res.data.id === "string")
          .map((res) => [res.data.id as string, res.data as LocalGistDetails]);
        setGistDetailsMap((prev) => new Map([...prev, ...detailsArray]));

        const starredIds = new Set(starResponses.filter((res) => res.isStarred).map((res) => res.gistId));
        setStarredGists((prev) => new Set([...prev, ...starredIds]));
      } catch (error) {
        console.error("Error in fetchPageData:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [octokit, gists, currentPage, selectedGroupId, gistGroups]);

  const toggleStar = async (gistId: string) => {
    if (!octokit) return;
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
    const filteredGists = selectedGroupId
      ? gists.filter((gist) =>
          gistGroups
            .find((group) => group.id === selectedGroupId)
            ?.gistIds?.some((g) => g.id === gist.id)
        )
      : gists;
    const currentIndex = filteredGists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex < filteredGists.length - 1) setExpandedGistId(filteredGists[currentIndex + 1].id);
  };

  const handlePreviousGist = () => {
    const filteredGists = selectedGroupId
      ? gists.filter((gist) =>
          gistGroups
            .find((group) => group.id === selectedGroupId)
            ?.gistIds?.some((g) => g.id === gist.id)
        )
      : gists;
    const currentIndex = filteredGists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex > 0) setExpandedGistId(filteredGists[currentIndex - 1].id);
  };

  const isOwner = (gist: Gist): boolean => {
    return !!githubUsername && gist.owner.login.toLowerCase() === githubUsername.toLowerCase();
  };

  const getPaginatedGists = () => {
    const filteredGists = selectedGroupId
      ? gists.filter((gist) =>
          gistGroups
            .find((group) => group.id === selectedGroupId)
            ?.gistIds?.some((g) => g.id === gist.id)
        )
      : gists;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredGists.length);
    return expandedGistId ? filteredGists.filter((gist) => gist.id === expandedGistId) : filteredGists.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(
    (selectedGroupId
      ? gists.filter((gist) =>
          gistGroups
            .find((group) => group.id === selectedGroupId)
            ?.gistIds?.some((g) => g.id === gist.id)
        ).length
      : gists.length) / ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedGistId(null);
    setLoading(true);
  };

  if (loading) return <div>Loading gists...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const displayedGists = getPaginatedGists();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Gists {selectedGroupId ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name}` : "from All Groups"}
      </h2>
      {displayedGists.length === 0 ? (
        <p className="text-sm text-gray-600">No gists available yet. Share one!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {displayedGists.map((gist) => {
            const isExpanded = expandedGistId === gist.id;
            const isStarred = starredGists.has(gist.id);
            const gistDetails = gistDetailsMap.get(gist.id);
            const filteredGists = selectedGroupId
              ? gists.filter((g) =>
                  gistGroups
                    .find((group) => group.id === selectedGroupId)
                    ?.gistIds?.some((g) => g.id === g.id)
                )
              : gists;
            const isFirst = filteredGists.findIndex((g) => g.id === gist.id) === 0;
            const isLast = filteredGists.findIndex((g) => g.id === gist.id) === filteredGists.length - 1;
            const relatedGist = gists.find((g) => g.id === linkedGist);

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
                    avatarUrl={session?.user?.image}
                    isExpanded={isExpanded}
                    isStarred={isStarred}
                    isOwner={isOwner(gist)}
                    linkedGist={linkedGist}
                    relatedGistDescription={relatedGist?.description}
                    relatedGistUrl={relatedGist?.html_url}
                    onToggleStar={toggleStar}
                    onExpandGist={handleExpandGist}
                    onEditGist={(gistId) => router.push(`/profile/edit/${gistId}`)}
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