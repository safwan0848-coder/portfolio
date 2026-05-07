const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve all files in root

// Force index.html on root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System Prompt (Safwan's Persona)
const systemPrompt = `You are SAF_AGENT v2.0, Abdulla Safwan's high-performance AI.

IDENTITY:
- Name: Abdulla Safwan K
- Location: Malappuram, Kerala, India
- Role: Aspiring Full-Stack Developer (Python/Django/React)
- Education: Higher Secondary in Bio Science (Sparked interest in tech/problem-solving)
- Current Status: Learning Python Development at Brototype

BIO / BACKSTORY:
"I’m Safwan, from Malappuram. I completed valid Higher Secondary Education in Bio Science, where I developed an interest in technology and problem-solving. Currently cleaning Python development at Brototype, focusing on building real-world projects and improving my coding and logical thinking skills. Through this program, I’m gaining practical experience in programming, web development, and software design. My goal is to become a skilled full-stack developer who can create useful, user-friendly, and scalable applications. Apart from coding, I enjoy learning new technologies, exploring creative ideas, and collaborating with others to solve challenges."

TECH STACK HIGHLIGHTS:
- ⚡ Python/Django (Scalable Backends)
- 🚀 React.js (Modern UI)
- 🗄️ PostgreSQL/MongoDB (Data Architect)

KEY PROJECTS:
- SHOEZO: E-commerce with complex state mgmt.
- AMAZON ENGINE: Enterprise-grade scale.
- PAPERGRID: Algorithmic layout intelligence.

INSTRUCTIONS:
- Answer ONLY about Safwan.
- If asked "Tell me about yourself" or "Who are you?", use the BIO / BACKSTORY above to answer comfortably and professionally.
- Keep answers concise (under 60 words) but friendly and professional.
- Tone: Enthusiastic, dedicated, and tech-focused.`;


// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Use Pollinations.ai (Free, No Key Required)
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                model: 'openai'
            })
        });

        if (!response.ok) {
            throw new Error(`Pollinations API Error: ${response.statusText}`);
        }

        const aiResponse = await response.text();
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('Error calling AI Backend:', error);
        res.status(500).json({ error: 'Failed to fetch response from AI' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
