import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { TaskTable } from './components/TaskTable.tsx';
import { Loader } from './components/Loader.tsx';
import { fetchTasks } from './services/googleSheetService.ts';
import { TaskData, MISStats } from './types.ts';
import { Dashboard } from './components/Dashboard.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { MISScoring } from './components/MISScoring.tsx';
import { calculateKpiCounts, calculateMISStats } from './utils/stats.ts';
import { parseDate } from './utils/date.ts';

const App: React.FC = () => {
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('taskDashboardUserEmail'));
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('');
  const [systemTypeFilter, setSystemTypeFilter] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TaskData | null, direction: 'ascending' | 'descending' }>({ key: 'plannedDate', direction: 'ascending' });
  const [kpiFilter, setKpiFilter] = useState<'all' | 'overdue' | 'dueToday'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchAndSetTasks = useCallback(async () => {
    setError(null);
    try {
      const tasks = await fetchTasks();
      setAllTasks(tasks);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchAndSetTasks();
      setIsLoading(false);
    };

    initialFetch();

    const intervalId = setInterval(() => {
      fetchAndSetTasks();
    }, 60000); // Increased interval to 60 seconds

    return () => clearInterval(intervalId);
  }, [fetchAndSetTasks]);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAndSetTasks();
    setIsRefreshing(false);
  }, [fetchAndSetTasks]);

  const pendingTasks = useMemo(() => {
    return allTasks.filter(task => !task.actualDate);
  }, [allTasks]);

  const misStats: MISStats | null = useMemo(() => calculateMISStats(allTasks, currentUserEmail), [allTasks, currentUserEmail]);

  const { overdueTasksCount, tasksDueTodayCount, myPendingTasksCount } = useMemo(() => calculateKpiCounts(pendingTasks, currentUserEmail), [pendingTasks, currentUserEmail]);

  const displayTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    let filteredTasks = pendingTasks.filter(task => {
      const userMatch = !currentUserEmail || task.emailId === currentUserEmail;
      const taskTypeMatch = !taskTypeFilter || task.task === taskTypeFilter;
      const systemTypeMatch = !systemTypeFilter || task.systemType === systemTypeFilter;

      const searchMatch = !searchTerm ||
        task.taskId.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.task.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.systemType.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.doerName.toLowerCase().includes(lowerCaseSearchTerm);

      if (!(userMatch && taskTypeMatch && systemTypeMatch && searchMatch)) {
        return false;
      }

      const planned = parseDate(task.plannedDate);
      if (!planned) return false;

      switch (kpiFilter) {
        case 'overdue':
          return planned < today;
        case 'dueToday':
          return planned.getTime() === today.getTime();
        case 'all':
        default:
          return planned <= today;
      }
    });

    if (sortConfig.key) {
      const sortableTasks = [...filteredTasks]; // Create a copy to avoid mutation
      const sortKey = sortConfig.key;
      sortableTasks.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;
        if (sortKey === 'plannedDate') {
          const dateA = parseDate(valA as string);
          const dateB = parseDate(valB as string);
          if (dateA && dateB) {
            comparison = dateA.getTime() - dateB.getTime();
          }
        } else {
          if (valA! < valB!) {
            comparison = -1;
          }
          if (valA! > valB!) {
            comparison = 1;
          }
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
      return sortableTasks;
    }

    return filteredTasks;
  }, [pendingTasks, currentUserEmail, taskTypeFilter, systemTypeFilter, kpiFilter, sortConfig, searchTerm]);

  const handleSort = (key: keyof TaskData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const uniqueTaskTypes = useMemo(() => [...new Set(pendingTasks.map(t => t.task).filter(Boolean))], [pendingTasks]);
  const uniqueSystemTypes = useMemo(() => [...new Set(pendingTasks.map(t => t.systemType).filter(Boolean))], [pendingTasks]);

  const handleLogin = (email: string) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCurrentUserEmail(email);
      localStorage.setItem('taskDashboardUserEmail', email);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const handleLogout = useCallback(() => {
    setCurrentUserEmail(null);
    localStorage.removeItem('taskDashboardUserEmail');
  }, []);

  if (!currentUserEmail) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-200 text-slate-900">
      <Header
        onRefresh={handleManualRefresh}
        isLoading={isRefreshing}
        currentUserEmail={currentUserEmail}
        onLogout={handleLogout}
        lastRefreshed={lastRefreshed}
      />
      <div className="max-w-screen-xl mx-auto p-4 md:p-6 space-y-8">
        <MISScoring stats={misStats} />
        <Dashboard
          overdueTasksCount={overdueTasksCount}
          tasksDueTodayCount={tasksDueTodayCount}
          myPendingTasksCount={myPendingTasksCount}
          taskTypes={uniqueTaskTypes}
          systemTypes={uniqueSystemTypes}
          taskTypeFilter={taskTypeFilter}
          systemTypeFilter={systemTypeFilter}
          onTaskTypeFilterChange={setTaskTypeFilter}
          onSystemTypeFilterChange={setSystemTypeFilter}
          kpiFilter={kpiFilter}
          onKpiFilterChange={setKpiFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Failed to load data</h3>
              <p className="mt-2">{error}</p>
              {error.includes("429") && <p className="mt-2 text-sm">This is due to too many requests. The data will attempt to refresh again automatically.</p>}
            </div>
          ) : (
            <TaskTable
              tasks={displayTasks}
              currentUserEmail={currentUserEmail}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
