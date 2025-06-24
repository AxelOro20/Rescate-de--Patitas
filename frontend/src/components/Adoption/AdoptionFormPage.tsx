import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useParams y useNavigate
import './AdoptionFormPage.css';
import type { UserData } from '../../types';

// Interfaz para el animal que se va a adoptar (podría ser más completa si lo necesitas)
interface Animal {
    id: number;
    name: string;
    image_urls?: string[];
}

// Propiedades para el componente AdoptionFormPage
interface AdoptionFormPageProps {
    // animalId: number | null; // <-- Ya no se recibe como prop, se obtiene de useParams
    // isLoggedIn: boolean;     // <-- Ya no se recibe como prop, se deduce de currentUser
    currentUser: UserData | null; // Datos del usuario logueado, si aplica
    onFormSubmitSuccess: () => void; // Callback para cuando el formulario se envía exitosamente
    // onGoBack: () => void; // <-- Ya no se recibe como prop, se usa useNavigate
}

function AdoptionFormPage({ currentUser, onFormSubmitSuccess }: AdoptionFormPageProps) {
    const { animalId: paramAnimalId } = useParams<{ animalId: string }>(); // Obtiene animalId de la URL
    const animalId = paramAnimalId ? Number(paramAnimalId) : null; // Convierte a número o null

    const navigate = useNavigate(); // Inicializa useNavigate

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [loadingAnimal, setLoadingAnimal] = useState(true);
    const [animalError, setAnimalError] = useState<string | null>(null);

    // Estados para los campos del formulario de adopción
    const [applicantName, setApplicantName] = useState('');
    const [applicantEmail, setApplicantEmail] = useState('');
    const [applicantPhone, setApplicantPhone] = useState('');
    const [applicantAddress, setApplicantAddress] = useState('');
    const [motivation, setMotivation] = useState('');

    const [formError, setFormError] = useState<string | null>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const token = localStorage.getItem('userToken');
    const isLoggedIn = !!currentUser; // Deriva isLoggedIn del currentUser

    // Efecto para cargar los detalles del animal si se proporciona un animalId
    useEffect(() => {
        const fetchAnimalDetails = async () => {
            if (animalId === null) {
                setLoadingAnimal(false);
                setAnimal(null); // Asegura que no haya un animal precargado si no hay ID
                return;
            }
            setLoadingAnimal(true);
            setAnimalError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/animals/${animalId}`);
                if (!response.ok) {
                    throw new Error('No se pudo cargar la información del animal.');
                }
                const data: Animal = await response.json();
                setAnimal(data);
            } catch (err) {
                console.error("Error fetching animal details:", err);
                setAnimalError("Error al cargar la información del animal.");
            } finally {
                setLoadingAnimal(false);
            }
        };

        fetchAnimalDetails();
    }, [animalId]); // Se ejecuta cuando animalId cambia

    // Efecto para prellenar los campos del formulario si el usuario está logueado
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            setApplicantName(currentUser.name || '');
            setApplicantEmail(currentUser.email || '');
            setApplicantPhone(currentUser.phone || '');
            setApplicantAddress(currentUser.address || '');
            // La motivación siempre se deja vacía para que el usuario la rellene
        } else {
            // Si no está logueado, limpia los campos o los deja vacíos para que el invitado los llene
            setApplicantName('');
            setApplicantEmail('');
            setApplicantPhone('');
            setApplicantAddress('');
        }
    }, [isLoggedIn, currentUser]); // Se ejecuta cuando el estado de login o el usuario actual cambian

    // Manejador del envío del formulario
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        setLoadingSubmit(true);
        setSuccessMessage(null);

        if (!animalId) {
            setFormError("Debes seleccionar un animal para adoptar.");
            setLoadingSubmit(false);
            return;
        }

        // Datos base de la solicitud
        const requestData: {
            animal_id: number;
            motivation: string;
            user_id?: number | null;
            applicant_name?: string | null;
            applicant_email?: string | null;
            applicant_phone?: string | null;
            applicant_address?: string | null;
        } = {
            animal_id: animalId,
            motivation: motivation,
        };

        // Lógica condicional para usuarios logueados vs. no logueados
        if (isLoggedIn && currentUser) {
            requestData.user_id = currentUser.id;
            // Se envían los datos del usuario logueado, permitiendo que sean null si no están definidos
            requestData.applicant_name = currentUser.name || null;
            requestData.applicant_email = currentUser.email || null;
            requestData.applicant_phone = currentUser.phone || null;
            requestData.applicant_address = currentUser.address || null;

        } else {
            // Validar campos requeridos para usuarios no registrados
            if (!applicantName || !applicantEmail || !applicantPhone || !applicantAddress) {
                setFormError("Para solicitudes sin usuario registrado, nombre, email, teléfono y dirección son requeridos.");
                setLoadingSubmit(false);
                return;
            }
            requestData.applicant_name = applicantName;
            requestData.applicant_email = applicantEmail;
            requestData.applicant_phone = applicantPhone;
            requestData.applicant_address = applicantAddress;
            requestData.user_id = null; // Asegura que user_id sea null si es un invitado
        }

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:5000/api/adoptions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || '¡Solicitud de adopción enviada con éxito!');
                setTimeout(() => {
                    onFormSubmitSuccess(); // Redirige después de un mensaje de éxito
                }, 2000);
            } else {
                setFormError(data.message || 'Error al enviar la solicitud de adopción.');
            }
        } catch (err: unknown) {
            console.error('Error al enviar la solicitud:', err);
            if (err instanceof Error) {
                setFormError(`No se pudo conectar con el servidor: ${err.message}`);
            } else {
                setFormError("Ocurrió un error desconocido al enviar la solicitud.");
            }
        } finally {
            setLoadingSubmit(false);
        }
    };

    // Función para el botón "Volver"
    const handleGoBack = () => {
        if (currentUser?.role === 'user') {
            navigate('/dashboard'); // Si es usuario, regresa al dashboard
        } else {
            navigate(-1); // Si no, regresa a la página anterior en el historial
        }
    };


    if (loadingAnimal) {
        return (
            <div className="adoption-form-container">
                <p>Cargando información del animal...</p>
            </div>
        );
    }

    if (animalError) {
        return (
            <div className="adoption-form-container">
                <p className="error-message">{animalError}</p>
                <button onClick={handleGoBack} className="go-back-button">Volver</button>
            </div>
        );
    }

    if (!animal) {
        return (
            <div className="adoption-form-container">
                <p className="error-message">No se encontró información del animal. Por favor, selecciona un animal para adoptar.</p>
                <button onClick={handleGoBack} className="go-back-button">Volver</button>
            </div>
        );
    }

    return (
        <div className="adoption-form-container">
            <form className="adoption-form" onSubmit={handleSubmit}>
                <h2>Solicitud de Adopción para <br /> {animal.name}</h2>
                <p className="form-description">Por favor, completa el siguiente formulario para solicitar la adopción.</p>

                {formError && <p className="error-message">{formError}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                {/* Campos de información del solicitante */}
                <div className="form-group">
                    <label htmlFor="applicantName">Nombre:</label>
                    <input
                        type="text"
                        id="applicantName"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        readOnly={isLoggedIn} // Solo lectura si el usuario está logueado
                        required={!isLoggedIn} // Requerido solo si el usuario NO está logueado
                        style={{ backgroundColor: isLoggedIn ? '#e9ecef' : 'white' }} // Estilo visual para campos de solo lectura
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="applicantEmail">Email:</label>
                    <input
                        type="email"
                        id="applicantEmail"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        readOnly={isLoggedIn} // Solo lectura si el usuario está logueado
                        required={!isLoggedIn} // Requerido solo si el usuario NO está logueado
                        style={{ backgroundColor: isLoggedIn ? '#e9ecef' : 'white' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="applicantPhone">Teléfono:</label>
                    <input
                        type="tel"
                        id="applicantPhone"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        readOnly={isLoggedIn} // Solo lectura si el usuario está logueado
                        required={!isLoggedIn} // Requerido solo si el usuario NO está logueado
                        style={{ backgroundColor: isLoggedIn ? '#e9ecef' : 'white' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="applicantAddress">Dirección:</label>
                    <input
                        type="text"
                        id="applicantAddress"
                        value={applicantAddress}
                        onChange={(e) => setApplicantAddress(e.target.value)}
                        readOnly={isLoggedIn} // Solo lectura si el usuario está logueado
                        required={!isLoggedIn} // Requerido solo si el usuario NO está logueado
                        style={{ backgroundColor: isLoggedIn ? '#e9ecef' : 'white' }}
                    />
                </div>

                {/* Campo de motivación siempre editable */}
                <div className="form-group">
                    <label htmlFor="motivation">¿Por qué quieres adoptar a {animal.name}? (Tu motivación)</label>
                    <textarea
                        id="motivation"
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        rows={5}
                        required
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loadingSubmit}>
                        {loadingSubmit ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                    <button type="button" onClick={handleGoBack} className="go-back-button" disabled={loadingSubmit}>
                        Volver
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdoptionFormPage;
