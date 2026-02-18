// DOM Elements
const wordInput = document.getElementById('wordInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const results = document.getElementById('results');
const noResults = document.getElementById('noResults');
const searchedWord = document.getElementById('searchedWord');
const phonetic = document.getElementById('phonetic');
const englishMeanings = document.getElementById('englishMeanings');
const tamilMeanings = document.getElementById('tamilMeanings');
const suggestions = document.getElementById('suggestions');
const englishSlangEl = document.getElementById('englishSlang');
const audioEnBtn = document.getElementById('audioEnBtn');
const audioTaBtn = document.getElementById('audioTaBtn');
const audioDictBtn = document.getElementById('audioDictBtn');
const audioEnVoice = document.getElementById('audioEnVoice');
const audioTaVoice = document.getElementById('audioTaVoice');
const audioDictSource = document.getElementById('audioDictSource');
const dictAudioGroup = document.getElementById('dictAudioGroup');
const tabDictionary = document.getElementById('tabDictionary');
const tabAI = document.getElementById('tabAI');
const panelDictionary = document.getElementById('panelDictionary');
const panelAI = document.getElementById('panelAI');
const aiLoading = document.getElementById('aiLoading');
const aiContent = document.getElementById('aiContent');
const aiError = document.getElementById('aiError');
const aiWordTitle = document.getElementById('aiWordTitle');
const aiEnglishBlock = document.getElementById('aiEnglishBlock');
const aiTamilBlock = document.getElementById('aiTamilBlock');

// API Base URL
const API_BASE_URL = window.location.origin;

// AI tab state: current word we requested, result or error
let aiRequestWord = '';
let aiResult = null;
let aiErrorMessage = '';
let aiFetchAbort = null;
let lastSearchedWord = ''; // word from last successful search (used when AI tab is clicked)

// Current result data for audio (word, tamilWord, phonetics)
let lastResultData = { word: '', tamilWord: '', phonetics: [] };

// Speech synthesis: voice lists (populated when voices load)
let voiceMap = { en: {}, ta: {} };
let voicesReady = false;

function isFemaleVoice(voice) {
  const n = (voice.name || '').toLowerCase();
  return /female|woman|samantha|kate|karen|victoria|moira|lekha|female/i.test(n);
}

function loadVoices() {
  const voices = speechSynthesis.getVoices();
  voiceMap = { en: {}, ta: {} };
  const gbVoices = [], usVoices = [], taVoices = [];
  voices.forEach(v => {
    const lang = (v.lang || '').toLowerCase();
    if (lang.startsWith('en-gb')) gbVoices.push(v);
    else if (lang.startsWith('en-us') || (lang.startsWith('en') && !lang.includes('gb'))) usVoices.push(v);
    else if (lang.startsWith('ta')) taVoices.push(v);
  });
  if (gbVoices.length >= 2) {
    const f = gbVoices.find(isFemaleVoice), m = gbVoices.find(v => !isFemaleVoice(v));
    if (m) voiceMap.en['en-GB-male'] = m;
    if (f) voiceMap.en['en-GB-female'] = f;
  } else if (gbVoices.length === 1) {
    voiceMap.en['en-GB-male'] = voiceMap.en['en-GB-female'] = gbVoices[0];
  }
  if (usVoices.length >= 2) {
    const f = usVoices.find(isFemaleVoice), m = usVoices.find(v => !isFemaleVoice(v));
    if (m) voiceMap.en['en-US-male'] = m;
    if (f) voiceMap.en['en-US-female'] = f;
  } else if (usVoices.length === 1) {
    voiceMap.en['en-US-male'] = voiceMap.en['en-US-female'] = usVoices[0];
  }
  if (taVoices.length >= 2) {
    const f = taVoices.find(isFemaleVoice), m = taVoices.find(v => !isFemaleVoice(v));
    if (m) voiceMap.ta['ta-male'] = m;
    if (f) voiceMap.ta['ta-female'] = f;
  } else if (taVoices.length === 1) {
    voiceMap.ta['ta-male'] = voiceMap.ta['ta-female'] = taVoices[0];
  }
  // Fallbacks: any English / Tamil
  ['en-GB-male', 'en-GB-female', 'en-US-male', 'en-US-female'].forEach(k => {
    if (!voiceMap.en[k]) {
      const v = voices.find(x => (x.lang || '').toLowerCase().startsWith('en'));
      if (v) voiceMap.en[k] = v;
    }
  });
  ['ta-male', 'ta-female'].forEach(k => {
    if (!voiceMap.ta[k]) {
      const v = voices.find(x => (x.lang || '').toLowerCase().startsWith('ta'));
      if (v) voiceMap.ta[k] = v;
    }
  });
  voicesReady = true;
}

if (typeof speechSynthesis !== 'undefined') {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function speakWithVoice(text, voiceKey, lang) {
  if (!text || !voicesReady) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = (lang === 'ta' ? voiceMap.ta : voiceMap.en)[voiceKey];
  if (voice) utterance.voice = voice;
  utterance.lang = lang === 'ta' ? 'ta-IN' : (voiceKey.startsWith('en-GB') ? 'en-GB' : 'en-US');
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function playDictionaryAudio(url) {
  const audio = new Audio(url);
  audio.play().catch(() => {});
}

// Suggestions state
let suggestionTimeout = null;
let currentSuggestionIndex = -1;
let suggestionItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input
    wordInput.focus();
    
    // Search on Enter key
    wordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!suggestions.classList.contains('hidden') && currentSuggestionIndex >= 0) {
                // Select highlighted suggestion
                e.preventDefault();
                selectSuggestion(suggestionItems[currentSuggestionIndex]);
            } else {
                // Perform search
                searchWord();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateSuggestions(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateSuggestions(-1);
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
    
    // Input change for suggestions
    wordInput.addEventListener('input', handleInputChange);
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container-wrapper')) {
            hideSuggestions();
        }
    });
    
    // Search button click
    searchBtn.addEventListener('click', searchWord);

    // Audio: English TTS
    audioEnBtn.addEventListener('click', () => {
      const voiceKey = audioEnVoice.value;
      speakWithVoice(lastResultData.word, voiceKey, 'en');
    });
    // Audio: Tamil TTS
    audioTaBtn.addEventListener('click', () => {
      const voiceKey = audioTaVoice.value;
      speakWithVoice(lastResultData.tamilWord || lastResultData.word, voiceKey, 'ta');
    });
    // Audio: Dictionary (streamed URL)
    audioDictBtn.addEventListener('click', () => {
      const opt = audioDictSource.selectedOptions[0];
      const url = opt && opt.value;
      if (url) playDictionaryAudio(url);
    });

    // Tabs: Dictionary | AI
    tabDictionary.addEventListener('click', () => switchTab('dictionary'));
    tabAI.addEventListener('click', () => switchTab('ai'));
});

