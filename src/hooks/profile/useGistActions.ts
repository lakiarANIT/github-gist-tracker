import { useEffect, useState } from "react";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup } from "src/types/types";

export function useGistActions({
  selectedGroupId,
  status,
  octokit,
  setGists,
  gistGroups,
  setGistGroups,
}: {
  selectedGroupId: string;
  status: "loading" | "authenticated" | "unauthenticated";
  octokit: Octokit | null;
  setGists: React.Dispatch<React.SetStateAction<Gist[]>>;
  gistGroups: GistGroup[];
  setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>;
}) {
  const [shouldFetchGists, setShouldFetchGists] = useState(true);

  useEffect(() => {
    const fetchGistsForGroup = async () => {
      if (status !== "authenticated" || !shouldFetchGists || !octokit) return;

      try {
        let gistIds: string[] = [];
        if (selectedGroupId === "") {
          const userGistsResponse = await octokit.request("GET /gists", {
            headers: { "X-GitHub-Api-Version": "2022-11-28" },
          });
          gistIds = userGistsResponse.data.map((gist: any) => gist.id);
        } else if (selectedGroupId === "my-gists") {
          const response = await fetch("/api/my-gists", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to fetch from /api/my-gists");
          const data = await response.json();
          gistIds = (data.gists || []).map((gist: any) => (typeof gist === "string" ? gist : gist.id));
        } else {
          const response = await fetch(`/api/gist-groups/${selectedGroupId}/gists`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) throw new Error(`Failed to fetch from /api/gist-groups/${selectedGroupId}/gists`);
          const data = await response.json();
          gistIds = (data.gists || []).map((gist: any) => (typeof gist === "string" ? gist : gist.id));
        }

        if (gistIds.length === 0) {
          setGists([]);
          return;
        }

        const gistPromises = gistIds.map((gistId) =>
          octokit.request("GET /gists/{gist_id}", {
            gist_id: gistId,
            headers: { "X-GitHub-Api-Version": "2022-11-28" },
          })
        );
        const gistResponses = await Promise.allSettled(gistPromises);
        const fullGists = gistResponses
          .filter((res): res is PromiseFulfilledResult<any> => res.status === "fulfilled")
          .map((res) => res.value.data)
          .filter((gist, index, self) => gist.id && self.findIndex((g) => g.id === gist.id) === index);

        setGists(fullGists.length > 0 ? fullGists : []);
      } catch (error) {
        console.error("Error fetching Gists:", error);
        setGists([]);
        alert("Failed to load gists. Please try again.");
      }
    };

    fetchGistsForGroup();
  }, [selectedGroupId, status, shouldFetchGists, octokit]);

  const handleDeleteGist = async (gistId: string) => {
    if (!octokit) {
      alert("GitHub integration not initialized.");
      return;
    }

    if (!confirm("Are you sure you want to delete this gist?")) return;

    setShouldFetchGists(false);

    try {
      await octokit.request("DELETE /gists/{gist_id}", {
        gist_id: gistId,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });

      const affectedGroups = gistGroups.filter((group) =>
        group.gistIds?.some((gist) => (typeof gist === "string" ? gist : gist.id) === gistId)
      );
      if (affectedGroups.length > 0) {
        await Promise.all(
          affectedGroups.map(async (group) => {
            const response = await fetch(`/api/gist-groups/${group.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gistIdToRemove: gistId }),
              credentials: "include",
            });
            if (!response.ok) {
              if (response.status === 404) {
                setGistGroups((prev) => prev.filter((g) => g.id !== group.id));
                return;
              }
              throw new Error("Failed to update group");
            }
            const data = await response.json();
            setGistGroups((prev) =>
              prev.map((g) => (g.id === group.id ? { ...g, gistIds: data.group.gistIds } : g))
            );
          })
        );
      }

      setGists((prev) => prev.filter((gist) => gist.id !== gistId));
      alert("Gist deleted successfully!");
    } catch (error) {
      console.error("Error deleting Gist:", error);
      alert("Failed to delete gist.");
    } finally {
      setShouldFetchGists(true);
    }
  };

  return { handleDeleteGist };
}