// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router(); // <--- Asegúrate de que Express.Router() esté instanciado correctamente
const pool = require('../db'); // Importa el pool de la base de datos
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ruta para el registro de usuario
router.post('/register', async (req, res) => {
    const { email, password, name, lastname, phone, address, city, state, zip_code } = req.body;

    // Validación básica de entrada
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos para el registro.' });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'El usuario con este email ya existe.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar el nuevo usuario en la base de datos
        await pool.query(
            `INSERT INTO users (email, password, name, lastname, phone, address, city, state, zip_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [email, hashedPassword, name, lastname, phone, address, city, state, zip_code]
        );

        res.status(201).json({ message: 'Registro exitoso. Ahora puedes iniciar sesión.' });

    } catch (err) {
        console.error('Error al registrar usuario:', err);
        // Manejo de errores específicos, por ejemplo, si hay problemas con la base de datos
        res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
    }
});

// Ruta para el login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validación básica de entrada
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos para iniciar sesión.' });
    }

    try {
        // Buscar el usuario por email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            // Si el usuario no existe, credenciales inválidas
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Comparar la contraseña proporcionada con la contraseña hasheada en la BD
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Si las contraseñas no coinciden, credenciales inválidas
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generar un token JWT
        // Se incluyen en el payload: id del usuario, email y rol para usar en el frontend
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name, lastname: user.lastname }, // Incluye más datos si los necesitas en el token
            process.env.JWT_SECRET, // Secreto para firmar el token (definido en .env)
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // Responder con un mensaje de éxito, el token y los datos básicos del usuario
        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                phone: user.phone,
                address: user.address,
                city: user.city,
                state: user.state,
                zip_code: user.zip_code,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Error al intentar login:', err);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

// Agrega un console.log para verificar que el router se exporta
console.log('authRoutes.js: router module.exports is being set.');
module.exports = router; // <--- ¡Asegúrate de que el router se exporte correctamente!
