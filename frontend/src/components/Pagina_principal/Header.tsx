import './Header.css';

// Importa tu imagen de logo aquí con la ruta especificada
// Asegúrate de que esta ruta sea correcta para tu proyecto en tu sistema de archivos.
// ¡Revisa si hay un espacio en "Rescate-de- Patitas" en la ruta de tu disco!
import logoImage from '../../assets/Images/Logo_rescate _de_patitas.png';

// Define las props para el componente Header
interface HeaderProps {
    isLoggedIn: boolean;
    userName: string | null; // <-- Propiedad 'userName' AÑADIDA para coincidir con App.tsx
    userRole: string | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onLogoClick: () => void;
    onAdminPanelClick: () => void;
}

function Header({ isLoggedIn, userName, userRole, onLoginClick, onLogoutClick, onLogoClick, onAdminPanelClick }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-content-wrapper">
                {/* Sección del Logo a la izquierda */}
                <div className="header-logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
                    <img
                        src={logoImage}
                        alt="Logo Refugio Patitas"
                        className="logo-img"
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/150x50/cccccc/333333?text=Logo+Error"; }}
                    />
                </div>

                {/* Navegación al centro */}
                <nav className="header-nav">
                    <ul>
                        <li onClick={onLogoClick} style={{ cursor: 'pointer'}}><a href="#inicio">Inicio</a></li>
                        <li><a href="#informacion">Información</a></li>
                        <li><a href="#perros">Perros</a></li>
                        <li><a href="#gatos">Gatos</a></li>
                        <li><a href="#donaciones">Donaciones</a></li>
                    </ul>
                </nav>

                {/* Sección de acciones a la derecha (Panel Admin y Botón de Sesión) */}
                <div className="header-right-actions">
                    {isLoggedIn && userRole === 'admin' && (
                        <button className="login-button admin-panel-button" onClick={onAdminPanelClick}>
                            Panel Admin
                        </button>
                    )}
                    {isLoggedIn ? (
                        <button className="login-button logout-button" onClick={onLogoutClick}>
                            {/* CORRECCIÓN: Usar userName aquí */}
                            {userName ? `Cerrar sersíon` : 'Cerrar sesión'}
                        </button>
                    ) : (
                        <button className="login-button" onClick={onLoginClick}>
                            Iniciar Sesión / Registrarse
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