/**
 * Switch between Dictionary and AI tabs
 */
function switchTab(tab) {
    const isDict = tab === 'dictionary';
    tabDictionary.classList.toggle('active', isDict);
    tabAI.classList.toggle('active', !isDict);
    tabDictionary.setAttribute('aria-selected', isDict);
    tabAI.setAttribute('aria-selected', !isDict);
    panelDictionary.classList.toggle('hidden', !isDict);
    panelAI.classList.toggle('hidden', isDict);
    if (!isDict) {
        if (lastSearchedWord) {
            aiResult = null;
            aiErrorMessage = '';
            renderAIPanel();
            fetchAIForWord(lastSearchedWord);
        } else {
            aiResult = null;
            aiErrorMessage = 'Search for a word first, then open the AI tab.';
            renderAIPanel();
        }
    } else {
        renderAIPanel();
    }
}

/**
 * Render one labeled field for the AI tab. Label can be empty to hide the row.
 */
function aiField(label, value) {
    if (value == null || String(value).trim() === '') return '';
    return `<div class="ai-field"><span class="ai-field-label">${escapeHtml(label)}</span><span class="ai-field-value">${escapeHtml(String(value).trim())}</span></div>`;
}

/**
 * Render AI tab from API JSON: { word, english: { definition, partOfSpeech, example }, tamil: { word, meaning, example } }
 */
function renderAIPanel() {
    aiLoading.classList.add('hidden');
    aiContent.classList.add('hidden');
    aiError.classList.add('hidden');
    if (aiErrorMessage) {
        aiError.textContent = aiErrorMessage;
        aiError.classList.remove('hidden');
        return;
    }
    if (aiResult) {
        const word = aiResult.word != null ? String(aiResult.word).trim() : '';
        const en = aiResult.english && typeof aiResult.english === 'object' ? aiResult.english : {};
        const ta = aiResult.tamil && typeof aiResult.tamil === 'object' ? aiResult.tamil : {};

        aiWordTitle.textContent = word || '—';
        aiWordTitle.classList.toggle('empty', !word);

        const enParts = [
            aiField('Part of speech', en.partOfSpeech),
            aiField('Definition', en.definition),
            aiField('Example', en.example)
        ].filter(Boolean).join('');
        aiEnglishBlock.innerHTML = enParts || '<p class="ai-empty">No English content</p>';

        const taParts = [
            aiField('Tamil word', ta.word),
            aiField('Meaning', ta.meaning),
            aiField('Example', ta.example)
        ].filter(Boolean).join('');
        aiTamilBlock.innerHTML = taParts || '<p class="ai-empty">No Tamil content</p>';

        aiContent.classList.remove('hidden');
        return;
    }
    aiLoading.classList.remove('hidden');
}

