// src/types.ts

export interface UserData {
    id: number;
    email: string;
    name: string | null;
    lastname: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    role: string;
    token?: string; // <--- ¡AÑADIDA! La propiedad del token ahora es opcional
}
