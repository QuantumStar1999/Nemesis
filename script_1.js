let wordData = [];
let priority = {};

// Show the selected section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

// Fetch word data from DictionaryAPI
/*
async function searchWord() {
  const word = document.getElementById('searchInput').value.trim();
  if (!word) return;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();
    if (data && data.length > 0) {
      displaySearchResults(data[0]);
      saveWord(data[0]);
    } else {
      alert('Word not found!');
    }
  } catch (error) {
    console.error('Error fetching word data:', error);
    alert('Failed to fetch word data. Please try again.');
  }
}
*/
async function searchWord() {
    const word = document.getElementById('searchInput').value.trim();
    if (!word) return;
  
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      if (data && data.length > 0) {
        displaySearchResults(data[0]);
      } else {
        alert('Word not found!');
        document.getElementById('searchResults').classList.remove('active'); // Hide results
      }
    } catch (error) {
      console.error('Error fetching word data:', error);
      alert('Failed to fetch word data. Please try again.');
      document.getElementById('searchResults').classList.remove('active'); // Hide results
    }
  }async function searchWord() {
    const word = document.getElementById('searchInput').value.trim();
    if (!word) return;
  
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      if (data && data.length > 0) {
        displaySearchResults(data[0]);
      } else {
        alert('Word not found!');
        document.getElementById('searchResults').classList.remove('active'); // Hide results
      }
    } catch (error) {
      console.error('Error fetching word data:', error);
      alert('Failed to fetch word data. Please try again.');
      document.getElementById('searchResults').classList.remove('active'); // Hide results
    }
  }

// Display search results

// function displaySearchResults(data) {
//   const resultsDiv = document.getElementById('searchResults');
//   resultsDiv.innerHTML = `
//     <h3>${data.word}</h3>
//     <p><strong>Meaning:</strong> ${data.meanings[0]?.definitions[0]?.definition}</p>
//     <p><strong>Synonyms:</strong> ${data.meanings[0]?.synonyms?.join(', ') || 'None'}</p>
//     <p><strong>Antonyms:</strong> ${data.meanings[0]?.antonyms?.join(', ') || 'None'}</p>
//   `;
// }
/*
function displaySearchResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
  
    // Display the word
    const wordHeader = document.createElement('h3');
    wordHeader.textContent = data.word;
    wordHeader.style.fontSize = '24px';
    wordHeader.style.fontWeight = 'bold';
    wordHeader.style.marginBottom = '16px';
    resultsDiv.appendChild(wordHeader);
  
    // Loop through each meaning
    data.meanings.forEach(meaning => {
      // Display part of speech
      const partOfSpeech = document.createElement('div');
      partOfSpeech.textContent = meaning.partOfSpeech;
      partOfSpeech.style.fontStyle = 'italic';
      partOfSpeech.style.color = '#666';
      partOfSpeech.style.marginBottom = '8px';
      resultsDiv.appendChild(partOfSpeech);
  
      // Loop through each definition
      meaning.definitions.forEach((definition, index) => {
        const definitionContainer = document.createElement('div');
        definitionContainer.style.marginBottom = '16px';
  
        // Display definition number
        const definitionNumber = document.createElement('span');
        definitionNumber.textContent = `${index + 1}. `;
        definitionNumber.style.fontWeight = 'bold';
        definitionContainer.appendChild(definitionNumber);
  
        // Display definition
        const definitionText = document.createElement('span');
        definitionText.textContent = definition.definition;
        definitionContainer.appendChild(definitionText);
  
        // Display example (if available)
        if (definition.example) {
          const example = document.createElement('div');
          example.textContent = `Example: ${definition.example}`;
          example.style.color = '#555';
          example.style.marginTop = '4px';
          example.style.fontStyle = 'italic';
          definitionContainer.appendChild(example);
        }
  
        resultsDiv.appendChild(definitionContainer);
      });
  
      // Display synonyms (if available)
      if (meaning.synonyms.length > 0) {
        const synonyms = document.createElement('div');
        synonyms.textContent = `Synonyms: ${meaning.synonyms.join(', ')}`;
        synonyms.style.color = '#555';
        synonyms.style.marginTop = '8px';
        resultsDiv.appendChild(synonyms);
      }
  
      // Display antonyms (if available)
      if (meaning.antonyms.length > 0) {
        const antonyms = document.createElement('div');
        antonyms.textContent = `Antonyms: ${meaning.antonyms.join(', ')}`;
        antonyms.style.color = '#555';
        antonyms.style.marginTop = '8px';
        resultsDiv.appendChild(antonyms);
      }
    });
  }

function displaySearchResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
  
    // Display the word
    resultsDiv.innerHTML += `<h3>${data.word}</h3>`;
  
    // Loop through each part of speech
    data.meanings.forEach(meaning => {
      resultsDiv.innerHTML += `
        <div class="part-of-speech">
          <h4>${meaning.partOfSpeech}</h4>
          <ol>
            ${meaning.definitions
              .map(
                (definition, index) => `
                <li>
                  <strong>${index + 1}.</strong> ${definition.definition}
                  ${definition.example ? `<em>Example: ${definition.example}</em>` : ''}
                </li>
              `
              )
              .join('')}
          </ol>
          ${meaning.synonyms.length > 0 ? `<p><strong>Synonyms:</strong> ${meaning.synonyms.join(', ')}</p>` : ''}
          ${meaning.antonyms.length > 0 ? `<p><strong>Antonyms:</strong> ${meaning.antonyms.join(', ')}</p>` : ''}
        </div>
      `;
    });
  }

*/

function displaySearchResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
  
    // Display the word
    resultsDiv.innerHTML += `<h3>${data.word}</h3>`;
  
    // Loop through each part of speech
    data.meanings.forEach(meaning => {
      resultsDiv.innerHTML += `
        <div class="part-of-speech">
          <h4>${meaning.partOfSpeech}</h4>
          ${meaning.definitions
            .map(
              (definition, index) => `
              <div class="meaning">
                <strong>${index + 1}.</strong> ${definition.definition}
                ${definition.example ? `<em>Example: ${definition.example}</em>` : ''}
              </div>
            `
            )
            .join('')}
          ${meaning.synonyms.length > 0 ? `<p><strong>Synonyms:</strong> ${meaning.synonyms.join(', ')}</p>` : ''}
          ${meaning.antonyms.length > 0 ? `<p><strong>Antonyms:</strong> ${meaning.antonyms.join(', ')}</p>` : ''}
        </div>
      `;
    });
  
    // Show the search results
    resultsDiv.classList.add('active');
  }
// Save word to localStorage
function saveWord(wordObj) {
  if (!wordData.some(word => word.word === wordObj.word)) {
    wordData.push(wordObj);
    localStorage.setItem('vocabWords', JSON.stringify(wordData));
  }
}

// Start practice session
function startPractice() {
  if (wordData.length === 0) {
    alert('No words available for practice. Please search for some words first.');
    return;
  }

  // Sort words by priority (higher priority first)
  const sortedWords = wordData.sort((a, b) => (priority[b.word] || 0) - (priority[a.word] || 0));
  const word = sortedWords[0];

  // Randomly ask for synonym or antonym
  const isSynonym = Math.random() > 0.5;
  const correctAnswer = isSynonym
    ? word.meanings[0]?.synonyms?.[0]
    : word.meanings[0]?.antonyms?.[0];

  if (!correctAnswer) {
    alert('No synonyms or antonyms available for this word.');
    return;
  }

  // Generate options (1 correct + 3 random)
  const options = [correctAnswer];
  while (options.length < 4) {
    const randomOption = wordData[Math.floor(Math.random() * wordData.length)].word;
    if (!options.includes(randomOption)) {
      options.push(randomOption);
    }
  }

  // Shuffle options
  document.getElementById('practiceQuestion').innerText = `What is the ${isSynonym ? 'synonym' : 'antonym'} of "${word.word}"?`;
  document.getElementById('practiceOptions').innerHTML = options
    .map(option => `<button onclick="checkAnswer('${option}', '${correctAnswer}', '${word.word}')">${option}</button>`)
    .join('');
  document.getElementById('feedback').innerText = '';
}

// Check user's answer
function checkAnswer(selected, correct, word) {
  if (selected === correct) {
    document.getElementById('feedback').innerText = 'Correct! 🎉';
    priority[word] = (priority[word] || 0) - 1; // Decrease priority
  } else {
    document.getElementById('feedback').innerText = `Incorrect! The correct answer is: ${correct}`;
    priority[word] = (priority[word] || 0) + 1; // Increase priority
  }
  localStorage.setItem('vocabPriority', JSON.stringify(priority));
  startPractice(); // Ask next question
}

// Export vocabulary data
function exportData() {
  const dataStr = JSON.stringify(wordData);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocab.json';
  a.click();
}

// Import vocabulary data
function importData() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = JSON.parse(event.target.result);
    wordData = data;
    localStorage.setItem('vocabWords', JSON.stringify(wordData));
    alert('Vocabulary imported successfully!');
  };
  reader.readAsText(file);
}

// Load data on page load
window.onload = () => {
  wordData = JSON.parse(localStorage.getItem('vocabWords')) || [];
  priority = JSON.parse(localStorage.getItem('vocabPriority')) || {};
};