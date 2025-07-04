import React from 'react';
import { MISStats } from '../types.ts';

// Helper to format dates as DD/MM
const formatDate = (date: Date): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    return `${day}/${month}`;
};

interface MISScoringProps {
    stats: MISStats | null;
}

export const MISScoring: React.FC<MISScoringProps> = ({ stats }) => {
    if (!stats) {
        return null; // Don't render if stats are not available
    }

    const { planVsActual, onTime, startDate, endDate } = stats;

    const MetricRow = ({ kra, kpi, planned, actual, performance }: { kra: string, kpi: string, planned: number, actual: number, performance: number }) => {
        const performanceColor = performance >= 0 ? 'text-green-600' : 'text-red-600';
        return (
            <div className="grid grid-cols-12 items-center px-6 py-4">
                <div className="col-span-12 md:col-span-4 text-left text-slate-700 font-medium">{kra}</div>
                <div className="col-span-12 md:col-span-3 text-left text-slate-600">{kpi}</div>
                <div className="col-span-4 md:col-span-2 text-center text-2xl font-bold text-slate-800">{planned}</div>
                <div className="col-span-4 md:col-span-2 text-center text-2xl font-bold text-slate-800">{actual}</div>
                <div className={`col-span-4 md:col-span-1 text-center text-2xl font-bold ${performanceColor}`}>{performance}%</div>
            </div>
        )
    };

    return (
        <section>
             <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-900">Last Week's Performance</h3>
                <p className="text-sm font-semibold text-slate-500">
                    ({formatDate(startDate)} - {formatDate(endDate)})
                </p>
             </div>
             <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden divide-y divide-slate-200/70">
                <header className="grid grid-cols-12 px-6 py-3 bg-slate-50/50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <div className="col-span-12 md:col-span-4 text-left">KRA</div>
                    <div className="col-span-12 md:col-span-3 text-left">KPI</div>
                    <div className="col-span-4 md:col-span-2 text-center">Planned</div>
                    <div className="col-span-4 md:col-span-2 text-center">Actual</div>
                    <div className="col-span-4 md:col-span-1 text-center">Actual %</div>
                </header>
                <MetricRow 
                    kra="All work should be done as per plan"
                    kpi="% work not done"
                    planned={planVsActual.planned}
                    actual={planVsActual.completed}
                    performance={planVsActual.performance}
                />
                <MetricRow 
                    kra="All work should be done on time"
                    kpi="% work not done on time"
                    planned={onTime.planned}
                    actual={onTime.completed}
                    performance={onTime.performance}
                />
            </div>
        </section>
    );
};