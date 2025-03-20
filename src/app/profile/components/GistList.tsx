import { FaHeart, FaComment, FaShare, FaCode } from "react-icons/fa";
import { Gist, GistGroup } from "../types";
import { useSession } from "next-auth/react";

interface GistListProps {
  gists: Gist[];
  selectedGroupId: string;
  gistGroups: GistGroup[];
  linkedGist: string | null;
}

export default function GistList({ gists, selectedGroupId, gistGroups, linkedGist }: GistListProps) {
  const { data: session } = useSession();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Gists {selectedGroupId ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name}` : "from All Groups"}
      </h2>
      <div className="max-h-[60vh] overflow-y-auto">
        {gists.length === 0 ? (
          <p className="text-sm text-gray-600">No gists available yet. Share one!</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gists.map((gist) => {
              const firstFile = Object.values(gist.files)[0];
              return (
                <div
                  key={gist.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={session?.user?.avatar || "/default-avatar.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                      onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{gist.owner.login}</p>
                      <p className="text-xs text-gray-500">{new Date(gist.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-md font-medium text-gray-900 mb-2">{gist.description || "Untitled Gist"}</p>
                  {gist.description && <p className="text-sm text-gray-600 mb-2">{gist.description}</p>}
                  <div className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                    <p className="text-gray-500">#!/usr/bin/env {firstFile.language?.toLowerCase() ?? "text"}</p>
                    <p className="mt-2 italic">** {gist.description || "No description"} **</p>
                  </div>
                  {linkedGist === gist.id && (
                    <div className="text-sm text-blue-600 mb-2">
                      <p>
                        Related Gist:{" "}
                        <a
                          href={gists.find((g) => g.id === linkedGist)?.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {gists.find((g) => g.id === linkedGist)?.description || "Untitled Gist"}
                        </a>
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-red-500">
                      <FaHeart className="w-4 h-4" /> 24
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500">
                      <FaComment className="w-4 h-4" /> {gist.comments}
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-500">
                      <FaShare className="w-4 h-4" /> 2
                    </button>
                    <a
                      href={gist.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <FaCode className="w-4 h-4" /> View Full Gist
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}