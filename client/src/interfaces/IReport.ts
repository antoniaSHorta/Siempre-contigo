import { IResident } from "./IResident";
import { IUser } from "./IUser";

export interface IReport {
  id: number;
  date?: string; 
  description?: string;
  pdf?: string; 
  resident: IResident;
  sender?: IUser;
}