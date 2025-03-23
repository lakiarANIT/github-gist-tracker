import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup } from "src/types/types";

export function useGistData() {
  const { data: session, status } = useSession();
  const [gists, setGists] = useState<Gist[]>([]);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/public-gist-groups", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 429) {
          setIsRateLimited(true);
          throw new Error("Rate limit exceeded");
        }
        if (!response.ok) throw new Error("Failed to fetch public data");

        const data = await response.json();
        setGistGroups(data.groups || []);
        setGists(data.gists || []);

        if (status === "authenticated" && session?.user?.email) {
          const tokenResponse = await fetch("/api/github-token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (tokenResponse.status === 429) {
            setIsRateLimited(true);
            throw new Error("Rate limit exceeded");
          }
          if (!tokenResponse.ok) throw new Error("Failed to fetch GitHub token");

          const { githubToken } = await tokenResponse.json();
          if (githubToken) {
            setOctokit(new Octokit({ auth: githubToken }));
          }
        }
      } catch (error) {
        console.error("Error fetching public data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  return { gists, gistGroups, loading, octokit, isRateLimited };
}