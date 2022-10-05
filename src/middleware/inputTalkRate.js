module.exports = function inputValidation(req, res, next) {
    const { talk: { rate, watchedAt } } = req.body;
    const dateFormat = /^\d{2}\/\d{2}\/\d{4}$/;

    if (!Number.isInteger(rate) || Number(rate) < 1 || Number(rate) > 5) {
        return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
    }
    if ((watchedAt).match(dateFormat) === null) {
        return res.status(400)
            .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
    }
    next();
};
