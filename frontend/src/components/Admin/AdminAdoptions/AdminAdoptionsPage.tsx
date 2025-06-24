import { useState, useEffect, useCallback } from 'react';
import './AdminAdoptionsPage.css';
import type { UserData } from '../../../types';

// Interfaz para una solicitud de adopción (completa)
interface AdoptionRequest {
    id: number;
    user_id: number | null;
    animal_id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string;
    applicant_address: string;
    motivation: string;
    status: string; // 'pendiente', 'en revisión', 'aprobada', 'rechazada'
    created_at: string;
    updated_at: string;
    animal_name?: string; // Para mostrar en la tabla
    user_email?: string; // Para mostrar en la tabla
}

// Props para el componente AdminAdoptionsPage
interface AdminAdoptionsPageProps {
    currentUser: UserData | null;
}

function AdminAdoptionsPage({ currentUser }: AdminAdoptionsPageProps) {
    const [adoptions, setAdoptions] = useState<AdoptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const token = localStorage.getItem('userToken');

    // Función para obtener todas las solicitudes de adopción
    const fetchAdoptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token || currentUser?.role !== 'admin') {
            setError("No autorizado. Solo los administradores pueden gestionar solicitudes de adopción.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/adoptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data: AdoptionRequest[] = await response.json();

            // Enriquecer solicitudes con nombres de animales y emails de usuarios
            const enrichedAdoptions = await Promise.all(data.map(async (req) => {
                let animalName = 'Desconocido';
                let userEmail = 'Anónimo';

                try {
                    const animalRes = await fetch(`http://localhost:5000/api/animals/${req.animal_id}`);
                    const animalData = await animalRes.json();
                    animalName = animalData.name || 'Desconocido';
                } catch (animalErr) {
                    console.warn(`No se pudo cargar el animal con ID ${req.animal_id}:`, animalErr);
                    animalName = 'Error al cargar animal';
                }

                if (req.user_id) {
                    try {
                        const userRes = await fetch(`http://localhost:5000/api/users/${req.user_id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (userRes.ok) {
                            const userData = await userRes.json();
                            userEmail = userData.email || 'Desconocido';
                        } else {
                            userEmail = 'Usuario no encontrado';
                        }
                    } catch (userErr) {
                        console.warn(`No se pudo cargar el usuario con ID ${req.user_id}:`, userErr);
                        userEmail = 'Error al cargar usuario';
                    }
                } else {
                    userEmail = req.applicant_email || 'Anónimo'; // Usar email del formulario si no hay user_id
                }

                return { ...req, animal_name: animalName, user_email: userEmail };
            }));

            setAdoptions(enrichedAdoptions);
        } catch (err: unknown) {
            console.error('Error al obtener solicitudes de adopción para admin:', err);
            if (err instanceof Error) {
                setError(`Error al cargar solicitudes: ${err.message}`);
            } else {
                setError("Ocurrió un error desconocido al cargar solicitudes.");
            }
        } finally {
            setLoading(false);
        }
    }, [token, currentUser]);

    useEffect(() => {
        fetchAdoptions();
    }, [fetchAdoptions]);

    // Manejador para actualizar el estado de una solicitud
    const handleUpdateStatus = async (requestId: number, newStatus: string) => {
        if (!window.confirm(`¿Estás seguro de que deseas cambiar el estado a "${newStatus}" para la solicitud ID ${requestId}?`)) {
            return;
        }
        if (!token) {
            setError("No autenticado para actualizar solicitudes.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/adoptions/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || `Estado de la solicitud ID ${requestId} actualizado a "${newStatus}" exitosamente.`);
                fetchAdoptions(); // Recargar la lista
            } else {
                setError(data.message || 'Error al actualizar el estado de la solicitud.');
            }
        } catch (err) {
            console.error('Error al actualizar estado de solicitud:', err);
            setError('No se pudo conectar con el servidor para actualizar el estado.');
        }
    };

    // Manejador para eliminar una solicitud
    const handleDeleteRequest = async (requestId: number) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar la solicitud ID ${requestId}? Esta acción es irreversible.`)) {
            return;
        }
        if (!token) {
            setError("No autenticado para eliminar solicitudes.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/adoptions/${requestId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || `Solicitud ID ${requestId} eliminada exitosamente.`);
                fetchAdoptions(); // Recargar la lista
            } else {
                setError(data.message || 'Error al eliminar la solicitud.');
            }
        } catch (err) {
            console.error('Error al eliminar solicitud:', err);
            setError('No se pudo conectar con el servidor para eliminar la solicitud.');
        }
    };


    // Filtrar y buscar solicitudes
    const filteredAdoptions = adoptions.filter(req => {
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        const matchesSearch = req.animal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              req.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              req.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              req.motivation.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });


    if (currentUser?.role !== 'admin') {
        return (
            <div className="admin-adoptions-container not-authorized">
                <h2>Acceso Denegado</h2>
                <p>Solo los administradores pueden gestionar solicitudes de adopción.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-adoptions-container">
                <p className="loading-message">Cargando solicitudes de adopción...</p>
            </div>
        );
    }

    return (
        <div className="admin-adoptions-container">
            <div className="admin-adoptions-header">
                <h2>Gestión de Solicitudes de Adopción</h2>
                <p>Aquí puedes revisar y gestionar todas las solicitudes de adopción.</p>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="filters-and-search">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en revisión">En Revisión</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                </select>
                <input
                    type="text"
                    placeholder="Buscar por animal, solicitante, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredAdoptions.length === 0 ? (
                <p className="no-adoptions-message">No se encontraron solicitudes con los filtros aplicados.</p>
            ) : (
                <div className="adoptions-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID Solicitud</th>
                                <th>Animal</th>
                                <th>Solicitante</th>
                                <th>Email/Teléfono</th>
                                <th>Motivación (Preview)</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdoptions.map(req => (
                                <tr key={req.id}>
                                    <td>{req.id}</td>
                                    <td>{req.animal_name || 'N/A'}</td>
                                    <td>{req.applicant_name || req.user_email || 'N/A'}</td>
                                    <td>{req.applicant_email || 'N/A'}<br/>{req.applicant_phone || 'N/A'}</td>
                                    <td>{req.motivation.substring(0, 50)}...</td>
                                    <td>
                                        <span className={`status-badge status-${req.status.replace(/\s/g, '-')}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {req.status === 'pendiente' && (
                                                <button className="action-button approve-button" onClick={() => handleUpdateStatus(req.id, 'en revisión')}>
                                                    Poner en Revisión
                                                </button>
                                            )}
                                            {req.status === 'en revisión' && (
                                                <button className="action-button approve-button" onClick={() => handleUpdateStatus(req.id, 'aprobada')}>
                                                    Aprobar
                                                </button>
                                            )}
                                            {(req.status === 'pendiente' || req.status === 'en revisión') && (
                                                <button className="action-button reject-button" onClick={() => handleUpdateStatus(req.id, 'rechazada')}>
                                                    Rechazar
                                                </button>
                                            )}
                                            <button className="action-button delete-button" onClick={() => handleDeleteRequest(req.id)}>
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
        </div>
    );
}

export default AdminAdoptionsPage;
