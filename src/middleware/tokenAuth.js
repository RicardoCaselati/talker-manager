module.exports = function tokenAuth(req, res, next) {
    const inputedToken = req.headers.authorization;
    if (!inputedToken) {
        return res.status(401).json({ message: 'Token não encontrado' });
    }
    if (inputedToken !== process.env.TOKEN) {
        return res.status(401).json({ message: 'Token inválido' });
    }
    next();
};