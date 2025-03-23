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

  return { starredGists, loadingStars, toggleStar };
}