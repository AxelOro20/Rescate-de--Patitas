// backend/routes/animalRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware'); // Middleware de autenticación
const authorizeAdmin = require('../middleware/authorizeAdmin'); // Middleware de autorización (asegúrate de que existe o usa tu versión)

// Middleware para verificar si el usuario es administrador (si no lo tienes en un archivo separado)
// Si ya tienes authorizeAdmin en middleware/authorizeAdmin.js, puedes eliminar esta función de aquí.
/*
function authorizeAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
}
*/

// Obtener todos los animales (Público)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM animals ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener animales:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener animales.' });
    }
});

// NUEVA RUTA: Obtener animales adoptados (Casos de Éxito - Público)
router.get('/adopted', async (req, res) => {
    try {
        // Asume que tienes un campo 'adoption_status' en tu tabla 'animals'
        const result = await pool.query(`
            SELECT * FROM animals 
            WHERE adoption_status = 'adoptado' OR adoption_status = 'adopted' 
            ORDER BY created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener animales adoptados:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener casos de éxito.' });
    }
});


// Obtener un animal por ID (Público)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM animals WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Animal no encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener animal por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener el animal.' });
    }
});

// Crear un nuevo animal (Requiere autenticación y rol de administrador)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    const { name, type, breed, age_approx, size, gender, description_short, description_long, health_status, is_featured, image_urls, adoption_status } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: 'Nombre y tipo de animal son requeridos.' });
    }

    try {
        const newAnimal = await pool.query(
            `INSERT INTO animals (name, type, breed, age_approx, size, gender, description_short, description_long, health_status, is_featured, image_urls, adoption_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [name, type, breed, age_approx, size, gender, description_short, description_long, health_status, is_featured, image_urls, adoption_status || 'disponible'] // Estado por defecto
        );
        res.status(201).json({ message: 'Animal creado exitosamente.', animal: newAnimal.rows[0] });
    } catch (err) {
        console.error('Error al crear animal:', err);
        res.status(500).json({ message: 'Error interno del servidor al crear el animal.' });
    }
});

// Actualizar un animal existente (Requiere autenticación y rol de administrador)
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, type, breed, age_approx, size, gender, description_short, description_long, health_status, is_featured, image_urls, adoption_status } = req.body;

    try {
        const updatedAnimal = await pool.query(
            `UPDATE animals
             SET name = $1, type = $2, breed = $3, age_approx = $4, size = $5, gender = $6, description_short = $7, description_long = $8, health_status = $9, is_featured = $10, image_urls = $11, adoption_status = $12, updated_at = CURRENT_TIMESTAMP
             WHERE id = $13 RETURNING *`,
            [name, type, breed, age_approx, size, gender, description_short, description_long, health_status, is_featured, image_urls, adoption_status, id]
        );

        if (updatedAnimal.rows.length === 0) {
            return res.status(404).json({ message: 'Animal no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Animal actualizado exitosamente.', animal: updatedAnimal.rows[0] });
    } catch (err) {
        console.error('Error al actualizar animal:', err);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el animal.' });
    }
});

// Eliminar un animal (Requiere autenticación y rol de administrador)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAnimal = await pool.query('DELETE FROM animals WHERE id = $1 RETURNING *', [id]);
        if (deletedAnimal.rows.length === 0) {
            return res.status(404).json({ message: 'Animal no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Animal eliminado exitosamente.', animal: deletedAnimal.rows[0] });
    } catch (err) {
        console.error('Error al eliminar animal:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el animal.' });
    }
});

module.exports = router;
