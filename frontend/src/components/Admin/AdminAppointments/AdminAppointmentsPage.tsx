import React, { useState, useEffect, useCallback } from 'react';
import './AdminAppointmentsPage.css'; // Asegúrate de que esta ruta sea correcta
import type { UserData } from '../../../types'; // Ruta relativa correcta para types

// Interfaz para la estructura de la cita
interface Appointment {
    id: number;
    user_id: number | null;
    animal_id: number;
    animal_name?: string; // Nombre del animal (obtenido con JOIN o fetch adicional)
    user_email?: string; // Email del usuario (obtenido con JOIN o fetch adicional)
    user_name?: string; // Nombre del usuario (obtenido con JOIN o fetch adicional)
    appointment_type: string;
    scheduled_time: string;
    notes?: string;
    status: string; // 'pendiente', 'confirmada', 'rechazada', 'cancelada', 'completada', 'en revisión'
    created_at: string;
    updated_at: string;
}

// Interfaz para la estructura del animal (necesaria para el modal de creación)
interface Animal {
    id: number;
    name: string;
    adoption_status: string; // Para filtrar animales disponibles
}

// Interfaz para el modal de formulario de citas (nuevo componente)
interface AppointmentFormModalProps {
    appointmentToEdit: Appointment | null; // Cita a editar (null para crear)
    onClose: () => void; // Para cerrar el modal
    onSuccess: () => void; // Para recargar la lista de citas tras éxito
    availableAnimals: Animal[]; // Animales disponibles para seleccionar
    // Removido currentUser de aquí, ya no se usa directamente en el modal
    loadingAnimals: boolean; // <-- Añadido: para mostrar estado de carga de animales en el modal
    errorAnimals: string | null; // <-- Añadido: para mostrar errores de carga de animales en el modal
}

