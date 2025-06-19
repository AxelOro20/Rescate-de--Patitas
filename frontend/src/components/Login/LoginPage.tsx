import React, { useState } from 'react'; // <-- ¡Asegúrate de que useState esté aquí!
import './AuthForms.css';
import type { UserData } from '../../types'; // Asegúrate de importar la interfaz UserData

interface LoginPageProps {
    onLoginSuccess: (userData: UserData) => void;
    onRegisterClick: () => void;
}

function LoginPage({ onLoginSuccess, onRegisterClick }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Simula guardar el token en localStorage (en un proyecto real, se usa con cuidado)
                localStorage.setItem('userToken', data.token);
                onLoginSuccess(data.user); // Llama a la función de éxito en App.tsx
            } else {
                setError(data.message || 'Error al iniciar sesión.');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
            console.error('Error de red al intentar login:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Iniciar Sesión</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="loginEmail">Email:</label>
                    <input
                        type="email"
                        id="loginEmail"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="loginPassword">Contraseña:</label>
                    <input
                        type="password"
                        id="loginPassword"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Login'}
                </button>
                <p className="auth-switch">
                    ¿No tienes una cuenta? <span onClick={onRegisterClick}>Regístrate aquí</span>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;
