require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const axios = require('axios');

let lastParsedCVs = {};

exports.uploadCV = async (req, res) => {
  try {
    const cvFile = req.files.cv;
    const uploadPath = path.join(__dirname, '..', 'uploads', cvFile.name);
    await cvFile.mv(uploadPath);

    let text = '';
    if (cvFile.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(uploadPath);
      const pdfData = await pdf(dataBuffer);
      text = pdfData.text;
    } else {
      text = fs.readFileSync(uploadPath, 'utf8');
    }

    const prompt = `
    You are a CV parser. Parse the following CV text and RETURN ONLY a single valid JSON object (no explanations, no code fences, no extra text).
    The JSON must match this exact structure and key names/typing. Fill values extracted from the CV text; if a value is not present in the CV, set it to an empty string "" for strings, an empty array [] for lists, or the exact key structure with appropriate empty fields. Dates/years may be strings. DO NOT change keys or types.

    Template to return (fill it; keep exact keys and types):

    {
      "personal_info": {
        "name": "",
        "location": "",
        "phone": "",
        "email": "",
        "github": "",
        "linkedin": ""
      },
      "education": [
        {
          "degree": "",
          "institution": "",
          "year": ""
        }
      ],
      "experience": [
        {
          "title": "",
          "company": "",
          "years": "",
          "description": ""
        }
      ],
      "skills": {
        "technical": [],
        "personal": []
      },
      "projects": [
        {
          "title": "",
          "role": "",
          "description": ""
        }
      ],
      "languages": [],
      "about": ""
    }

    Instructions:
    1. Respond ONLY with the JSON object exactly matching the template above (no additional keys, no wrapper).
    2. For sections with multiple items (education, experience, projects, skills lists, languages) return arrays. If only one item found, return array with single object. If none found, return an empty array [].
    3. For string fields that aren't present in the CV, return empty string "".
    4. For skills.technical and skills.personal return an array of strings (e.g. ["Python", "SQL"]). If none, return [].
    5. For languages return an array of strings like ["Arabic: Native", "English: B2"] or an empty array.
    6. Keep years/dates as strings exactly as found (e.g. "2020 – 2023" or "2024").
    7. Remove any bullets, numbering, extra whitespace; keep plain text.
    8. Ensure the final output is valid JSON parsable by JSON.parse().

    CV TEXT:
    <<<START_CV_TEXT>>>
    ${text}
    <<<END_CV_TEXT>>>
    `;


    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: 'You are a CV parser.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let parsedCV;
    try {
      parsedCV = JSON.parse(response.data.choices[0].message.content);
    } catch {
      parsedCV = defaultCVJSON;
    }

    const userId = req.body.user_id;
    lastParsedCVs[userId] = parsedCV;

    res.json({ redirect: '/account/my_profile' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to parse CV', error: err.message });
  }
};

exports.getParsedCV = (userId) => lastParsedCVs[userId] || null;
