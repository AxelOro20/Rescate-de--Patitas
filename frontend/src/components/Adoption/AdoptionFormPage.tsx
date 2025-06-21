import React, { useState, useEffect } from 'react';
import './AdoptionFormPage.css';

// Importa la interfaz UserData (asegúrate de que la ruta sea correcta)
import type { UserData } from '../../types';

// Define las props que este componente espera recibir
interface AdoptionFormPageProps {
    animalId: number | null; // El ID del animal que se desea adoptar
    isLoggedIn: boolean;     // Indica si el usuario está logueado
    currentUser: UserData | null; // Datos del usuario logueado, si aplica
    onFormSubmitSuccess: () => void; // Callback para cuando el formulario se envía exitosamente
    onGoBack: () => void; // Callback para volver a la página anterior
}

// Interfaz para la carga útil (payload) de la solicitud de adopción
interface AdoptionPayload {
    animal_id: number | null;
    motivation: string;
    applicant_name?: string; // Opcional si user_id está presente en el backend
    applicant_email?: string;
    applicant_phone?: string;
    applicant_address?: string;
    // user_id no se envía desde aquí directamente en el payload, se espera que el backend lo tome del token
}

function AdoptionFormPage({ animalId, isLoggedIn, currentUser, onFormSubmitSuccess, onGoBack }: AdoptionFormPageProps) {
    const [motivation, setMotivation] = useState('');
    // Estados para campos del solicitante (si no está logueado)
    const [applicantName, setApplicantName] = useState('');
    const [applicantEmail, setApplicantEmail] = useState('');
    const [applicantPhone, setApplicantPhone] = useState('');
    const [applicantAddress, setApplicantAddress] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [animalName, setAnimalName] = useState<string | null>(null); // Para mostrar el nombre del animal

    // Efecto para precargar datos si el usuario está logueado y para obtener el nombre del animal
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            setApplicantName(currentUser.name || '');
            setApplicantEmail(currentUser.email || '');
            // Asegúrate de que 'phone' y 'address' existan en tu interfaz UserData en src/types.ts
            // Si no existen, TypeScript marcará un error aquí.
            setApplicantPhone(currentUser.phone || ''); 
            setApplicantAddress(currentUser.address || ''); 
        }

        // Obtener el nombre del animal si se proporciona un animalId
        const fetchAnimalName = async () => {
            if (animalId) {
                try {
                    const response = await fetch(`http://localhost:5000/api/animals/${animalId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setAnimalName(data.name);
                    } else {
                        console.error('No se pudo cargar el nombre del animal:', response.statusText);
                        setAnimalName('Animal no encontrado');
                    }
                } catch (err) {
                    console.error('Error al obtener el nombre del animal:', err);
                    setAnimalName('Error al cargar animal');
                }
            } else {
                setAnimalName('Ningún animal seleccionado');
            }
        };
        fetchAnimalName();
    }, [animalId, isLoggedIn, currentUser]); // Dependencias del useEffect

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        // Usamos la nueva interfaz AdoptionPayload
        const payload: AdoptionPayload = {
            animal_id: animalId,
            motivation: motivation
        };

        // Si el usuario no está logueado, incluir los datos del solicitante
        if (!isLoggedIn) {
            payload.applicant_name = applicantName;
            payload.applicant_email = applicantEmail;
            payload.applicant_phone = applicantPhone;
            payload.applicant_address = applicantAddress;
        }
        // Si el usuario está logueado, user_id se enviará automáticamente si se pasa un token al backend,
        // pero la API de adopciones que creamos en el backend no requiere el token para la creación,
        // sino que el 'user_id' se toma de 'req.user' si el middleware authenticateToken se hubiera aplicado.
        // Como la ruta POST de adopciones no lo usa, debemos asegurarnos de que los campos applicant_* sean consistentes.
        // Por la forma en que está diseñada nuestra API de adopciones, siempre envía los campos applicant_*
        // y el backend usará user_id si se detecta un token válido.

        try {
            const token = localStorage.getItem('userToken'); // Obtener el token si existe

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token && isLoggedIn) { // Si hay token y el usuario está logueado, envíalo
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:5000/api/adoptions/', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || '¡Tu solicitud ha sido enviada con éxito!');
                // Limpiar formulario o redirigir
                setMotivation('');
                setApplicantName('');
                setApplicantEmail('');
                setApplicantPhone('');
                setApplicantAddress('');
                onFormSubmitSuccess(); // Llama al callback para ir a la Home o mostrar mensaje
            } else {
                setError(data.message || 'Error al enviar la solicitud.');
            }
        } catch (err: unknown) { // Cambiado 'any' a 'unknown' para un tipado más seguro
            console.error('Error al enviar la solicitud de adopción:', err);
            if (err instanceof Error) {
                setError(`No se pudo conectar con el servidor: ${err.message}. Inténtalo de nuevo más tarde.`);
            } else {
                setError('Ocurrió un error desconocido al enviar la solicitud. Inténtalo de nuevo más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="adoption-form-container">
            <form className="adoption-form" onSubmit={handleSubmit}>
                <h2>Solicitud de Adopción para {animalName || 'un animal'}</h2>
                <p>Por favor, completa el siguiente formulario para solicitar la adopción.</p>

                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}

                {!isLoggedIn && (
                    <>
                        <div className="form-group">
                            <label htmlFor="applicantName">Tu Nombre Completo:</label>
                            <input
                                type="text"
                                id="applicantName"
                                value={applicantName}
                                onChange={(e) => setApplicantName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="applicantEmail">Tu Email:</label>
                            <input
                                type="email"
                                id="applicantEmail"
                                value={applicantEmail}
                                onChange={(e) => setApplicantEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="applicantPhone">Tu Teléfono:</label>
                            <input
                                type="tel"
                                id="applicantPhone"
                                value={applicantPhone}
                                onChange={(e) => setApplicantPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="applicantAddress">Tu Dirección:</label>
                            <input
                                type="text"
                                id="applicantAddress"
                                value={applicantAddress}
                                onChange={(e) => setApplicantAddress(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label htmlFor="motivation">¿Por qué quieres adoptar a {animalName || 'este animal'}? (Tu motivación)</label>
                    <textarea
                        id="motivation"
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        rows={6}
                        required
                    ></textarea>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
                <button type="button" onClick={onGoBack} className="go-back-button" disabled={loading}>
                    Volver
                </button>
            </form>
        </div>
    );
}

export default AdoptionFormPage;
