require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');
const axios = require('axios');

let lastParsedCVs = {};

exports.uploadCV = async (req, res) => {
  try {
    const cvFile = req.files.cv;
    const uploadPath = path.join(__dirname, '..', 'uploads', cvFile.name);
    await cvFile.mv(uploadPath);

    let text = '';
    if (cvFile.mimetype === 'application/pdf') {
      const data = new Uint8Array(fs.readFileSync(uploadPath));
      const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
    } else {
      text = fs.readFileSync(uploadPath, 'utf8');
    }

    const prompt = `...`; // نفس الـ prompt الذي كتبته سابقًا

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
      parsedCV = {}; // يمكن وضع defaultCVJSON هنا
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
