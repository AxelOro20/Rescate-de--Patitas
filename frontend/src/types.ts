// src/types.ts
export interface UserData {
    id: number;
    email: string;
    name?: string; // Propiedad opcional
    lastname?: string; // Propiedad opcional
    role: string; // Ejemplo: 'user', 'admin'
    // Agrega aquí todas las propiedades que esperes recibir del backend para un usuario
}