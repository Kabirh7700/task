import { GOOGLE_SHEET_URL } from '../constants.ts';
import { TaskData } from '../types.ts';

// Helper to safely get cell value
const getCellValue = (cell: any): string => {
  if (!cell) return '';
  // 'f' is formatted value, 'v' is the raw value. Prioritize 'f'.
  return cell.f || cell.v?.toString() || '';
};

export const fetchTasks = async (): Promise<TaskData[]> => {
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseText = await response.text();
    
    // The response is JSONP, we need to extract the JSON part.
    const jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
    const parsedData = JSON.parse(jsonString);

    if (parsedData.status !== 'ok') {
        throw new Error('Google Sheets API returned an error status.');
    }

    const rows = parsedData.table.rows;
    // The first row is headers, so we skip it.
    const tasks = rows.slice(1).map((row: any): TaskData | null => {
      // Defensive check for malformed rows from Google Sheets.
      if (!row || !row.c) {
        return null;
      }
      const cells = row.c;
      return {
        // Mapping based on user-requested columns B, C, D, E, F, H, J, N, O, P
        // B=1, C=2, D=3, E=4, F=5, H=7, J=9, N=13, O=14, P=15
        taskId: getCellValue(cells[1]),      // Column B: Task Id of Text
        task: getCellValue(cells[2]),        // Column C: Task
        stepCode: getCellValue(cells[3]),    // Column D: Step Code
        plannedDate: getCellValue(cells[4]), // Column E: Planned
        actualDate: getCellValue(cells[5]),  // Column F: Actual
        formLink: getCellValue(cells[7]),    // Column H: Link
        systemType: getCellValue(cells[9]),  // Column J: System Type
        status: getCellValue(cells[13]),     // Column N: Status
        doerName: getCellValue(cells[14]),   // Column O: Final User Name
        emailId: getCellValue(cells[15]),    // Column P: Email id
      };
    });

    // Filter out nulls (from bad rows) and rows that don't look like tasks
    return tasks
        .filter((task): task is TaskData => task !== null)
        .filter(task => task.taskId || task.task);
  } catch (error) {
    console.error('Failed to fetch or parse sheet data:', error);
    throw new Error('Could not retrieve task data from Google Sheets. Please check the sheet URL and permissions.');
  }
};