const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

/**
 * GET /api/ai/:word
 * Returns AI explanation in this JSON shape (used by the AI tab UI):
 * {
 *   word: string,
 *   english: { definition: string, partOfSpeech: string, example: string | null },
 *   tamil: { word: string, meaning: string, example: string | null }
 * }
 */
router.get('/:word', async (req, res) => {
  try {
    const word = req.params.word.trim();
    if (!word) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Word parameter is required'
      });
    }

    const result = await aiService.getWordExplanation(word);
    res.json(result);
  } catch (error) {
    console.error('Error in AI route:', error);
    const status = 500;
    res.status(status).json({
      error: error.message || 'AI request failed'
    });
  }
});

module.exports = router;
