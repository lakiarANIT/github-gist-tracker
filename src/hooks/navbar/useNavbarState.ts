import { useState, useEffect } from 'react';
import { Gist } from 'src/types/types';

export function useNavbarState(gists: Gist[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGistsOpen, setIsGistsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Gist[]>([]);

  useEffect(() => {
    if (!isSearchOpen || searchQuery.length < 2) {
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }

    const filtered = gists
      .filter((gist) =>
        gist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 6);

    setSearchResults((prev) => {
      const prevIds = prev.map((g) => g.id).join(",");
      const newIds = filtered.map((g) => g.id).join(",");
      return prevIds === newIds ? prev : filtered;
    });
  }, [searchQuery, gists, isSearchOpen]);

  return {
    isOpen,
    setIsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isGistsOpen,
    setIsGistsOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
  };
}