// src/components/gist/GistCard.tsx
import { Gist } from "src/types/types";
import { useDirections } from "@hooks/directions/useDirections";
import { GistHeader } from "@components/gist/gist/GistHeader";
import { GistContent } from "@components/gist/gist/GistContent";
import { GistActions } from "@components/gist/gist/GistActions";
import DirectionsModal from "@components/location/directionalmodal";

interface GistCardProps {
  gist: Gist;
  avatarUrl?: string | null | undefined;
  isExpanded: boolean;
  isStarred: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
  linkedGist?: string | null;
  relatedGistDescription?: string | null;
  relatedGistUrl?: string | null;
  onToggleStar: (gistId: string) => void;
  onExpandGist: (gistId: string) => void;
  onEditGist: (gistId: string) => void;
  onDeleteGist: (gistId: string) => void;
}

export default function GistCard({
  gist,
  avatarUrl,
  isExpanded,
  isStarred,
  isOwner,
  isLoggedIn,
  linkedGist,
  relatedGistDescription,
  relatedGistUrl,
  onToggleStar,
  onExpandGist,
  onEditGist,
  onDeleteGist,
}: GistCardProps) {
  const { showDirectionsModal, coordinates, fetchDirections, closeDirectionsModal } = useDirections(gist);

  return (
    <div
      className={`relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 transition-all duration-300 ${
        isExpanded
          ? "col-span-full shadow-lg bg-gray-50 dark:bg-gray-800"
          : "hover:shadow-md dark:hover:shadow-gray-700 h-60 sm:h-64"
      }`}
    >
      <div
        className={`${isExpanded ? "border-b pb-3 sm:pb-4 mb-3 sm:mb-4 border-gray-200 dark:border-gray-700" : "h-full flex flex-col"}`}
      >
        <GistHeader gist={gist} avatarUrl={avatarUrl} />
        <GistContent
          gist={gist}
          isExpanded={isExpanded}
          linkedGist={linkedGist}
          relatedGistDescription={relatedGistDescription}
          relatedGistUrl={relatedGistUrl}
        />
        <GistActions
          gist={gist}
          isExpanded={isExpanded}
          isStarred={isStarred}
          isOwner={isOwner}
          isLoggedIn={isLoggedIn}
          onToggleStar={onToggleStar}
          onExpandGist={onExpandGist}
          onEditGist={onEditGist}
          onDeleteGist={onDeleteGist}
          onShowDirections={fetchDirections}
        />
      </div>

      <DirectionsModal isOpen={showDirectionsModal} onClose={closeDirectionsModal} coordinates={coordinates} />
    </div>
  );
}