// backend/routes/userRoutes.js

console.log('userRoutes.js: Archivo de rutas de usuario cargado.'); // <-- VERIFICACIÓN DE CARGA

const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs'); // Necesario para hashear contraseñas si se actualizan

// Middleware para verificar si el usuario es administrador
function authorizeAdmin(req, res, next) {
    // Si no hay usuario en la solicitud o el rol no es 'admin', denegar acceso.
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next(); // Si es admin, continúa con la siguiente función.
}

// Obtener todos los usuarios (Solo para administradores)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        console.log('userRoutes.js: Intento de obtener todos los usuarios.'); // Log para depuración
        // Excluir la contraseña de los resultados para seguridad
        const result = await pool.query('SELECT id, email, name, lastname, phone, address, city, state, zip_code, role, created_at, updated_at FROM users ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('userRoutes.js: Error al obtener usuarios (admin):', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
});

// Obtener un usuario por ID (Solo para administradores o el propio usuario)
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`userRoutes.js: Intento de obtener usuario con ID: ${id}.`); // Log para depuración
        // Excluir la contraseña de los resultados
        const result = await pool.query('SELECT id, email, name, lastname, phone, address, city, state, zip_code, role, created_at, updated_at FROM users WHERE id = $1', [id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Permitir acceso si es administrador o si el ID de usuario solicitado coincide con el ID del token
        if (req.user.role !== 'admin' && req.user.id !== user.id) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para ver este perfil de usuario.' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('userRoutes.js: Error al obtener usuario por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener el usuario.' });
    }
});

// Actualizar un usuario existente (Solo para administradores o el propio usuario)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { email, name, lastname, phone, address, city, state, zip_code, role, password } = req.body;

    // Si el usuario no es administrador Y el ID de usuario solicitado no coincide con el ID del token,
    // entonces denegar acceso. Un usuario normal no puede editar el perfil de otro usuario.
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para actualizar este usuario.' });
    }

    // Si un usuario normal intenta cambiar su rol, denegar. Solo admins pueden cambiar roles.
    if (req.user.role !== 'admin' && role && role !== req.user.role) {
        return res.status(403).json({ message: 'Acceso denegado. No puedes cambiar tu propio rol.' });
    }

    try {
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Construir la consulta de forma dinámica para incluir solo los campos que se envían
        const fields = [];
        const values = [];
        let queryIndex = 1;

        if (email !== undefined) { fields.push(`email = $${queryIndex++}`); values.push(email); }
        if (name !== undefined) { fields.push(`name = $${queryIndex++}`); values.push(name); }
        if (lastname !== undefined) { fields.push(`lastname = $${queryIndex++}`); values.push(lastname); }
        if (phone !== undefined) { fields.push(`phone = $${queryIndex++}`); values.push(phone); }
        if (address !== undefined) { fields.push(`address = $${queryIndex++}`); values.push(address); }
        if (city !== undefined) { fields.push(`city = $${queryIndex++}`); values.push(city); }
        if (state !== undefined) { fields.push(`state = $${queryIndex++}`); values.push(state); }
        if (zip_code !== undefined) { fields.push(`zip_code = $${queryIndex++}`); values.push(zip_code); }
        // Solo permitir que los administradores actualicen el rol
        if (role !== undefined && req.user.role === 'admin') { fields.push(`role = $${queryIndex++}`); values.push(role); }
        if (hashedPassword) { fields.push(`password = $${queryIndex++}`); values.push(hashedPassword); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar.' });
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`); // Siempre actualizar la fecha de actualización
        values.push(id); // El último valor es el ID para la cláusula WHERE

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING id, email, name, lastname, role`;
        const updatedUser = await pool.query(query, values);

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente.', user: updatedUser.rows[0] });

    } catch (err) {
        console.error('userRoutes.js: Error al actualizar usuario:', err);
        if (err.code === '23505' && err.constraint === 'users_email_key') {
            return res.status(409).json({ message: 'El email proporcionado ya está en uso.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el usuario.' });
    }
});

// Eliminar un usuario (Solo para administradores)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (deletedUser.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente.', user: deletedUser.rows[0] });
    } catch (err) {
        console.error('userRoutes.js: Error al eliminar usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el usuario.' });
    }
});

module.exports = router;
