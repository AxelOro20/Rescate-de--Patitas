import React, { useState } from 'react'; // Eliminado useEffect ya que no se usa
import './AnimalFormModal.css'; // Estilos para el modal

// Interfaz para el tipo de Animal (debe coincidir con Animal en AdminPanelPage.tsx)
interface Animal {
    id?: number; // Opcional para cuando se está creando un nuevo animal
    name: string;
    type: string;
    breed?: string | null; // <-- Añadido | null
    age_approx?: string | null; // <-- Añadido | null
    size?: string | null; // <-- Añadido | null
    gender?: string | null; // <-- Añadido | null
    description_short: string;
    description_long?: string | null; // <-- Añadido | null
    health_status?: string | null; // <-- Añadido | null
    is_featured: boolean;
    image_urls?: string[]; // Array de strings para URLs de imágenes
    adoption_status: string; // Estado de adopción
}

// Propiedades para el AnimalFormModal
interface AnimalFormModalProps {
    animalToEdit: Animal | null; // El animal a editar (null si es para agregar)
    onClose: () => void; // Función para cerrar el modal
    onSuccess: () => void; // Función a llamar al éxito (para recargar lista)
}

function AnimalFormModal({ animalToEdit, onClose, onSuccess }: AnimalFormModalProps) {
    const [name, setName] = useState(animalToEdit?.name || '');
    const [type, setType] = useState(animalToEdit?.type || 'perro'); // Valor por defecto
    const [breed, setBreed] = useState(animalToEdit?.breed || '');
    const [ageApprox, setAgeApprox] = useState(animalToEdit?.age_approx || '');
    const [size, setSize] = useState(animalToEdit?.size || 'mediano'); // Valor por defecto
    const [gender, setGender] = useState(animalToEdit?.gender || 'macho'); // Valor por defecto
    const [descriptionShort, setDescriptionShort] = useState(animalToEdit?.description_short || '');
    const [descriptionLong, setDescriptionLong] = useState(animalToEdit?.description_long || '');
    const [healthStatus, setHealthStatus] = useState(animalToEdit?.health_status || '');
    const [isFeatured, setIsFeatured] = useState(animalToEdit?.is_featured || false);
    const [adoptionStatus, setAdoptionStatus] = useState(animalToEdit?.adoption_status || 'disponible'); // Valor por defecto
    const [imageUrls, setImageUrls] = useState(animalToEdit?.image_urls?.join('\n') || ''); // Un string de URLs separadas por nueva línea

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const token = localStorage.getItem('userToken');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        // Convertir el string de URLs a un array
        const imageUrlsArray = imageUrls.split('\n').map(url => url.trim()).filter(url => url !== '');

        // Aseguramos que los campos opcionales sean `null` si están vacíos,
        // para que coincidan con la base de datos si así lo requiere.
        const animalData: Partial<Animal> = {
            name,
            type,
            breed: breed || null, 
            age_approx: ageApprox || null,
            size: size || null,
            gender: gender || null,
            description_short: descriptionShort,
            description_long: descriptionLong || null,
            health_status: healthStatus || null,
            is_featured: isFeatured,
            image_urls: imageUrlsArray,
            adoption_status: adoptionStatus,
        };

        const method = animalToEdit ? 'PUT' : 'POST';
        const url = animalToEdit ? `http://localhost:5000/api/animals/${animalToEdit.id}` : 'http://localhost:5000/api/animals';

        if (!token) {
            setError("Error: No estás autenticado.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(animalData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || `Animal ${animalToEdit ? 'actualizado' : 'creado'} exitosamente.`);
                setTimeout(() => {
                    onSuccess(); // Cierra el modal y recarga la lista
                }, 1500); // Dar tiempo para que el usuario vea el mensaje de éxito
            } else {
                setError(data.message || `Error al ${animalToEdit ? 'actualizar' : 'crear'} el animal.`);
            }
        } catch (err: unknown) {
            console.error(`Error al ${animalToEdit ? 'actualizar' : 'crear'} animal:`, err);
            if (err instanceof Error) {
                setError(`No se pudo conectar con el servidor: ${err.message}.`);
            } else {
                setError("Ocurrió un error desconocido.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animal-form-modal-overlay">
            <div className="animal-form-modal-content">
                <h2>{animalToEdit ? 'Editar Animal' : 'Agregar Nuevo Animal'}</h2>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre:</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Tipo:</label>
                        <select id="type" value={type} onChange={(e) => setType(e.target.value)} required>
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="breed">Raza:</label>
                        <input type="text" id="breed" value={breed || ''} onChange={(e) => setBreed(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ageApprox">Edad Aproximada:</label>
                        <input type="text" id="ageApprox" value={ageApprox || ''} onChange={(e) => setAgeApprox(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="size">Tamaño:</label>
                        <select id="size" value={size || ''} onChange={(e) => setSize(e.target.value)}>
                            <option value="pequeño">Pequeño</option>
                            <option value="mediano">Mediano</option>
                            <option value="grande">Grande</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Género:</label>
                        <select id="gender" value={gender || ''} onChange={(e) => setGender(e.target.value)}>
                            <option value="macho">Macho</option>
                            <option value="hembra">Hembra</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="descriptionShort">Descripción Corta:</label>
                        <textarea id="descriptionShort" value={descriptionShort} onChange={(e) => setDescriptionShort(e.target.value)} required rows={3}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="descriptionLong">Descripción Larga:</label>
                        <textarea id="descriptionLong" value={descriptionLong || ''} onChange={(e) => setDescriptionLong(e.target.value)} rows={5}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="healthStatus">Estado de Salud:</label>
                        <input type="text" id="healthStatus" value={healthStatus || ''} onChange={(e) => setHealthStatus(e.target.value)} />
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                        <label htmlFor="isFeatured">¿Es Destacado?</label>
                    </div>
                     <div className="form-group">
                        <label htmlFor="adoptionStatus">Estado de Adopción:</label>
                        <select id="adoptionStatus" value={adoptionStatus} onChange={(e) => setAdoptionStatus(e.target.value)} required>
                            <option value="disponible">Disponible</option>
                            <option value="en proceso">En proceso</option>
                            <option value="adoptado">Adoptado</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="imageUrls">URLs de Imágenes (una por línea):</label>
                        <textarea id="imageUrls" value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} rows={4}></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : (animalToEdit ? 'Actualizar Animal' : 'Agregar Animal')}
                        </button>
                        <button type="button" onClick={onClose} disabled={loading} className="cancel-button">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AnimalFormModal;
