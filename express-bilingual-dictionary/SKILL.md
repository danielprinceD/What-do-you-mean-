---
name: express-bilingual-dictionary
description: Create an Express.js application with a beautiful web UI that provides word definitions in both English and Tamil with examples. The app includes a modern, responsive frontend interface and accepts word input to return comprehensive dictionary information including meanings and usage examples in both languages.
version: 1.0.0
author: Claude Skills
tags:
  - express
  - dictionary
  - api
  - bilingual
  - tamil
  - english
  - nodejs
---

# Express Bilingual Dictionary Skill

This skill helps you build an Express.js web application that provides bilingual dictionary functionality. The application accepts a word input and returns:
1. English meaning with example sentences
2. Tamil meaning with example sentences

## When to Use This Skill

- Building a dictionary API or web service
- Creating a bilingual translation/definition tool
- Developing educational applications for language learning
- Building RESTful APIs that provide word definitions
- Creating applications that need to fetch and display word meanings from multiple sources

## Instructions

When the user requests to build an Express dictionary application, follow these steps:

### 1. Project Setup

Create a new Express.js project with the following structure:
```
express-dictionary/
├── package.json
├── server.js (or app.js)
├── routes/
│   └── dictionary.js
├── services/
│   └── dictionaryService.js
├── public/              # Frontend files
│   ├── index.html      # Main UI page
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
└── .env (for API keys if needed)
```

### 2. Dependencies

Install the following packages:
- `express` - Web framework
- `axios` or `node-fetch` - For making HTTP requests to dictionary APIs
- `dotenv` - For environment variables (if using API keys)
- `cors` - For handling cross-origin requests (if needed)

### 3. API Integration

For English definitions, use one of these free APIs:
- **Free Dictionary API**: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **WordsAPI** (requires key): `https://wordsapiv1.p.rapidapi.com/words/{word}`
- **Oxford Dictionary API** (requires key)

For Tamil translations/meanings:
- **Google Translate API** (requires key): `https://translate.googleapis.com/translate_a/single`
- **LibreTranslate** (free, self-hosted): `https://libretranslate.com/translate`
- **MyMemory Translation API** (free tier): `https://api.mymemory.translated.net/get`

### 4. Implementation Steps

1. **Create Express Server**:
   - Set up basic Express app with middleware
   - Configure JSON parsing
   - Serve static files from `public` directory
   - Set root route to serve `index.html`
   - Set up error handling

2. **Create Dictionary Route**:
   - Endpoint: `GET /api/dictionary/:word` or `POST /api/dictionary`
   - Accept word as parameter or in request body
   - Call dictionary service functions
   - Return combined response with English and Tamil meanings

3. **Create Dictionary Service**:
   - Function to fetch English meaning from dictionary API
   - Function to fetch Tamil translation/meaning
   - Parse and format responses
   - Handle errors gracefully

4. **Create Frontend UI**:
   - Create `public/index.html` with search interface
   - Create `public/styles.css` with modern, responsive styling
   - Create `public/app.js` for API interaction and DOM manipulation
   - Include loading states, error handling, and smooth animations
   - Make it mobile-responsive with a dark theme

5. **Response Format**:
   ```json
   {
     "word": "example",
     "english": {
       "meanings": [...],
       "examples": [...]
     },
     "tamil": {
       "meaning": "...",
       "example": "..."
     }
   }
   ```

### 6. Error Handling

- Handle cases where word is not found
- Handle API failures gracefully
- Return appropriate HTTP status codes
- Provide meaningful error messages

### 6. Example Implementation Pattern

```javascript
// Basic structure
app.get('/api/dictionary/:word', async (req, res) => {
  try {
    const word = req.params.word;
    const englishData = await getEnglishMeaning(word);
    const tamilData = await getTamilMeaning(word);
    
    res.json({
      word: word,
      english: englishData,
      tamil: tamilData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Examples

### Example 1: Basic Request
**User Input**: "hello"
**Expected Response**:
```json
{
  "word": "hello",
  "english": {
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "a greeting",
            "example": "Hello, how are you?"
          }
        ]
      }
    ]
  },
  "tamil": {
    "meaning": "வணக்கம்",
    "example": "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?"
  }
}
```

### Example 2: Complex Word
**User Input**: "beautiful"
**Expected Response**: Should include multiple meanings, parts of speech, and examples in both languages.

### Example 3: Word Not Found
**User Input**: "xyzabc123"
**Expected Response**: 
```json
{
  "error": "Word not found",
  "word": "xyzabc123"
}
```

## Best Practices

1. **API Rate Limiting**: Implement rate limiting if using free APIs
2. **Caching**: Consider caching frequently requested words
3. **Input Validation**: Validate and sanitize word input
4. **Case Insensitivity**: Handle case-insensitive word searches
5. **Multiple Meanings**: Display all meanings and examples when available
6. **Response Time**: Optimize API calls (consider parallel requests)
7. **Documentation**: Include API documentation (Swagger/OpenAPI if needed)

## Testing

Test the application with:
- Common words (e.g., "hello", "world", "beautiful")
- Words with multiple meanings
- Non-existent words
- Special characters and edge cases
- Empty or null inputs

## UI Features

The included web interface provides:
- Modern, dark-themed design with gradient accents
- Responsive layout that works on mobile, tablet, and desktop
- Real-time search with loading indicators
- Smooth animations and transitions
- Clear display of English and Tamil meanings side-by-side
- Example sentences highlighted for easy reading
- Error handling with user-friendly messages
- Keyboard support (Enter key to search)

## Additional Features (Optional)

- Add pronunciation (phonetic spelling)
- Add synonyms and antonyms
- Add word etymology
- Support for multiple languages
- Save search history
- Add authentication for API usage tracking
- Dark/light theme toggle
- Word pronunciation audio

## Notes

- Free dictionary APIs may have rate limits
- Tamil translation APIs may require API keys for production use
- Consider using multiple API sources as fallbacks
- For production, implement proper error logging and monitoring
