import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";
import { Gist } from "src/types/types"; 

export function useGistStars(filteredGists: Gist[], octokit?: Octokit | null) {
  const { status } = useSession();
  const [starredGists, setStarredGists] = useState<Set<string>>(new Set());
  const [loadingStars, setLoadingStars] = useState(false);

  useEffect(() => {
    const fetchStarredStatus = async () => {
      if (!octokit || status !== "authenticated" || !filteredGists.length) return;
      setLoadingStars(true);
      try {
        const response = await octokit.request("GET /gists/starred", {
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
          per_page: 100, 
        });

        const starredGistIds = new Set(
          (response.data as Gist[]).map((gist) => gist.id)
        );

        const relevantStarred = new Set(
          filteredGists
            .filter((gist) => starredGistIds.has(gist.id))
            .map((gist) => gist.id)
        );

        setStarredGists(relevantStarred);
      } catch (error) {
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
      alert("Failed to update star status.");
    }
  };

  return { starredGists, loadingStars, toggleStar };
}