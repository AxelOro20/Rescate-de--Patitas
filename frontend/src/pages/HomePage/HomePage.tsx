import { useNavigate } from 'react-router-dom'; // Para la navegación interna
// import React from 'react'; // Eliminado ya que no se usa directamente
// Importa tus componentes de la página principal aquí
import HeroSection from '../../components/Pagina_principal/HeroSection';
import FeaturedAnimals from '../../components/Pagina_principal/FeaturedAnimals';
import NewArrivals from '../../components/Pagina_principal/NewArrivals';
import WhyAdoptSection from '../../components/Pagina_principal/WhyAdoptSection';

function HomePage() {
    const navigate = useNavigate();

    // Manejador para el botón "Adopta ahora" (redirige al formulario de adopción general)
    const handleAdoptNowClick = () => {
        navigate('/adopt');
    };

    // Manejador específico para el botón "Quiero adoptar" de las tarjetas de animales
    const handleAdoptSpecificAnimalClick = (animalId: number) => {
        navigate(`/adopt/${animalId}`);
    };

    // Manejador para el botón "Ver todos" de NewArrivals
    const handleViewAllAnimalsClick = () => {
        navigate('/animals');
    };

    return (
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
    );
}

export default HomePage;
