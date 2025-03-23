import { useState } from "react";
import { Gist } from "src/types/types";

export function useGistPagination(filteredGists: Gist[], itemsPerPage: number = 6) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedGistId, setExpandedGistId] = useState<string | null>(null);

  const totalPages = Math.ceil(filteredGists.length / itemsPerPage);

  const getPaginatedGists = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredGists.length);
    return expandedGistId
      ? filteredGists.filter((gist) => gist.id === expandedGistId)
      : filteredGists.slice(startIndex, endIndex);
  };

  const handleExpandGist = (gistId: string) => {
    setExpandedGistId(expandedGistId === gistId ? null : gistId);
  };

  const handleNextGist = () => {
    const currentIndex = filteredGists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex < filteredGists.length - 1) setExpandedGistId(filteredGists[currentIndex + 1].id);
  };

  const handlePreviousGist = () => {
    const currentIndex = filteredGists.findIndex((gist) => gist.id === expandedGistId);
    if (currentIndex > 0) setExpandedGistId(filteredGists[currentIndex - 1].id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedGistId(null);
  };

  return {
    currentPage,
    totalPages,
    expandedGistId,
    getPaginatedGists,
    handleExpandGist,
    handleNextGist,
    handlePreviousGist,
    handlePageChange,
  };
}