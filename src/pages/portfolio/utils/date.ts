/** ISO 날짜 문자열을 YYYY-MM-DD로 변환 */
export function formatDateOnly(iso: string): string {
  if (!iso || typeof iso !== 'string') return '';
  const s = iso.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** created_at, updated_at을 "YYYY-MM-DD ~ YYYY-MM-DD" 형식으로 */
export function formatDateRange(createdAt: string, updatedAt: string): string {
  const from = formatDateOnly(createdAt);
  const to = formatDateOnly(updatedAt);
  if (from && to) return `${from} ~ ${to}`;
  if (from) return from;
  if (to) return to;
  return '-';
}
