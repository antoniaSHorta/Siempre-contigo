import axios from 'axios';
import { endpoints } from '../config/api';
import { IUser } from '../interfaces/IUser';

export async function getAllUsersAdmin(token: string) {
    try {
        const response = await axios.get(endpoints.admin.users.list, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en getAllUsersAdmin:', error);
        throw error;
    }
}

export async function getUserByIdAdmin(id: number | number, token: string) {
    try {
        const response = await axios.get(endpoints.admin.users.getById(id), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en getUserByIdAdmin:', error);
        throw error;
    }
}

export async function createUserAdmin(user: Partial<IUser>, token: string) {
    try {
        const response = await axios.post(endpoints.admin.users.create, user, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en createUserAdmin:', error);
        throw error;
    }
}

export async function updateUserAdmin(id: number, user: Partial<IUser>, token: string) {
    try {
        const response = await axios.put(endpoints.admin.users.update(id), user, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error en updateUserAdmin:', error);
        throw error;
    }
}

export async function checkEmailExists(email: string, token: string): Promise<boolean> {
    try {
        const response = await axios.post(endpoints.admin.users.checkEmail,
            { email: email },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data.exists;
    } catch (error) {
        console.error('Error en checkEmailExists:', error);
        throw error;
    }
}

export async function toggleStatusUser(id: number, token: string, newStatus: boolean) {
    try {
        const response = await axios.put(endpoints.admin.users.toggle(id),
            { isActive: newStatus },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error en toggleStatusUser:', error);
        throw error;
    }
}
