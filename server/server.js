
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration with allowed origins
const allowedOrigins = [
  'https://focusflow.app',
  'https://focus-flow-ai.vercel.app',
  'https://focus-flow-ai-backend.onrender.com',
  'https://focus-flow-ai.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'chrome-extension://*'
];

// Enhanced CORS setup to allow requests from extension and web app
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === origin) return true;
      if (allowedOrigin.endsWith('*')) {
        const prefix = allowedOrigin.slice(0, -1);
        return origin.startsWith(prefix);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy violation'), false);
    }
  },
  credentials: true
}));

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

    // Add a timestamp to help with client-side caching
    return res.json({ 
      content: response.data.choices[0].message.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint with additional information
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    version: '1.0.1',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
