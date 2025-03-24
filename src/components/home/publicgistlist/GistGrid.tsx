import GistCard from "@components/gist/GistCard";
import GistDetailsExpanded from "@components/gist/GistDetailsExpanded";
import { Gist } from "src/types/types";

interface GistGridProps {
  displayedGists: Gist[];
  filteredGists: Gist[];
  starredGists: Set<string>;
  expandedGistId: string | null;
  toggleStar: (gistId: string) => void;
  handleExpandGist: (gistId: string) => void;
  handleNextGist: () => void;
  handlePreviousGist: () => void;
  isAuthenticated: boolean;
}

export default function GistGrid({
  displayedGists,
  filteredGists,
  starredGists,
  expandedGistId,
  toggleStar,
  handleExpandGist,
  handleNextGist,
  handlePreviousGist,
  isAuthenticated,
}: GistGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4">
      {displayedGists.map((gist) => {
        const isExpanded = expandedGistId === gist.id;
        const isStarred = starredGists.has(gist.id);
        const isFirst = filteredGists.findIndex((g) => g.id === gist.id) === 0;
        const isLast = filteredGists.findIndex((g) => g.id === gist.id) === filteredGists.length - 1;

        return (
          <div
            key={gist.id}
            className={`border border-gray-200 dark:border-gray-600 rounded-lg p-2 sm:p-3 transition-all duration-300 ${
              isExpanded ? "col-span-full shadow-lg bg-gray-50 dark:bg-gray-700" : "hover:shadow-md"
            }`}
          >
            {!isExpanded && (
              <GistCard
                gist={gist}
                avatarUrl={gist.owner.avatar_url}
                isExpanded={isExpanded}
                isStarred={isStarred}
                isOwner={false}
                isLoggedIn={isAuthenticated} // Pass isAuthenticated as isLoggedIn
                linkedGist={null}
                relatedGistDescription={null}
                relatedGistUrl={null}
                onToggleStar={toggleStar} // Pass toggleStar directly
                onExpandGist={handleExpandGist}
                onEditGist={() => {}} // Placeholder for non-owners
                onDeleteGist={() => {}} // Placeholder for non-owners
              />
            )}
            {isExpanded && (
              <GistDetailsExpanded
                gist={gist}
                gistDetails={{
                  ...gist,
                  files: Object.fromEntries(
                    Object.entries(gist.files).map(([key, file]) => [
                      key,
                      { ...file, language: file.language || null, content: file.content || "" },
                    ])
                  ),
                }}
                isFirst={isFirst}
                isLast={isLast}
                isOwner={false}
                onPreviousGist={handlePreviousGist}
                onNextGist={handleNextGist}
                onExpandGist={handleExpandGist}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}