// backend/routes/adoptionsRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Importa el pool de la base de datos
const authenticateToken = require('../middleware/authMiddleware'); // Importa el middleware de autenticación

// --- Rutas para la Gestión de Solicitudes de Adopción ---

// Crear una nueva solicitud de adopción
// Esta ruta puede ser accedida por usuarios no autenticados si user_id es nulo
// o por usuarios autenticados, en cuyo caso se usa su user_id
router.post('/', async (req, res) => {
    // Si el usuario está autenticado, podemos usar su ID.
    // Si no lo está, los campos de applicant_name, email, etc., serán requeridos.
    const user_id = req.user ? req.user.id : null; // req.user viene del authenticateToken
    const {
        animal_id,
        applicant_name,
        applicant_email,
        applicant_phone,
        applicant_address,
        motivation
    } = req.body;

    // Validación básica: al menos un animal_id y motivación son necesarios
    if (!animal_id || !motivation) {
        return res.status(400).json({ message: 'El ID del animal y la motivación son requeridos.' });
    }

    // Si el usuario no está logueado, los datos del solicitante son obligatorios
    if (!user_id && (!applicant_name || !applicant_email || !applicant_phone || !applicant_address)) {
        return res.status(400).json({ message: 'Para solicitudes sin usuario registrado, nombre, email, teléfono y dirección son requeridos.' });
    }

    try {
        const newAdoption = await pool.query(
            `INSERT INTO adoptions (user_id, animal_id, applicant_name, applicant_email, applicant_phone, applicant_address, motivation)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, animal_id, applicant_name, applicant_email, applicant_phone, applicant_address, motivation]
        );

        res.status(201).json({ message: 'Solicitud de adopción enviada exitosamente. Nos pondremos en contacto contigo pronto.', adoption: newAdoption.rows[0] });
    } catch (err) {
        console.error('Error al crear solicitud de adopción:', err);
        res.status(500).json({ message: 'Error interno del servidor al enviar la solicitud de adopción.' });
    }
});


// Obtener todas las solicitudes de adopción (Requiere autenticación y rol de administrador)
router.get('/', authenticateToken, async (req, res) => {
    // Solo administradores pueden ver todas las solicitudes
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden ver todas las solicitudes de adopción.' });
    }
    try {
        const result = await pool.query('SELECT * FROM adoptions ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener solicitudes de adopción:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener las solicitudes de adopción.' });
    }
});

// Obtener una solicitud de adopción por ID (Requiere autenticación y rol de administrador o ser el usuario de la solicitud)
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM adoptions WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Solicitud de adopción no encontrada.' });
        }

        const adoption = result.rows[0];

        // Solo el administrador o el usuario que hizo la solicitud pueden verla
        if (req.user.role !== 'admin' && adoption.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permisos para ver esta solicitud.' });
        }

        res.status(200).json(adoption);
    } catch (err) {
        console.error('Error al obtener solicitud de adopción por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener la solicitud.' });
    }
});

// Actualizar el estado de una solicitud de adopción (Requiere autenticación y rol de administrador)
router.put('/:id', authenticateToken, async (req, res) => {
    // Solo administradores pueden actualizar el estado de las solicitudes
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden actualizar solicitudes de adopción.' });
    }

    const { id } = req.params;
    const { status } = req.body; // Solo permitiremos actualizar el estado en esta ruta

    if (!status) {
        return res.status(400).json({ message: 'El estado de la solicitud es requerido para la actualización.' });
    }

    // Puedes añadir una validación de estados permitidos aquí si es necesario
    const allowedStatuses = ['pendiente', 'en revisión', 'aprobada', 'rechazada', 'completada'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Estado inválido. Los estados permitidos son: ${allowedStatuses.join(', ')}` });
    }

    try {
        const updatedAdoption = await pool.query(
            `UPDATE adoptions
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (updatedAdoption.rows.length === 0) {
            return res.status(404).json({ message: 'Solicitud de adopción no encontrada para actualizar.' });
        }
        res.status(200).json({ message: 'Estado de la solicitud de adopción actualizado exitosamente.', adoption: updatedAdoption.rows[0] });
    } catch (err) {
        console.error('Error al actualizar solicitud de adopción:', err);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la solicitud.' });
    }
});

// Eliminar una solicitud de adopción (Requiere autenticación y rol de administrador)
router.delete('/:id', authenticateToken, async (req, res) => {
    // Solo administradores pueden eliminar solicitudes
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden eliminar solicitudes de adopción.' });
    }

    const { id } = req.params;
    try {
        const deletedAdoption = await pool.query('DELETE FROM adoptions WHERE id = $1 RETURNING *', [id]);
        if (deletedAdoption.rows.length === 0) {
            return res.status(404).json({ message: 'Solicitud de adopción no encontrada para eliminar.' });
        }
        res.status(200).json({ message: 'Solicitud de adopción eliminada exitosamente.', adoption: deletedAdoption.rows[0] });
    } catch (err) {
        console.error('Error al eliminar solicitud de adopción:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la solicitud.' });
    }
});

module.exports = router;
