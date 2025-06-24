import { useState, useEffect } from 'react'; // Eliminado 'React' ya que no se usa directamente
import { useParams, useNavigate } from 'react-router-dom';
import './AnimalDetailPage.css'; // Crear este CSS

interface Animal {
    id: number;
    name: string;
    type: string;
    breed?: string | null; // Añadido | null para flexibilidad
    age_approx?: string | null; // Añadido | null
    size?: string | null; // Añadido | null
    gender?: string | null; // Añadido | null
    description_short: string;
    description_long?: string | null; // Añadido | null
    health_status?: string | null; // Añadido | null
    is_featured: boolean;
    image_urls?: string[];
    created_at: string;
    updated_at: string;
    adoption_status: string;
}

function AnimalDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnimal = async () => {
            if (!id) {
                setError("ID de animal no proporcionado.");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:5000/api/animals/${id}`);
                if (!response.ok) {
                    throw new Error('Animal no encontrado o error al cargar.');
                }
                const data: Animal = await response.json();
                setAnimal(data);
            } catch (err: unknown) { // CAMBIO: Usar 'unknown' en lugar de 'any' para un tipado más seguro
                console.error("Error fetching animal:", err);
                // CAMBIO: Narrowing de tipo para 'err'
                if (err instanceof Error) {
                    setError(err.message || "Error al cargar los detalles del animal.");
                } else {
                    setError("Ocurrió un error desconocido al cargar los detalles del animal.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAnimal();
    }, [id]);

    const handleAdoptClick = () => {
        if (animal) {
            navigate(`/adopt/${animal.id}`);
        }
    };

    if (loading) {
        return (
            <div className="animal-detail-container">
                <p>Cargando detalles del animal...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animal-detail-container">
                <p className="error-message">{error}</p>
                <button onClick={() => navigate('/animals')} className="go-back-button">Volver a la Lista</button>
            </div>
        );
    }

    if (!animal) {
        return (
            <div className="animal-detail-container">
                <p>No se encontró el animal.</p>
                <button onClick={() => navigate('/animals')} className="go-back-button">Volver a la Lista</button>
            </div>
        );
    }

    return (
        <div className="animal-detail-container">
            <div className="animal-detail-header">
                <h2>Detalles de {animal.name}</h2>
                <button onClick={() => navigate('/animals')} className="go-back-button">Volver a la Lista</button>
            </div>
            <div className="animal-detail-content">
                <div className="animal-detail-image-gallery">
                    {animal.image_urls && animal.image_urls.length > 0 ? (
                        animal.image_urls.map((url, index) => (
                            <img key={index} src={url} alt={animal.name} className="animal-detail-img" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300/cccccc/333333?text=Imagen+No+Cargada"; }} />
                        ))
                    ) : (
                        <img src="https://placehold.co/400x300/cccccc/333333?text=Sin+Imagen" alt="Placeholder" className="animal-detail-img" />
                    )}
                </div>
                <div className="animal-detail-info">
                    <h3>{animal.name} ({animal.type})</h3>
                    <p><strong>Raza:</strong> {animal.breed || 'N/A'}</p>
                    <p><strong>Edad:</strong> {animal.age_approx || 'N/A'}</p>
                    <p><strong>Tamaño:</strong> {animal.size || 'N/A'}</p>
                    <p><strong>Género:</strong> {animal.gender || 'N/A'}</p>
                    <p><strong>Estado de salud:</strong> {animal.health_status || 'Desconocido'}</p>
                    <p><strong>Estado de adopción:</strong> <span className={`status-badge status-${animal.adoption_status.replace(/\s/g, '-')}`}>{animal.adoption_status}</span></p>
                    <h4>Descripción:</h4>
                    <p>{animal.description_long || animal.description_short}</p>
                    {animal.adoption_status === 'disponible' && (
                        <button className="cta-button" onClick={handleAdoptClick}>Adoptar a {animal.name}</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnimalDetailPage;
