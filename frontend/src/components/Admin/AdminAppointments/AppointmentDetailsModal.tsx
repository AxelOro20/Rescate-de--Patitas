import React from 'react'; // Asegúrate de importar React
import './AppointmentDetailsModal.css'; // Estilos para el modal

// Interfaz para la estructura de una cita (debe coincidir con AdminAppointmentsPage.tsx)
interface Appointment {
    id: number;
    user_id: number;
    animal_id: number | null;
    appointment_type: string;
    scheduled_time: string; // ISO string de la fecha y hora
    status: string; // 'pendiente', 'confirmada', 'cancelada', 'completada', 'en revisión'
    notes?: string | null; // <-- CORREGIDO: Ahora admite string o null
    created_at: string;
    updated_at: string;
    user_email?: string; // Adjuntado desde el backend
    animal_name?: string; // Adjuntado desde el backend
}

// Propiedades para el modal de detalles de la cita
interface AppointmentDetailsModalProps {
    appointment: Appointment; // La cita a mostrar
    onClose: () => void; // Función para cerrar el modal
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ appointment, onClose }) => {
    return (
        <div className="appointment-details-modal-overlay">
            <div className="appointment-details-modal-content">
                <h2>Detalles de la Cita</h2>
                <div className="details-grid">
                    <div className="detail-item">
                        <strong>ID Cita:</strong>
                        <span>{appointment.id}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Usuario:</strong>
                        <span>{appointment.user_email || `ID: ${appointment.user_id}`}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Animal:</strong>
                        <span>{appointment.animal_name || `ID: ${appointment.animal_id || 'N/A'}`}</span>
                    </div>
                    {appointment.animal_id && (
                        <div className="detail-item">
                            <strong>ID de Animal:</strong>
                            <span>{appointment.animal_id}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <strong>Tipo de Cita:</strong>
                        <span>{appointment.appointment_type}</span>
                    </div>
                    <div className="detail-item full-width">
                        <strong>Fecha y Hora Programada:</strong>
                        <span>{new Date(appointment.scheduled_time).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Estado:</strong>
                        <span>
                            <span className={`status-badge status-${appointment.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                {appointment.status}
                            </span>
                        </span>
                    </div>
                    <div className="detail-item">
                        <strong>Fecha de Creación:</strong>
                        <span>{new Date(appointment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Última Actualización:</strong>
                        <span>{new Date(appointment.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item full-width">
                        <strong>Notas:</strong>
                        {/* Asegura que el valor de notes sea tratado como string o vacío si es null */}
                        <p>{appointment.notes || 'No hay notas.'}</p>
                    </div>
                </div>
                <button className="close-button" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;
