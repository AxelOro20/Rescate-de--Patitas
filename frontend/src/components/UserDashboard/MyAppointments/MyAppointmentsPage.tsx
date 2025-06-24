import React, { useState, useEffect, useCallback } from 'react';
import './MyAppointmentsPage.css'; // Estilos específicos para esta página
import type { UserData } from '../../../types'; // Importa UserData desde la raíz de types

// Interfaz para la estructura de las citas (para el frontend)
interface Appointment {
    id: number;
    user_id: number;
    animal_id: number;
    animal_name?: string; // Para mostrar el nombre del animal
    user_name?: string; // Para mostrar el nombre del usuario (aunque aquí es el propio usuario)
    appointment_type: string;
    scheduled_time: string;
    notes?: string;
    status: string; // 'pendiente', 'confirmada', 'cancelada'
    created_at: string;
    updated_at: string;
}

// Interfaz para la estructura de los animales (para la selección en el formulario)
interface Animal {
    id: number;
    name: string;
    adoption_status: string; // ¡Añadida la propiedad adoption_status!
}

// Propiedades para el componente MyRequestsPage
interface MyAppointmentsPageProps {
    currentUser: UserData | null; // Necesitamos el ID del usuario actual
}

function MyAppointmentsPage({ currentUser }: MyAppointmentsPageProps) {
    const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [errorAppointments, setErrorAppointments] = useState<string | null>(null);

    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [availableAnimals, setAvailableAnimals] = useState<Animal[]>([]);
    const [loadingAnimals, setLoadingAnimals] = useState(true);
    const [errorAnimals, setErrorAnimals] = useState<string | null>(null);

    // Estados para el formulario de nueva cita
    const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
    const [appointmentType, setAppointmentType] = useState<string>(''); // 'visita', 'entrevista', 'vacunacion', 'otro'
    const [scheduledTime, setScheduledTime] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const token = localStorage.getItem('userToken');

    // Función para obtener todas las citas del usuario actual
    const fetchUserAppointments = useCallback(async () => {
        setLoadingAppointments(true);
        setErrorAppointments(null);
        if (!token || !currentUser?.id) {
            setErrorAppointments("No autorizado o ID de usuario no disponible. Por favor, inicia sesión.");
            setLoadingAppointments(false);
            return;
        }
        try {
            // Esta ruta GET está diseñada para devolver solo las citas del usuario logueado
            const response = await fetch('http://localhost:5000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Acceso denegado. No tienes permisos para ver tus citas.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Appointment[] = await response.json();
            setUserAppointments(data);

        } catch (err: unknown) {
            console.error("Error fetching user appointments:", err);
            if (err instanceof Error) {
                setErrorAppointments(`Error al cargar tus citas: ${err.message}`);
            } else {
                setErrorAppointments("Ocurrió un error desconocido al cargar tus citas.");
            }
        } finally {
            setLoadingAppointments(false);
        }
    }, [token, currentUser]);

    // Función para cargar los animales disponibles (para el formulario de nueva cita)
    const fetchAvailableAnimals = useCallback(async () => {
        setLoadingAnimals(true);
        setErrorAnimals(null);
        try {
            const response = await fetch('http://localhost:5000/api/animals');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Animal[] = await response.json();
            // Solo ofrecemos animales disponibles para citas de visita
            setAvailableAnimals(data.filter(animal => animal.adoption_status === 'disponible')); // Removido 'as any'
        } catch (err: unknown) {
            console.error("Error fetching animals for appointment form:", err);
            if (err instanceof Error) {
                setErrorAnimals(`No se pudieron cargar los animales para el formulario: ${err.message}.`);
            } else {
                setErrorAnimals("Ocurrió un error desconocido al cargar los animales.");
            }
        } finally {
            setLoadingAnimals(false);
        }
    }, []);

    // Cargar citas y animales al montar el componente
    useEffect(() => {
        fetchUserAppointments();
        fetchAvailableAnimals();
    }, [fetchUserAppointments, fetchAvailableAnimals]);

    // Manejador para añadir una nueva cita
    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        if (!token) {
            setFormError("No autorizado. Por favor, inicia sesión.");
            setFormLoading(false);
            return;
        }

        // Validación según el rol (como lo hace el backend)
        const finalAppointmentType = currentUser?.role === 'user' ? 'visita' : appointmentType;
        const finalAnimalId = currentUser?.role === 'user' ? (selectedAnimalId ? parseInt(selectedAnimalId) : null) : (selectedAnimalId ? parseInt(selectedAnimalId) : null);

        if (!finalAnimalId || !scheduledTime || !finalAppointmentType) {
            setFormError("Todos los campos obligatorios deben ser llenados.");
            setFormLoading(false);
            return;
        }

        // Si es usuario normal y el tipo no es 'visita', o no ha seleccionado animal para visita
        if (currentUser?.role === 'user' && (finalAppointmentType !== 'visita' || !selectedAnimalId)) {
            setFormError("Como usuario, solo puedes crear citas de tipo 'visita' y debes seleccionar un animal.");
            setFormLoading(false);
            return;
        }

        const payload = {
            animal_id: finalAnimalId,
            appointment_type: finalAppointmentType,
            scheduled_time: scheduledTime,
            notes: notes,
            // status no se envía, el backend lo establece a 'pendiente' para usuarios
            // user_id no se envía, el backend lo toma del token
        };

        try {
            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setFormSuccess(data.message || 'Cita creada exitosamente.');
                // Limpiar formulario y recargar citas
                setSelectedAnimalId('');
                setScheduledTime('');
                setAppointmentType('');
                setNotes('');
                fetchUserAppointments(); // Recargar la lista de citas
                setShowAppointmentForm(false); // Ocultar el formulario
            } else {
                setFormError(data.message || 'Error al crear la cita.');
            }
        } catch (err: unknown) {
            console.error('Error al crear cita:', err);
            if (err instanceof Error) {
                setFormError(`No se pudo conectar con el servidor para crear la cita: ${err.message}.`);
            } else {
                setFormError('Ocurrió un error desconocido al crear la cita.');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Manejador para cancelar una cita
    const handleCancelAppointment = async (appointmentId: number) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            return;
        }
        if (!token) {
            alert('No autorizado para cancelar citas. Por favor, inicia sesión.');
            return;
        }

        try {
            // Usa la ruta específica de cancelación para usuarios
            const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Cita cancelada exitosamente.');
                fetchUserAppointments(); // Recargar la lista de citas
            } else {
                alert(data.message || 'Error al cancelar la cita.');
            }
        } catch (err) {
            console.error('Error al cancelar cita:', err);
            alert('No se pudo conectar con el servidor para cancelar la cita.');
        }
    };

    if (!currentUser) {
        return (
            <div className="my-appointments-container not-authorized">
                <h2>Error de Autenticación</h2>
                <p>No se pudo cargar tu perfil. Por favor, inicia sesión nuevamente.</p>
            </div>
        );
    }

    return (
        <div className="my-appointments-container">
            <div className="my-appointments-header">
                <h2>Mis Citas</h2>
                <p>Aquí puedes gestionar tus citas programadas.</p>
                <button className="add-appointment-button" onClick={() => setShowAppointmentForm(!showAppointmentForm)}>
                    {showAppointmentForm ? 'Ocultar Formulario' : 'Programar Nueva Cita'}
                </button>
            </div>

            {/* Formulario para programar nueva cita */}
            {showAppointmentForm && (
                <div className="new-appointment-form-card">
                    <h3>Programar Nueva Cita</h3>
                    {formSuccess && <p className="success-message">{formSuccess}</p>}
                    {formError && <p className="error-message">{formError}</p>}
                    <form onSubmit={handleAddAppointment}>
                        <div className="form-group">
                            <label htmlFor="animal">Animal:</label>
                            {loadingAnimals ? (
                                <p className="loading-message">Cargando animales...</p>
                            ) : errorAnimals ? (
                                <p className="error-message-small">{errorAnimals}</p>
                            ) : availableAnimals.length > 0 ? (
                                <select
                                    id="animal"
                                    value={selectedAnimalId}
                                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona un animal</option>
                                    {availableAnimals.map(animal => (
                                        <option key={animal.id} value={animal.id}>
                                            {animal.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="no-animals-message-small">No hay animales disponibles para citas.</p>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="appointmentType">Tipo de Cita:</label>
                            {/* Los usuarios normales solo pueden crear citas de tipo 'visita' */}
                            {currentUser.role === 'user' ? (
                                <input
                                    type="text"
                                    id="appointmentType"
                                    value="visita"
                                    readOnly
                                    className="read-only-input" // Puedes añadir un estilo para campos de solo lectura
                                    required
                                />
                            ) : (
                                <select
                                    id="appointmentType"
                                    value={appointmentType}
                                    onChange={(e) => setAppointmentType(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona un tipo</option>
                                    <option value="visita">Visita</option>
                                    <option value="entrevista">Entrevista</option>
                                    <option value="vacunacion">Vacunación</option>
                                    <option value="otro">Otro</option>
                                </select>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="scheduledTime">Fecha y Hora:</label>
                            <input
                                type="datetime-local"
                                id="scheduledTime"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Notas (opcional):</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            ></textarea>
                        </div>
                        <button type="submit" disabled={formLoading}>
                            {formLoading ? 'Programando...' : 'Programar Cita'}
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de citas del usuario */}
            {loadingAppointments ? (
                <p className="loading-message">Cargando tus citas...</p>
            ) : errorAppointments ? (
                <p className="error-message">{errorAppointments}</p>
            ) : userAppointments.length === 0 ? (
                <p className="no-appointments-message">No tienes citas programadas aún.</p>
            ) : (
                <div className="appointments-grid">
                    {userAppointments.map(appointment => (
                        <div key={appointment.id} className="appointment-card">
                            <h4>Cita con {appointment.animal_name || `Animal ID: ${appointment.animal_id}`}</h4>
                            <p><strong>Tipo:</strong> {appointment.appointment_type}</p>
                            <p><strong>Fecha:</strong> {new Date(appointment.scheduled_time).toLocaleDateString()} a las {new Date(appointment.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Estado:</strong> <span className={`status-badge status-${appointment.status.replace(/\s/g, '-')}`}>{appointment.status}</span></p>
                            {appointment.notes && <p><strong>Notas:</strong> {appointment.notes}</p>}
                            <p><strong>ID Cita:</strong> {appointment.id}</p>
                            {/* Botón de cancelar */}
                            {['pendiente', 'confirmada', 'en revisión'].includes(appointment.status) && (
                                <button
                                    className="cancel-button"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    disabled={formLoading} // Deshabilitar si se está procesando otro formulario
                                >
                                    Cancelar Cita
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyAppointmentsPage;
