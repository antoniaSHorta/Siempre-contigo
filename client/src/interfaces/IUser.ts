export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    location: string;
    isActive: boolean;
    isConnected: boolean;
    createdAt?: string;
    updatedAt?: string;
}