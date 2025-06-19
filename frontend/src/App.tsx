import { useState } from 'react';
import './App.css'; // Estilos globales

// Importa la interfaz UserData con 'type'
import type { UserData } from './types';

// Importa tus componentes (asumiendo que todos tienen un 'export default')
import Header from './components/Pagina_principal/Header';
import HeroSection from './components/Pagina_principal/HeroSection';
import FeaturedAnimals from './components/Pagina_principal/FeaturedAnimals';
import NewArrivals from './components/Pagina_principal/NewArrivals';
import WhyAdoptSection from './components/Pagina_principal/WhyAdoptSection';
import Footer from './components/Pagina_principal/Footer';
import LoginPage from './components/Login/LoginPage';
import RegisterPage from './components/Login/RegisterPage';

function App() {
    // Estado para controlar qué vista se muestra: 'home', 'login', 'register'
    const [currentView, setCurrentView] = useState<'home' | 'login' | 'register'>('home');
    // Estado para simular si el usuario está logueado, con tipado explícito
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    // Estado para guardar los datos básicos del usuario: puede ser UserData o null, con tipado explícito
    const [user, setUser] = useState<UserData | null>(null);

    // Manejador de clic para el botón de Login
    const handleLoginClick = () => {
        console.log("Botón de Login pulsado! Cambiando vista a 'login'."); // Mensaje de depuración
        setCurrentView('login');
    };

    // Manejador de clic para el botón de Registro
    const handleRegisterClick = () => {
        setCurrentView('register');
    };

    // Manejador para el éxito del login, recibe userData tipado
    const handleLoginSuccess = (userData: UserData) => {
        setIsLoggedIn(true);
        setUser(userData);
        setCurrentView('home'); // Volver a la página principal tras login exitoso
        alert(`¡Bienvenido, ${userData.name || userData.email}!`); // 'name' ahora es reconocido
    };

    // Manejador para cerrar sesión
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView('home');
        alert('Sesión cerrada.');
        localStorage.removeItem('userToken'); // Limpiar el token de sesión
    };

    // Lógica para el botón "Adopta ahora"
    const handleAdoptNowClick = () => {
        if (isLoggedIn) {
            // Si el usuario está logueado, llevar a la página de adopción general (a implementar)
            alert('Llevar a la página de adopción general para usuarios logueados.');
        } else {
            // Si no está logueado, hacer scroll suave hacia la sección "Nuevos Inquilinos"
            const newArrivalsSection = document.getElementById('new-arrivals-section');
            if (newArrivalsSection) {
                newArrivalsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Nueva función para volver a la página de inicio
    const handleGoHome = () => {
        setCurrentView('home');
    };

    return (
        <div className="App">
            {/* El Header se renderiza siempre */}
            <Header
                isLoggedIn={isLoggedIn}
                userName={user ? user.name : null}
                onLoginClick={isLoggedIn ? handleLogout : handleLoginClick}
                onLogoClick={handleGoHome} 
            />

            {/* Contenido principal de la aplicación */}
            {/* Si currentView es 'home', se muestra el contenido de la página de inicio dentro del wrapper */}
            {currentView === 'home' && (
                <main className="main-content-wrapper">
                    <HeroSection onAdoptClick={handleAdoptNowClick} />
                    <FeaturedAnimals />
                    <NewArrivals /> {/* Este componente necesita un ID para el scroll: <section id="new-arrivals-section"> */}
                    <WhyAdoptSection onAdoptClick={handleAdoptNowClick} />
                </main>
            )}

            {/* Si currentView es 'login', se muestra el componente LoginPage */}
            {currentView === 'login' && (
                <LoginPage onLoginSuccess={handleLoginSuccess} onRegisterClick={handleRegisterClick} />
            )}

            {/* Si currentView es 'register', se muestra el componente RegisterPage */}
            {currentView === 'register' && (
                <RegisterPage onRegisterSuccess={() => setCurrentView('login')} onLoginClick={handleLoginClick} />
            )}

            {/* El Footer se renderiza siempre */}
            <Footer />
        </div>
    );
}

export default App;
