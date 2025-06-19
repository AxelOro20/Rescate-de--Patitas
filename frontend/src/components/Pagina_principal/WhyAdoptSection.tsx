import './WhyAdoptSection.css'; // Estilos para WhyAdoptSection
// Puedes usar react-icons o simplemente placeholdres para los iconos
// import { FaSearch, FaSyncAlt, FaHeart } from 'react-icons/fa';

// Define la interfaz para las propiedades que el componente WhyAdoptSection espera recibir
interface WhyAdoptSectionProps {
    onAdoptClick: () => void; // Función que se ejecuta al hacer click en el botón "Adopta ahora"
}

// Aplica la interfaz WhyAdoptSectionProps a las propiedades del componente
function WhyAdoptSection({ onAdoptClick }: WhyAdoptSectionProps) {
    return (
        <section className="why-adopt-section">
            <h2>¿Por qué adoptar?</h2>
            <p className="subtitle">La tasa de abandono no para...</p>
            <div className="reasons-grid">
                <div className="reason-item">
                    <div className="icon-placeholder">🐾</div> {/* Icono placeholder */}
                    <h3>Encuentra a tu compañero ideal</h3>
                </div>
                <div className="reason-item">
                    <div className="icon-placeholder">📋</div> {/* Icono placeholder */}
                    <h3>Proceso de adopción sencillo</h3>
                </div>
                <div className="reason-item">
                    <div className="icon-placeholder">💖</div> {/* Icono placeholder */}
                    <h3>Salva una vida, cambia la tuya</h3>
                </div>
            </div>
            <button className="cta-button" onClick={onAdoptClick}>Adopta ahora</button>
        </section>
    );
}

export default WhyAdoptSection;
