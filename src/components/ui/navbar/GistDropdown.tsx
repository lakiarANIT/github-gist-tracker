import { FaFolder, FaChevronDown } from 'react-icons/fa';
import { GistGroup } from 'src/types/types';

interface GistDropdownProps {
  isGistsOpen: boolean;
  setIsGistsOpen: (value: boolean) => void;
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  sortedGroups: Record<string, GistGroup[]>;
  letters: string[];
  totalGists: number;
}

export function GistDropdown({
  isGistsOpen,
  setIsGistsOpen,
  selectedGroupId,
  setSelectedGroupId,
  sortedGroups,
  letters,
  totalGists,
}: GistDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={() => setIsGistsOpen(!isGistsOpen)}
        className="text-sm sm:text-base hover:text-purple-300 dark:hover:text-purple-200 transition-colors flex items-center gap-1 whitespace-nowrap"
      >
        Gists
        <FaChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isGistsOpen ? "rotate-180" : ""}`} />
      </button>

      {isGistsOpen && (
        <div className="absolute left-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-lg z-10 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <button
            onClick={() => {
              setSelectedGroupId("");
              setIsGistsOpen(false);
            }}
            className={`w-full px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium flex items-center ${
              selectedGroupId === "" ? "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <FaFolder className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span>All Gists</span>
            <span className="ml-1 sm:ml-2 text-xs text-gray-500 dark:text-gray-400">({totalGists})</span>
          </button>

          {letters.map((letter) => (
            <div key={letter}>
              <h3 className="px-2 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                {letter}
              </h3>
              {sortedGroups[letter].map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setIsGistsOpen(false);
                  }}
                  className={`w-full px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm flex items-center ${
                    selectedGroupId === group.id ? "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <FaFolder className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <div className="truncate flex-1">
                    <span className="font-medium">{group.name}</span>
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      ({group.gistIds?.length ?? 0})
                    </span>
                    <span className="block text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">
                      @{group.owner?.login || "unknown"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}