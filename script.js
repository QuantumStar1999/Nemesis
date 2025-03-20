// API Key for WordsAPI (replace with your own key)
const API_KEY = 'your_api_key_here';
const API_URL = `https://wordsapiv1.p.rapidapi.com/words/`;

// Local storage key
const STORAGE_KEY = 'wordData';

// Show the selected section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

// Search for a word
async function searchWord() {
  const word = document.getElementById('searchInput').value.trim();
  if (!word) return;

  try {
    const response = await fetch(`${API_URL}${word}`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
      }
    });
    const data = await response.json();
    displaySearchResults(data);
    saveWordData(data);
  } catch (error) {
    console.error('Error fetching word data:', error);
  }
}

// Display search results
function displaySearchResults(data) {
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = `
    <h3>${data.word}</h3>
    <p><strong>Definition:</strong> ${data.results[0].definition}</p>
    <p><strong>Synonyms:</strong> ${data.results[0].synonyms.join(', ')}</p>
    <p><strong>Antonyms:</strong> ${data.results[0].antonyms.join(', ')}</p>
  `;
}

// Save word data to local storage
function saveWordData(data) {
  let wordData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  wordData[data.word] = {
    synonyms: data.results[0].synonyms,
    antonyms: data.results[0].antonyms
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wordData));
}

// Practice section logic
function startPractice() {
  const wordData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const words = Object.keys(wordData);
  if (words.length === 0) {
    alert('No words found in storage. Please search for some words first.');
    return;
  }

  const randomWord = words[Math.floor(Math.random() * words.length)];
  const isSynonym = Math.random() > 0.5;
  const correctAnswer = isSynonym
    ? wordData[randomWord].synonyms[0]
    : wordData[randomWord].antonyms[0];
  const options = [correctAnswer, 'Option 2', 'Option 3', 'Option 4']; // Add logic for random options

  document.getElementById('practiceQuestion').innerText = `What is the ${isSynonym ? 'synonym' : 'antonym'} of "${randomWord}"?`;
  document.getElementById('practiceOptions').innerHTML = options
    .map(option => `<button onclick="checkAnswer('${option}', '${correctAnswer}')">${option}</button>`)
    .join('');
}

// Check answer in practice section
function checkAnswer(selected, correct) {
  if (selected === correct) {
    alert('Correct!');
  } else {
    alert('Wrong!');
  }
  startPractice();
}

// Export data
function exportData() {
  const wordData = localStorage.getItem(STORAGE_KEY);
  const blob = new Blob([wordData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wordData.json';
  a.click();
}

// Import data
function importData() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = event.target.result;
    localStorage.setItem(STORAGE_KEY, data);
    alert('Data imported successfully!');
  };
  reader.readAsText(file);
}

// Initialize
showSection('search');