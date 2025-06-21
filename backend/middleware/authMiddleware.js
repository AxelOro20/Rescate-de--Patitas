// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware para verificar la autenticación JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'No se proporcionó un token de autenticación.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Error de verificación de token:', err.message);
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        req.user = user; // Guarda los datos del usuario del token en la solicitud
        next(); // Continúa con la siguiente función middleware o ruta
    });
}

module.exports = authenticateToken; // Exporta el middleware
