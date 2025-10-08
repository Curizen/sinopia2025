module.exports = function ensureAuthorized(req, res, next) {
    if (req.session && req.session.authorized) {
        return next(); 
    }
    return res.redirect('/account/login');
};
