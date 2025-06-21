// backend/db.js

const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL usando Pool
// La connectionString se obtiene de las variables de entorno
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //     rejectUnauthorized: false // Solo si usas un proveedor de hosting que lo requiera y confías en la conexión
    // }
});

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

module.exports = pool; // Exporta el pool para que otros archivos puedan usarlo