// ** Nuevo Componente: AppointmentFormModal **
const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ 
    appointmentToEdit, 
    onClose, 
    onSuccess, 
    availableAnimals,
    loadingAnimals, // <-- Recibiendo la prop
    errorAnimals // <-- Recibiendo la prop
}) => {
    const [userId, setUserId] = useState<string>(appointmentToEdit?.user_id?.toString() || '');
    const [animalId, setAnimalId] = useState<string>(appointmentToEdit?.animal_id?.toString() || '');
    const [appointmentType, setAppointmentType] = useState<string>(appointmentToEdit?.appointment_type || 'visita');
    const [scheduledTime, setScheduledTime] = useState<string>(
        appointmentToEdit ? new Date(appointmentToEdit.scheduled_time).toISOString().slice(0, 16) : ''
    );
    const [notes, setNotes] = useState<string>(appointmentToEdit?.notes || '');
    const [status, setStatus] = useState<string>(appointmentToEdit?.status || 'pendiente');

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

    const token = localStorage.getItem('userToken');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccessMessage(null);

        if (!token) {
            setFormError("No autorizado. Por favor, inicia sesión.");
            setFormLoading(false);
            return;
        }

        // Validar si el ID de animal es un número válido (no vacío)
        if (!animalId || isNaN(parseInt(animalId))) {
            setFormError("Debes seleccionar un animal válido.");
            setFormLoading(false);
            return;
        }
        // Validar si la fecha/hora está seleccionada
        if (!scheduledTime) {
            setFormError("Debes seleccionar una fecha y hora para la cita.");
            setFormLoading(false);
            return;
        }

        const payload = {
            user_id: userId ? parseInt(userId) : null, // Puede ser null si el admin lo crea sin user_id (raro pero posible)
            animal_id: parseInt(animalId),
            appointment_type: appointmentType,
            scheduled_time: scheduledTime,
            notes: notes,
            status: status
        };

        const method = appointmentToEdit ? 'PUT' : 'POST';
        const url = appointmentToEdit ? `http://localhost:5000/api/appointments/${appointmentToEdit.id}` : 'http://localhost:5000/api/appointments';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setFormSuccessMessage(data.message || 'Cita guardada exitosamente.');
                setTimeout(() => {
                    onSuccess(); // Cierra el modal y recarga la lista
                    onClose(); // Cierra el modal
                }, 1500);
            } else {
                setFormError(data.message || `Error al ${appointmentToEdit ? 'actualizar' : 'crear'} la cita.`);
            }
        } catch (err: unknown) {
            console.error(`Error al ${appointmentToEdit ? 'actualizar' : 'crear'} cita:`, err);
            if (err instanceof Error) {
                setFormError(`No se pudo conectar con el servidor: ${err.message}.`);
            } else {
                setFormError("Ocurrió un error desconocido.");
            }
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="appointment-form-modal-overlay">
            <div className="appointment-form-modal-content">
                <h3>{appointmentToEdit ? 'Editar Cita' : 'Programar Nueva Cita'}</h3>
                {formSuccessMessage && <p className="success-message">{formSuccessMessage}</p>}
                {formError && <p className="error-message">{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="userId">ID de Usuario (opcional):</label>
                        <input
                            type="number"
                            id="userId"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="Dejar vacío si es para un invitado"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="animalId">Animal:</label>
                        {loadingAnimals ? ( // <-- Usando la prop loadingAnimals
                            <p className="loading-message-small">Cargando animales...</p>
                        ) : errorAnimals ? ( // <-- Usando la prop errorAnimals
                            <p className="error-message-small">{errorAnimals}</p>
                        ) : availableAnimals.length > 0 ? (
                            <select
                                id="animalId"
                                value={animalId}
                                onChange={(e) => setAnimalId(e.target.value)}
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
                            <p className="no-data-message-small">No hay animales disponibles para seleccionar.</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="appointmentType">Tipo de Cita:</label>
                        <select
                            id="appointmentType"
                            value={appointmentType}
                            onChange={(e) => setAppointmentType(e.target.value)}
                            required
                        >
                            <option value="visita">Visita</option>
                            <option value="entrevista">Entrevista</option>
                            <option value="vacunacion">Vacunación</option>
                            <option value="otro">Otro</option>
                        </select>
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
                        <label htmlFor="notes">Notas:</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Estado:</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="en revisión">En Revisión</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="rechazada">Rechazada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="completada">Completada</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" disabled={formLoading}>
                            {formLoading ? 'Guardando...' : (appointmentToEdit ? 'Actualizar Cita' : 'Programar Cita')}
                        </button>
                        <button type="button" onClick={onClose} disabled={formLoading} className="cancel-button">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Props para el componente principal AdminAppointmentsPage
interface AdminAppointmentsPageProps {
    currentUser: UserData | null;
}

function AdminAppointmentsPage({ currentUser }: AdminAppointmentsPageProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [availableAnimals, setAvailableAnimals] = useState<Animal[]>([]);
    const [loadingAnimals, setLoadingAnimals] = useState(true); // Se mantiene aquí para el fetch
    const [errorAnimals, setErrorAnimals] = useState<string | null>(null); // Se mantiene aquí para el fetch


    const token = localStorage.getItem('userToken');

    // Función para obtener todas las citas (para administradores)
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token || currentUser?.role !== 'admin') {
            setError("No autorizado. Solo los administradores pueden gestionar citas.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data: Appointment[] = await response.json();
            setAppointments(data);
        } catch (err: unknown) {
            console.error('Error al obtener citas para admin:', err);
            if (err instanceof Error) {
                setError(`Error al cargar citas: ${err.message}`);
            } else {
                setError("Ocurrió un error desconocido al cargar citas.");
            }
        } finally {
            setLoading(false);
        }
    }, [token, currentUser]);

    // Función para cargar los animales disponibles (para el modal de cita)
    const fetchAvailableAnimals = useCallback(async () => {
        setLoadingAnimals(true); // <-- Usado aquí
        setErrorAnimals(null);   // <-- Usado aquí
        try {
            const response = await fetch('http://localhost:5000/api/animals');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Animal[] = await response.json();
            // Los administradores pueden crear citas para cualquier animal, no solo 'disponible'
            setAvailableAnimals(data); 
        } catch (err: unknown) {
            console.error("Error fetching animals for appointment form:", err);
            if (err instanceof Error) {
                setErrorAnimals(`No se pudieron cargar los animales para el formulario: ${err.message}.`); // <-- Usado aquí
            } else {
                setErrorAnimals("Ocurrió un error desconocido al cargar los animales."); // <-- Usado aquí
            }
        } finally {
            setLoadingAnimals(false); // <-- Usado aquí
        }
    }, []);


    useEffect(() => {
        fetchAppointments();
        fetchAvailableAnimals();
    }, [fetchAppointments, fetchAvailableAnimals]);

    // Manejador para abrir el modal de añadir
    const handleAddAppointmentClick = () => {
        setEditingAppointment(null);
        setShowAppointmentModal(true);
    };

    // Manejador para abrir el modal de editar
    const handleEditAppointmentClick = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setShowAppointmentModal(true);
    };

    // Manejador para eliminar una cita
    const handleDeleteAppointment = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción es irreversible.')) {
            return;
        }
        if (!token) {
            setError('No autorizado para eliminar citas.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Cita eliminada exitosamente.');
                fetchAppointments(); // Recarga la lista
            } else {
                alert(data.message || 'Error al eliminar la cita.');
            }
        } catch (err) {
            console.error('Error al eliminar cita:', err);
            alert('No se pudo conectar con el servidor para eliminar la cita.');
        }
    };

    // Filtrar y buscar citas
    const filteredAppointments = appointments.filter(appointment => {
        const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
        const matchesSearch = 
            appointment.animal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.appointment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.id.toString().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (currentUser?.role !== 'admin') {
        return (
            <div className="admin-appointments-page not-authorized">
                <h2>Acceso Denegado</h2>
                <p>Solo los administradores pueden gestionar citas.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-appointments-page">
                <p className="loading-message">Cargando citas...</p>
            </div>
        );
    }

    return (
        <div className="admin-appointments-page">
            <div className="admin-appointments-header">
                <h2>Gestión de Citas</h2>
                <p>Aquí puedes gestionar todas las citas programadas.</p>
                <button className="add-appointment-button" onClick={handleAddAppointmentClick}>
                    Programar Nueva Cita
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="appointments-controls">
                <div className="filter-group">
                    <label htmlFor="filterStatus">Filtrar por Estado:</label>
                    <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en revisión">En Revisión</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="completada">Completada</option>
                    </select>
                </div>
                <div className="search-group">
                    <label htmlFor="searchTerm">Buscar:</label>
                    <input
                        type="text"
                        id="searchTerm"
                        placeholder="Buscar por animal, usuario, tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredAppointments.length === 0 ? (
                <p className="no-appointments-message">No se encontraron citas con los filtros aplicados.</p>
            ) : (
                <div className="appointments-table-container">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>ID Cita</th>
                                <th>Animal</th>
                                <th>Usuario (Email)</th>
                                <th>Tipo</th>
                                <th>Fecha y Hora</th>
                                <th>Estado</th>
                                <th>Notas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map(appointment => (
                                <tr key={appointment.id}>
                                    <td>{appointment.id}</td>
                                    <td>{appointment.animal_name || `ID: ${appointment.animal_id}`}</td>
                                    <td>{appointment.user_email || appointment.user_name || `ID: ${appointment.user_id || 'N/A'}`}</td>
                                    <td>{appointment.appointment_type}</td>
                                    <td>{new Date(appointment.scheduled_time).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge status-${appointment.status.replace(/\s/g, '-')}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td>{appointment.notes?.substring(0, 50)}...</td>
                                    <td>
                                        <div className="appointment-actions">
                                            <button className="action-button edit-button" onClick={() => handleEditAppointmentClick(appointment)}>
                                                Editar
                                            </button>
                                            <button className="action-button delete-button" onClick={() => handleDeleteAppointment(appointment.id)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para añadir/editar cita */}
            {showAppointmentModal && currentUser && ( // Aseguramos que currentUser no sea null
                <AppointmentFormModal
                    appointmentToEdit={editingAppointment}
                    onClose={() => setShowAppointmentModal(false)}
                    onSuccess={fetchAppointments} // Recargar citas cuando el modal se cierra con éxito
                    availableAnimals={availableAnimals}
                    loadingAnimals={loadingAnimals} // <-- Pasando la prop
                    errorAnimals={errorAnimals}   // <-- Pasando la prop
                    // Removido currentUser del modal
                />
            )}
        </div>
    );
}

export default AdminAppointmentsPage;
