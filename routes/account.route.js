const express = require('express');
const router = express.Router();
const ensureAuthorized = require('../middleware/ensureAuthorized');
const ensureGuest = require('../middleware/ensureGuest');
const cvController = require('../controllers/cv.controller');
const fileUpload = require('express-fileupload');
const axios = require('axios');

router.use(fileUpload());


router.get('/login', ensureGuest, (req, res) => {
    res.render('login', {
        title: req.__('login.title'),
        currentLang: req.getLocale(),
        error: null
    });
});
router.get('/signup', ensureGuest, (req, res) => {
    res.render('signup', {
        title: req.__('signUp.title'),
        currentLang: req.getLocale(),
        error: null,
        successMessage: null,
        email: ''
    });
});

router.get('/tasks', (req, res) => {
    const tasks = [
        {
            title: "Build Authentication System",
            description: "Implement login, signup, and JWT-based authentication.",
            status: "In Progress",
            approved: true,
            deadline: "2025-10-15",
            subtasks: [
                { text: "Setup user schema", done: true },
                { text: "Implement signup", done: true },
                { text: "Implement login", done: false },
                { text: "Add JWT verification", done: false },
                { text: "Protect routes", done: false }
            ]
        },
        {
            title: "Create Landing Page",
            description: "Design and develop responsive landing page using Tailwind CSS.",
            status: "Completed",
            approved: true,
            deadline: "2025-09-20",
            subtasks: [
                { text: "Wireframe design", done: true },
                { text: "Implement header", done: true },
                { text: "Add hero section", done: true },
                { text: "Responsive footer", done: true }
            ]
        },
        {
            title: "Integrate Payment Gateway",
            description: "Add Stripe payment gateway integration to the project.",
            status: "Pending Approval",
            approved: false,
            deadline: "2025-11-01",
            subtasks: [
                { text: "Install Stripe SDK", done: false },
                { text: "Setup test keys", done: false },
                { text: "Implement checkout form", done: false },
                { text: "Handle webhooks", done: false },
                { text: "Test sandbox mode", done: false }
            ]
        },
        {
            title: "Client Design Review",
            description: "Review the new design provided by the client and approve or request changes.",
            status: "Pending Approval",
            approved: false,
            sender: "Project Manager",
            assignedTo: "Abed Alhakim",
            createdAt: "2025-09-28",
            deadline: "2025-10-05",
            subtasks: [
                { text: "Check homepage mockup", done: false },
                { text: "Check dashboard UI", done: false },
                { text: "Provide feedback", done: false },
                { text: "Approve or reject design", done: false }
            ]
        },
        {
            title: "API Endpoint Validation",
            description: "Validate the new API endpoints sent by backend team before integration.",
            status: "Pending Approval",
            approved: false,
            sender: "Backend Lead",
            assignedTo: "Abed Alhakim",
            createdAt: "2025-09-27",
            deadline: "2025-10-02",
            subtasks: [
                { text: "Test GET requests", done: false },
                { text: "Test POST requests", done: false },
                { text: "Test error handling", done: false },
                { text: "Sign off validation", done: false }
            ]
        }
    ];

    tasks.forEach(task => {
        const total = task.subtasks.length;
        const done = task.subtasks.filter(st => st.done).length;
        task.progress = Math.round((done / total) * 100);
    });

    const pendingTasks = tasks.filter(t => t.status === "Pending Approval");
    const inProgressTasks = tasks.filter(t => t.status === "In Progress");
    const completedTasks = tasks.filter(t => t.status === "Completed");

    res.render('tasks', {
        title: req.__('tasks.title'),
        currentLang: req.getLocale(),
        pendingTasks,
        inProgressTasks,
        completedTasks
    });
});

router.get('/my_profile', ensureAuthorized, async (req, res) => {
    const userId = req.session.userId;
    const successMessage = req.query.success || null;

    let user = {};

    try {
        const webhookResponse = await axios.get(`https://YOUR_N8N_WEBHOOK_URL?userId=${userId}`);
        user = webhookResponse.data || {};

        cvController.setParsedCV(userId, user);
    } catch (err) {
        console.error('Failed to fetch user from n8n webhook:', err);
        user = cvController.getParsedCV(userId) || {};
    }

    res.render('myProfile', {
        layout: 'layouts/main',
        title: req.__('profile.about'),
        currentLang: req.getLocale ? req.getLocale() : 'en',
        user,
        successMessage,
        userId
    });
});

module.exports = router;
