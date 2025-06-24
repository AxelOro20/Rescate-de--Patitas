import React, { useState, useEffect } from 'react';
import './AppointmentFormModal.css';

// Interfaz para la estructura de una cita (debe coincidir con el backend)
interface Appointment {
    id?: number; // Opcional para cuando se está creando una nueva cita
    user_id: number;
    animal_id: number | null;
    appointment_type: string; // Tipo de cita (ej. 'visita', 'entrevista')
    scheduled_time: string; // ISO string de la fecha y hora
    status: string; // 'pending', 'confirmed', 'canceled', 'completed', 'in review'
    notes?: string | null; // Notas adicionales sobre la cita
    created_at?: string; // Opcional
    updated_at?: string; // Opcional
}

// Interfaz para el animal (para el dropdown)
interface Animal {
    id: number;
    name: string;
}

// Interfaz para el usuario (para el dropdown)
interface User {
    id: number;
    email: string;
    name: string | null;
}

// Propiedades para el AppointmentFormModal
interface AppointmentFormModalProps {
    appointmentToEdit: Appointment | null; // La cita a editar (null si es para agregar)
    onClose: () => void; // Función para cerrar el modal
    onSuccess: () => void; // Función a llamar al éxito (para recargar lista)
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ appointmentToEdit, onClose, onSuccess }) => {
    // Inicializar estados con los datos de la cita a editar o valores por defecto
    const [userId, setUserId] = useState<number | ''>(appointmentToEdit?.user_id || '');
    const [animalId, setAnimalId] = useState<number | ''>(appointmentToEdit?.animal_id || '');
    const [appointmentType, setAppointmentType] = useState(appointmentToEdit?.appointment_type || 'visita'); // <-- NUEVO ESTADO
    const [scheduledTime, setScheduledTime] = useState(
        appointmentToEdit?.scheduled_time 
            ? new Date(appointmentToEdit.scheduled_time).toISOString().slice(0, 16) // Formato datetime-local
            : ''
    );
    const [status, setStatus] = useState(appointmentToEdit?.status || 'pendiente');
    const [notes, setNotes] = useState(appointmentToEdit?.notes || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [animals, setAnimals] = useState<Animal[]>([]); // Para el dropdown de animales
    const [users, setUsers] = useState<User[]>([]); // Para el dropdown de usuarios

    const token = localStorage.getItem('userToken');

    // Cargar listas de animales y usuarios al montar el componente
    useEffect(() => {
        const fetchDropdownData = async () => {
            if (!token) {
                setError("No autenticado. No se pueden cargar las listas. Por favor, inicia sesión como administrador.");
                return;
            }

            try {
                // Fetch animales
                const animalsRes = await fetch('http://localhost:5000/api/animals');
                if (animalsRes.ok) {
                    const animalsData: Animal[] = await animalsRes.json();
                    setAnimals(animalsData);
                } else {
                    console.error('Error al cargar animales para el dropdown:', animalsRes.statusText);
                    setError(prev => prev ? prev + "\n" + 'Error al cargar animales.' : 'Error al cargar animales.');
                }

                // Fetch usuarios
                const usersRes = await fetch('http://localhost:5000/api/users', {
                    headers: { 'Authorization': `Bearer ${token}` } // Necesitas token para usuarios
                });
                if (usersRes.ok) {
                    const usersData: User[] = await usersRes.json();
                    setUsers(usersData);
                } else {
                    const errorBody = await usersRes.json();
                    const errorMessage = errorBody.message || `Error ${usersRes.status}: No se pudieron cargar los usuarios.`;
                    console.error('Error al cargar usuarios para el dropdown:', errorMessage);
                    setError(prev => prev ? prev + "\n" + errorMessage : errorMessage);
                }

            } catch (err: unknown) {
                console.error("Error fetching dropdown data:", err);
                if (err instanceof Error) {
                    setError(prev => prev ? prev + "\n" + `Error al cargar datos para los selectores: ${err.message}` : `Error al cargar datos para los selectores: ${err.message}`);
                } else {
                    setError(prev => prev ? prev + "\n" + "Ocurrió un error desconocido al cargar los selectores." : "Ocurrió un error desconocido al cargar los selectores.");
                }
            }
        };
        fetchDropdownData();
    }, [token]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        // Validaciones
        if (!userId || !scheduledTime || !status || !appointmentType) { // <-- Validación de appointmentType añadida
            setError('Por favor, completa todos los campos obligatorios: Usuario, Fecha/Hora, Estado y Tipo de Cita.');
            setLoading(false);
            return;
        }

        const appointmentData: Partial<Appointment> = {
            user_id: Number(userId),
            animal_id: animalId ? Number(animalId) : null,
            appointment_type: appointmentType, // <-- NUEVO CAMPO EN EL PAYLOAD
            scheduled_time: new Date(scheduledTime).toISOString(), // Convertir a ISO string
            status: status,
            notes: notes || null,
        };

        const method = appointmentToEdit ? 'PUT' : 'POST';
        const url = appointmentToEdit ? `http://localhost:5000/api/appointments/${appointmentToEdit.id}` : 'http://localhost:5000/api/appointments';

        if (!token) {
            setError("Error: No estás autenticado.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || `Cita ${appointmentToEdit ? 'actualizada' : 'creada'} exitosamente.`);
                setTimeout(() => {
                    onSuccess(); // Cierra el modal y recarga la lista
                }, 1500); 
            } else {
                setError(data.message || `Error al ${appointmentToEdit ? 'actualizar' : 'crear'} la cita.`);
            }
        } catch (err: unknown) {
            console.error(`Error al ${appointmentToEdit ? 'actualizar' : 'crear'} cita:`, err);
            if (err instanceof Error) {
                setError(`No se pudo conectar con el servidor: ${err.message}.`);
            } else {
                setError("Ocurrió un error desconocido.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="appointment-form-modal-overlay">
            <div className="appointment-form-modal-content">
                <h2>{appointmentToEdit ? 'Editar Cita' : 'Programar Nueva Cita'}</h2>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="userId">Usuario:</label>
                        <select id="userId" value={userId} onChange={(e) => setUserId(Number(e.target.value))} required>
                            <option value="">Selecciona un usuario</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.email} ({user.name || 'Sin Nombre'})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="animalId">Animal (Opcional):</label>
                        <select id="animalId" value={animalId} onChange={(e) => setAnimalId(Number(e.target.value))}>
                            <option value="">Selecciona un animal (Opcional)</option>
                            {animals.map(animal => (
                                <option key={animal.id} value={animal.id}>{animal.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* NUEVO GRUPO DE FORMULARIO PARA TIPO DE CITA */}
                    <div className="form-group">
                        <label htmlFor="appointmentType">Tipo de Cita:</label>
                        <select id="appointmentType" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} required>
                            <option value="visita">Visita</option>
                            <option value="entrevista">Entrevista</option>
                            <option value="vacunacion">Vacunación</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="scheduledTime">Fecha y Hora:</label>
                        <input type="datetime-local" id="scheduledTime" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Estado:</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} required>
                            <option value="pendiente">Pendiente</option>
                            <option value="en revisión">En revisión</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="completada">Completada</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notas (Opcional):</label>
                        <textarea id="notes" value={notes || ''} onChange={(e) => setNotes(e.target.value)} rows={3}></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : (appointmentToEdit ? 'Actualizar Cita' : 'Programar Cita')}
                        </button>
                        <button type="button" onClick={onClose} disabled={loading} className="cancel-button">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentFormModal;
