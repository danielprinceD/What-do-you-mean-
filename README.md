# Express Bilingual Dictionary API

A RESTful API built with Express.js that provides word definitions in both English and Tamil with examples.

## Features

- ✅ Get English word definitions with examples
- ✅ Get Tamil translations with examples
- ✅ **Autocomplete suggestions** while typing
- ✅ Beautiful, modern web UI
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

3. Copy `.env.example` to `.env` (optional, for custom configuration):
```bash
cp .env.example .env
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
├── routes/
│   └── dictionary.js      # Dictionary routes
├── services/
│   └── dictionaryService.js  # Dictionary API service
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

## License

MIT
