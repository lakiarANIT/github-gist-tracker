interface SearchHeaderProps {
    filteredGistsLength: number;
    handleResetSearch: () => void;
  }
  
  export default function SearchHeader({ filteredGistsLength, handleResetSearch }: SearchHeaderProps) {
    return (
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mt-0 sm:mt-1">
          Search Results ({filteredGistsLength} found)
        </h2>
        <button
          onClick={handleResetSearch}
          className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
        >
          Back to Public Gists
        </button>
      </div>
    );
  }