import React, { useState, useEffect, useCallback } from 'react';
import './AdminUsersPage.css'; // Asegúrate de que esta ruta sea correcta
import type { UserData } from '../../../types'; // Ruta relativa correcta para types

// Interfaz para la estructura de los usuarios (debe coincidir con la base de datos)
interface User {
    id: number;
    email: string;
    name: string | null;
    lastname: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    role: string;
    created_at: string;
    updated_at: string;
}

// Interfaz para las propiedades del modal de formulario de usuario
interface UserFormModalProps {
    userToEdit: User | null; // Usuario a editar (null para crear)
    onClose: () => void; // Para cerrar el modal
    onSuccess: () => void; // Para recargar la lista de usuarios tras éxito
}

// ** Componente: UserFormModal **
const UserFormModal: React.FC<UserFormModalProps> = ({ userToEdit, onClose, onSuccess }) => {
    // Hooks de estado deben ser llamados incondicionalmente al principio del componente.
    // Inicializamos los valores basados en userToEdit, que puede ser null para "crear".
    const [email, setEmail] = useState(userToEdit?.email || '');
    const [name, setName] = useState(userToEdit?.name || '');
    const [lastname, setLastname] = useState(userToEdit?.lastname || '');
    const [phone, setPhone] = useState(userToEdit?.phone || '');
    const [address, setAddress] = useState(userToEdit?.address || '');
    const [city, setCity] = useState(userToEdit?.city || '');
    const [state, setState] = useState(userToEdit?.state || '');
    const [zipCode, setZipCode] = useState(userToEdit?.zip_code || '');
    const [role, setRole] = useState(userToEdit?.role || 'user'); // Rol por defecto 'user' para nuevos

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

        const payload = {
            email,
            name: name || null, // Asegurar que los campos vacíos sean null
            lastname: lastname || null,
            phone: phone || null,
            address: address || null,
            city: city || null,
            state: state || null,
            zip_code: zipCode || null,
            role, // Incluir el rol en el payload
        };

        const method = userToEdit ? 'PUT' : 'POST';
        const url = userToEdit ? `http://localhost:5000/api/users/${userToEdit.id}` : 'http://localhost:5000/api/users'; // Si no hay userToEdit, es una creación

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setFormSuccessMessage(data.message || `Usuario ${userToEdit ? 'actualizado' : 'creado'} exitosamente.`);
                setTimeout(() => {
                    onSuccess(); // Recarga la lista de usuarios en la página principal
                    onClose(); // Cierra el modal
                }, 1500);
            } else {
                setFormError(data.message || `Error al ${userToEdit ? 'actualizar' : 'crear'} el usuario.`);
            }
        } catch (err: unknown) {
            console.error('Error al enviar formulario de usuario:', err);
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
        <div className="user-form-modal-overlay">
            <div className="user-form-modal-content">
                <h3>{userToEdit ? `Editar Usuario (ID: ${userToEdit.id})` : 'Crear Nuevo Usuario'}</h3>
                {formSuccessMessage && <p className="success-message">{formSuccessMessage}</p>}
                {formError && <p className="error-message">{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="userEmail">Email:</label>
                        <input
                            type="email"
                            id="userEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userName">Nombre:</label>
                        <input
                            type="text"
                            id="userName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userLastname">Apellido:</label>
                        <input
                            type="text"
                            id="userLastname"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userPhone">Teléfono:</label>
                        <input
                            type="tel"
                            id="userPhone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userAddress">Dirección:</label>
                        <input
                            type="text"
                            id="userAddress"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userCity">Ciudad:</label>
                        <input
                            type="text"
                            id="userCity"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userState">Estado/Provincia:</label>
                        <input
                            type="text"
                            id="userState"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userZipCode">Código Postal:</label>
                        <input
                            type="text"
                            id="userZipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userRole">Rol:</label>
                        <select
                            id="userRole"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                            <option value="volunteer">Voluntario</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" disabled={formLoading}>
                            {formLoading ? 'Guardando...' : (userToEdit ? 'Actualizar Usuario' : 'Crear Usuario')}
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

// ** Componente: ConfirmationModal (Nuevo) **
interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="user-form-modal-overlay"> {/* Reutiliza el estilo del overlay */}
            <div className="user-form-modal-content" style={{ maxWidth: '400px' }}> {/* Estilo para un modal más pequeño */}
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


// Propiedades para el componente principal AdminUsersPage
interface AdminUsersPageProps {
    currentUser: UserData | null;
}

function AdminUsersPage({ currentUser }: AdminUsersPageProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null); // Usuario seleccionado para edición

    // Estados para el modal de confirmación de eliminación
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);

    // Estados para mensajes de éxito/error en la página principal
    const [pageMessage, setPageMessage] = useState<string | null>(null);
    const [pageMessageType, setPageMessageType] = useState<'success' | 'error' | null>(null);


    const token = localStorage.getItem('userToken');

    // Función para mostrar un mensaje temporal en la página
    const showTemporaryMessage = (message: string, type: 'success' | 'error') => {
        setPageMessage(message);
        setPageMessageType(type);
        setTimeout(() => {
            setPageMessage(null);
            setPageMessageType(null);
        }, 3000); // El mensaje desaparece después de 3 segundos
    };

    // Función para obtener todos los usuarios
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token || currentUser?.role !== 'admin') {
            setError("No autorizado. Solo los administradores pueden gestionar usuarios.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data: User[] = await response.json();
            setUsers(data);
        } catch (err: unknown) {
            console.error('Error al obtener usuarios (admin):', err);
            if (err instanceof Error) {
                setError(`Error al cargar usuarios: ${err.message}`);
            } else {
                setError("Ocurrió un error desconocido al cargar usuarios.");
            }
        } finally {
            setLoading(false);
        }
    }, [token, currentUser]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Manejador para abrir el modal de añadir usuario
    const handleAddUserClick = () => {
        setEditingUser(null); // Establece userToEdit como null para el modo de creación
        setShowUserModal(true);
    };

    // Manejador para abrir el modal de editar usuario
    const handleEditUserClick = (user: User) => {
        setEditingUser(user); // Pasa el usuario completo para editar
        setShowUserModal(true);
    };

    // Abre el modal de confirmación de eliminación
    const confirmDeleteUser = (userId: number) => {
        setUserToDeleteId(userId);
        setShowDeleteConfirm(true);
    };

    // Lógica para eliminar un usuario después de la confirmación
    const handleDeleteUser = async () => {
        if (!userToDeleteId) return; // Si no hay ID, salir

        setShowDeleteConfirm(false); // Cierra el modal de confirmación
        
        if (!token) {
            showTemporaryMessage('No autorizado para eliminar usuarios.', 'error');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userToDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                showTemporaryMessage(data.message || 'Usuario eliminado exitosamente.', 'success');
                fetchUsers(); // Recargar la lista
            } else {
                showTemporaryMessage(data.message || 'Error al eliminar el usuario.', 'error');
            }
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            showTemporaryMessage('No se pudo conectar con el servidor para eliminar el usuario.', 'error');
        } finally {
            setUserToDeleteId(null); // Resetea el ID de usuario a eliminar
        }
    };


    // Filtrar y buscar usuarios
    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesSearch =
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.zip_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toString().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });


    if (currentUser?.role !== 'admin') {
        return (
            <div className="admin-users-container not-authorized">
                <h2>Acceso Denegado</h2>
                <p>Solo los administradores pueden gestionar usuarios.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-users-container">
                <p className="loading-message">Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="admin-users-container">
            <div className="admin-users-header">
                <h2>Gestión de Usuarios</h2>
                <p>Aquí puedes gestionar las cuentas de usuario.</p>
                <button className="add-user-button" onClick={handleAddUserClick}>
                    Agregar Nuevo Usuario
                </button>
            </div>

            {/* Mensajes de éxito/error en la página principal */}
            {pageMessage && (
                <p className={pageMessageType === 'success' ? 'success-message' : 'error-message'}>
                    {pageMessage}
                </p>
            )}

            {error && <p className="error-message">{error}</p>}

            <div className="users-controls">
                <div className="filter-group">
                    <label htmlFor="filterRole">Filtrar por Rol:</label>
                    <select id="filterRole" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="all">Todos los roles</option>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                        <option value="volunteer">Voluntario</option>
                    </select>
                </div>
                <div className="search-group">
                    <label htmlFor="searchTerm">Buscar:</label>
                    <input
                        type="text"
                        id="searchTerm"
                        placeholder="Buscar por email, nombre, etc."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <p className="no-users-message">No se encontraron usuarios con los filtros aplicados.</p>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Teléfono</th>
                                <th>Rol</th>
                                <th>Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.name || 'N/A'}</td>
                                    <td>{user.lastname || 'N/A'}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="user-actions">
                                            <button className="action-button edit-button" onClick={() => handleEditUserClick(user)}>
                                                Editar
                                            </button>
                                            <button className="action-button delete-button" onClick={() => confirmDeleteUser(user.id)}>
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

            {/* Modal para añadir/editar usuario */}
            {showUserModal && ( // Renderiza el modal si showUserModal es true, userToEdit puede ser null o un objeto
                <UserFormModal
                    userToEdit={editingUser}
                    onClose={() => setShowUserModal(false)}
                    onSuccess={fetchUsers} // Recargar usuarios cuando el modal se cierra con éxito
                />
            )}

            {/* Modal de confirmación para eliminar */}
            {showDeleteConfirm && (
                <ConfirmationModal
                    message={`¿Estás seguro de que deseas eliminar el usuario con ID ${userToDeleteId}? Esta acción es irreversible.`}
                    onConfirm={handleDeleteUser}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setUserToDeleteId(null);
                    }}
                />
            )}
        </div>
    );
}

export default AdminUsersPage;
