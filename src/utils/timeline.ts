export interface YearGroup<T extends { date: string }> {
  year: number;
  visits: T[];
}

function parseVisitDate(date: string): { year: number; month: number; day: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { year: y, month: (m || 1) - 1, day: d || 1 };
}

/** 按年份分组，年份从新到旧，年份内部按日期从新到旧——单个地点的到访记录、跨地点摊平后的列表都能用 */
export function groupVisitsByYear<T extends { date: string }>(visits: T[]): YearGroup<T>[] {
  const byYear = new Map<number, T[]>();
  for (const visit of visits) {
    const { year } = parseVisitDate(visit.date);
    const bucket = byYear.get(year);
    if (bucket) bucket.push(visit);
    else byYear.set(year, [visit]);
  }
  return Array.from(byYear.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, yearVisits]) => ({
      year,
      visits: [...yearVisits].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    }));
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatVisitDayMonth(date: string): { day: string; month: string } {
  const { month, day } = parseVisitDate(date);
  return { day: String(day).padStart(2, "0"), month: MONTH_ABBR[month] };
}
