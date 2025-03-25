import { GistGroup } from 'src/types/types';

export function sortAndGroupGists(gistGroups: GistGroup[]) {
  const sorted = [...gistGroups].sort((a, b) => a.name.localeCompare(b.name));
  return sorted.reduce((acc, group) => {
    const firstLetter = group.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(group);
    return acc;
  }, {} as Record<string, GistGroup[]>);
}