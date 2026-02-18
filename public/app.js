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

// API Base URL
const API_BASE_URL = window.location.origin;

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
});

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
    
    // Display word header
    searchedWord.textContent = data.word;
    phonetic.textContent = data.english?.phonetic || '';
    
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
