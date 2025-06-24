import './HeroSection.css'; // Estilos para el HeroSection

// Define la interfaz para las propiedades que el componente HeroSection espera recibir
interface HeroSectionProps {
    onAdoptClick: () => void; // Función que se ejecuta al hacer click en el botón "Adopta ahora"
}

// Aplica la interfaz HeroSectionProps a las propiedades del componente
function HeroSection({ onAdoptClick }: HeroSectionProps) {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>Adopta, Rescata y Ayuda</h1>
                <p>Rescata un amigo o da apoyo a los refugios de animales y a todas las patitas que están en busca de un hogar y una familia</p>
                <button className="cta-button" onClick={onAdoptClick}>Adopta ahora</button>
            </div>
            {/* La imagen de fondo se manejará con CSS */}
        </section>
    );
}

export default HeroSection;
