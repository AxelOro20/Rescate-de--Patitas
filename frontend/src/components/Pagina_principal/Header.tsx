import './Header.css';

// Importa tu imagen de logo aquí con la ruta especificada
import logoImage from '../../assets/Images/Logo_rescate _de_patitas.png'; // <-- ¡Tu importación específica!

interface HeaderProps {
    isLoggedIn: boolean;
    userName: string | null | undefined;
    onLoginClick: () => void;
    onLogoClick: () => void; // Prop para ir a la página de inicio al hacer clic en el logo
}

function Header({ isLoggedIn, userName, onLoginClick, onLogoClick }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-content-wrapper">
                {/* Sección del Logo a la izquierda */}
                {/* El div del logo es clickeable y tiene un cursor de puntero */}
                <div className="header-logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
                    {/* Usamos la variable 'logoImage' importada en el src */}
                    <img
                        src={logoImage} // <-- Usamos la variable importada
                        alt="Logo Refugio Patitas"
                        className="logo-img"
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/150x50/cccccc/333333?text=Logo+Error"; }} // Fallback en caso de error de carga
                    />
                </div>

                {/* Navegación al centro */}
                <nav className="header-nav">
                    <ul>
                        {/* Hacemos que el elemento de lista de "Inicio" sea clickeable */}
                        <li onClick={onLogoClick} style={{ cursor: 'pointer' }}><a href="#inicio">Inicio</a></li>
                        <li><a href="#informacion">Información</a></li>
                        <li><a href="#perros">Perros</a></li>
                        <li><a href="#gatos">Gatos</a></li>
                        <li><a href="#donaciones">Donaciones</a></li>
                    </ul>
                </nav>

                {/* Sección de acciones a la derecha (solo botón de Login/Sign Up) */}
                <div className="header-right-actions">
                    <button className="login-button" onClick={onLoginClick}>
                        {/* El texto del botón cambia según el estado de login */}
                        {isLoggedIn ? (userName ? `Hola, ${userName}` : 'Mi Cuenta') : 'Login'}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
