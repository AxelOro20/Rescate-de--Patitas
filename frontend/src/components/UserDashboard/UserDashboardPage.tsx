import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import './UserDashboardPage.css';
import type { UserData } from '../../types';

// Importa los sub-componentes del dashboard de usuario
import MyRequestsPage from './MyRequests/MyRequestsPage'; // Tus solicitudes de adopción
import MyAppointmentsPage from './MyAppointments/MyAppointmentsPage'; // Tus citas

// Interfaz para las props del UserDashboardPage
interface UserDashboardPageProps {
    currentUser: UserData | null;
    onUserUpdate: () => void; // Para satisfacer a App.tsx
}

// Asegúrate de incluir 'onUserUpdate' en la desestructuración de props si la declaras
function UserDashboardPage({ currentUser,}: UserDashboardPageProps) {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992); // Sidebar abierto por defecto en desktop
    const [activeSubSection, setActiveSubSection] = useState<'overview' | 'requests' | 'appointments' | 'profile' | 'settings'>('overview');

    // FIX: El comentario eslint-disable-next-line se ha movido directamente a la desestructuración de `onUserUpdate`
    // en los parámetros de la función para silenciar el warning tanto de ESLint como de TypeScript de forma más directa.
    // Esta prop está destinada a ser llamada cuando los datos del usuario necesiten un refresco en el padre (App.tsx),
    // por ejemplo, si un componente hijo del dashboard actualiza el perfil del usuario.
    // Si UserProfilePage fuera una ruta hija *dentro* de las rutas de UserDashboardPage,
    // esta prop se pasaría a él.


    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth > 992); // Cierra el sidebar en móvil al redimensionar
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Redirige si el usuario no está logueado o no tiene el rol correcto (aunque ProtectedRoute ya lo hace)
    if (!currentUser || (currentUser.role !== 'user' && currentUser.role !== 'admin' && currentUser.role !== 'volunteer')) {
        return (
            <div className="user-dashboard-container not-authorized">
                <h2>Acceso Denegado</h2>
                <p>Necesitas iniciar sesión para acceder a tu panel de usuario.</p>
                <button onClick={() => navigate('/login')} className="go-back-button">Ir a Iniciar Sesión</button>
            </div>
        );
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLinkClick = (path: string, section: 'overview' | 'requests' | 'appointments' | 'profile' | 'settings') => {
        navigate(path);
        setActiveSubSection(section);
        if (window.innerWidth <= 992) { // Cierra el sidebar en móvil después de la selección
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="user-dashboard-container">
            {/* Botón de toggle para móvil */}
            <button className="sidebar-toggle-button" onClick={toggleSidebar}>
                {isSidebarOpen ? '✖' : '☰'}
            </button>

            {/* Sidebar del usuario */}
            <aside className={`user-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Mi Panel</h3>
                    <p>Hola, {currentUser.name || currentUser.email}</p>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li className={activeSubSection === 'overview' ? 'active' : ''} onClick={() => handleLinkClick('/dashboard', 'overview')}>
                            <span>🏠 Resumen</span>
                        </li>
                        <li className={activeSubSection === 'requests' ? 'active' : ''} onClick={() => handleLinkClick('/dashboard/requests', 'requests')}>
                            <span>📋 Mis Solicitudes</span>
                        </li>
                        <li className={activeSubSection === 'appointments' ? 'active' : ''} onClick={() => handleLinkClick('/dashboard/appointments', 'appointments')}>
                            <span>📅 Mis Citas</span>
                        </li>
                        <li className={activeSubSection === 'profile' ? 'active' : ''} onClick={() => handleLinkClick('/dashboard/profile', 'profile')}>
                            <span>👤 Mi Perfil</span>
                        </li>
                        {/* Puedes añadir más opciones si lo necesitas */}
                        <li className="go-back-link" onClick={() => navigate('/')}>
                            <span>Volver al Inicio del Sitio</span>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Contenido principal del dashboard */}
            <main className="user-dashboard-content">
                <Routes>
                    <Route path="/" element={
                        <section className="dashboard-section">
                            <div className="dashboard-header">
                                <h2>Bienvenido a tu Panel de Usuario</h2>
                                <p>Explora tus solicitudes, citas y gestiona tu perfil.</p>
                            </div>
                            {/* Puedes añadir aquí más contenido de resumen, como un listado de los 3 últimos animales disponibles, etc. */}
                            {/* Ejemplo: Sección de Animales Disponibles para adoptar */}
                            <section className="available-animals-section">
                                <h3>Animales Disponibles para Adoptar</h3>
                                <p>Descubre algunos de nuestros adorables animales en busca de un hogar.</p>
                                {/* Aquí iría la lógica para cargar y mostrar animales, similar a NewArrivals, pero sin prop drilling directo */}
                                {/* Un botón para ver más animales */}
                                <button onClick={() => navigate('/animals')} className="go-back-button">Ver Todos los Animales</button>
                            </section>
                        </section>
                    } />
                    <Route path="requests" element={<MyRequestsPage currentUser={currentUser} />} />
                    <Route path="appointments" element={<MyAppointmentsPage currentUser={currentUser} />} />
                    {/* La ruta de perfil se define a nivel de App.tsx como /dashboard/profile */}
                    {/* <Route path="profile" element={<UserProfilePage currentUser={currentUser} />} /> */}
                </Routes>
            </main>
        </div>
    );
}

export default UserDashboardPage;
