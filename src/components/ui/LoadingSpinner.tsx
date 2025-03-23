interface LoadingSpinnerProps {
    isRateLimited?: boolean;
  }
  
  export default function LoadingSpinner({ isRateLimited = false }: LoadingSpinnerProps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-blue-600 dark:border-t-blue-400 border-gray-200 dark:border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-mono text-gray-700 dark:text-gray-300">
            {isRateLimited ? "Rate limit reached, please wait..." : "Loading gists, please wait..."}
          </div>
        </div>
      </div>
    );
  }