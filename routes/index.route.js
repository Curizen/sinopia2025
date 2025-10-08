const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
    res.render('home', {
        title: req.__('home.title'),
        currentLang: req.getLocale()
    });
});


router.get('/about', (req, res) => {
    res.render('about', {
        title: req.__('about.title'),
        currentLang: req.getLocale()
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: req.__('contact.title'),
        currentLang: req.getLocale()
    });
});


module.exports = router;