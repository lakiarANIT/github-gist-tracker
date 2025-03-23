import { useState, useEffect } from "react";
import { Gist, GistGroup } from "src/types/types";

interface GistFilteringProps {
  gists: Gist[];
  selectedGroupId: string;
  gistGroups: GistGroup[];
  githubUsername?: string;
  excludeUserGists?: boolean;
}

export function useGistFiltering({
  gists,
  selectedGroupId,
  gistGroups,
  githubUsername,
  excludeUserGists = false,
}: GistFilteringProps) {
  const [filteredGists, setFilteredGists] = useState<Gist[]>([]);

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

  return filteredGists;
}