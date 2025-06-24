import { useState, useEffect, useCallback } from 'react';
import './SuccessStoriesPage.css'; // Asegúrate de crear este archivo CSS

// Interfaz para la estructura del animal, incluyendo el estado de adopción
interface Animal {
    id: number;
    name: string;
    type: string;
    breed: string | null;
    age_approx: number | null;
    size: string | null;
    gender: string | null;
    description_short: string | null;
    image_urls: string[]; // Suponemos un array de URLs de imágenes
    adoption_status: string; // 'disponible', 'adoptado', etc.
}

function SuccessStoriesPage() {
    const [adoptedAnimals, setAdoptedAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAdoptedAnimals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/animals/adopted');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const data: Animal[] = await response.json();
            setAdoptedAnimals(data);
        } catch (err: unknown) {
            console.error("Error fetching adopted animals:", err);
            if (err instanceof Error) {
                setError(`Error al cargar los casos de éxito: ${err.message}`);
            } else {
                setError("Ocurrió un error desconocido al cargar los casos de éxito.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdoptedAnimals();
    }, [fetchAdoptedAnimals]);

    if (loading) {
        return (
            <div className="success-stories-container">
                <p className="loading-message">Cargando historias de éxito...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="success-stories-container">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="success-stories-container">
            <div className="success-stories-header">
                <h2>Historias de Éxito</h2>
                <p>Conoce a los animales que encontraron un hogar amoroso.</p>
            </div>

            {adoptedAnimals.length === 0 ? (
                <p className="no-stories-message">Aún no hay historias de éxito para mostrar.</p>
            ) : (
                <div className="adopted-animals-grid">
                    {adoptedAnimals.map(animal => (
                        <div key={animal.id} className="adopted-animal-card">
                            <div className="adopted-animal-image-wrapper">
                                <img
                                    src={animal.image_urls && animal.image_urls.length > 0 ? animal.image_urls[0] : `https://placehold.co/300x200/cccccc/ffffff?text=${animal.name || 'Animal'}`}
                                    alt={animal.name || 'Animal Adoptado'}
                                    className="adopted-animal-image"
                                    onError={(e) => { e.currentTarget.src = `https://placehold.co/300x200/cccccc/ffffff?text=${animal.name || 'Animal'}`; }}
                                />
                                <span className="adopted-badge">Adoptado</span> {/* Etiqueta de "Adoptado" */}
                            </div>
                            <div className="adopted-animal-info">
                                <h3>{animal.name}</h3>
                                <p><strong>Tipo:</strong> {animal.type}</p>
                                <p><strong>Raza:</strong> {animal.breed || 'Desconocida'}</p>
                                <p><strong>Edad:</strong> {animal.age_approx ? `${animal.age_approx} años` : 'Desconocida'}</p>
                                <p className="adoption-message">¡Encontró su hogar para siempre!</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SuccessStoriesPage;
