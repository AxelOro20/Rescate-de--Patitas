import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './AdminPanelPage.css';
import type { UserData } from '../../types';

// Importa los sub-componentes del panel de administración
import AdminUsersPage from './AdminUsers/AdminUsersPage';
import AdminAnimalsPage from './AdminAnimals/AdminAnimalsPage';
import AdminAdoptionsPage from './AdminAdoptions/AdminAdoptionsPage';
import AdminAppointmentsPage from './AdminAppointments/AdminAppointmentsPage';

// Interfaz para un animal (simplificada para este overview)
interface Animal {
    id: number;
    name: string;
    image_urls?: string[];
    adoption_status?: string; 
    is_featured?: boolean; 
}

// Interfaz para una solicitud de adopción (simplificada para el overview)
interface AdoptionRequest {
    id: number;
    animal_name?: string;
    status: string;
    created_at: string;
    animal_id: number; 
}

// Interfaz para una cita (simplificada para el overview)
interface Appointment {
    id: number;
    animal_name?: string;
    user_email?: string;
    scheduled_time: string;
    status: string;
    user_id: number; 
    animal_id: number | null; 
}

// Nuevo componente para la vista general del dashboard
interface AdminDashboardOverviewProps {
    token: string | null;
    currentUser: UserData | null;
    onViewAllAnimals: () => void; 
    onViewAllAdoptions: () => void; 
    onViewAllAppointments: () => void; 
}

