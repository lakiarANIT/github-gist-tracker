import { Gist } from 'src/types/types';

interface SearchBarProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchResults: Gist[];
  onSearchSubmit: (query: string) => void;
  onGistSelect: (gistId: string) => void;
}

export function SearchBar({
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  searchResults,
  onSearchSubmit,
  onGistSelect,
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.length >= 2) {
      onSearchSubmit(searchQuery);
      setIsSearchOpen(false);
    }
  };

  const handleSearchSelect = (gistId: string) => {
    onGistSelect(gistId);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return isSearchOpen ? (
    <div className="relative">
      <input
        type="text"
        placeholder="Search gists..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-40 xs:w-48 sm:w-64 md:w-80 bg-purple-800 dark:bg-purple-900 text-white placeholder-purple-400 dark:placeholder-purple-300 border border-purple-700 dark:border-purple-800 rounded-md py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-300"
        onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
        autoFocus
      />
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {searchResults.map((gist) => (
            <button
              key={gist.id}
              onClick={() => handleSearchSelect(gist.id)}
              className="w-full px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col"
            >
              <span className="font-medium truncate">{gist.description || "No description"}</span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">@{gist.owner.login}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  ) : (
    <button onClick={() => setIsSearchOpen(true)} className="text-white hover:text-purple-300 dark:hover:text-purple-200 focus:outline-none">
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
}