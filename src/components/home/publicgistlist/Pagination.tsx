interface PaginationProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
  }
  
  export default function Pagination({ currentPage, totalPages, handlePageChange }: PaginationProps) {
    return (
      <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-1 sm:px-2 py-1 rounded text-xs sm:text-sm ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  }