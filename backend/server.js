// server.js (en la carpeta nombre-de-tu-refugio-backend)

// Cargar variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Importa el Pool de pg
const bcrypt = require('bcryptjs'); // Para hashear contraseñas
const jwt = require('jsonwebtoken'); // Para tokens JWT

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de la conexión a PostgreSQL usando Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //     rejectUnauthorized: false // Solo si usas un proveedor de hosting que lo requiera y confías en la conexión
    // }
});

// Middleware
app.use(cors()); // Habilita CORS para todas las solicitudes
app.use(express.json()); // Habilita el parsing de JSON en el cuerpo de las solicitudes

// Middleware para verificar la conexión a la base de datos (opcional, para depuración)
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error al adquirir cliente de PostgreSQL', err.stack);
    }
    console.log('Conectado exitosamente a PostgreSQL!');
    client.query('SELECT NOW()', (err, result) => {
        release(); // Libera el cliente de vuelta al pool
        if (err) {
            return console.error('Error al ejecutar query de prueba', err.stack);
        }
        console.log('Tiempo actual de la DB:', result.rows[0].now);
    });
});


// --- Rutas de Prueba (Ahora usarán la DB) ---

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola desde el backend del refugio! Conectado a la DB.');
});


// --- Rutas de Autenticación Real (Usando PostgreSQL y bcryptjs/jsonwebtoken) ---

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, lastname, phone, address, city, state, zip_code } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'El usuario con este email ya existe.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10); // Genera un "salt" para mayor seguridad
        const hashedPassword = await bcrypt.hash(password, salt); // Hashea la contraseña con el salt

        // Insertar nuevo usuario en la base de datos
        const newUser = await pool.query(
            `INSERT INTO users (email, password, name, lastname, phone, address, city, state, zip_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, name, role`,
            [email, hashedPassword, name, lastname, phone, address, city, state, zip_code]
        );

        res.status(201).json({ message: 'Registro exitoso. Ahora puedes iniciar sesión.' });

    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor al registrar.' });
    }
});

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        // Buscar el usuario por email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Comparar la contraseña ingresada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, // Payload del token
            process.env.JWT_SECRET, // Clave secreta desde .env
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        console.log('Login exitoso para:', user.email);
        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Error al intentar login:', err);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Node.js (backend) escuchando en el puerto ${PORT}`);
});
