// backend/routes/appointmentsRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Importa el pool de la base de datos
const authenticateToken = require('../middleware/authMiddleware');
// Elimina la definición de la función authorizeAdmin que estaba aquí
const authorizeAdmin = require('../middleware/authorizeAdmin'); // ¡Importa el middleware authorizeAdmin!

// GET /api/appointments - Obtener todas las citas (Solo para administradores, o las del usuario si no es admin)
router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const user_role = req.user.role;

    try {
        let queryText = `
            SELECT 
                a.*, 
                u.email AS user_email, 
                u.name AS user_name, 
                an.name AS animal_name
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN animals an ON a.animal_id = an.id
        `;
        let queryParams = [];

        if (user_role !== 'admin') {
            queryText += ' WHERE a.user_id = $1';
            queryParams.push(user_id);
        }
        queryText += ' ORDER BY a.scheduled_time DESC';

        const result = await pool.query(queryText, queryParams);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener citas:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener citas.' });
    }
});

// GET /api/appointments/:id - Obtener una cita por ID (Admin o usuario propietario)
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                a.*, 
                u.email AS user_email, 
                u.name AS user_name, 
                an.name AS animal_name 
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN animals an ON a.animal_id = an.id
            WHERE a.id = $1`, 
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        const appointment = result.rows[0];

        // Solo el admin o el usuario propietario de la cita pueden verla
        if (req.user.role !== 'admin' && req.user.id !== appointment.user_id) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para ver esta cita.' });
        }

        res.status(200).json(appointment);
    } catch (err) {
        console.error('Error al obtener cita por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener la cita.' });
    }
});

// POST /api/appointments - Crear una nueva cita (Requiere autenticación)
router.post('/', authenticateToken, async (req, res) => {
    const { user_id, animal_id, appointment_type, scheduled_time, notes, status } = req.body;
    const auth_user_id = req.user.id;
    const auth_user_role = req.user.role;

    const final_user_id = (auth_user_role === 'admin' && user_id) ? user_id : auth_user_id;

    let finalStatus = 'pendiente'; 
    let finalAppointmentType = appointment_type; 

    try {
        if (auth_user_role === 'user') {
            if (user_id && user_id !== auth_user_id) {
                return res.status(403).json({ message: 'Los usuarios solo pueden crear citas para sí mismos.' });
            }
            if (appointment_type !== 'visita') {
                return res.status(403).json({ message: 'Los usuarios solo pueden crear citas de tipo "visita".' });
            }
            if (status && status !== 'pendiente') {
                return res.status(403).json({ message: 'Los usuarios no pueden establecer el estado inicial de la cita, siempre es "pendiente".' });
            }
            if (!animal_id) {
                return res.status(400).json({ message: 'Para citas de visita, el ID del animal es requerido.' });
            }
            finalAppointmentType = 'visita'; 
            finalStatus = 'pendiente'; 

        } else if (auth_user_role === 'admin') {
            if (status && ['pendiente', 'confirmada', 'rechazada', 'cancelada', 'completada', 'en revisión'].includes(status)) {
                finalStatus = status;
            }
            if (!appointment_type) {
                return res.status(400).json({ message: 'Para administradores, el tipo de cita es requerido.' });
            }
            finalAppointmentType = appointment_type;
        } else {
            return res.status(403).json({ message: 'Rol de usuario no autorizado para crear citas.' });
        }

        if (!final_user_id || !scheduled_time || !finalAppointmentType) {
            return res.status(400).json({ message: 'ID de usuario, fecha/hora y tipo de cita son requeridos.' });
        }

        const newAppointment = await pool.query(
            `INSERT INTO appointments (user_id, animal_id, appointment_type, scheduled_time, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [final_user_id, animal_id, finalAppointmentType, scheduled_time, notes, finalStatus]
        );

        res.status(201).json({ message: 'Cita creada exitosamente.', appointment: newAppointment.rows[0] });
    } catch (err) {
        console.error('Error al crear cita:', err);
        res.status(500).json({ message: 'Error interno del servidor al crear la cita.' });
    }
});

