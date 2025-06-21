import { useState } from 'react';
import './App.css'; // Estilos globales

// Importa la interfaz UserData con 'type'
import type { UserData } from './types';

// Importa tus componentes
import Header from './components/Pagina_principal/Header';
import HeroSection from './components/Pagina_principal/HeroSection';
import FeaturedAnimals from './components/Pagina_principal/FeaturedAnimals';
import NewArrivals from './components/Pagina_principal/NewArrivals';
import WhyAdoptSection from './components/Pagina_principal/WhyAdoptSection';
import Footer from './components/Pagina_principal/Footer';
import LoginPage from './components/Login/LoginPage';
import RegisterPage from './components/Login/RegisterPage';
import AdoptionFormPage from './components/Adoption/AdoptionFormPage';
import AnimalsListPage from './components/AnimalsList/AnimalsListPage';

function App() {
    // Estado para controlar qué vista se muestra: 'home', 'login', 'register', 'adopt', 'animals-list'
    const [currentView, setCurrentView] = useState<'home' | 'login' | 'register' | 'adopt' | 'animals-list'>('home');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [animalIdForAdoption, setAnimalIdForAdoption] = useState<number | null>(null);

    // Manejadores existentes
    const handleLoginClick = () => setCurrentView('login');
    const handleRegisterClick = () => setCurrentView('register');
    const handleLoginSuccess = (userData: UserData) => {
        setIsLoggedIn(true);
        setUser(userData);
        setCurrentView('home');
        alert(`¡Bienvenido, ${userData.name || userData.email}!`);
    };
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView('home');
        alert('Sesión cerrada.');
        localStorage.removeItem('userToken');
    };

    // Lógica para el botón "Adopta ahora" (desde HeroSection y WhyAdoptSection)
    const handleAdoptNowClick = () => {
        setAnimalIdForAdoption(null); // No se selecciona un animal específico inicialmente
        setCurrentView('adopt'); // Ir a la página de formulario de adopción (general)
    };

    // Manejador específico para el botón "Quiero adoptar" de las tarjetas de animales
    const handleAdoptSpecificAnimalClick = (animalId: number) => {
        setAnimalIdForAdoption(animalId);
        setCurrentView('adopt');
    };

    // Callback para cuando el formulario de adopción se envía exitosamente
    const handleAdoptionFormSuccess = () => {
        setAnimalIdForAdoption(null);
        setCurrentView('home'); // Vuelve a la vista principal
    };

    // Callback para el botón "Volver" en el formulario de adopción y AnimalsListPage
    const handleGoBackToHome = () => {
        setCurrentView('home');
    };

    // Nuevo manejador para el botón "Ver todos"
    const handleViewAllAnimalsClick = () => {
        setCurrentView('animals-list');
    };


    return (
        <div className="App">
            <Header
                isLoggedIn={isLoggedIn}
                userName={user ? user.name : null}
                onLoginClick={isLoggedIn ? handleLogout : handleLoginClick}
                onLogoClick={handleGoBackToHome} // El logo siempre vuelve a home
            />

            {/* Contenido principal condicional */}
            {currentView === 'home' && (
                <main className="main-content-wrapper">
                    <HeroSection onAdoptClick={handleAdoptNowClick} />
                    <NewArrivals
                        onAdoptClick={handleAdoptSpecificAnimalClick}
                        onViewAllClick={handleViewAllAnimalsClick}
                    />
                    <FeaturedAnimals
                        onAdoptClick={handleAdoptSpecificAnimalClick}
                    />
                    <WhyAdoptSection onAdoptClick={handleAdoptNowClick} />
                </main>
            )}

            {currentView === 'login' && (
                <LoginPage onLoginSuccess={handleLoginSuccess} onRegisterClick={handleRegisterClick} />
            )}

            {currentView === 'register' && (
                <RegisterPage onRegisterSuccess={() => setCurrentView('login')} onLoginClick={handleLoginClick} />
            )}

            {currentView === 'adopt' && (
                <AdoptionFormPage
                    animalId={animalIdForAdoption}
                    isLoggedIn={isLoggedIn}
                    currentUser={user}
                    onFormSubmitSuccess={handleAdoptionFormSuccess}
                    onGoBack={handleGoBackToHome}
                />
            )}

            {/* Nueva vista para la lista completa de animales */}
            {currentView === 'animals-list' && (
                <AnimalsListPage
                    onAdoptClick={handleAdoptSpecificAnimalClick}
                    onGoBack={handleGoBackToHome}
                />
            )}

            <Footer />
        </div>
    );
}

export default App;
