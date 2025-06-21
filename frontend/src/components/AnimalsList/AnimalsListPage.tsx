import { useState, useEffect } from 'react';
import './AnimalsListPage.css'; // Crearemos este archivo CSS a continuación

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

// Interfaz para las propiedades de la tarjeta de animal
interface AnimalCardProps {
    animal: Animal; // Pasamos el objeto animal completo
    onAdoptClick: (animalId: number) => void;
}

const AnimalCard = ({ animal, onAdoptClick }: AnimalCardProps) => {
    // Usar la primera URL de la lista si existe, de lo contrario un placeholder
    const imageUrl = animal.image_urls && animal.image_urls.length > 0 ? animal.image_urls[0] : 'https://placehold.co/300x200/cccccc/333333?text=Sin+Imagen';

    return (
        <div className="animal-list-card">
            <div className="animal-list-image-container">
                <img
                    src={imageUrl}
                    alt={animal.name}
                    className="animal-list-img"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x200/cccccc/333333?text=Imagen+No+Cargada'; }}
                />
            </div>
            <div className="animal-list-details">
                <h3>{animal.name}</h3>
                <p>{animal.description_short}</p>
                <div className="animal-list-meta">
                    {animal.age_approx && <span>Edad: {animal.age_approx}</span>}
                    {animal.size && <span>Tamaño: {animal.size}</span>}
                    {animal.gender && <span>Género: {animal.gender}</span>}
                    {animal.breed && <span>Raza: {animal.breed}</span>}
                </div>
                <button className="adopt-button" onClick={() => onAdoptClick(animal.id)}>Quiero adoptar</button>
            </div>
        </div>
    );
};


// Interfaz de props para el componente principal AnimalsListPage
interface AnimalsListPageProps {
    onAdoptClick: (animalId: number) => void; // Recibe la función para ir al formulario de adopción
    onGoBack: () => void; // Función para volver a la página anterior
}

function AnimalsListPage({ onAdoptClick, onGoBack }: AnimalsListPageProps) {
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
                // Solo muestra animales disponibles para adopción
                setAnimals(data.filter(animal => animal.adoption_status === 'disponible'));
            } catch (err: unknown) {
                console.error("Error fetching all animals:", err);
                if (err instanceof Error) {
                    setError(`No se pudieron cargar los animales: ${err.message}.`);
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
            <div className="animals-list-page-container">
                <h2>Cargando Animales...</h2>
                <p>Por favor, espera.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animals-list-page-container">
                <h2>Error al cargar</h2>
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={onGoBack} className="go-back-button">Volver</button>
            </div>
        );
    }

    return (
        <div className="animals-list-page-container">
            <div className="page-header">
                <h2>Todos Nuestros Animales Disponibles</h2>
                <p>¡Explora a nuestros adorables amigos en busca de un hogar!</p>
                <button onClick={onGoBack} className="go-back-button">Volver a la Página Principal</button>
            </div>

            <div className="animals-list-grid">
                {animals.length > 0 ? (
                    animals.map(animal => (
                        <AnimalCard
                            key={animal.id}
                            animal={animal}
                            onAdoptClick={onAdoptClick}
                        />
                    ))
                ) : (
                    <p>No hay animales disponibles por el momento.</p>
                )}
            </div>
        </div>
    );
}

export default AnimalsListPage;
