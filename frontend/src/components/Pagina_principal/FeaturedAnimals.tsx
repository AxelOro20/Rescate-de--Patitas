import './FeaturedAnimals.css'; // Estilos para FeaturedAnimals

// 1. Define la interfaz para las propiedades del componente AnimalCard
interface AnimalCardProps {
    name: string; // La propiedad 'name' debe ser de tipo string
}

// Un componente simple para una tarjeta de animal
// 2. Aplica la interfaz AnimalCardProps a las propiedades del componente
const AnimalCard = ({ name }: AnimalCardProps) => (
    <div className="animal-card">
        <div className="animal-image-placeholder"></div>
        <h3>{name}</h3>
    </div>
);

function FeaturedAnimals() {
    // Datos de ejemplo, luego vendrán de la API
    const featured = [
        { id: 1, name: 'Firulais' },
        { id: 2, name: 'Bigotes' },
        { id: 3, name: 'Sanzon' },
    ];

    return (
        <section className="featured-animals">
            {featured.map(animal => (
                <AnimalCard key={animal.id} name={animal.name} />
            ))}
        </section>
    );
}

export default FeaturedAnimals;
