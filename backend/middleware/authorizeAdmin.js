// backend/middleware/authorizeAdmin.js

function authorizeAdmin(req, res, next) {
    // Asegúrate de que req.user exista (lo cual es manejado por authenticateToken)
    // y que el rol del usuario sea 'admin'.
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next(); // Si es administrador, continúa con la siguiente función middleware o ruta
}

module.exports = authorizeAdmin;