/**
 * Build AI-tab shape from dictionary API response so the AI tab can show immediately.
 */
function dictionaryDataToAIResult(data) {
    if (!data || !data.word) return null;
    const en = data.english;
    const ta = data.tamil;
    const english = {
        definition: '',
        partOfSpeech: '',
        example: null
    };
    const tamil = { word: '', meaning: '', example: null };
    if (en && en.meanings && en.meanings.length > 0) {
        const first = en.meanings[0];
        english.definition = first.definition || '';
        english.partOfSpeech = first.partOfSpeech || '';
        english.example = first.example || null;
    }
    if (ta) {
        tamil.word = ta.word || '';
        tamil.meaning = ta.meaning || '';
        tamil.example = ta.example || null;
    }
    return { word: data.word, english, tamil };
}

/**
 * Normalize /api/ai response to the shape the UI expects.
 * API returns: { word, english: { definition, partOfSpeech, example }, tamil: { word, meaning, example } }
 */
function normalizeAIResponseFromAPI(data, fallbackWord) {
    const w = (data && data.word != null) ? String(data.word).trim() : (fallbackWord || '');
    const en = data && data.english && typeof data.english === 'object' ? data.english : {};
    const ta = data && data.tamil && typeof data.tamil === 'object' ? data.tamil : {};
    return {
        word: w,
        english: {
            definition: en.definition != null ? String(en.definition) : '',
            partOfSpeech: en.partOfSpeech != null ? String(en.partOfSpeech) : '',
            example: en.example != null ? en.example : null
        },
        tamil: {
            word: ta.word != null ? String(ta.word) : '',
            meaning: ta.meaning != null ? String(ta.meaning) : '',
            example: ta.example != null ? ta.example : null
        }
    };
}

/**
 * Fetch AI explanation for word and update AI tab
 */
async function fetchAIForWord(word) {
    if (aiFetchAbort) aiFetchAbort.abort();
    aiRequestWord = word;
    aiResult = null;
    aiErrorMessage = '';
    aiFetchAbort = new AbortController();
    const signal = aiFetchAbort.signal;
    renderAIPanel();
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/${encodeURIComponent(word)}`, { signal });
        const data = await response.json();
        if (aiRequestWord !== word) return;
        if (response.ok) {
            aiResult = normalizeAIResponseFromAPI(data, word);
            aiErrorMessage = '';
        } else {
            aiErrorMessage = data.error || data.message || 'AI request failed';
        }
    } catch (err) {
        if (aiRequestWord !== word) return;
        if (err.name === 'AbortError') return;
        aiErrorMessage = err.message || 'Failed to load AI explanation';
    } finally {
        aiFetchAbort = null;
        renderAIPanel();
    }
}

/**
 * Search for word meaning
 */
async function searchWord() {
    const word = wordInput.value.trim();
    
    // Validation
    if (!word) {
        showError('Please enter a word to search');
        return;
    }
    
    // Hide suggestions
    hideSuggestions();
    
    // Hide previous results and errors
    hideAll();
    showLoading();
    
    // Disable search button
    searchBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/dictionary/${encodeURIComponent(word)}`);
        const data = await response.json();
        
        if (response.ok) {
            displayResults(data);
        } else {
            showNoResults(data.error || 'Word not found');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to fetch word meaning. Please try again.');
    } finally {
        hideLoading();
        searchBtn.disabled = false;
    }
}

/**
 * Display search results
 */
