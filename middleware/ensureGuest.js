module.exports = function ensureGuest(req, res, next) {
    if (req.session && req.session.authorized) {
        return res.redirect('/account/my_profile');
    }
    next();
};
