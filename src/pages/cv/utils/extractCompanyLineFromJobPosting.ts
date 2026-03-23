export function extractCompanyLineFromJobPosting(jobPosting: string): string {
  const t = jobPosting.trim();
  if (!t) return '—';
  const m = t.match(/^\s*회사\s*[:：]\s*([^\n\r]+)/);
  if (m?.[1]) {
    const line = m[1].trim();
    return line || '—';
  }
  const firstLine = t.split(/\r?\n/).find(l => l.trim().length > 0)?.trim() ?? '';
  if (firstLine.length > 0 && firstLine.length <= 100) return firstLine;
  return firstLine.length > 100 ? `${firstLine.slice(0, 97)}…` : '—';
}
