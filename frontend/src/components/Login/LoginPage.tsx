import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './AuthForms.css';
import type { UserData } from '../../types';

interface LoginPageProps {
    onLoginSuccess: (userData: UserData) => void;
    // onRegisterClick: () => void; // Ya no se recibe directamente aquí desde App.tsx
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Inicializa useNavigate

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
                // Asumiendo que `data` contiene `{ token: "...", user: { ... } }`
                const userDataWithToken: UserData = { ...data.user, token: data.token };
                onLoginSuccess(userDataWithToken); // Llama a la función de éxito en App.tsx
                // La redirección después del login se maneja en App.tsx según el rol del usuario
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
                    ¿No tienes una cuenta? <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Regístrate aquí</span>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;
