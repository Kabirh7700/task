import { TaskData, MISStats } from '../types.ts';
import { parseDate } from './date.ts';

export const calculateMISStats = (tasks: TaskData[], userEmail: string | null): MISStats | null => {
    if (!userEmail) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // Sunday: 0, Monday: 1, ...
    const offsetToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - offsetToLastMonday - 7);

    const lastSaturday = new Date(lastMonday);
    lastSaturday.setDate(lastMonday.getDate() + 5);

    const userTasks = tasks.filter(task => task.emailId === userEmail);

    let lastWeekPlanned = 0;
    let lastWeekCompleted = 0;
    let lastWeekOnTime = 0;

    userTasks.forEach(task => {
        const plannedDate = parseDate(task.plannedDate);
        const actualDate = parseDate(task.actualDate);

        if (plannedDate && plannedDate >= lastMonday && plannedDate <= lastSaturday) {
            lastWeekPlanned++;
        }

        if (actualDate && actualDate >= lastMonday && actualDate <= lastSaturday) {
            lastWeekCompleted++;
            if (plannedDate && actualDate <= plannedDate) {
                lastWeekOnTime++;
            }
        }
    });
    
    const planVsActualPerformance = lastWeekPlanned === 0 ? 0 : ((lastWeekCompleted - lastWeekPlanned) / lastWeekPlanned) * 100;
    const onTimePerformance = lastWeekCompleted === 0 ? 0 : ((lastWeekOnTime - lastWeekCompleted) / lastWeekCompleted) * 100;

    const round = (num: number) => Math.round(num * 10) / 10;

    return {
        planVsActual: {
            planned: lastWeekPlanned,
            completed: lastWeekCompleted,
            performance: round(planVsActualPerformance),
        },
        onTime: {
            planned: lastWeekCompleted,
            completed: lastWeekOnTime,
            performance: round(onTimePerformance),
        },
        startDate: lastMonday,
        endDate: lastSaturday,
    };
};

export const calculateKpiCounts = (pendingTasks: TaskData[], userEmail: string | null) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdue = 0;
    let dueToday = 0;
    
    const userPendingTasks = pendingTasks.filter(task => !userEmail || task.emailId === userEmail);

    userPendingTasks.forEach(task => {
        const planned = parseDate(task.plannedDate);
        if (planned) {
            if (planned < today) {
                overdue++;
            } else if (planned.getTime() === today.getTime()) {
                dueToday++;
            }
        }
    });
    
    return {
        overdueTasksCount: overdue,
        tasksDueTodayCount: dueToday,
        myPendingTasksCount: overdue + dueToday,
    };
};
