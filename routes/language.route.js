const express = require('express');
const router = express.Router();

router.get('/change/:lang', (req, res) => {
    const { lang } = req.params;

    if (['en', 'de'].includes(lang)) {
        res.cookie('locale', lang, { maxAge: 30*24*60*60*1000 }); 
    }

    const backURL = req.get('Referer') || '/';
    res.redirect(backURL);
});

module.exports = router;
