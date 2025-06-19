import './Footer.css'; // Estilos para el Footer
import { FaFacebookF, FaInstagram, FaTiktok, FaXTwitter } from 'react-icons/fa6'; // Asegúrate de instalar react-icons: npm install react-icons

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-section logo-section">
                    {/* Aquí puedes poner un logo real o simplemente el texto "Refugio" */}
                    <span className="footer-logo-text">Refugio</span>
                </div>
                <div className="footer-section links-section">
                    <h4>Ayuda</h4>
                    <ul>
                        <li><a href="#faq">Preguntas Frecuentes</a></li>
                        <li><a href="#contact">Contáctanos</a></li>
                    </ul>
                </div>
                <div className="footer-section links-section">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="#terms">Términos y Condiciones</a></li>
                        <li><a href="#privacy">Política de Privacidad</a></li>
                    </ul>
                </div>
                <div className="footer-section links-section">
                    <h4>Nosotros</h4>
                    <ul>
                        <li><a href="#about">Acerca de Nosotros</a></li>
                        <li><a href="#mission">Nuestra Misión</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="social-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"><FaTiktok /></a>
                    <a href="https://x.com" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
                </div>
                <p>&copy; {new Date().getFullYear()} Nombre del Refugio. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;