const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ token, currentUser, onViewAllAnimals, onViewAllAdoptions, onViewAllAppointments }) => {
    const [pendingAdoptions, setPendingAdoptions] = useState<AdoptionRequest[]>([]);
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    const [featuredAnimals, setFeaturedAnimals] = useState<Animal[]>([]);
    const [loadingOverview, setLoadingOverview] = useState(true);
    const [errorOverview, setErrorOverview] = useState<string | null>(null);

    // Función para obtener los datos de resumen del dashboard
    const fetchOverviewData = useCallback(async () => {
        setLoadingOverview(true);
        setErrorOverview(null);

        if (!token || currentUser?.role !== 'admin') {
            setErrorOverview("No autorizado para ver el resumen del dashboard.");
            setLoadingOverview(false);
            return;
        }

        try {
            // Fetch Solicitudes Pendientes
            const adoptionsRes = await fetch('http://localhost:5000/api/adoptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // --- INICIO DE CORRECCIÓN: Verificar response.ok ---
            if (!adoptionsRes.ok) {
                const errorData = await adoptionsRes.json();
                throw new Error(errorData.message || `Error ${adoptionsRes.status}: No se pudieron cargar las solicitudes de adopción.`);
            }
            const adoptionsData: AdoptionRequest[] = await adoptionsRes.json();
            const pendingAdoptionsFiltered = adoptionsData.filter(req => req.status === 'pendiente').slice(0, 5); 
            // --- FIN DE CORRECCIÓN ---
            
            // Obtener nombres de animales para solicitudes
            const adoptionsWithAnimalNames = await Promise.all(pendingAdoptionsFiltered.map(async (req) => {
                try {
                    const animalRes = await fetch(`http://localhost:5000/api/animals/${req.animal_id}`);
                    if (!animalRes.ok) { // También verifica la respuesta del animal
                        throw new Error(`Error ${animalRes.status} al cargar animal: ${req.animal_id}`);
                    }
                    const animalData = await animalRes.json();
                    return { ...req, animal_name: animalData.name || 'Desconocido' };
                } catch (err) {
                    console.warn('Error fetching animal name for adoption:', err);
                    return { ...req, animal_name: 'Error' };
                }
            }));
            setPendingAdoptions(adoptionsWithAnimalNames);

            // Fetch Citas Pendientes/Por Confirmar
            const appointmentsRes = await fetch('http://localhost:5000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // --- INICIO DE CORRECCIÓN: Verificar response.ok ---
            if (!appointmentsRes.ok) {
                const errorData = await appointmentsRes.json();
                throw new Error(errorData.message || `Error ${appointmentsRes.status}: No se pudieron cargar las citas.`);
            }
            const appointmentsData: Appointment[] = await appointmentsRes.json();
            const pendingAppointmentsFiltered = appointmentsData.filter(
                appt => appt.status === 'pendiente' || appt.status === 'en revisión'
            ).slice(0, 5); 
            // --- FIN DE CORRECCIÓN ---

            // Obtener nombres de animales y emails de usuarios para citas
            const appointmentsEnriched = await Promise.all(pendingAppointmentsFiltered.map(async (appt) => {
                let animalName = 'N/A';
                let userEmail = 'Desconocido';

                if (appt.animal_id) {
                    try {
                        const animalRes = await fetch(`http://localhost:5000/api/animals/${appt.animal_id}`);
                        if (!animalRes.ok) { // También verifica la respuesta del animal
                            throw new Error(`Error ${animalRes.status} al cargar animal para cita: ${appt.animal_id}`);
                        }
                        const animalData = await animalRes.json();
                        animalName = animalData.name || 'Desconocido';
                    } catch (animalErr) {
                        console.warn(`No se pudo cargar el animal con ID ${appt.animal_id}:`, animalErr);
                        animalName = 'Error';
                    }
                }
                try {
                    const userRes = await fetch(`http://localhost:5000/api/users/${appt.user_id}`, { 
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!userRes.ok) { // También verifica la respuesta del usuario
                        throw new Error(`Error ${userRes.status} al cargar usuario: ${appt.user_id}`);
                    }
                    const userData = await userRes.json();
                    userEmail = userData.email || 'Desconocido';
                } catch (userErr) {
                    console.warn(`No se pudo cargar el usuario con ID ${appt.user_id}:`, userErr);
                    userEmail = 'Error';
                }
                return { ...appt, animal_name: animalName, user_email: userEmail };
            }));
            setPendingAppointments(appointmentsEnriched);


            // Fetch Animales Destacados
            const animalsRes = await fetch('http://localhost:5000/api/animals'); // No se envía token aquí, asume ruta pública
            // --- INICIO DE CORRECCIÓN: Verificar response.ok ---
            if (!animalsRes.ok) {
                const errorData = await animalsRes.json();
                throw new Error(errorData.message || `Error ${animalsRes.status}: No se pudieron cargar los animales destacados.`);
            }
            const animalsData: Animal[] = await animalsRes.json(); 
            setFeaturedAnimals(animalsData.filter((animal: Animal) => animal.is_featured === true).slice(0, 3)); 
            // --- FIN DE CORRECCIÓN ---

        } catch (err: unknown) {
            console.error("Error fetching admin overview data:", err);
            if (err instanceof Error) {
                setErrorOverview(`Error al cargar datos del resumen: ${err.message}. Asegúrate de que el backend esté corriendo y estés autorizado.`);
            } else {
                setErrorOverview("Ocurrió un error desconocido al cargar el resumen. Intenta de nuevo más tarde.");
            }
        } finally {
            setLoadingOverview(false);
        }
    }, [token, currentUser]); // Incluye 'token' y 'currentUser' en las dependencias

    useEffect(() => {
        if (currentUser?.role === 'admin') { 
            fetchOverviewData();
        }
    }, [fetchOverviewData, currentUser]);


    if (loadingOverview) {
        return <p className="loading-message">Cargando resumen del dashboard...</p>;
    }

    if (errorOverview) {
        return <p className="error-message">{errorOverview}</p>;
    }

    return (
        <div className="admin-dashboard-overview">
            <div className="overview-section pending-actions">
                <h3>Acciones Pendientes</h3>
                <div className="pending-cards-container">
                    <div className="pending-card">
                        <h4>Citas por Revisar ({pendingAppointments.length})</h4>
                        {pendingAppointments.length === 0 ? (
                            <p>No hay citas pendientes.</p>
                        ) : (
                            <ul>
                                {pendingAppointments.map(appt => (
                                    <li key={appt.id}>
                                        Cita para **{appt.animal_name}** ({appt.user_email}) el {new Date(appt.scheduled_time).toLocaleString()} - Status: {appt.status}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button onClick={onViewAllAppointments} className="view-all-button-small">Ver todas las citas</button>
                    </div>
                    <div className="pending-card">
                        <h4>Nuevas Solicitudes ({pendingAdoptions.length})</h4>
                        {pendingAdoptions.length === 0 ? (
                            <p>No hay nuevas solicitudes de adopción.</p>
                        ) : (
                            <ul>
                                {pendingAdoptions.map(req => (
                                    <li key={req.id}>
                                        Solicitud para **{req.animal_name}** - Status: {req.status}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button onClick={onViewAllAdoptions} className="view-all-button-small">Ver todas las solicitudes</button>
                    </div>
                </div>
            </div>

            <div className="overview-section featured-animals-overview">
                <h3>Animales Destacados</h3>
                {featuredAnimals.length === 0 ? (
                    <p>No hay animales destacados actualmente.</p>
                ) : (
                    <div className="featured-animals-grid-overview">
                        {featuredAnimals.map(animal => (
                            <div key={animal.id} className="featured-animal-card-overview">
                                <img
                                    src={animal.image_urls && animal.image_urls.length > 0 ? animal.image_urls[0] : 'https://placehold.co/150x100/cccccc/333333?text=Sin+Imagen'}
                                    alt={animal.name}
                                    className="featured-animal-img-overview"
                                />
                                <span>{animal.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={onViewAllAnimals} className="view-all-button-small">Gestionar animales</button>
            </div>
        </div>
    );
};


interface AdminPanelPageProps { 
    currentUser: UserData | null;
    onLogout: () => void; // <-- ¡AÑADIDA! Función de logout
}

function AdminPanelPage({ currentUser, onLogout }: AdminPanelPageProps) {
    const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'animals' | 'adoptions' | 'appointments' | 'settings'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHoveringSidebar, setIsHoveringSidebar] = useState(false); 
    const navigate = useNavigate(); // Inicializa useNavigate

    const token = localStorage.getItem('userToken');

    // Helper para determinar si estamos en una vista de móvil/tablet
    const isMobileView = () => window.innerWidth <= 992;

    // Restricción de acceso: Solo para administradores
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="admin-panel-container not-authorized">
                <h2>Acceso Denegado</h2>
                <p>Solo los administradores pueden acceder a este panel.</p>
                <button onClick={() => navigate('/')} className="go-back-button">Volver a la Página Principal</button>
            </div>
        );
    }

    const handleSetActiveSection = (section: 'overview' | 'users' | 'animals' | 'adoptions' | 'appointments' | 'settings') => {
        setActiveSection(section);
        if (isMobileView()) {
            setIsSidebarOpen(false);
        }
    };


    return (
        <div className="admin-panel-container">
            {/* Botón de toggle para móviles */}
            {isMobileView() && (
                 <button
                    className="admin-sidebar-toggle-button"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 >
                    {isSidebarOpen ? '✖' : '☰'}
                 </button>
            )}

            <aside
                className={`admin-sidebar ${isSidebarOpen ? 'open' : ''} ${!isMobileView() && isHoveringSidebar ? 'hovered' : ''}`}
                onMouseEnter={!isMobileView() ? () => setIsHoveringSidebar(true) : undefined}
                onMouseLeave={!isMobileView() ? () => setIsHoveringSidebar(false) : undefined}
            >
                {/* Sección de cabecera del sidebar simplificada (sin perfil) */}
                <div className="sidebar-header">
                    <h3>Panel de Administración</h3>
                    <p>Bienvenido, {currentUser.name || currentUser.email}</p>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li className={activeSection === 'overview' ? 'active' : ''} onClick={() => handleSetActiveSection('overview')}>
                            <span>📊 Resumen del Dashboard</span>
                        </li>
                        <li className={activeSection === 'animals' ? 'active' : ''} onClick={() => handleSetActiveSection('animals')}>
                            <span>🐶 Gestión de Animales</span>
                        </li>
                        <li className={activeSection === 'adoptions' ? 'active' : ''} onClick={() => handleSetActiveSection('adoptions')}>
                            <span>📋 Gestión de Solicitudes de Adopción</span>
                        </li>
                        <li className={activeSection === 'appointments' ? 'active' : ''} onClick={() => handleSetActiveSection('appointments')}>
                            <span>📅 Gestión de Citas</span>
                        </li>
                        <li className={activeSection === 'users' ? 'active' : ''} onClick={() => handleSetActiveSection('users')}>
                            <span>👥 Gestión de Usuarios</span>
                        </li>
                        <li className={activeSection === 'settings' ? 'active' : ''} onClick={() => handleSetActiveSection('settings')}>
                            <span>⚙️ Ajustes del Sistema</span>
                        </li>
                        {/* Botones de acción al final del menú */}
                        <li className="back-to-home-item" onClick={() => navigate('/')}>
                            <span>🏠 Volver a la Página Principal</span>
                        </li>
                        <li className="logout-item" onClick={onLogout}>
                            <span>🚪 Cerrar Sesión</span>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="admin-content">
                {activeSection === 'overview' && (
                    <AdminDashboardOverview
                        token={token}
                        currentUser={currentUser}
                        onViewAllAnimals={() => handleSetActiveSection('animals')}
                        onViewAllAdoptions={() => handleSetActiveSection('adoptions')}
                        onViewAllAppointments={() => handleSetActiveSection('appointments')}
                    />
                )}
                {activeSection === 'animals' && (
                    <AdminAnimalsPage currentUser={currentUser} />
                )}
                {activeSection === 'adoptions' && (
                    <AdminAdoptionsPage currentUser={currentUser} />
                )}
                {activeSection === 'appointments' && (
                    <AdminAppointmentsPage currentUser={currentUser} />
                )}
                {activeSection === 'users' && (
                    <AdminUsersPage currentUser={currentUser} />
                )}
                {activeSection === 'settings' && (
                    <section className="admin-section">
                        <h2>Ajustes del Sistema</h2>
                        <p>Contenido de ajustes del sistema en desarrollo.</p>
                    </section>
                )}
            </main>
        </div>
    );
}

export default AdminPanelPage;
