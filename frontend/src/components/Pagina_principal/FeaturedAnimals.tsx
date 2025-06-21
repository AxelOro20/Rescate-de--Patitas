import { useState, useEffect } from 'react';
import './FeaturedAnimals.css';

// Interfaz para las propiedades de la tarjeta de animal
interface AnimalCardProps {
    name: string;
    image_urls?: string[];
    onAdoptClick: (animalId: number) => void; // <-- ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE!
    animalId: number; // <-- ¡Y ESTA TAMBIÉN!
}

// Un componente simple para una tarjeta de animal
const AnimalCard = ({ name, image_urls, onAdoptClick, animalId }: AnimalCardProps) => {
    const imageUrl = image_urls && image_urls.length > 0 ? image_urls[0] : 'https://placehold.co/300x200/cccccc/333333?text=Sin+Imagen';

    return (
        <div className="animal-card">
            <div className="animal-image-placeholder">
                <img
                    src={imageUrl}
                    alt={name}
                    className="animal-card-img"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x200/cccccc/333333?text=Imagen+No+Cargada'; }}
                />
            </div>
            <h3>{name}</h3>
            {/* Añadimos el botón de adopción aquí */}
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

// Interfaz de props para el componente principal FeaturedAnimals
interface FeaturedAnimalsProps {
    onAdoptClick: (animalId: number) => void; // <-- ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE!
}

function FeaturedAnimals({ onAdoptClick }: FeaturedAnimalsProps) {
    const [featuredAnimals, setFeaturedAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeaturedAnimals = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/animals');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Animal[] = await response.json();
                setFeaturedAnimals(data.filter(animal => animal.is_featured === true));
            } catch (err: unknown) {
                console.error("Error fetching featured animals:", err);
                if (err instanceof Error) {
                    setError(`No se pudieron cargar los animales destacados: ${err.message}.`);
                } else {
                    setError("Ocurrió un error desconocido al cargar los animales destacados.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedAnimals();
    }, []);

    if (loading) {
        return (
            <section className="featured-animals">
                <h2>Cargando Animales Destacados...</h2>
                <p>Por favor, espera.</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="featured-animals">
                <h2>Error al cargar</h2>
                <p style={{ color: 'red' }}>{error}</p>
            </section>
        );
    }

    return (
        <section className="featured-animals">
            <h2>Animales Destacados</h2>
            <div className="featured-animals-grid">
                {featuredAnimals.length > 0 ? (
                    featuredAnimals.map(animal => (
                        <AnimalCard
                            key={animal.id}
                            animalId={animal.id} // Pasa el ID del animal a la tarjeta
                            name={animal.name}
                            image_urls={animal.image_urls}
                            onAdoptClick={onAdoptClick} // Pasa la prop onAdoptClick a la tarjeta
                        />
                    ))
                ) : (
                    <p>No hay animales destacados por el momento.</p>
                )}
            </div>
        </section>
    );
}

export default FeaturedAnimals;