// PUT /api/appointments/:id - Actualizar una cita (Admin o usuario propietario)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { user_id, animal_id, appointment_type, scheduled_time, status, notes } = req.body;
    const auth_user_id = req.user.id;
    const auth_user_role = req.user.role;

    try {
        const existingAppointment = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (existingAppointment.rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada para actualizar.' });
        }
        const oldAppointment = existingAppointment.rows[0];

        if (auth_user_role !== 'admin' && auth_user_id !== oldAppointment.user_id) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para actualizar esta cita.' });
        }

        if (auth_user_role !== 'admin') {
            if (oldAppointment.status !== status && status !== 'cancelada') {
                return res.status(403).json({ message: 'Acceso denegado. Solo puedes cambiar el estado de tu cita a "cancelada".' });
            }
            if (oldAppointment.user_id !== user_id || oldAppointment.animal_id !== animal_id || oldAppointment.appointment_type !== appointment_type || new Date(oldAppointment.scheduled_time).toISOString() !== new Date(scheduled_time).toISOString()) {
                return res.status(403).json({ message: 'Acceso denegado. No puedes cambiar los detalles de la cita (usuario, animal, tipo, fecha) solo el estado (a cancelar).' });
            }
            if (status === 'cancelada' && (oldAppointment.status === 'cancelada' || oldAppointment.status === 'completada')) {
                return res.status(400).json({ message: 'Esta cita ya está en un estado final y no puede ser cancelada nuevamente.' });
            }
            
            if (oldAppointment.status !== status && status !== 'cancelada') {
                    return res.status(403).json({ message: 'Acceso denegado. Solo puedes cambiar el estado de tu cita a "cancelada".' });
            }
        }

        if (auth_user_role === 'admin') {
            if (status && !['pendiente', 'confirmada', 'rechazada', 'cancelada', 'completada', 'en revisión'].includes(status)) {
                return res.status(400).json({ message: 'Estado inválido proporcionado.' });
            }
            if (appointment_type && !['visita', 'entrevista', 'vacunacion', 'otro'].includes(appointment_type)) { 
                return res.status(400).json({ message: 'Tipo de cita inválido proporcionado.' });
            }
        }
        
        const updatedAppointment = await pool.query(
            `UPDATE appointments
             SET user_id = COALESCE($1, user_id), 
                 animal_id = COALESCE($2, animal_id), 
                 appointment_type = COALESCE($3, appointment_type),
                 scheduled_time = COALESCE($4, scheduled_time), 
                 status = COALESCE($5, status), 
                 notes = COALESCE($6, notes), 
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [user_id, animal_id, appointment_type, scheduled_time, status, notes, id]
        );

        res.status(200).json({ message: 'Cita actualizada exitosamente.', appointment: updatedAppointment.rows[0] });
    } catch (err) {
        console.error('Error al actualizar cita:', err);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la cita.' });
    }
});


// PUT /api/appointments/:id/cancel - Cancelar una cita (Para usuario propietario o admin)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const auth_user_id = req.user.id;
    const auth_user_role = req.user.role;

    try {
        const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        const appointment = result.rows[0];

        if (auth_user_role === 'user') {
            if (appointment.user_id !== auth_user_id) {
                return res.status(403).json({ message: 'No tienes permiso para cancelar esta cita.' });
            }
            if (appointment.status === 'cancelada' || appointment.status === 'completada' || appointment.status === 'rechazada') {
                return res.status(400).json({ message: `No se puede cancelar una cita con estado "${appointment.status}".` });
            }
        } else if (auth_user_role !== 'admin') {
            return res.status(403).json({ message: 'Rol de usuario no autorizado para cancelar citas.' });
        }

        const updatedAppointment = await pool.query(
            `UPDATE appointments
             SET status = 'cancelada', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING *`,
            [id]
        );

        res.status(200).json({ message: 'Cita cancelada exitosamente.', appointment: updatedAppointment.rows[0] });
    } catch (err) {
        console.error('Error al cancelar cita:', err);
        res.status(500).json({ message: 'Error interno del servidor al cancelar la cita.' });
    }
});


// DELETE /api/appointments/:id - Eliminar una cita (Solo para administradores)
// Aplica el middleware authorizeAdmin centralizado aquí
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAppointment = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
        if (deletedAppointment.rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada para eliminar.' });
        }
        res.status(200).json({ message: 'Cita eliminada exitosamente.', appointment: deletedAppointment.rows[0] });
    } catch (err) {
        console.error('Error al eliminar cita:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la cita.' });
    }
});

module.exports = router;
