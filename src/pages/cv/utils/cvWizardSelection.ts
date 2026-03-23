import type { RepoItem } from '@/pages/summary/SummaryPage/context/SummaryContext';

export function repoSelectionId(r: RepoItem): number {
  return r.id ?? r.repo_id;
}

export function toggleInList(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
}
