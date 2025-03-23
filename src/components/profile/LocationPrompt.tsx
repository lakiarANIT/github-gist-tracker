interface LocationPromptProps {
    showLocationPrompt: boolean;
    setShowLocationPrompt: (show: boolean) => void;
    requestLocation: () => Promise<void>;
  }
  
  export default function LocationPrompt({
    showLocationPrompt,
    setShowLocationPrompt,
    requestLocation,
  }: LocationPromptProps) {
    if (!showLocationPrompt) return null;
  
    return (
      <div className="mt-4 p-4 border border-amber-200 dark:border-amber-700 rounded-lg bg-amber-50 dark:bg-amber-900/20">
        <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">Share your location to enhance your experience</p>
        <div className="flex gap-3">
          <button
            onClick={requestLocation}
            className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Share
          </button>
          <button
            onClick={() => setShowLocationPrompt(false)}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    );
  }