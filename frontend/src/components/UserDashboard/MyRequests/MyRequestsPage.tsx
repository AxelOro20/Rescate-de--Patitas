import React, { useState, useEffect } from 'react';
import './MyRequestsPage.css'; // Estilos específicos para esta página
import type { UserData } from '../../../types'; // Importa UserData desde la raíz de types

// Interfaz para la estructura de las solicitudes de adopción (para el frontend)
interface AdoptionRequest {
    id: number;
    user_id: number;
    animal_id: number;
    animal_name?: string; // Para mostrar el nombre del animal
    motivation: string;
    status: string;
    created_at: string;
    updated_at: string;
    // applicant_name y applicant_email no son estrictamente necesarios aquí ya que estamos en el dashboard del usuario.
}

// Propiedades para el componente MyRequestsPage
interface MyRequestsPageProps {
    currentUser: UserData | null; // Necesitamos el ID del usuario actual
}

function MyRequestsPage({ currentUser }: MyRequestsPageProps) {
    const [userRequests, setUserRequests] = useState<AdoptionRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [errorRequests, setErrorRequests] = useState<string | null>(null);

    const token = localStorage.getItem('userToken');

    // Función para cargar las solicitudes de adopción del usuario
    const fetchUserRequests = React.useCallback(async () => {
        setLoadingRequests(true);
        setErrorRequests(null);
        if (!token || !currentUser?.id) {
            setErrorRequests("No autorizado o ID de usuario no disponible. Por favor, inicia sesión.");
            setLoadingRequests(false);
            return;
        }
        try {
            // El endpoint GET /api/adoptions/ debería devolver solo las solicitudes del usuario logueado
            // si el middleware authenticateToken está en el backend.
            const response = await fetch('http://localhost:5000/api/adoptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Acceso denegado. No tienes permisos para ver tus solicitudes.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: AdoptionRequest[] = await response.json();

            // Para cada solicitud, obtenemos el nombre del animal para mostrarlo
            const requestsWithAnimalNames = await Promise.all(data.map(async (req) => {
                try {
                    const animalRes = await fetch(`http://localhost:5000/api/animals/${req.animal_id}`);
                    const animalData = await animalRes.json();
                    return { ...req, animal_name: animalData.name || 'Desconocido' };
                } catch (animalErr) {
                    console.warn(`No se pudo cargar el animal con ID ${req.animal_id}:`, animalErr);
                    return { ...req, animal_name: 'Error al cargar' };
                }
            }));
            // Filtrar solo las solicitudes del currentUser si el backend devuelve todas (esto es una capa de seguridad extra)
            const filteredRequests = requestsWithAnimalNames.filter(req => req.user_id === currentUser.id);
            setUserRequests(filteredRequests);

        } catch (err: unknown) {
            console.error("Error fetching user requests:", err);
            if (err instanceof Error) {
                setErrorRequests(`Error al cargar tus solicitudes: ${err.message}`);
            } else {
                setErrorRequests("Ocurrió un error desconocido al cargar tus solicitudes.");
            }
        } finally {
            setLoadingRequests(false);
        }
    }, [token, currentUser]); // Dependencias: token y currentUser

    // Cargar las solicitudes cuando el componente se monte o el token/currentUser cambie
    useEffect(() => {
        fetchUserRequests();
    }, [fetchUserRequests]); // fetchUserRequests ya es useCallback, por lo que solo cambia si sus dependencias cambian.

    if (!currentUser) {
        return (
            <div className="my-requests-container not-authorized">
                <h2>Error de Autenticación</h2>
                <p>No se pudo cargar tu perfil. Por favor, inicia sesión nuevamente.</p>
            </div>
        );
    }

    return (
        <div className="my-requests-container">
            <div className="my-requests-header">
                <h2>Mis Solicitudes de Adopción</h2>
                <p>Aquí puedes ver el estado de todas las solicitudes de adopción que has enviado.</p>
            </div>

            {loadingRequests ? (
                <p className="loading-message">Cargando tus solicitudes...</p>
            ) : errorRequests ? (
                <p className="error-message">{errorRequests}</p>
            ) : userRequests.length === 0 ? (
                <p className="no-requests-message">No has enviado ninguna solicitud de adopción aún.</p>
            ) : (
                <div className="requests-grid">
                    {userRequests.map(req => (
                        <div key={req.id} className="request-card">
                            <h4>Solicitud para {req.animal_name || 'Animal Desconocido'}</h4>
                            <p><strong>ID Solicitud:</strong> {req.id}</p>
                            <p><strong>Estado:</strong> <span className={`status-badge status-${req.status.replace(/\s/g, '-')}`}>{req.status}</span></p>
                            <p className="motivation-preview">
                                <strong>Motivación:</strong> {req.motivation.substring(0, 100)}{req.motivation.length > 100 ? '...' : ''}
                            </p>
                            <p><strong>Fecha de Envío:</strong> {new Date(req.created_at).toLocaleDateString()}</p>
                            {/* Un botón opcional para ver detalles completos en un modal, si lo implementas */}
                            {/* <button className="view-details-button">Ver Detalles</button> */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyRequestsPage;