function displayResults(data) {
    hideAll();
    switchTab('dictionary');

    lastSearchedWord = data.word || '';
    lastResultData = {
      word: data.word,
      tamilWord: (data.tamil && data.tamil.word) ? data.tamil.word : data.word,
      phonetics: (data.english && data.english.phonetics) ? data.english.phonetics : []
    };

    // Display word header
    searchedWord.textContent = data.word;
    phonetic.textContent = data.english?.phonetic || '';

    // Dictionary audio (phonetics from API)
    audioDictSource.innerHTML = '';
    if (lastResultData.phonetics.length > 0) {
      dictAudioGroup.classList.remove('hidden');
      lastResultData.phonetics.forEach((p, i) => {
        const opt = document.createElement('option');
        opt.value = p.audio;
        opt.textContent = p.accent === 'uk' ? 'UK' : 'US';
        if (i === 0) opt.selected = true;
        audioDictSource.appendChild(opt);
      });
    } else {
      dictAudioGroup.classList.add('hidden');
    }
    
    // Display English meanings
    if (data.english && !data.english.error && data.english.meanings) {
        displayEnglishMeanings(data.english);
    } else {
        englishMeanings.innerHTML = `
            <div class="meaning-item">
                <p class="definition-text" style="color: var(--text-muted);">
                    ${data.english?.error || 'English meaning not available'}
                </p>
            </div>
        `;
    }
    
    // Display Tamil meanings
    if (data.tamil && !data.tamil.error) {
        displayTamilMeanings(data.tamil);
    } else {
        tamilMeanings.innerHTML = `
            <div class="meaning-item">
                <p class="definition-text" style="color: var(--text-muted);">
                    ${data.tamil?.error || 'Tamil meaning not available'}
                </p>
            </div>
            `;
    }

    // Slang / informal (British & American)
    if (data.english && data.english.slangDefinitions && data.english.slangDefinitions.length > 0) {
        displayEnglishSlang(data.english.slangDefinitions);
    } else {
        englishSlangEl.classList.add('hidden');
        englishSlangEl.innerHTML = '';
    }
    
    results.classList.remove('hidden');

    // Scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Display English meanings
 */
function displayEnglishMeanings(englishData) {
    englishMeanings.innerHTML = '';
    
    if (!englishData.meanings || englishData.meanings.length === 0) {
        englishMeanings.innerHTML = `
            <div class="meaning-item">
                <p class="definition-text" style="color: var(--text-muted);">
                    No meanings found
                </p>
            </div>
        `;
        return;
    }
    
    englishData.meanings.forEach((meaning, index) => {
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'meaning-item';
        
        let html = '';
        
        if (meaning.partOfSpeech) {
            html += `<span class="part-of-speech">${meaning.partOfSpeech}</span>`;
        }
        
        if (meaning.definition) {
            html += `<p class="definition-text">${escapeHtml(meaning.definition)}</p>`;
        }
        
        if (meaning.example) {
            html += `
                <div class="example-container">
                    <div class="example-label">Example</div>
                    <div class="example-text">"${escapeHtml(meaning.example)}"</div>
                </div>
            `;
        }
        
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            html += `
                <div style="margin-top: 0.75rem;">
                    <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">Synonyms: </span>
                    <span style="color: var(--text-secondary);">${meaning.synonyms.slice(0, 5).join(', ')}</span>
                </div>
            `;
        }
        
        meaningDiv.innerHTML = html;
        englishMeanings.appendChild(meaningDiv);
    });
}

/**
 * Display Tamil meanings
 */
function displayTamilMeanings(tamilData) {
    tamilMeanings.innerHTML = '';
    
    const meaningDiv = document.createElement('div');
    meaningDiv.className = 'meaning-item';
    
    let html = '';
    
    if (tamilData.word) {
        html += `<div class="tamil-word">${tamilData.word}</div>`;
    }
    
    if (tamilData.meaning) {
        html += `<p class="definition-text">${escapeHtml(tamilData.meaning)}</p>`;
    }
    
    if (tamilData.example) {
        html += `
            <div class="example-container">
                <div class="example-label">Example</div>
                <div class="example-text">"${escapeHtml(tamilData.example)}"</div>
            </div>
        `;
    }
    
    meaningDiv.innerHTML = html;
    tamilMeanings.appendChild(meaningDiv);
}

/**
 * Strip Urban Dictionary-style [word] links and HTML for display/TTS
 */
function stripSlangMarkup(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerHTML = text;
    let plain = div.textContent || text;
    return plain.replace(/\s+/g, ' ').trim();
}

/**
 * Display English slang / informal definitions (British & American)
 */
