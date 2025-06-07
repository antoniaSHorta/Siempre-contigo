export interface IReport {
  id: number;
  date?: string; 
  description?: string;
  pdf?: string; 
  residentId: number;
  senderId?: number;
}