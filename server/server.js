
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS with more specific configuration
app.use(cors({
  origin: '*', // Allow all origins in development (customize in production)
  methods: ['GET', 'POST'], // Allow only needed methods
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ WARNING: OPENAI_API_KEY is not set in the environment variables. The AI chat will use fallback responses.');
}

// Configure OpenAI - only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

// Enhanced fallback responses for when the API is unavailable
const fallbackResponses = [
  "I'm here to help you stay focused and productive. What would you like assistance with today?",
  "Having a productive day? I can suggest techniques to help you maintain focus.",
  "Looking for a productivity tip? Regular breaks can actually improve your overall focus and output.",
  "Need help organizing your tasks? I recommend prioritizing them by importance and urgency.",
  "Remember that taking short breaks during focused work can help prevent burnout and maintain productivity.",
  "Is there something specific about productivity or focus that you'd like to learn more about?",
  "The Pomodoro Technique involves 25-minute focused work sessions followed by 5-minute breaks. Would you like to try it?",
  "Setting clear goals for each work session can significantly improve your productivity and focus.",
  "I'm here to support your productivity journey. What challenges are you facing today?",
  "Sometimes a change of environment can help refresh your focus. Have you tried working from a different location?"
];

function getFallbackResponse(message) {
  // For simple questions, provide standard responses
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello! I'm your productivity assistant. How can I help you today?";
  }
  
  if (message.toLowerCase().includes("how are you")) {
    return "I'm functioning well and ready to help you with your productivity needs!";
  }
  
  if (message.toLowerCase().includes("thank")) {
    return "You're welcome! Feel free to ask if you need more assistance.";
  }
  
  // For other queries, return a random fallback response
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If OpenAI is configured, try to use it
    if (openai) {
      try {
        const response = await openai.createChatCompletion({
          model: "gpt-4o-mini", // Using OpenAI's latest model for best performance/cost ratio
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
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fall back to simulated responses on OpenAI error
        return res.json({ 
          content: getFallbackResponse(message),
          usingFallback: true
        });
      }
    } else {
      // If OpenAI is not configured, use fallback responses
      return res.json({ 
        content: getFallbackResponse(message),
        usingFallback: true 
      });
    }
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
  res.status(200).json({ 
    status: 'ok',
    aiAvailable: !!openai
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Status: ${openai ? 'Using OpenAI API' : 'Using fallback responses (no API key)'}`);
});
