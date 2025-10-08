const axios = require('axios');
const { response } = require('express');

exports.signup = async (req, res) => {
    const { email, password, confirmPassword, role } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("Role is:", role);

    const renderSignup = (options) => {
        return res.render('signup', {
            email: email || '',
            role: role || '',
            error: options.error || null,
            success: options.success || null,
            loading: false,
            title: req.__('signup.title'),
            currentLang: req.getLocale()
        });
    };

    try {
        const webhookUrl = 'https://curizen.app.n8n.cloud/webhook/signup';
        let response;

        try {
            response = await axios.post(webhookUrl, {
                email,
                password,
                role,
                ip_address: ipAddress
            });
            console.log("Webhook Response:", JSON.stringify(response.data, null, 2));
        } catch (networkError) {
            console.error('Network/Webhook error:', networkError);
            const message = networkError.response?.data?.message || 'Unable to reach registration server. Please try again later.';
            return renderSignup({ error: message });
        }

        if (!response || !response.data || !response.data[0]) {
            return renderSignup({ error: 'Invalid response from registration server.' });
        }

        const userData = response.data[0];
        console.log("User Data:", userData);

        if (
            userData.response &&
            userData.response.toLowerCase().includes('email is already exist') &&
            userData.authorized === false
        ) {
            return res.render('login', {
                error: 'Email already exists. Please log in instead.',
                success: null,
                title: 'Login',
                currentLang: req.getLocale()
            });
        }

        req.session.authorized = userData.authorized;
        req.session.userId = userData.user_id || null;
        req.session.role = userData.role || null;
        req.session.sessionToken = userData.sessionToken || null;

        console.log("Role:", req.session.role);

        res.cookie('sessionToken', userData.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'Strict'
        });

        if (role == "candidate") {
            return res.redirect('/account/my_profile');
        } else {
            return res.redirect('/client/my_profile');
        }

    } catch (err) {
        console.error('Unexpected signup error:', err);
        const message = err.response?.data?.response || 'Internal server error. Please try again later.';
        return renderSignup({ error: message });
    }
};

exports.signin = async (req, res) => {
    const { email, password, clientIp } = req.body;

    if (!email || !password) {
        return res.render('login', { 
            error: 'Email and password are required.',
            title: req.__('login.title'),
            currentLang: req.getLocale()
        });
    }

    const ipAddress = clientIp || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || req.ip;

    try {
        const webhookUrl = 'https://curizen.app.n8n.cloud/webhook/SignIn';
        const { data: respData } = await axios.post(webhookUrl, {
            email,
            password,
            ip_address: ipAddress
        });

        if (!respData.authorized) {
            req.session.authorized = false;
            req.session.userId = null;
            req.session.role = null;
            req.session.sessionToken = null;

            return res.render('login', { 
                error: 'Invalid email or password.',
                title: req.__('login.title'),
                currentLang: req.getLocale()
            });
        }
        console.log(response.data);
        req.session.authorized = respData.authorized;
        req.session.userId = respData.userId || null;
        req.session.role = respData.role || null;
        req.session.sessionToken = respData.sessionToken || null;
        console.log(req.session.userId);

        console.log('Session updated:', req.session.role);

        if (req.session.role == "candidate") {
            return res.redirect('/account/my_profile');
        } else {
            return res.redirect('/client/my_profile');
        }

    } catch (err) {
        console.error('Signin error:', err);
        const errorMessage = err.response?.data?.message || 'Internal server error. Please try again later.';
        
        return res.render('login', { 
            error: errorMessage,
            title: req.__('login.title'),
            currentLang: req.getLocale()
        });
    }
};


exports.logout = (req, res) => {
    req.session.destroy(err => {
        console.log("Session destroyed");
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};