import React, { useState, useEffect, useCallback } from 'react';
import './AdminAnimalsPage.css'; // Asegúrate de que esta ruta sea correcta
import '../AnimalFormModal.css'; // Estilos para el modal

import type { UserData } from '../../../types'; // Importa la interfaz UserData

// Interfaz para la estructura del animal (debe coincidir con la base de datos)
interface Animal {
    id: number;
    name: string;
    type: string;
    breed: string | null;
    age_approx: number | null;
    size: string | null;
    gender: string | null;
    description_short: string | null;
    description_long: string | null;
    health_status: string | null;
    is_featured: boolean;
    image_urls: string[];
    adoption_status: string; // <-- Asegúrate de que esta propiedad exista en tu DB y aquí
    created_at: string;
    updated_at: string;
}

// Interfaz para las propiedades del modal de formulario de animal
interface AnimalFormModalProps {
    animalToEdit: Animal | null; // Animal a editar (null para crear)
    onClose: () => void; // Para cerrar el modal
    onSuccess: () => void; // Para recargar la lista de animales tras éxito
}

// ** Componente: AnimalFormModal **
const AnimalFormModal: React.FC<AnimalFormModalProps> = ({ animalToEdit, onClose, onSuccess }) => {
    // Inicializa los estados con los valores del animal a editar o valores por defecto
    const [name, setName] = useState(animalToEdit?.name || '');
    const [type, setType] = useState(animalToEdit?.type || '');
    const [breed, setBreed] = useState(animalToEdit?.breed || '');
    const [ageApprox, setAgeApprox] = useState(animalToEdit?.age_approx?.toString() || '');
    const [size, setSize] = useState(animalToEdit?.size || '');
    const [gender, setGender] = useState(animalToEdit?.gender || '');
    const [descriptionShort, setDescriptionShort] = useState(animalToEdit?.description_short || '');
    const [descriptionLong, setDescriptionLong] = useState(animalToEdit?.description_long || '');
    const [healthStatus, setHealthStatus] = useState(animalToEdit?.health_status || '');
    const [isFeatured, setIsFeatured] = useState(animalToEdit?.is_featured || false);
    const [imageUrls, setImageUrls] = useState(animalToEdit?.image_urls.join('\n') || ''); // Unimos URLs con saltos de línea
    const [adoptionStatus, setAdoptionStatus] = useState(animalToEdit?.adoption_status || 'disponible'); // <-- Nuevo estado para el estado de adopción

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

    const token = localStorage.getItem('userToken');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccessMessage(null);

        if (!token) {
            setFormError("No autorizado. Por favor, inicia sesión.");
            setFormLoading(false);
            return;
        }

        // Validación básica
        if (!name || !type) {
            setFormError("El nombre y el tipo del animal son obligatorios.");
            setFormLoading(false);
            return;
        }

        const payload = {
            name,
            type,
            breed: breed || null,
            age_approx: ageApprox ? parseInt(ageApprox) : null,
            size: size || null,
            gender: gender || null,
            description_short: descriptionShort || null,
            description_long: descriptionLong || null,
            health_status: healthStatus || null,
            is_featured: isFeatured,
            image_urls: imageUrls.split('\n').filter(url => url.trim() !== ''), // Convertimos de nuevo a array
            adoption_status: adoptionStatus // <-- Incluir en el payload
        };

        const method = animalToEdit ? 'PUT' : 'POST';
        const url = animalToEdit ? `http://localhost:5000/api/animals/${animalToEdit.id}` : 'http://localhost:5000/api/animals';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setFormSuccessMessage(data.message || `Animal ${animalToEdit ? 'actualizado' : 'creado'} exitosamente.`);
                setTimeout(() => {
                    onSuccess(); // Recarga la lista en el componente padre
                    onClose(); // Cierra el modal
                }, 1500);
            } else {
                setFormError(data.message || `Error al ${animalToEdit ? 'actualizar' : 'crear'} el animal.`);
            }
        } catch (err: unknown) {
            console.error(`Error al ${animalToEdit ? 'actualizar' : 'crear'} animal:`, err);
            if (err instanceof Error) {
                setFormError(`No se pudo conectar con el servidor: ${err.message}.`);
            } else {
                setFormError("Ocurrió un error desconocido.");
            }
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="animal-form-modal-overlay">
            <div className="animal-form-modal-content">
                <h3>{animalToEdit ? `Editar Animal: ${animalToEdit.name}` : 'Registrar Nuevo Animal'}</h3>
                {formSuccessMessage && <p className="success-message">{formSuccessMessage}</p>}
                {formError && <p className="error-message">{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre:</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Tipo:</label>
                        <input type="text" id="type" value={type} onChange={(e) => setType(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="breed">Raza:</label>
                        <input type="text" id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="age_approx">Edad Aproximada (años):</label>
                        <input type="number" id="age_approx" value={ageApprox} onChange={(e) => setAgeApprox(e.target.value)} min="0" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="size">Tamaño:</label>
                        <select id="size" value={size} onChange={(e) => setSize(e.target.value)}>
                            <option value="">Seleccionar</option>
                            <option value="pequeno">Pequeño</option>
                            <option value="mediano">Mediano</option>
                            <option value="grande">Grande</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Género:</label>
                        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Seleccionar</option>
                            <option value="macho">Macho</option>
                            <option value="hembra">Hembra</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description_short">Descripción Corta:</label>
                        <textarea id="description_short" value={descriptionShort} onChange={(e) => setDescriptionShort(e.target.value)} rows={2}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description_long">Descripción Larga:</label>
                        <textarea id="description_long" value={descriptionLong} onChange={(e) => setDescriptionLong(e.target.value)} rows={4}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="health_status">Estado de Salud:</label>
                        <input type="text" id="health_status" value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)} />
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="is_featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                        <label htmlFor="is_featured">Destacado en Home</label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="image_urls">URLs de Imágenes (una por línea):</label>
                        <textarea id="image_urls" value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} rows={3}></textarea>
                    </div>
                    {/* Campo para el estado de adopción */}
                    <div className="form-group">
                        <label htmlFor="adoption_status">Estado de Adopción:</label>
                        <select
                            id="adoption_status"
                            value={adoptionStatus}
                            onChange={(e) => setAdoptionStatus(e.target.value)}
                            required
                        >
                            <option value="disponible">Disponible</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="adoptado">Adoptado</option> {/* <-- Opción "Adoptado" */}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" disabled={formLoading}>
                            {formLoading ? 'Guardando...' : (animalToEdit ? 'Actualizar Animal' : 'Registrar Animal')}
                        </button>
                        <button type="button" onClick={onClose} disabled={formLoading} className="cancel-button">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Interfaz para las propiedades del modal de confirmación
interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Componente: ConfirmationModal
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="animal-form-modal-overlay">
            <div className="animal-form-modal-content" style={{ maxWidth: '400px' }}>
                <h3>Confirmación</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button onClick={onConfirm} className="submit-button" style={{ backgroundColor: '#dc3545' }}>Confirmar</button>
                    <button onClick={onCancel} className="cancel-button">Cancelar</button>
                </div>
            </div>
        </div>
    );
};


