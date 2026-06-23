'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';

interface DailyStat {
  date: string;
  accesses: number;
  uniqueIps: number;
  consentedCount: number;
}

interface PopularPage {
  slug: string;
  count: number;
}

interface VisitorDetail {
  ip: string;
  visits: number;
  paths: string[];
  lastActive: string;
  consented: boolean;
  browser: string;
}

interface AnalyticsData {
  stats: {
    totalAccesses: number;
    uniqueVisitors: number;
    consentRate: number;
  };
  dailyStats: DailyStat[];
  popularPages: PopularPage[];
}

export default function AnalyticsDashboard() {
  const t = useTranslations('Analytics');
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState<'accesses' | 'uniqueIps'>('accesses');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visitorsList, setVisitorsList] = useState<VisitorDetail[]>([]);
  const [isDetailPending, startDetailTransition] = useTransition();
  const [hoveredCell, setHoveredCell] = useState<{ date: string; value: number; x: number; y: number } | null>(null);

  // Fetch summary stats on mount
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/dev/api/admin/analytics');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load analytics summary:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // Fetch detailed day data
  const handleCellClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setVisitorsList([]);

    startDetailTransition(async () => {
      try {
        const res = await fetch(`/dev/api/admin/analytics?date=${dateStr}`);
        const json = await res.json();
        if (json.success) {
          setVisitorsList(json.visitors);
        }
      } catch (err) {
        console.error(`Failed to load details for ${dateStr}:`, err);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center animate-pulse font-mono text-stone-500 text-sm">
        Loading analytics dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center font-mono text-rose-500 text-sm">
        Failed to load analytics. Make sure you are authorized.
      </div>
    );
  }

  // ── Construct Calendar Heatmap (Last 180 Days) ──────────────────────────────
  const constructCalendarGrid = () => {
    const grid: { date: string; value: number; dayOfWeek: number }[][] = [];
    const dateMap = new Map<string, DailyStat>();
    data.dailyStats.forEach((stat) => {
      dateMap.set(stat.date, stat);
    });

    const daysCount = 182; // 26 weeks
    const today = new Date();
    today.setHours(12, 0, 0, 0); // avoid dst hour mismatches

    // Find the starting date (182 days ago, adjusted to start on a Sunday)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysCount);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // snap to previous Sunday

    const currentDate = new Date(startDate);
    const weeksCount = Math.ceil((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

    for (let w = 0; w < weeksCount; w++) {
      const week: { date: string; value: number; dayOfWeek: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const stat = dateMap.get(dateStr);
        let cellVal = 0;
        if (stat) {
          cellVal = metric === 'accesses' ? stat.accesses : stat.uniqueIps;
        }
        week.push({
          date: dateStr,
          value: cellVal,
          dayOfWeek: d,
        });

        // Advance 1 day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      grid.push(week);
    }

    return grid;
  };

  const calendarGrid = constructCalendarGrid();
  const maxMetricVal = Math.max(...data.dailyStats.map((d) => (metric === 'accesses' ? d.accesses : d.uniqueIps)), 0);

  // Helper to resolve cell shading based on relative value intensity
  const getCellColor = (val: number) => {
    if (val === 0) return '#e7e5e4'; // stone-200
    if (maxMetricVal === 0) return '#fcd34d'; // default amber-300

    const ratio = val / maxMetricVal;
    if (ratio < 0.25) return '#fde047'; // amber-300
    if (ratio < 0.5) return '#fbbf24';  // amber-400
    if (ratio < 0.75) return '#ea580c'; // orange-600
    return '#9a3412';                   // orange-900
  };

  return (
    <div className="space-y-8 animate-scale-in text-stone-900">
      
      {/* ── KPI Header Counters ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 border border-stone-200 rounded-xl shadow-xs flex flex-col space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
            📊 {t('totalAccesses')}
          </span>
          <span className="text-3xl font-extrabold text-stone-950 font-mono leading-none">
            {data.stats.totalAccesses}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-1">
            {t('last180Days')}
          </span>
        </div>

        <div className="bg-white p-5 border border-stone-200 rounded-xl shadow-xs flex flex-col space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
            👥 {t('uniqueVisitors')}
          </span>
          <span className="text-3xl font-extrabold text-stone-950 font-mono leading-none">
            {data.stats.uniqueVisitors}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-1">
            Distinct IP footprint
          </span>
        </div>

        <div className="bg-white p-5 border border-stone-200 rounded-xl shadow-xs flex flex-col space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
            🛡️ {t('acceptRate')}
          </span>
          <span className="text-3xl font-extrabold text-stone-950 font-mono leading-none">
            {data.stats.consentRate}%
          </span>
          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${data.stats.consentRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Calendar Heatmap Section ── */}
      <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4 mb-6 gap-3">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-stone-950 font-mono">
              📅 {t('dashboardTitle')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Heatmap representation of traffic density (last 6 months)
            </p>
          </div>

          {/* Metric Selector Toggle */}
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200 font-mono text-[10px] self-start">
            <button
              onClick={() => setMetric('accesses')}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all duration-150 ${
                metric === 'accesses'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              {t('totalAccesses')}
            </button>
            <button
              onClick={() => setMetric('uniqueIps')}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all duration-150 ${
                metric === 'uniqueIps'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              {t('uniqueVisitors')}
            </button>
          </div>
        </div>

        {/* SVG contribution-grid calendar */}
        <div className="relative overflow-x-auto pb-4 max-w-full">
          <svg 
            width={calendarGrid.length * 13 + 30} 
            height={7 * 13 + 15} 
            className="mx-auto select-none overflow-visible"
          >
            {/* Weekday Labels */}
            <text x="0" y="22" className="fill-stone-400 text-[8px] font-bold font-mono">Mon</text>
            <text x="0" y="48" className="fill-stone-400 text-[8px] font-bold font-mono">Wed</text>
            <text x="0" y="74" className="fill-stone-400 text-[8px] font-bold font-mono">Fri</text>

            {/* Grid Cells */}
            {calendarGrid.map((week, wIdx) => {
              const x = 25 + wIdx * 13;
              
              // Estimate month label placement
              let monthLabel = '';
              const firstDayOfWeek = new Date(week[0].date);
              if (firstDayOfWeek.getDate() <= 7) {
                monthLabel = firstDayOfWeek.toLocaleDateString(undefined, { month: 'short' });
              }

              return (
                <g key={wIdx}>
                  {/* Month Label */}
                  {monthLabel && (
                    <text x={x} y="8" className="fill-stone-500 text-[8px] font-bold font-mono">
                      {monthLabel}
                    </text>
                  )}
                  {week.map((day) => {
                    const y = 14 + day.dayOfWeek * 13;
                    const isSelected = selectedDate === day.date;
                    const cellColor = getCellColor(day.value);
                    
                    return (
                      <rect
                        key={day.date}
                        x={x}
                        y={y}
                        width="10"
                        height="10"
                        rx="2"
                        fill={cellColor}
                        stroke={isSelected ? '#1c1917' : 'transparent'}
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all duration-150 hover:scale-[1.25] origin-center"
                        style={{ transformOrigin: `${x + 5}px ${y + 5}px` }}
                        onClick={() => handleCellClick(day.date)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const container = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                          if (container) {
                            setHoveredCell({
                              date: day.date,
                              value: day.value,
                              x: rect.left - container.left + 5,
                              y: rect.top - container.top - 35,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Simple Floating Tooltip */}
          {hoveredCell && (
            <div
              className="absolute z-40 bg-stone-950 text-stone-100 text-[9px] font-mono p-2 rounded-md shadow-lg pointer-events-none transition-all duration-75 border border-stone-850"
              style={{
                left: `${hoveredCell.x}px`,
                top: `${hoveredCell.y}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-bold">{hoveredCell.date}</p>
              <p className="text-amber-400 mt-0.5">
                {metric === 'accesses' ? t('visits') : t('uniqueVisitors')}: {hoveredCell.value}
              </p>
            </div>
          )}
        </div>

        {/* Heatmap Legend */}
        <div className="flex justify-end items-center gap-1.5 font-mono text-[9px] text-stone-400 mt-4 px-2">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-stone-200" />
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-300" />
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-600" />
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-900" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Popular Slugs List (Left/Col-5) ── */}
        <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-xs lg:col-span-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-stone-950 font-mono">
              🔥 {t('popularPages')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Top viewed paths in the last 180 days
            </p>
          </div>
          <div className="space-y-3">
            {data.popularPages.map((item, idx) => {
              const maxPopularVal = data.popularPages[0]?.count || 1;
              const percent = Math.round((item.count / maxPopularVal) * 100);
              return (
                <div key={item.slug} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-stone-700">
                    <span className="truncate max-w-[200px]" title={item.slug}>
                      {idx + 1}. <span className="font-semibold text-stone-900">{item.slug}</span>
                    </span>
                    <span>{item.count}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5">
                    <div 
                      className="bg-accent h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Date Details Panel (Right/Col-7) ── */}
        <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-xs lg:col-span-7 min-h-[300px] flex flex-col justify-between">
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 py-16 text-stone-400">
              <svg className="w-12 h-12 stroke-current fill-none mb-3 opacity-60" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-xs font-semibold font-mono">
                {t('noAccessesSelected')}
              </p>
            </div>
          ) : (
            <div className="space-y-5 flex-1 flex flex-col justify-between animate-fade-in">
              <div className="border-b border-stone-100 pb-3 flex justify-between items-baseline">
                <h4 className="text-xs font-bold font-mono text-stone-950 uppercase">
                  {t('selectedDayDetails', { date: selectedDate })}
                </h4>
                <span className="text-[10px] font-mono text-stone-400">
                  {visitorsList.length} unique nodes
                </span>
              </div>

              {isDetailPending ? (
                <div className="flex-1 flex items-center justify-center text-stone-400 font-mono text-[10px] py-16 animate-pulse">
                  Querying database logs...
                </div>
              ) : visitorsList.length === 0 ? (
                <p className="text-xs text-stone-400 italic font-mono py-12 text-center bg-stone-50 rounded-lg">
                  No tracking logs recorded on this date.
                </p>
              ) : (
                <div className="flex-1 overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
                  <table className="w-full text-left border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 uppercase font-bold">
                        <th className="py-2 pr-4">{t('ipAddress')}</th>
                        <th className="py-2 pr-4 text-center">{t('visits')}</th>
                        <th className="py-2 pr-4">{t('browser')}</th>
                        <th className="py-2 pr-4">{t('visitedPaths')}</th>
                        <th className="py-2 text-right">{t('lastActive')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {visitorsList.map((visitor) => (
                        <tr key={visitor.ip} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-2.5 pr-4 font-semibold select-all text-stone-900">
                            {visitor.ip}
                          </td>
                          <td className="py-2.5 pr-4 text-center font-bold text-stone-950">
                            {visitor.visits}
                          </td>
                          <td className="py-2.5 pr-4 text-stone-500">
                            {visitor.browser}
                          </td>
                          <td className="py-2.5 pr-4 max-w-[120px] truncate" title={visitor.paths.join(', ')}>
                            {visitor.paths.map((p) => {
                              const label = p === '/' ? 'Home' : p.replace('/posts/', '').replace('/bartua1', 'Portfolio');
                              return (
                                <span 
                                  key={p} 
                                  className="inline-block px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[9px] mr-1 max-w-[70px] truncate"
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </td>
                          <td className="py-2.5 text-right text-stone-400">
                            {new Date(visitor.lastActive).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
