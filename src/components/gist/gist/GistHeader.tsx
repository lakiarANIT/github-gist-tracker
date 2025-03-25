import { Gist } from "src/types/types";

interface GistHeaderProps {
  gist: Gist;
  avatarUrl?: string | null | undefined;
}

export const GistHeader = ({ gist, avatarUrl }: GistHeaderProps) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
    <div className="flex items-center gap-2">
      <img
        src={avatarUrl || "/default-avatar.png"}
        alt="Profile"
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
        onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
      />
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{gist.owner.login}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(gist.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  </div>
);