// Propiedades para el componente principal AdminAnimalsPage
interface AdminAnimalsPageProps {
    currentUser: UserData | null;
}

function AdminAnimalsPage({ currentUser }: AdminAnimalsPageProps) {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [showAnimalModal, setShowAnimalModal] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [animalToDeleteId, setAnimalToDeleteId] = useState<number | null>(null);

    const [pageMessage, setPageMessage] = useState<string | null>(null);
    const [pageMessageType, setPageMessageType] = useState<'success' | 'error' | null>(null);


    const token = localStorage.getItem('userToken');

    const showTemporaryMessage = (message: string, type: 'success' | 'error') => {
        setPageMessage(message);
        setPageMessageType(type);
        setTimeout(() => {
            setPageMessage(null);
            setPageMessageType(null);
        }, 3000);
    };

    // Función para obtener todos los animales
    const fetchAnimals = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token || currentUser?.role !== 'admin') {
            setError("No autorizado. Solo los administradores pueden gestionar animales.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/animals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data: Animal[] = await response.json();
            setAnimals(data);
        } catch (err: unknown) {
            console.error('Error al obtener animales (admin):', err);
            if (err instanceof Error) {
                setError(`Error al cargar animales: ${err.message}`);
            } else {
                setError("Ocurrió un error desconocido al cargar animales.");
            }
        } finally {
            setLoading(false);
        }
    }, [token, currentUser]);

    useEffect(() => {
        fetchAnimals();
    }, [fetchAnimals]);

    // Manejador para abrir el modal de añadir animal
    const handleAddAnimalClick = () => {
        setEditingAnimal(null);
        setShowAnimalModal(true);
    };

    // Manejador para abrir el modal de editar animal
    const handleEditAnimalClick = (animal: Animal) => {
        setEditingAnimal(animal);
        setShowAnimalModal(true);
    };

    // Abre el modal de confirmación de eliminación
    const confirmDeleteAnimal = (animalId: number) => {
        setAnimalToDeleteId(animalId);
        setShowDeleteConfirm(true);
    };

    // Lógica para eliminar un animal después de la confirmación
    const handleDeleteAnimal = async () => {
        if (!animalToDeleteId) return;

        setShowDeleteConfirm(false);
        
        if (!token) {
            showTemporaryMessage('No autorizado para eliminar animales.', 'error');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/animals/${animalToDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                showTemporaryMessage(data.message || 'Animal eliminado exitosamente.', 'success');
                fetchAnimals(); // Recargar la lista
            } else {
                showTemporaryMessage(data.message || 'Error al eliminar el animal.', 'error');
            }
        } catch (err) {
            console.error('Error al eliminar animal:', err);
            showTemporaryMessage('No se pudo conectar con el servidor para eliminar el animal.', 'error');
        } finally {
            setAnimalToDeleteId(null);
        }
    };


    // Filtrar y buscar animales
    const filteredAnimals = animals.filter(animal => {
        const matchesType = filterType === 'all' || animal.type === filterType;
        const matchesSearch =
            animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.adoption_status.toLowerCase().includes(searchTerm.toLowerCase()) || // Filtrar por estado de adopción
            animal.id.toString().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Obtener tipos de animales únicos para el filtro
    const uniqueAnimalTypes = Array.from(new Set(animals.map(animal => animal.type)));


    if (currentUser?.role !== 'admin') {
        return (
            <div className="admin-animals-container not-authorized">
                <h2>Acceso Denegado</h2>
                <p>Solo los administradores pueden gestionar animales.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-animals-container">
                <p className="loading-message">Cargando animales...</p>
            </div>
        );
    }

    return (
        <div className="admin-animals-page">
            <div className="admin-animals-header">
                <h2>Gestión de Animales</h2>
                <p>Aquí puedes gestionar los animales disponibles en el refugio.</p>
                <button className="add-animal-button" onClick={handleAddAnimalClick}>
                    Registrar Nuevo Animal
                </button>
            </div>

            {pageMessage && (
                <p className={pageMessageType === 'success' ? 'success-message' : 'error-message'}>
                    {pageMessage}
                </p>
            )}
            {error && <p className="error-message">{error}</p>}

            <div className="animals-controls">
                <div className="filter-group">
                    <label htmlFor="filterType">Filtrar por Tipo:</label>
                    <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">Todos los tipos</option>
                        {uniqueAnimalTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="search-group">
                    <label htmlFor="searchTerm">Buscar:</label>
                    <input
                        type="text"
                        id="searchTerm"
                        placeholder="Buscar por nombre, raza, etc."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredAnimals.length === 0 ? (
                <p className="no-animals-message">No se encontraron animales con los filtros aplicados.</p>
            ) : (
                <div className="animals-table-container">
                    <table className="animals-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Raza</th>
                                <th>Edad</th>
                                <th>Estado Adopción</th> {/* <-- Nueva columna */}
                                <th>Destacado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAnimals.map(animal => (
                                <tr key={animal.id}>
                                    <td>{animal.id}</td>
                                    <td>{animal.name}</td>
                                    <td>{animal.type}</td>
                                    <td>{animal.breed || 'N/A'}</td>
                                    <td>{animal.age_approx || 'N/A'}</td>
                                    <td>
                                        <span className={`adoption-status-badge status-${animal.adoption_status.replace(/\s/g, '-').toLowerCase()}`}>
                                            {animal.adoption_status}
                                        </span>
                                    </td>
                                    <td>{animal.is_featured ? 'Sí' : 'No'}</td>
                                    <td>
                                        <div className="animal-actions">
                                            <button className="action-button edit-button" onClick={() => handleEditAnimalClick(animal)}>
                                                Editar
                                            </button>
                                            <button className="action-button delete-button" onClick={() => confirmDeleteAnimal(animal.id)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para añadir/editar animal */}
            {showAnimalModal && (
                <AnimalFormModal
                    animalToEdit={editingAnimal}
                    onClose={() => setShowAnimalModal(false)}
                    onSuccess={fetchAnimals}
                />
            )}

            {/* Modal de confirmación para eliminar */}
            {showDeleteConfirm && (
                <ConfirmationModal
                    message={`¿Estás seguro de que deseas eliminar a "${animals.find(a => a.id === animalToDeleteId)?.name || 'este animal'}"? Esta acción es irreversible.`}
                    onConfirm={handleDeleteAnimal}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setAnimalToDeleteId(null);
                    }}
                />
            )}
        </div>
    );
}

export default AdminAnimalsPage;
