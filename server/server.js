
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins in development
app.use(express.json());

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in the environment variables');
  process.exit(1);
}

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Using a more reliable model
      messages: [
        { role: "system", content: "You are a helpful assistant focused on productivity and well-being. Keep your responses concise and practical." },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return res.json({ 
      content: response.data.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
