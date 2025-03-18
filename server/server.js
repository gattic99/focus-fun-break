
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration with more allowed origins and better logging
const allowedOrigins = [
  'https://focusflow.app',
  'https://focus-flow-ai.vercel.app',
  'https://focus-flow-ai-backend.onrender.com',
  'https://focus-flow-ai.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'chrome-extension://*'
];

// Improved CORS setup with better logging
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) {
      console.log('Request with no origin allowed');
      return callback(null, true);
    }
    
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
      console.log(`Origin allowed: ${origin}`);
      return callback(null, true);
    } else {
      console.warn(`Origin rejected: ${origin}`);
      return callback(new Error(`CORS policy violation: ${origin} not allowed`), false);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204
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
    console.log('Received chat request');
    const { message } = req.body;
    
    if (!message) {
      console.warn('Request rejected: Message is required');
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Processing message: "${message.substring(0, 30)}..."`);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Using a more reliable model
      messages: [
        { role: "system", content: "You are a helpful assistant focused on productivity and well-being. Keep your responses concise and practical." },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    console.log('Successfully processed chat request');
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

// Enhanced health check endpoint with additional information
app.get('/api/health', (req, res) => {
  console.log('Health check request received');
  res.status(200).json({ 
    status: 'ok',
    version: '1.0.2',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add CORS preflight handling
app.options('*', cors());

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log(`Chat API available at http://localhost:${PORT}/api/chat`);
  console.log('Allowed origins:', allowedOrigins);
});
