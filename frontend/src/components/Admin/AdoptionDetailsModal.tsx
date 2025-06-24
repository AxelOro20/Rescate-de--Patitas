import './AdoptionDetailsModal.css'; // Estilos para el modal

// Interfaz para la estructura de las solicitudes de adopción (debe coincidir con AdminPanelPage.tsx)
interface AdoptionRequest {
    id: number;
    user_id: number | null;
    animal_id: number;
    animal_name?: string; // Nombre del animal, ya cargado en AdminPanelPage
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string;
    applicant_address: string;
    motivation: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// Propiedades para el AdoptionDetailsModal
interface AdoptionDetailsModalProps {
    request: AdoptionRequest; // La solicitud de adopción a mostrar
    onClose: () => void; // Función para cerrar el modal
}

function AdoptionDetailsModal({ request, onClose }: AdoptionDetailsModalProps) {
    return (
        <div className="adoption-details-modal-overlay">
            <div className="adoption-details-modal-content">
                <h2>Detalles de la Solicitud de Adopción</h2>
                <div className="details-grid">
                    <div className="detail-item">
                        <strong>ID Solicitud:</strong>
                        <span>{request.id}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Animal Solicitado:</strong>
                        <span>{request.animal_name || `ID: ${request.animal_id}`}</span>
                    </div>
                    <div className="detail-item">
                        <strong>ID de Animal:</strong>
                        <span>{request.animal_id}</span>
                    </div>
                    {request.user_id && (
                        <div className="detail-item">
                            <strong>ID de Usuario Registrado:</strong>
                            <span>{request.user_id}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <strong>Nombre del Solicitante:</strong>
                        <span>{request.applicant_name}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Email del Solicitante:</strong>
                        <span>{request.applicant_email}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Teléfono del Solicitante:</strong>
                        <span>{request.applicant_phone}</span>
                    </div>
                    <div className="detail-item full-width">
                        <strong>Dirección del Solicitante:</strong>
                        <span>{request.applicant_address}</span>
                    </div>
                    <div className="detail-item full-width">
                        <strong>Motivación:</strong>
                        <p>{request.motivation}</p>
                    </div>
                    <div className="detail-item">
                        <strong>Estado:</strong>
                        <span>{request.status}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Fecha de Creación:</strong>
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Última Actualización:</strong>
                        <span>{new Date(request.updated_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <button className="close-button" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
}

export default AdoptionDetailsModal;
