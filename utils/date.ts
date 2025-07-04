// Helper to parse DD/MM/YYYY date strings
export const parseDate = (dateStr: string): Date | null => {
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  // Month is 0-indexed in JavaScript Date
  return new Date(year, month - 1, day);
};
