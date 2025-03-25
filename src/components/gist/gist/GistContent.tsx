import { Gist } from "src/types/types";

interface GistContentProps {
  gist: Gist;
  isExpanded: boolean;
  linkedGist?: string | null;
  relatedGistDescription?: string | null;
  relatedGistUrl?: string | null;
}

export const GistContent = ({
  gist,
  isExpanded,
  linkedGist,
  relatedGistDescription,
  relatedGistUrl,
}: GistContentProps) => {
  const firstFile = Object.values(gist.files)[0];

  return (
    <>
      <p
        className="text-sm sm:text-md font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 overflow-hidden text-ellipsis"
        title={gist.description || "Untitled Gist"}
      >
        {gist.description || "Untitled Gist"}
      </p>

      {!isExpanded && (
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 font-mono h-20 sm:h-24 overflow-hidden">
          <p className="text-gray-500 dark:text-gray-400">
            #!/usr/bin/env {firstFile.language?.toLowerCase() ?? "text"}
          </p>
          <p className="mt-1 sm:mt-2 italic line-clamp-2 overflow-hidden text-ellipsis">
            ** {firstFile.content || "No description"} **
          </p>
        </div>
      )}

      {linkedGist === gist.id && !isExpanded && relatedGistUrl && (
        <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-2 line-clamp-1 overflow-hidden text-ellipsis">
          <p>
            Related Gist:{" "}
            <a href={relatedGistUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {relatedGistDescription || "Untitled Gist"}
            </a>
          </p>
        </div>
      )}
    </>
  );
};