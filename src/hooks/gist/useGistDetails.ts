import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";
import { Gist } from "src/types/types";

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

export function useGistDetails(
  octokit: Octokit | null,
  gists: Gist[],
  currentPage: number,
  authStatus: "loading" | "authenticated" | "unauthenticated"
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gistDetailsMap, setGistDetailsMap] = useState<Map<string, LocalGistDetails>>(new Map());

  useEffect(() => {
    const fetchGistDetails = async () => {
      if (!octokit || !gists.length || authStatus !== "authenticated") {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const startIndex = (currentPage - 1) * 6; // Matches ITEMS_PER_PAGE from useGistPagination
        const endIndex = Math.min(startIndex + 6, gists.length);
        const currentGists = gists.slice(startIndex, endIndex);

        type GistResponse = Endpoints["GET /gists/{gist_id}"]["response"];
        const detailsPromises = currentGists.map((gist) =>
          octokit
            .request("GET /gists/{gist_id}", {
              gist_id: gist.id,
              headers: { "X-GitHub-Api-Version": "2022-11-28" },
            })
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
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchGistDetails();
  }, [octokit, gists, currentPage, authStatus]);

  return { loading, error, gistDetailsMap };
}