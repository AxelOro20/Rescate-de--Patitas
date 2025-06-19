import './NewArrivals.css'; // Estilos para NewArrivals
// import { FaPaw } from 'react-icons/fa'; // Para iconos como la patita, si usas react-icons

// 1. Define la interfaz para las propiedades del componente NewArrivalCard
interface NewArrivalCardProps {
    name: string;
    description: string;
    age?: string; // Hacemos 'age' opcional con '?' si no siempre viene
    size?: string; // Hacemos 'size' opcional con '?' si no siempre viene
    onAdoptClick: () => void; // Función que no toma argumentos y no devuelve nada
}

// Componente de tarjeta de nuevo inquilino
// 2. Aplica la interfaz NewArrivalCardProps a las propiedades del componente
const NewArrivalCard = ({ name, description, age, size, onAdoptClick }: NewArrivalCardProps) => (
    <div className="new-arrival-card">
        <div className="new-arrival-image-placeholder">
            <span className="new-badge">Nuevo</span>
        </div>
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="animal-details">
            {age && <span>Edad: {age}</span>}
            {size && <span>Tamaño: {size}</span>}
        </div>
        <button className="adopt-button" onClick={onAdoptClick}>Quiero adoptar</button>
    </div>
);

function NewArrivals() {
    // Datos de ejemplo, luego vendrán de la API
    const newAnimals = [
        { id: 4, name: 'Firulais 2', description: 'Amante de los paseos, está en busca de un hogar.', age: '3 años', size: 'Mediano' },
        { id: 5, name: 'Rooibos', description: 'Juguetón y cariñoso, busca una familia.', age: '1 año', size: 'Pequeño' },
        { id: 6, name: 'Ginger', description: 'Tranquilo y hogareño, ideal para un apartamento.', age: '5 años', size: 'Grande' },
        { id: 7, name: 'Max', description: 'Energético y leal, perfecto para familias activas.', age: '2 años', size: 'Mediano' } // ¡Nuevo inquilino añadido!
    ];

    // 3. Tipa el parámetro 'animalId' como 'number' (asumiendo que los IDs son números)
    const handleAdoptClick = (animalId: number) => {
        // En un proyecto real, usa un modal o una página de confirmación, no alert()
        alert(`Solicitud de adopción para el animal con ID: ${animalId}. (Formulario aún no implementado)`);
        // Aquí podrías redirigir a un formulario de adopción o abrir un modal
    };

    return (
        // Asegúrate de que esta sección tenga el ID para el scroll suave desde HeroSection
        <section className="new-arrivals-section" id="new-arrivals-section">
            <h2>Nuevos inquilinos</h2>
            <div className="new-arrivals-grid">
                {newAnimals.map(animal => (
                    <NewArrivalCard
                        key={animal.id}
                        name={animal.name}
                        description={animal.description}
                        age={animal.age}
                        size={animal.size}
                        // Envuelve la llamada para pasar el ID del animal
                        onAdoptClick={() => handleAdoptClick(animal.id)}
                    />
                ))}
            </div>
            <button className="view-all-button">Ver todos</button>
        </section>
    );
}

export default NewArrivals;
