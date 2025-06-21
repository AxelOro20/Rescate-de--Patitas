import { useState, useEffect } from 'react';
import './NewArrivals.css';

// Interfaz para las propiedades de la tarjeta de animal
interface NewArrivalCardProps {
    name: string;
    description: string;
    age_approx?: string;
    size?: string;
    image_urls?: string[];
    onAdoptClick: (animalId: number) => void;
    animalId: number;
}

// Componente de tarjeta de nuevo inquilino
const NewArrivalCard = ({ name, description, age_approx, size, image_urls, onAdoptClick, animalId }: NewArrivalCardProps) => {
    const imageUrl = image_urls && image_urls.length > 0 ? image_urls[0] : 'https://placehold.co/300x200/cccccc/333333?text=Sin+Imagen';

    return (
        <div className="new-arrival-card">
            <div className="new-arrival-image-placeholder">
                <img
                    src={imageUrl}
                    alt={name}
                    className="animal-card-img"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x200/cccccc/333333?text=Imagen+No+Cargada'; }}
                />
                <span className="new-badge">Nuevo</span>
            </div>
            <h3>{name}</h3>
            <p>{description}</p>
            <div className="animal-details">
                {age_approx && <span>Edad: {age_approx}</span>}
                {size && <span>Tamaño: {size}</span>}
            </div>
            <button className="adopt-button" onClick={() => onAdoptClick(animalId)}>Quiero adoptar</button>
        </div>
    );
};

// Interfaz para la estructura de los animales que vienen del backend
interface Animal {
    id: number;
    name: string;
    type: string;
    breed?: string;
    age_approx?: string;
    size?: string;
    gender?: string;
    description_short: string;
    description_long?: string;
    health_status?: string;
    is_featured: boolean;
    image_urls?: string[];
    created_at: string;
    updated_at: string;
    adoption_status: string;
}

// Interfaz de props para el componente principal NewArrivals
interface NewArrivalsProps {
    onAdoptClick: (animalId: number) => void;
    onViewAllClick: () => void; // <-- ¡ESTA LÍNEA ES LA CLAVE DE LA CORRECCIÓN!
}

function NewArrivals({ onAdoptClick, onViewAllClick }: NewArrivalsProps) {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnimals = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/animals');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Animal[] = await response.json();
                setAnimals(data.filter(animal => animal.adoption_status === 'disponible'));
            } catch (err: unknown) {
                console.error("Error fetching animals:", err);
                if (err instanceof Error) {
                    setError(`No se pudieron cargar los animales: ${err.message}. Intenta de nuevo más tarde.`);
                } else {
                    setError("Ocurrió un error desconocido al cargar los animales.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnimals();
    }, []);

    if (loading) {
        return (
            <section className="new-arrivals-section" id="new-arrivals-section">
                <h2>Cargando Nuevos Inquilinos...</h2>
                <p>Por favor, espera.</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="new-arrivals-section" id="new-arrivals-section">
                <h2>Error al cargar</h2>
                <p style={{ color: 'red' }}>{error}</p>
            </section>
        );
    }

    const animalsToShow = animals.slice(0, 3);

    return (
        <section className="new-arrivals-section" id="new-arrivals-section">
            <h2>Nuevos inquilinos</h2>
            <div className="new-arrivals-grid">
                {animalsToShow.length > 0 ? (
                    animalsToShow.map(animal => (
                        <NewArrivalCard
                            key={animal.id}
                            animalId={animal.id}
                            name={animal.name}
                            description={animal.description_short}
                            age_approx={animal.age_approx}
                            size={animal.size}
                            image_urls={animal.image_urls}
                            onAdoptClick={onAdoptClick}
                        />
                    ))
                ) : (
                    <p>No hay nuevos animales disponibles por el momento.</p>
                )}
            </div>
            {animals.length > 3 && (
                <button className="view-all-button" onClick={onViewAllClick}>Ver todos</button>
            )}
        </section>
    );
}

export default NewArrivals;
