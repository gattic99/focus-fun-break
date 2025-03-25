
# FocusFlow API Backend

This is the backend server for the FocusFlow application, handling communication with AI services.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

   Note: If you don't provide an API key, the server will still work but will use simulated responses instead.

## Running the Server

### Development
```
npm run dev
```

### Production
```
npm start
```

## API Endpoints

- `POST /api/chat` - Send a message to the AI and get a response
- `GET /api/health` - Health check endpoint

## Deployment

The server can be deployed to various platforms:

### Render.com (Recommended for beginners)

1. Sign up for a free account at [Render.com](https://render.com)
2. Create a new Web Service
3. Connect to your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the OPENAI_API_KEY environment variable
6. Deploy

### Vercel, Netlify, Heroku

See the BACKEND_DEPLOYMENT.md file for more detailed instructions for other platforms.

## Security Notes

- Never commit your API key to version control
- Always use environment variables for sensitive keys
- The server will work without an API key, using simulated responses