function displayEnglishSlang(slangDefinitions) {
    englishSlangEl.innerHTML = '';
    englishSlangEl.classList.remove('hidden');
    const heading = document.createElement('h4');
    heading.className = 'slang-heading';
    heading.innerHTML = '🇬🇧🇺🇸 Slang / Informal';
    englishSlangEl.appendChild(heading);
    slangDefinitions.forEach((item, index) => {
        const def = stripSlangMarkup(item.definition);
        const example = item.example ? stripSlangMarkup(item.example) : '';
        const card = document.createElement('div');
        card.className = 'slang-item';
        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'slang-play-btn';
        playBtn.title = 'Listen (English voice)';
        playBtn.innerHTML = '🔊';
        playBtn.addEventListener('click', () => {
            const voiceKey = audioEnVoice.value;
            const toSpeak = example ? `${def} Example: ${example}` : def;
            speakWithVoice(toSpeak, voiceKey, 'en');
        });
        card.innerHTML = `
            <div class="slang-content">
                <p class="slang-definition">${escapeHtml(def)}</p>
                ${example ? `<p class="slang-example">"${escapeHtml(example)}"</p>` : ''}
                ${(item.thumbsUp || item.thumbsDown) ? `<span class="slang-votes">👍 ${item.thumbsUp || 0} 👎 ${item.thumbsDown || 0}</span>` : ''}
            </div>
        `;
        card.prepend(playBtn);
        englishSlangEl.appendChild(card);
    });
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

/**
 * Show no results message
 */
function showNoResults(message) {
    hideAll();
    noResults.querySelector('p').textContent = message || 'Word not found';
    noResults.classList.remove('hidden');
}

/**
 * Hide all result sections
 */
function hideAll() {
    results.classList.add('hidden');
    noResults.classList.add('hidden');
    errorMessage.classList.remove('show');
}

/**
 * Handle input change for suggestions
 */
function handleInputChange() {
    const query = wordInput.value.trim();
    
    // Clear previous timeout
    if (suggestionTimeout) {
        clearTimeout(suggestionTimeout);
    }
    
    // Hide suggestions if input is empty
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Debounce suggestions fetch
    suggestionTimeout = setTimeout(() => {
        fetchSuggestions(query);
    }, 300);
}

/**
 * Fetch word suggestions
 */
async function fetchSuggestions(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dictionary/suggestions/${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.suggestions && data.suggestions.length > 0) {
            displaySuggestions(data.suggestions);
        } else {
            hideSuggestions();
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        hideSuggestions();
    }
}

/**
 * Display suggestions
 */
function displaySuggestions(suggestionList) {
    suggestions.innerHTML = '';
    suggestionItems = [];
    currentSuggestionIndex = -1;
    
    if (suggestionList.length === 0) {
        suggestions.innerHTML = '<div class="suggestions-empty">No suggestions found</div>';
        suggestions.classList.remove('hidden');
        return;
    }
    
    suggestionList.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <span class="suggestion-icon">💡</span>
            <span class="suggestion-text">${escapeHtml(word)}</span>
        `;
        
        item.addEventListener('click', () => {
            selectSuggestion(item);
        });
        
        item.addEventListener('mouseenter', () => {
            highlightSuggestion(index);
        });
        
        suggestions.appendChild(item);
        suggestionItems.push(item);
    });
    
    suggestions.classList.remove('hidden');
}

/**
 * Navigate suggestions with keyboard
 */
function navigateSuggestions(direction) {
    if (suggestionItems.length === 0) return;
    
    // Remove previous highlight
    if (currentSuggestionIndex >= 0) {
        suggestionItems[currentSuggestionIndex].classList.remove('highlighted');
    }
    
    // Calculate new index
    currentSuggestionIndex += direction;
    
    if (currentSuggestionIndex < 0) {
        currentSuggestionIndex = suggestionItems.length - 1;
    } else if (currentSuggestionIndex >= suggestionItems.length) {
        currentSuggestionIndex = 0;
    }
    
    // Highlight new item
    suggestionItems[currentSuggestionIndex].classList.add('highlighted');
    
    // Scroll into view
    suggestionItems[currentSuggestionIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
    });
}

/**
 * Highlight suggestion by index
 */
function highlightSuggestion(index) {
    // Remove previous highlight
    if (currentSuggestionIndex >= 0 && currentSuggestionIndex < suggestionItems.length) {
        suggestionItems[currentSuggestionIndex].classList.remove('highlighted');
    }
    
    currentSuggestionIndex = index;
    suggestionItems[index].classList.add('highlighted');
}

/**
 * Select a suggestion
 */
function selectSuggestion(item) {
    const word = item.querySelector('.suggestion-text').textContent.trim();
    wordInput.value = word;
    hideSuggestions();
    wordInput.focus();
    // Trigger search
    searchWord();
}

/**
 * Hide suggestions
 */
function hideSuggestions() {
    suggestions.classList.add('hidden');
    currentSuggestionIndex = -1;
    if (suggestionItems.length > 0) {
        suggestionItems.forEach(item => item.classList.remove('highlighted'));
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
