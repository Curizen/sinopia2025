const express = require('express');
const router = express.Router();

router.get('/project-search', (req, res) => {
    res.render('projectSearch', {
        title: 'Project Skill Search',
        currentLang: req.getLocale ? req.getLocale() : 'en',
        projectDescription: '',
        projectData: null
    });
});

router.get('/my_profile', (req, res) => {
  const companyProfile = {
    id: 101,
    company_name: "Bauwerk Innovations GmbH",
    industry: "Construction & Civil Engineering",
    headquarters: "Munich, Germany",
    size_label: "201-500 employees",
    number_of_employees: 260,
    website: "https://www.bauwerk-innovations.de",
    linkedin: "https://linkedin.com/company/bauwerk-innovations",
    description:
      "Bauwerk Innovations GmbH is a German construction firm specializing in sustainable infrastructure, commercial buildings, and modern residential projects. With a focus on energy efficiency and smart city integration, the company delivers high-quality projects across Germany.",
    founder: "Michael Weber",
    established_at: "2005-04-12",
    completed_projects: 185,
    specialties: [
      "Structural Engineering",
      "Project Management",
      "Sustainable Construction",
      "Concrete & Steel Design",
      "Urban Development"
    ],
    certifications: [
      "ISO 9001:2015 Quality Management",
      "ISO 14001:2015 Environmental Management",
      "DGNB Gold Sustainability Certificate"
    ],
    recent_projects: [
      { name: "Skyline Office Tower", location: "Frankfurt", year: 2023 },
      { name: "EcoLiving Apartments", location: "Berlin", year: 2024 },
      { name: "Green Logistics Park", location: "Hamburg", year: 2022 }
    ],
    contact_email: "contact@bauwerk-innovations.de",
    contact_phone: "+49 89 1234 5678"
  };

  res.render("clinetProfile", {
    title: "Company Profile",
    company: companyProfile,
    successMessage: null,
    currentLang: req.getLocale ? req.getLocale() : "en"
  });
});


router.post('/project-search', (req, res) => {
    const { projectDescription } = req.body;

    const projectData = {
        title: "New Web Application Project",
        cases: [
            {
                id: 1,
                title: "Frontend Development",
                description: "Build responsive UI using modern frameworks.",
                skills: ["React", "Tailwind CSS", "JavaScript"]
            },
            {
                id: 2,
                title: "Backend Development",
                description: "Develop REST APIs and database models.",
                skills: ["Node.js", "Express", "MongoDB"]
            },
            {
                id: 3,
                title: "Testing & QA",
                description: "Ensure application quality and performance.",
                skills: ["Jest", "Cypress", "Postman"]
            }
        ]
    };

    res.render('projectSearch', {
        title: 'Project Skill Search',
        currentLang: req.getLocale ? req.getLocale() : 'en',
        projectDescription,
        projectData
    });
});

module.exports = router;
