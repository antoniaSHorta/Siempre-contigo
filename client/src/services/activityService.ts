import axios from 'axios';
import { endpoints } from '../config/api';
import {IActivity} from '../interfaces/IActivity'

export const getActivities = async (token: string) => {
  try {
    const response = await axios.get(endpoints.activities.list, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Error al obtener las actividades');
  }
};

export const getActivityById = async (id:number,token: string) => {
  try {
    const response = await axios.get(endpoints.activities.getById(id), {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Error al obtener la actividad');
  }
};

export const createActivity = async (activityData: IActivity,token: string) => {
  try {
    const response = await axios.post(endpoints.activities.create, activityData,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Error al crear la actividad');
  }
};

export const updateActivity = async (id: number, updatedData: IActivity,token: string) => {
  try {
    const response = await axios.put(endpoints.activities.update(id),updatedData,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Error al actualizar la actividad');
  }
};

export const deleteActivity = async (id: number,token: string) => {
  try {
    const response = await axios.delete(endpoints.activities.delete(id),{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Error al eliminar la actividad');
  }
};