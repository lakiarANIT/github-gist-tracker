import { useState, useMemo } from "react";
import { Gist } from "src/types/types";

export function useGistSearch(gists: Gist[]) {
  const [selectedGistId, setSelectedGistId] = useState<string | null>(null);
  const [filteredSearchGists, setFilteredSearchGists] = useState<Gist[]>([]);
  const memoizedGists = useMemo(() => [...gists], [gists]);

  const handleGistSelect = (gistId: string) => {
    setSelectedGistId(gistId);
    setFilteredSearchGists([]);
  };

  const handleSearchSubmit = (query: string) => {
    const filtered = memoizedGists.filter((gist) =>
      gist.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSearchGists(filtered);
    setSelectedGistId(null);
  };

  const resetSearch = () => {
    setFilteredSearchGists([]);
    setSelectedGistId(null);
  };

  return {
    selectedGistId,
    filteredSearchGists,
    handleGistSelect,
    handleSearchSubmit,
    resetSearch,
    memoizedGists,
  };
}