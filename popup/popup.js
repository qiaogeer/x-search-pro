/**
 * Twitter Advanced Search Extension - Popup Script
 * @file popup.js
 * @version 1.0.0
 * @description Handles form interactions and search query building
 * @license MIT
 */

// Constants
const CONSTANTS = {
    TIMEOUT: 5000,
    DEBOUNCE_DELAY: 300,
    FORM_FIELDS: [
        'keywords', 'exclude', 'exactPhrase', 'orSearch',
        'fromUser', 'toUser', 'mentionUser', 'hasLinks',
        'mediaType', 'sortType', 'minFaves', 'minRetweets',
        'minReplies', 'startTime', 'endTime'
    ],
    UI_TEXTS: {
        SEARCHING: '正在搜索...',
        SEARCH_ERROR: '搜索失败',
        UNKNOWN_ERROR: '未知错误'
    }
};

// Cache DOM elements
const elements = new Map();

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Get cached form element value
 * @param {string} id - Element ID
 * @returns {string} - Element value
 */
const getElementValue = (id) => {
    if (!elements.has(id)) {
        elements.set(id, document.getElementById(id));
    }
    const element = elements.get(id);
    return element ? element.value.trim() : '';
};

/**
 * Save search conditions to Chrome storage
 */
const saveSearchConditions = debounce(() => {
    const conditions = Object.fromEntries(
        CONSTANTS.FORM_FIELDS.map(id => [id, getElementValue(id)])
    );
    chrome.storage.local.set({ lastSearch: conditions });
}, CONSTANTS.DEBOUNCE_DELAY);

/**
 * Restore previous search conditions
 */
const restoreSearchConditions = async () => {
    try {
        const { lastSearch } = await chrome.storage.local.get(['lastSearch']);
        if (lastSearch) {
            CONSTANTS.FORM_FIELDS.forEach(id => {
                const element = document.getElementById(id);
                if (element && lastSearch[id]) {
                    element.value = lastSearch[id];
                }
            });
        }
    } catch (error) {
        console.error('Failed to restore search conditions:', error);
    }
};

/**
 * Build search query string
 * @returns {string} - Search query
 */
const buildSearchQuery = () => {
    const parts = new Set();
    
    // Keywords
    const keywords = getElementValue('keywords');
    if (keywords) {
        parts.add(keywords.split(' ').map(word => `(${word})`).join(' '));
    }
    
    // Exclude keywords
    const exclude = getElementValue('exclude');
    if (exclude) {
        parts.add(exclude.split(' ').map(word => `-${word}`).join(' '));
    }
    
    // Exact phrase
    const exactPhrase = getElementValue('exactPhrase');
    if (exactPhrase) {
        parts.add(exactPhrase.startsWith('"') ? exactPhrase : `"${exactPhrase}"`);
    }
    
    // OR search
    const orSearch = getElementValue('orSearch');
    if (orSearch) {
        if (orSearch.includes(' OR ')) {
            parts.add(`(${orSearch})`);
        } else {
            const terms = orSearch.split(' ').filter(Boolean);
            if (terms.length >= 2) {
                parts.add(`(${terms[0]} OR ${terms[1]})`);
            }
        }
    }
    
    // User filters
    ['fromUser', 'toUser', 'mentionUser'].forEach(field => {
        const value = getElementValue(field);
        if (value) {
            const prefix = field === 'mentionUser' ? '@' : field.replace('User', ':');
            parts.add(`${prefix}${value}`);
        }
    });
    
    // Sort type
    const sortType = getElementValue('sortType');
    if (sortType === 'latest') {
        parts.add('f=live');
    }

    // Engagement filters
    ['minFaves', 'minRetweets', 'minReplies'].forEach(field => {
        const value = getElementValue(field);
        if (value && !isNaN(value) && value > 0) {
            parts.add(`${field.replace('min', 'min_')}:${value}`);
        }
    });

    // Other filters
    ['hasLinks', 'mediaType'].forEach(field => {
        const value = getElementValue(field);
        if (value) {
            parts.add(value);
        }
    });
    
    // Time filters
    const startTime = getElementValue('startTime');
    const endTime = getElementValue('endTime');
    if (startTime) parts.add(`since:${startTime}`);
    if (endTime) parts.add(`until:${endTime}`);
    
    return Array.from(parts).join(' ');
};

/**
 * Handle search form submission
 * @param {Event} e - Form submit event
 */
const handleSearch = async (e) => {
    e.preventDefault();
    
    const searchButton = document.querySelector('.search-button');
    const originalText = searchButton.textContent;
    
    try {
        searchButton.textContent = CONSTANTS.UI_TEXTS.SEARCHING;
        searchButton.disabled = true;
        
        const searchQuery = buildSearchQuery();
        await saveSearchConditions();
        
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Search timeout'));
            }, CONSTANTS.TIMEOUT);
            
            chrome.runtime.sendMessage({
                action: 'performSearch',
                query: searchQuery
            }, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });
        });
        
        if (!response?.success) {
            throw new Error(response?.error || CONSTANTS.UI_TEXTS.UNKNOWN_ERROR);
        }
    } catch (error) {
        console.error(CONSTANTS.UI_TEXTS.SEARCH_ERROR, error);
    } finally {
        searchButton.textContent = originalText;
        searchButton.disabled = false;
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Cache form elements
    CONSTANTS.FORM_FIELDS.forEach(id => {
        elements.set(id, document.getElementById(id));
    });
    
    // Restore previous search conditions
    restoreSearchConditions();
    
    // Add form submit listener
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    
    // Add input change listeners for auto-save
    CONSTANTS.FORM_FIELDS.forEach(id => {
        const element = elements.get(id);
        if (element) {
            element.addEventListener('input', saveSearchConditions);
        }
    });
});

