// src/types.ts

export interface UserData {
    id: number;
    email: string;
    name: string | null;
    lastname: string | null;
    phone?: string | null;   // <--- ¡AÑADE O ACTUALIZA ESTA LÍNEA!
    address?: string | null; // <--- ¡AÑADE O ACTUALIZA ESTA LÍNEA!
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    role: string;
}
