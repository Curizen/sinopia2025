module.exports = (req, res, next) => {
	let lang = req.cookies.locale;
	if (!lang) {
		lang = req.acceptsLanguages('en', 'de') || 'en';
		res.cookie('locale', lang, { maxAge: 30 * 24 * 60 * 60 * 1000 });
	}
	req.setLocale(lang);
	next();
};
