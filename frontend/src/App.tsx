import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css'; // Estilos globales

// Importa la interfaz UserData con 'type'
import type { UserData } from './types';

// Importa tus componentes
import Header from './components/Pagina_principal/Header';
import HomePage from './pages/HomePage/HomePage';
import AnimalListPage from './pages/AnimalsList/AnimalsListPage';
import AnimalDetailPage from './pages/AnimalDetailPage/AnimalDetailPage';
import AdoptionFormPage from './components/Adoption/AdoptionFormPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage/SuccessStoriesPage';
import Footer from './components/Pagina_principal/Footer';

// Componentes de Autenticación
import LoginPage from './components/Login/LoginPage';
import RegisterPage from './components/Login/RegisterPage';

// Componentes del Dashboard y Administración
import UserDashboardPage from './components/UserDashboard/UserDashboardPage';
import UserProfilePage from './components/UserProfile/UserProfilePage';
import AdminPanelPage from './components/Admin/AdminPanelPage';

// Componente para proteger rutas (solo accesibles si el usuario está autenticado y tiene el rol correcto)
interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
    currentUser: UserData | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, currentUser }) => {
    // Si no hay usuario logueado, redirige a login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    // Si el usuario no tiene los roles permitidos, redirige a la página de inicio o a una página de acceso denegado
    if (!allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

// Nuevo componente interno que contendrá las rutas y la lógica de navegación
interface AppContentProps {
    currentUser: UserData | null;
    fetchCurrentUser: () => void;
    onLoginSuccess: (userData: UserData) => void;
    onLogout: () => void;
    handleAdoptionFormSuccess: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ currentUser, fetchCurrentUser, onLoginSuccess, onLogout, handleAdoptionFormSuccess }) => {
    const navigate = useNavigate(); // Ahora useNavigate está dentro de un componente hijo de BrowserRouter

    // Las funciones que usan 'navigate' se definen aquí
    const handleLoginSuccessInternal = (userData: UserData) => {
        onLoginSuccess(userData); // Llama a la función del padre para actualizar el estado global del usuario
        if (userData.role === 'user') {
            navigate('/dashboard');
            console.log(`¡Bienvenido, ${userData.name || userData.email}! Te hemos llevado a tu panel de usuario.`);
        } else if (userData.role === 'admin') {
            navigate('/admin');
            console.log(`¡Bienvenido, administrador ${userData.name || userData.email}! Te hemos llevado al panel de administración.`);
        } else {
            navigate('/');
            console.log(`¡Bienvenido, ${userData.name || userData.email}!`);
        }
    };

    const handleLogoutInternal = () => {
        onLogout(); // Llama a la función del padre para cerrar sesión globalmente
        navigate('/');
        console.log('Sesión cerrada.');
    };

    const handleAdoptionFormSuccessInternal = () => {
        handleAdoptionFormSuccess(); // Llama a la función del padre
        if (currentUser?.role === 'user') {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    // ELIMINADO: handleHeaderNavigation no se está utilizando y es redundante
    // const handleHeaderNavigation = (path: string) => {
    //     navigate(path);
    // };

    return (
        <div className="App">
            {/* Header siempre presente */}
            <Header
                isLoggedIn={!!currentUser}
                userName={currentUser?.name || currentUser?.email || null} // Pasar el nombre de usuario
                userRole={currentUser?.role || null} // Pasar el rol del usuario
                onLoginClick={() => navigate('/login')} // Maneja el clic en el botón de Login/Register
                onLogoutClick={handleLogoutInternal} // Maneja el clic en el botón de Logout
                onLogoClick={() => navigate('/')} // Navega a la home al hacer clic en el logo
                onAdminPanelClick={() => navigate('/admin')} // Navega al panel de admin
            />

            <main className="main-content-wrapper">
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccessInternal} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/animals" element={<AnimalListPage />} />
                    <Route path="/animals/:id" element={<AnimalDetailPage />} />
                    <Route path="/adopt/:animalId" element={<AdoptionFormPage currentUser={currentUser} onFormSubmitSuccess={handleAdoptionFormSuccessInternal} />} />
                    <Route path="/adopt" element={<AdoptionFormPage currentUser={currentUser} onFormSubmitSuccess={handleAdoptionFormSuccessInternal} />} />
                    <Route path="/success-stories" element={<SuccessStoriesPage />} />

                    {/* Rutas protegidas para el Dashboard del Usuario */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute currentUser={currentUser} allowedRoles={['user', 'admin', 'volunteer']}>
                                <UserDashboardPage currentUser={currentUser} onUserUpdate={fetchCurrentUser} />
                            </ProtectedRoute>
                        }
                    />
                    {/* Ruta específica para el perfil de usuario dentro del dashboard */}
                    <Route
                        path="/dashboard/profile"
                        element={
                            <ProtectedRoute currentUser={currentUser} allowedRoles={['user', 'admin', 'volunteer']}>
                                <UserProfilePage currentUser={currentUser} />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas protegidas para el Panel de Administración */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute currentUser={currentUser} allowedRoles={['admin']}>
                                <AdminPanelPage currentUser={currentUser} onLogout={handleLogoutInternal} />
                            </ProtectedRoute>
                        }
                    />

                    {/* Ruta para cualquier otra URL no definida (404) */}
                    <Route path="*" element={<div>Página No Encontrada</div>} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
};

function App() {
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    // Función para obtener y establecer el usuario actual desde localStorage
    const fetchCurrentUser = useCallback(() => {
        const storedToken = localStorage.getItem('userToken');
        if (storedToken) {
            try {
                // Decodificar el payload del token (parte central del JWT)
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                if (payload && payload.id && payload.email && payload.role) {
                    setCurrentUser({
                        id: payload.id,
                        email: payload.email,
                        name: payload.name || payload.email,
                        lastname: payload.lastname || null,
                        phone: payload.phone || null,
                        address: payload.address || null,
                        city: payload.city || null,
                        state: payload.state || null,
                        zip_code: payload.zip_code || null,
                        role: payload.role,
                        token: storedToken
                    });
                } else {
                    // Token inválido o incompleto, limpiar sesión
                    localStorage.removeItem('userToken');
                    setCurrentUser(null);
                }
            } catch (e) {
                console.error("Error decodificando token o token inválido:", e);
                localStorage.removeItem('userToken');
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
        }
    }, []);

    // Se ejecuta una vez al cargar la aplicación para verificar el estado de autenticación
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    // Manejador de éxito de inicio de sesión (ahora en App)
    const handleLoginSuccess = (userData: UserData) => {
        localStorage.setItem('userToken', userData.token as string);
        setCurrentUser(userData);
        // La navegación se gestiona en AppContent
    };

    // Manejador de cierre de sesión (ahora en App)
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        setCurrentUser(null);
        // La navegación se gestiona en AppContent
    };

    // Callback para el éxito del formulario de adopción (ahora en App)
    const handleAdoptionFormSuccess = () => {
        // La navegación se gestiona en AppContent
    };


    return (
        <BrowserRouter>
            {/* Renderizamos el nuevo componente AppContent aquí */}
            <AppContent
                currentUser={currentUser}
                fetchCurrentUser={fetchCurrentUser}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                handleAdoptionFormSuccess={handleAdoptionFormSuccess}
            />
        </BrowserRouter>
    );
}

export default App;
