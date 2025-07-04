
export interface TaskData {
  taskId: string;
  task: string;
  stepCode: string;
  plannedDate: string;
  actualDate: string;
  formLink: string;
  systemType: string;
  status: string;
  doerName: string;
  emailId: string;
}

interface MISMetric {
  planned: number;
  completed: number;
  performance: number;
}

export interface MISStats {
  planVsActual: MISMetric;
  onTime: MISMetric;
  startDate: Date;
  endDate: Date;
}
