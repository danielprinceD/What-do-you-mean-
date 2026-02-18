const express = require('express');
const router = express.Router();
const axios = require('axios');
const dictionaryService = require('../services/dictionaryService');

/**
 * GET /api/dictionary/:word
 * Get word definitions in English and Tamil
 */
router.get('/:word', async (req, res) => {
  try {
    const word = req.params.word.toLowerCase().trim();
    
    if (!word || word.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Word parameter is required'
      });
    }

    // Fetch both English and Tamil meanings in parallel
    const [englishData, tamilData] = await Promise.allSettled([
      dictionaryService.getEnglishMeaning(word),
      dictionaryService.getTamilMeaning(word)
    ]);

    const response = {
      word: word,
      english: englishData.status === 'fulfilled' ? englishData.value : { error: englishData.reason?.message || 'Failed to fetch English meaning' },
      tamil: tamilData.status === 'fulfilled' ? tamilData.value : { error: tamilData.reason?.message || 'Failed to fetch Tamil meaning' }
    };

    // If both failed, return 404
    if (englishData.status === 'rejected' && tamilData.status === 'rejected') {
      return res.status(404).json({
        error: 'Word not found',
        word: word,
        message: 'Could not find meaning in English or Tamil'
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Error in dictionary route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/dictionary
 * Search word via POST request
 */
router.post('/', async (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Word is required in request body'
      });
    }

    const searchWord = word.toLowerCase().trim();
    
    // Fetch both English and Tamil meanings in parallel
    const [englishData, tamilData] = await Promise.allSettled([
      dictionaryService.getEnglishMeaning(searchWord),
      dictionaryService.getTamilMeaning(searchWord)
    ]);

    const response = {
      word: searchWord,
      english: englishData.status === 'fulfilled' ? englishData.value : { error: englishData.reason?.message || 'Failed to fetch English meaning' },
      tamil: tamilData.status === 'fulfilled' ? tamilData.value : { error: tamilData.reason?.message || 'Failed to fetch Tamil meaning' }
    };

    // If both failed, return 404
    if (englishData.status === 'rejected' && tamilData.status === 'rejected') {
      return res.status(404).json({
        error: 'Word not found',
        word: searchWord,
        message: 'Could not find meaning in English or Tamil'
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Error in dictionary route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/dictionary/suggestions/:query
 * Get word suggestions for autocomplete
 */
router.get('/suggestions/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase().trim();
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Use Datamuse API for word suggestions
    const response = await axios.get('https://api.datamuse.com/sug', {
      params: {
        s: query,
        max: 10
      },
      timeout: 5000
    });

    const suggestions = response.data
      .map(item => item.word)
      .filter(word => word.length > 0)
      .slice(0, 8); // Limit to 8 suggestions

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    // Return empty suggestions on error instead of failing
    res.json({ suggestions: [] });
  }
});

module.exports = router;
