const axios = require('axios');

/**
 * Get English meaning and examples for a word
 * Uses Free Dictionary API (https://dictionaryapi.dev/)
 */
async function getEnglishMeaning(word) {
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (response.data && response.data.length > 0) {
      const wordData = response.data[0];
      
      // Extract meanings and examples
      const meanings = [];
      
      if (wordData.meanings && Array.isArray(wordData.meanings)) {
        wordData.meanings.forEach(meaning => {
          if (meaning.definitions && Array.isArray(meaning.definitions)) {
            meaning.definitions.forEach(def => {
              meanings.push({
                partOfSpeech: meaning.partOfSpeech || 'unknown',
                definition: def.definition || '',
                example: def.example || null,
                synonyms: def.synonyms || [],
                antonyms: def.antonyms || []
              });
            });
          }
        });
      }

      return {
        word: wordData.word || word,
        phonetic: wordData.phonetic || null,
        meanings: meanings,
        sourceUrls: wordData.sourceUrls || []
      };
    }

    throw new Error('Word not found in dictionary');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Word not found in English dictionary');
    }
    throw new Error(`Failed to fetch English meaning: ${error.message}`);
  }
}

/**
 * Get Tamil meaning and example for a word
 * Uses MyMemory Translation API for translation
 */
async function getTamilMeaning(word) {
  try {
    // First, get English definition to translate
    const englishData = await getEnglishMeaning(word).catch(() => null);
    
    // Translate the word itself
    const wordTranslationResponse = await axios.get(
      'https://api.mymemory.translated.net/get',
      {
        params: {
          q: word,
          langpair: 'en|ta'
        },
        timeout: 10000
      }
    );

    let tamilWord = word;
    if (wordTranslationResponse.data && 
        wordTranslationResponse.data.responseData && 
        wordTranslationResponse.data.responseData.translatedText) {
      tamilWord = wordTranslationResponse.data.responseData.translatedText;
    }

    // Translate the first definition if available
    let tamilMeaning = '';
    let tamilExample = '';

    if (englishData && englishData.meanings && englishData.meanings.length > 0) {
      const firstDefinition = englishData.meanings[0].definition;
      
      // Translate the definition
      const meaningTranslationResponse = await axios.get(
        'https://api.mymemory.translated.net/get',
        {
          params: {
            q: firstDefinition,
            langpair: 'en|ta'
          },
          timeout: 10000
        }
      );

      if (meaningTranslationResponse.data && 
          meaningTranslationResponse.data.responseData && 
          meaningTranslationResponse.data.responseData.translatedText) {
        tamilMeaning = meaningTranslationResponse.data.responseData.translatedText;
      }

      // Translate example if available
      if (englishData.meanings[0].example) {
        const exampleTranslationResponse = await axios.get(
          'https://api.mymemory.translated.net/get',
          {
            params: {
              q: englishData.meanings[0].example,
              langpair: 'en|ta'
            },
            timeout: 10000
          }
        );

        if (exampleTranslationResponse.data && 
            exampleTranslationResponse.data.responseData && 
            exampleTranslationResponse.data.responseData.translatedText) {
          tamilExample = exampleTranslationResponse.data.responseData.translatedText;
        }
      }
    }

    return {
      word: tamilWord,
      meaning: tamilMeaning || 'Translation not available',
      example: tamilExample || null,
      originalWord: word
    };
  } catch (error) {
    throw new Error(`Failed to fetch Tamil meaning: ${error.message}`);
  }
}

module.exports = {
  getEnglishMeaning,
  getTamilMeaning
};
