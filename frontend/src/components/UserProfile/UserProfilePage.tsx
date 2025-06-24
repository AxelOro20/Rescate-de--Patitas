import { useNavigate } from 'react-router-dom'; // Eliminado 'React' ya que no se usa directamente
import './UserProfilePage.css';
import type { UserData } from '../../types';

// Propiedades para el componente UserProfilePage
interface UserProfilePageProps {
    currentUser: UserData | null; // Información del usuario logueado
    // onGoBack: () => void; // <-- Ya no se recibe como prop
}

function UserProfilePage({ currentUser }: UserProfilePageProps) {
    const navigate = useNavigate(); // Inicializa useNavigate

    // Si no hay un usuario logueado, o por alguna razón currentUser es null,
    // mostramos un mensaje de no autorizado.
    if (!currentUser) {
        return (
            <div className="user-profile-container not-authorized">
                <h2>Acceso Denegado</h2>
                <p>Necesitas iniciar sesión para ver tu perfil.</p>
                <button onClick={() => navigate('/login')} className="go-back-button">Ir a Iniciar Sesión</button>
            </div>
        );
    }

    // Determina la ruta de "volver" dinámicamente
    const handleGoBack = () => {
        if (currentUser.role === 'user') {
            navigate('/dashboard'); // Vuelve al dashboard si es un usuario normal
        } else {
            navigate(-1); // O simplemente retrocede en el historial
        }
    };

    return (
        <div className="user-profile-container">
            <div className="profile-header">
                <h2>Mi Perfil</h2>
                <p>Bienvenido, {currentUser.name || currentUser.email || 'Usuario'}. Aquí puedes ver tu información.</p>
                <button onClick={handleGoBack} className="go-back-button">Volver a la Página Principal</button>
            </div>

            <section className="profile-details-section">
                <h3>Información Personal</h3>
                <div className="details-grid">
                    <div className="detail-item">
                        <strong>Email:</strong>
                        <span>{currentUser.email}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Nombre:</strong>
                        <span>{currentUser.name || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Apellido:</strong>
                        <span>{currentUser.lastname || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Teléfono:</strong>
                        <span>{currentUser.phone || 'No especificado'}</span>
                    </div>
                    <div className="detail-item full-width">
                        <strong>Dirección:</strong>
                        <span>{currentUser.address || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Ciudad:</strong>
                        <span>{currentUser.city || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Estado/Provincia:</strong>
                        <span>{currentUser.state || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Código Postal:</strong>
                        <span>{currentUser.zip_code || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Rol:</strong>
                        <span>{currentUser.role || 'user'}</span>
                    </div>
                </div>
                {/* Botón de editar (funcionalidad a implementar más adelante) */}
                {/* <button className="edit-profile-button">Editar Perfil</button> */}
            </section>
        </div>
    );
}

export default UserProfilePage;
