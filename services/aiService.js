const axios = require('axios');
const dictionaryService = require('./dictionaryService');

const HF_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_LEGACY_INFERENCE_URL = 'https://api-inference.huggingface.co/models';

const HF_TOKEN_HELP = 'Create a token with "Inference" or "Inference Providers" permission at https://huggingface.co/settings/tokens (use a Fine-grained token and enable Inference).';

/**
 * Get word explanation in English and Tamil.
 * Uses Hugging Face Chat Completions API (router.huggingface.co) when HUGGINGFACE_API_KEY is set; otherwise dictionary fallback.
 * Always returns the same shape so the UI can display it: { word, english, tamil }.
 */
async function getWordExplanation(word) {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (apiKey && apiKey.trim() !== '') {
    try {
      return await getWordExplanationFromHuggingFace(word, apiKey);
    } catch (error) {
      console.warn('Hugging Face API failed, using dictionary fallback:', error.message);
      if (error.message && (error.message.includes('403') || error.message.includes(HF_TOKEN_HELP))) {
        throw error;
      }
    }
  }
  return getWordExplanationFromDictionary(word);
}

/**
 * Try Hugging Face Chat Completions (router), then legacy inference if 403.
 */
async function getWordExplanationFromHuggingFace(word, apiKey) {
  try {
    return await getWordExplanationFromHuggingFaceRouter(word, apiKey);
  } catch (err) {
    const status = err.response?.status;
    if (status === 403 || status === 401) {
      try {
        return await getWordExplanationFromHuggingFaceLegacy(word, apiKey);
      } catch (legacyErr) {
        const legacyStatus = legacyErr.response?.status;
        if (legacyStatus === 403 || legacyStatus === 401) {
          throw new Error(`Hugging Face API returned ${status || legacyStatus}. ${HF_TOKEN_HELP}`);
        }
        throw legacyErr;
      }
    }
    throw err;
  }
}

/**
 * Hugging Face Chat Completions API (router.huggingface.co).
 */
async function getWordExplanationFromHuggingFaceRouter(word, apiKey) {
  const model = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  const prompt = `For the English word "${word}", reply with valid JSON only in this exact shape (no other text):
{"english":{"definition":"...","partOfSpeech":"...","example":"..."},"tamil":{"word":"...","meaning":"...","example":"..."}}`;

  const response = await axios.post(
    HF_CHAT_URL,
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.3
    },
    {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Empty or invalid response from Hugging Face');
  }

  return normalizeAIResponse(word, content.trim());
}

/**
 * Legacy Inference API (api-inference.huggingface.co) – works with Read/Inference tokens.
 */
async function getWordExplanationFromHuggingFaceLegacy(word, apiKey) {
  const model = process.env.HUGGINGFACE_LEGACY_MODEL || 'google/flan-t5-base';
  const prompt = `For the English word "${word}", reply with valid JSON only in this exact shape (no other text):
{"english":{"definition":"...","partOfSpeech":"...","example":"..."},"tamil":{"word":"...","meaning":"...","example":"..."}}`;

  const response = await axios.post(
    `${HF_LEGACY_INFERENCE_URL}/${model}`,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        return_full_text: false,
        temperature: 0.3
      }
    },
    {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );

  let generatedText = '';
  const data = response.data;
  if (Array.isArray(data) && data[0] && data[0].generated_text != null) {
    generatedText = String(data[0].generated_text).trim();
  } else if (data && data.generated_text != null) {
    generatedText = String(data.generated_text).trim();
  }

  if (!generatedText) {
    throw new Error('Empty response from Hugging Face');
  }

  return normalizeAIResponse(word, generatedText);
}

/**
 * Normalize raw AI output (JSON string or plain text) to the shape the UI expects.
 */
function normalizeAIResponse(word, rawText) {
  const english = { definition: '', partOfSpeech: '', example: null };
  const tamil = { word: '', meaning: '', example: null };

  const trimmed = rawText.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const en = parsed.english || parsed.English;
      const ta = parsed.tamil || parsed.Tamil;
      if (en && typeof en === 'object') {
        english.definition = en.definition || '';
        english.partOfSpeech = en.partOfSpeech || en.part_of_speech || '';
        english.example = en.example || null;
      }
      if (ta && typeof ta === 'object') {
        tamil.word = ta.word || '';
        tamil.meaning = ta.meaning || ta.definition || '';
        tamil.example = ta.example || null;
      }
    } catch (_) {
      // Fall through to use raw text
    }
  }

  const hasStructured = english.definition || english.partOfSpeech || tamil.meaning || tamil.word;
  if (!hasStructured) {
    english.definition = trimmed;
  }

  return { word, english, tamil };
}

/**
 * Fallback: use free dictionary + translation APIs (no key required).
 */
async function getWordExplanationFromDictionary(word) {
  const [englishData, tamilData] = await Promise.all([
    dictionaryService.getEnglishMeaning(word).catch(() => null),
    dictionaryService.getTamilMeaning(word).catch(() => null)
  ]);

  const english = { definition: '', partOfSpeech: '', example: null };
  const tamil = { word: '', meaning: '', example: null };

  if (englishData?.meanings?.length > 0) {
    const first = englishData.meanings[0];
    english.definition = first.definition || '';
    english.partOfSpeech = first.partOfSpeech || '';
    english.example = first.example || null;
  }
  if (tamilData) {
    tamil.word = tamilData.word || '';
    tamil.meaning = tamilData.meaning || '';
    tamil.example = tamilData.example || null;
  }

  if (!english.definition && !tamil.meaning) {
    throw new Error('Could not get meaning for this word. Try the Dictionary tab for more sources.');
  }

  return { word, english, tamil };
}

module.exports = {
  getWordExplanation,
  normalizeAIResponse
};
