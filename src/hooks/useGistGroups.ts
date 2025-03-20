import { useState, useEffect } from "react";
import { GistGroup } from "../types";

interface ApiResponse {
  groups: Record<string, {
    id: string;
    name: string;
    gistIds: string[];
    owner: {
      login: string;
    };
  }[]>;
  totalGroups: number;
}

export function useGistGroups(currentUserId: string, githubUsername?: string) {
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGistGroups() {
      try {
        setLoading(true);
        const response = await fetch("/api/gist-groups");
        if (!response.ok) {
          throw new Error("Failed to fetch gist groups");
        }
        const data = await response.json() as ApiResponse;

        const allGroups: GistGroup[] = Object.entries(data.groups).flatMap(([userId, groups]) =>
          groups.map((group) => ({
            _id: group.id,
            name: group.name,
            gistIds: group.gistIds,
            userId: userId,
            owner: {
              login:
                userId === currentUserId && githubUsername ? githubUsername : group.owner.login,
            },
          }))
        );

        setGistGroups(allGroups);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGistGroups();
  }, [currentUserId, githubUsername]);

  return { gistGroups, loading, error };
}