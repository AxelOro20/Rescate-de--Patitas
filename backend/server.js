// backend/server.js

// Cargar variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Importar el pool de conexión a la base de datos
const pool = require('./db');

// Importar los routers de rutas
const authRoutes = require('./routes/authRoutes');
const animalRoutes = require('./routes/animalRoutes');
const adoptionsRoutes = require('./routes/adoptionsRoutes'); // <-- ¡Nueva importación!

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Habilita CORS para todas las solicitudes
app.use(express.json()); // Habilita el parsing de JSON en el cuerpo de las solicitudes

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola desde el backend del refugio! Servidor operativo.');
});

// Usar las rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/adoptions', adoptionsRoutes); // <-- ¡Nueva integración de rutas!


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Node.js (backend) escuchando en el puerto ${PORT}`);
});
