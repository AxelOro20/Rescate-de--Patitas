import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './AuthForms.css';

// Ya no necesitamos la interfaz RegisterPageProps si no se esperan props.
// Si en el futuro necesitas props, vuelve a definirla.
// interface RegisterPageProps {
//     onRegisterSuccess: () => void;
//     onLoginClick: () => void;
// }

// No desestructuramos props aquí si no las usamos
function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Inicializa useNavigate

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    lastname,
                    phone,
                    address,
                    city,
                    state,
                    zip_code: zipCode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Usar una notificación más amigable en lugar de alert() en un entorno de producción
                // Para el propósito de depuración, alert() es aceptable por ahora.
                alert('Registro exitoso. Ahora puedes iniciar sesión.');
                navigate('/login'); // Redirige a la página de login después del registro exitoso
            } else {
                setError(data.message || 'Error al registrar el usuario.');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
            console.error('Error de red al intentar registrar:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Registrarse</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="registerEmail">Email:</label>
                    <input
                        type="email"
                        id="registerEmail"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="registerPassword">Contraseña:</label>
                    <input
                        type="password"
                        id="registerPassword"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {/* Campos adicionales de registro */}
                <div className="form-group">
                    <label htmlFor="registerName">Nombre:</label>
                    <input
                        type="text"
                        id="registerName"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="registerLastname">Apellido:</label>
                    <input
                        type="text"
                        id="registerLastname"
                        value={lastname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="registerPhone">Teléfono:</label>
                    <input
                        type="tel"
                        id="registerPhone"
                        value={phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="registerAddress">Dirección:</label>
                    <input
                        type="text"
                        id="registerAddress"
                        value={address}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="registerCity">Ciudad:</label>
                    <input
                        type="text"
                        id="registerCity"
                        value={city}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="registerState">Estado/Provincia:</label>
                    <input
                        type="text"
                        id="registerState"
                        value={state}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="registerZipCode">Código Postal:</label>
                    <input
                        type="text"
                        id="registerZipCode"
                        value={zipCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZipCode(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                </button>
                <p className="auth-switch">
                    ¿Ya tienes una cuenta? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Inicia sesión aquí</span>
                </p>
            </form>
        </div>
    );
}

export default RegisterPage;
