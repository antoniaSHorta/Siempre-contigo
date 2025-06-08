export const API_URL = 'http://localhost:3000/api';

export const endpoints = {
  auth: {
    login: `${API_URL}/users/login`,
    register: `${API_URL}/users/register`,
    me: `${API_URL}/users/me`,
    logout: `${API_URL}/users/logout`,
  },
  users: {
    list: `${API_URL}/users`,
    create: `${API_URL}/users`,
    update: (id: number) => `${API_URL}/users/${id}`,
    delete: (id: number) => `${API_URL}/users/${id}`,
  },
  admin: {
    users: {
      list: `${API_URL}/admin`,                            
      getById: (id: number) => `${API_URL}/admin/${id}`, 
      create: `${API_URL}/admin`,                          
      checkEmail: `${API_URL}/admin/check-email`,
      update: (id: number) => `${API_URL}/admin/${id}`, 
      toggle: (id: number) => `${API_URL}/admin/status/${id}`, 
    }
  },
  activities:{
    list: `${API_URL}/activities`,
    getById: (id: number) => `${API_URL}/activities/${id}`,
    create: `${API_URL}/activities`,
    update: (id: number) => `${API_URL}/activities/${id}`,
    delete: (id: number) => `${API_URL}/activities/${id}`,
  },
  residents:{
    list: `${API_URL}/residents`,
    listAll: `${API_URL}/residents/activeAndInactive`,
    getById: (id: number) => `${API_URL}/residents/${id}`,
    create: `${API_URL}/residents`,
    update: (id: number) => `${API_URL}/residents/${id}`,
    active: (id: number) => `${API_URL}/residents/active/${id}`,
    delete: (id: number) => `${API_URL}/residents/${id}`,
    addCuidadores: (id:number) => `${API_URL}/residentesCuidadores/${id}/cuidadores`,
    addFamiliares: (id:number) => `${API_URL}/residentesFamiliares/${id}/familiares`,
    updateCuidadores: (id:number) => `${API_URL}/residentesCuidadores/${id}/cuidadores`,
    updateFamiliares: (id:number) => `${API_URL}/residentesFamiliares/${id}/familiares`
    
  },
  report: {
        list: (residentId: number) => `${API_URL}/reports/resident/${residentId}`,
        getById: (id: number) => `${API_URL}/reports/${id}`,
        generatePdf: (residentId: number, from: string, to: string) =>
            `${API_URL}/reports/generate/pdf/${residentId}/${from}/${to}`,
        getPdfBase64: (id: number) => `/api/reports/${id}/pdf/base64`
  },
  notifications: {
    registerFcmToken: (id: number) => `${API_URL}/notificaciones/registerFcmToken/${id}`,
  },
}; 