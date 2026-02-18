# Express Bilingual Dictionary API

A RESTful API built with Express.js that provides word definitions in both English and Tamil with examples.

## Features

- ✅ Get English word definitions with examples
- ✅ Get Tamil translations with examples
- ✅ **AI tab** – English & Tamil via Hugging Face (optional API key; falls back to dictionary)
- ✅ **Autocomplete suggestions** while typing
- ✅ Beautiful, modern web UI with **Dictionary | AI** tabs
- ✅ Responsive design (mobile-friendly)
- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ RESTful API endpoints
- ✅ Error handling and validation
- ✅ Parallel API calls for better performance

## Installation

1. Clone or download this project
2. Install dependencies:
```bash
npm install
```

3. **Hugging Face API key (for AI tab)**  
   The AI tab uses the [Hugging Face Inference API](https://huggingface.co/inference-api). Without a key, the app falls back to the free dictionary/translation APIs.

   - Go to [Hugging Face → Settings → Access Tokens](https://huggingface.co/settings/tokens).
   - Create a **Fine-grained** token (not Classic), and under permissions enable **Inference** or **Inference Providers**. (A plain Read token will return 403.)
   - Copy `env.example` to `.env`:  
     `cp env.example .env`
   - Open `.env` and set your token:
     ```bash
     HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```
   - Optional: set a different model (default is `Qwen/Qwen2.5-7B-Instruct` for the router API):
     ```bash
     HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
     ```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser and visit:
```
http://localhost:3000
```

You'll see a beautiful web interface where you can search for words and get their meanings in both English and Tamil!

### Using the UI

- **Type a word** in the search box - suggestions will appear automatically as you type
- **Use arrow keys** (↑↓) to navigate suggestions
- **Press Enter** to select a suggestion or search
- **Press Escape** to close suggestions
- **Click on a suggestion** to select it

## API Endpoints

### GET /api/dictionary/:word
Get word definitions in English and Tamil.

**Example:**
```bash
curl http://localhost:3000/api/dictionary/hello
```

**Response:**
```json
{
  "word": "hello",
  "english": {
    "word": "hello",
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definition": "a greeting",
        "example": "Hello, how are you?",
        "synonyms": [],
        "antonyms": []
      }
    ]
  },
  "tamil": {
    "word": "வணக்கம்",
    "meaning": "ஒரு வாழ்த்து",
    "example": "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?",
    "originalWord": "hello"
  }
}
```

### POST /api/dictionary
Search word via POST request.

**Example:**
```bash
curl -X POST http://localhost:3000/api/dictionary \
  -H "Content-Type: application/json" \
  -d '{"word": "beautiful"}'
```

### GET /api/ai/:word
Get a summary of the word in English and Tamil (uses the same free dictionary and translation APIs as the Dictionary tab; no API key required).

**Example:**
```bash
curl http://localhost:3000/api/ai/hello
```

**Response:**
```json
{
  "word": "hello",
  "english": {
    "definition": "used as a greeting or to begin a phone conversation.",
    "partOfSpeech": "noun",
    "example": "Hello, how are you?"
  },
  "tamil": {
    "word": "வணக்கம்",
    "meaning": "...",
    "example": "..."
  }
}
```

### GET /api/dictionary/suggestions/:query
Get word suggestions for autocomplete.

**Example:**
```bash
curl http://localhost:3000/api/dictionary/suggestions/hello
```

**Response:**
```json
{
  "suggestions": ["hello", "hellos", "hellow", "helloworld"]
}
```

### GET /health
Health check endpoint.

### GET /
Serves the web interface.

## Project Structure

```
express-dictionary/
├── server.js              # Main Express application
├── api/index.js           # Vercel serverless entry
├── routes/
│   ├── dictionary.js      # Dictionary routes
│   └── ai.js              # AI (ChatGPT) routes
├── services/
│   ├── dictionaryService.js  # Dictionary API service
│   └── aiService.js          # AI tab summary (free APIs)
├── public/                # Frontend files
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Styling
│   └── app.js            # Frontend JavaScript
├── package.json
└── .env                   # Environment variables
```

## APIs Used

- **English Dictionary**: [Free Dictionary API](https://dictionaryapi.dev/)
- **Tamil Translation**: [MyMemory Translation API](https://mymemory.translated.net/)
- **Word Suggestions**: [Datamuse API](https://www.datamuse.com/api/) - For autocomplete functionality

## Error Handling

The API handles various error cases:
- Invalid or missing word parameter
- Word not found in dictionary
- API service failures
- Network errors

## Deployment to Vercel

This application is configured for easy deployment to Vercel. Follow these steps:

### Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Deployment Steps

#### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI globally:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (for first deployment)
   - What's your project's name? (Press Enter for default)
   - In which directory is your code located? **./** (Press Enter)

5. **For production deployment:**
   ```bash
   vercel --prod
   ```

#### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your Git repository**

5. **Configure the project:**
   - Framework Preset: **Other**
   - Root Directory: **./** (or leave default)
   - Build Command: Leave empty (not needed)
   - Output Directory: Leave empty
   - Install Command: `npm install`

6. **Add Environment Variables (optional, for AI tab):**
   - Go to Project Settings → Environment Variables
   - Add `HUGGINGFACE_API_KEY` with your [Hugging Face token](https://huggingface.co/settings/tokens) to enable the AI tab

7. **Click "Deploy"**

### Project Structure for Vercel

The project is configured with:
- `vercel.json` - Vercel configuration file
- `api/index.js` - Serverless function entry point
- `public/` - Static files (HTML, CSS, JS)
- Routes are automatically handled by Vercel

### Important Notes

- ✅ **No environment variables required** - The app uses free public APIs
- ✅ **Automatic HTTPS** - Vercel provides SSL certificates
- ✅ **Global CDN** - Static files are served from edge locations
- ✅ **Serverless functions** - API routes run as serverless functions
- ✅ **Automatic deployments** - Every push to main branch triggers a new deployment

### Post-Deployment

After deployment, you'll get a URL like:
```
https://your-project-name.vercel.app
```

Your app will be live and accessible at this URL!

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Troubleshooting

**Issue: API routes not working**
- Ensure `api/index.js` exists and exports the Express app
- Check `vercel.json` configuration

**Issue: Static files not loading**
- Verify `public/` directory structure
- Check that files are committed to Git

**Issue: Build fails**
- Check Node.js version in `package.json` (engines field)
- Ensure all dependencies are listed in `package.json`

## License

MIT
