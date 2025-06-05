import axios from 'axios';
import { endpoints } from '../config/api';
import { IResident } from '../interfaces/IResident';

export async function getAllResidents(token: string) {
  try {
    const response = await axios.get(endpoints.residents.list, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error en getAllResidents:', error);
    throw error;
  }
}

export async function getAllResidentsInactiveAndActive(token: string) {
  try {
    const response = await axios.get(endpoints.residents.listAll, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error en getAllResidentsInactiveAndActive:', error);
    throw error;
  }
}

export async function getResidentById(id: number, token: string) {
  try {
    const response = await axios.get(endpoints.residents.getById(id), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error en getResidentById:', error);
    throw error;
  }
}

export async function createResident(resident: Partial<IResident>, token: string) {
  try {
    const response = await axios.post(endpoints.residents.create, resident, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error en createResident:', error);
    throw error;
  }
}

export async function updateResident(id: number, resident: Partial<IResident>, token: string) {
  try {
    const response = await axios.put(endpoints.residents.update(id), resident, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error en updateResident:', error);
    throw error;
  }
}

export async function activateResident(id: number, token: string) {
  try {
    const response = await axios.put(endpoints.residents.active(id), {},{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.message;
  } catch (error) {
    console.error('Error en activateResident:', error);
    throw error;
  }
}

export async function deleteResident(id: number, token: string) {
  try {
    const response = await axios.delete(endpoints.residents.delete(id), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.message;
  } catch (error) {
    console.error('Error en deleteResident:', error);
    throw error;
  }
}

export async function updateResidentCuidadores(residentId: number, cuidadores: number[], token: string){
    try {
        const response = await axios.put(endpoints.residents.updateCuidadores(residentId),{ cuidadores },{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en updateResidentCuidadores:', error);
        throw error;
    }
};

export async function updateResidentFamiliares (residentId: number, familiares: number[], token: string) {
    try {
        const response = await axios.put(endpoints.residents.updateFamiliares(residentId),{ familiares },{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en updateResidentFamiliares:', error);
        throw error;
    }
};

export async function addResidentFamiliares(residentId: number, familiares: number[], token: string){
    try {
        const response = await axios.post(endpoints.residents.addFamiliares(residentId),{ familiares:familiares },{
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en updateResidentFamiliares:', error);
        throw error;
    }
}

export async function addResidentCuidadores(residentId: number, cuidadores: number[], token: string){
    try {
        const response = await axios.post(endpoints.residents.addCuidadores(residentId),{ cuidadores:cuidadores },{
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en updateResidentFamiliares:', error);
        throw error;
    }
};
