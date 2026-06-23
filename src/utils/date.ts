export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayStr(): string {
  return formatDateLocal(new Date());
}

export function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDateLocal(d);
}
