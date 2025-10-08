const express = require('express');
const router = express.Router();

router.get('/project-analysis', (req, res) => {
  res.render('project-analysis', {
    title: 'Project Analysis',  
    currentLang: 'en'            
  });
});


router.post('/project-analysis', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Project title and description are required' });
    }

    const analysisData = [
        {
        usecase: 'Frontend Development',
        tasks: [
            { name: 'Design Home Page', skills: ['HTML', 'CSS', 'Tailwind'] },
            { name: 'Design Login Page', skills: ['HTML', 'CSS', 'JavaScript'] }
        ]
        },
        {
        usecase: 'Backend Setup',
        tasks: [
            { name: 'Create User API', skills: ['Node.js', 'Express', 'MongoDB'] },
            { name: 'Setup JWT Authentication', skills: ['Node.js', 'JWT', 'Security'] }
        ]
        }
    ];

    res.json(analysisData);
});

module.exports = router;
