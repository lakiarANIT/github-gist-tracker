import { useState, useEffect } from "react";

export function useSelectedGist(selectedGistId?: string | null) {
  const [expandedGistId, setExpandedGistId] = useState<string | null>(selectedGistId || null);

  useEffect(() => {
    setExpandedGistId(selectedGistId || null);
  }, [selectedGistId]);

  const handleExpandGist = (gistId: string) => {
    setExpandedGistId(expandedGistId === gistId ? null : gistId);
  };

  return { expandedGistId, handleExpandGist };
}