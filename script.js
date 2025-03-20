let wordData = [];
let priority = {};

// Load data on page load
window.onload = () => {
  wordData = JSON.parse(localStorage.getItem('vocabWords')) || [];
  priority = JSON.parse(localStorage.getItem('vocabPriority')) || {};
};

// Show the selected section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

// Fetch word data from DictionaryAPI
async function searchWord() {
  const word = document.getElementById('searchInput').value.trim();
  if (!word) return;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();
    if (data && data.length > 0) {
        console.log(data);
        document.getElementById('searchResults').innerHTML = '';
        data.forEach(entry => {
            displaySearchResults(entry); // Display results for each entry
            saveWord(entry); // Save each entry
          });
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
  function displaySearchResults(entry) {
    const resultsDiv = document.getElementById('searchResults');
  
    // Display the word
    resultsDiv.innerHTML += `<h3>${entry.word}</h3>`;
  
    // Loop through each part of speech in the entry
    entry.meanings.forEach(meaning => {
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

function saveWord(entry) {
    const word = entry.word;
  
    // Check if the word already exists in wordData
    const existingWord = wordData.find(item => item.word === word);
    if (existingWord) {
      // Update synonyms and antonyms for the existing word
      entry.meanings.forEach(meaning => {
        existingWord.synonyms = [...new Set([...existingWord.synonyms, ...meaning.synonyms])];
        existingWord.antonyms = [...new Set([...existingWord.antonyms, ...meaning.antonyms])];
      });
    } else {
      // Create a new entry with the word, synonyms, and antonyms
      const synonyms = entry.meanings.flatMap(meaning => meaning.synonyms);
      const antonyms = entry.meanings.flatMap(meaning => meaning.antonyms);
      wordData.push({
        word,
        synonyms: [...new Set(synonyms)], // Remove duplicates
        antonyms: [...new Set(antonyms)]  // Remove duplicates
      });
    }
  
    // Initialize priority if not already set
    if (!priority[word]) {
      priority[word] = { value: 0, lastAsked: Date.now() };
    }
  
    // Save to localStorage
    localStorage.setItem('vocabWords', JSON.stringify(wordData));
    localStorage.setItem('vocabPriority', JSON.stringify(priority));
  }

// Start practice session
  function startPractice() {
    // Reset UI
    document.getElementById('practiceQuestion').innerText = '';
    document.getElementById('practiceOptions').innerHTML = '';
    document.getElementById('feedback').innerText = '';
    document.getElementById('correctAnswerDetails').style.display = 'none';
    document.getElementById('nextButton').style.display = 'none';
  
    if (wordData.length === 0) {
      alert('No words available for practice. Please search for some words first.');
      return;
    }
  
    // Get the delay value from the input field
    const hoursSinceLastAskedInput = document.getElementById('hoursSinceLastAsked');
    const hoursSinceLastAskedValue = parseFloat(hoursSinceLastAskedInput.value) || 0;
  
    // Get the selected question type
    const questionType = document.getElementById('questionType').value;
  
    // Filter words based on priority and time delay
    const now = Date.now();
    const wordsToPractice = wordData.filter(entry => {
      const wordPriority = priority[entry.word];
      if (!wordPriority.lastAsked) return true; // Never asked before
      const hoursSinceLastAsked = (now - wordPriority.lastAsked) / (1000 * 60 * 60);
      return hoursSinceLastAsked >= hoursSinceLastAskedValue; // Use the user-specified delay
    });
  
    if (wordsToPractice.length === 0) {
      alert('No words available for practice at the moment. Try again later.');
      return;
    }
  
    // Sort words by priority (higher priority first)
    const sortedWords = wordsToPractice.sort((a, b) => priority[b.word].value - priority[a.word].value);
    const wordEntry = sortedWords[0];
  
    // Determine the question type
    let isSynonym;
    if (questionType === 'random') {
      isSynonym = Math.random() > 0.5; // Randomly choose between synonym and antonym
    } else {
      isSynonym = questionType === 'synonym'; // Use the selected type
    }
  
    // Get the correct answer based on the question type
    const correctAnswer = isSynonym
      ? wordEntry.synonyms[Math.floor(Math.random() * wordEntry.synonyms.length)]
      : wordEntry.antonyms[Math.floor(Math.random() * wordEntry.antonyms.length)];
  
    if (!correctAnswer) {
      alert(`No ${isSynonym ? 'synonyms' : 'antonyms'} available for this word.`);
      return;
    }
  
    // Generate options (1 correct + 3 random)
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomOption = wordData[Math.floor(Math.random() * wordData.length)].word;
      if (!options.includes(randomOption) && randomOption!==wordEntry.word){
        options.push(randomOption);
      } else {
        // If the random option is already in the list, skip it
        continue;
      }
    }
  
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
  
    // Display the question
    document.getElementById('practiceQuestion').innerText = `What is the ${isSynonym ? 'synonym' : 'antonym'} of "${wordEntry.word}"?`;
    document.getElementById('practiceOptions').innerHTML = options
      .map(option => `<button onclick="checkAnswer('${option}', '${correctAnswer}', '${wordEntry.word}')">${option}</button>`)
      .join('');
  }
  // Check Answer
  async function checkAnswer(selected, correct, word) {

  
    const options = document.querySelectorAll('#practiceOptions button');
    const correctAnswerText = document.getElementById('correctAnswerText');
    const meaningText = document.getElementById('meaningText');
    const correctAnswerDetails = document.getElementById('correctAnswerDetails');
    const nextButton = document.getElementById('nextButton');
  
  
  
    // Disable all buttons to prevent further clicks
    options.forEach(button => {
      button.disabled = true;
    });
  
    // Highlight correct and incorrect answers
    options.forEach(button => {
      if (button.innerText === correct) {
        button.classList.add('correct'); // Green for correct answer
      } else if (button.innerText === selected) {
        button.classList.add('incorrect'); // Red for incorrect answer
      }
    });
  
    // Show feedback
    if (selected === correct) {
      document.getElementById('feedback').innerText = 'Correct! 🎉';
      priority[word].value = Math.max(0, priority[word].value - 1); // Decrease priority
    } else {
      document.getElementById('feedback').innerText = `Incorrect! The correct answer is: ${correct}`;
      priority[word].value += 1; // Increase priority
    }
  
    // Show correct answer and meaning
    const wordEntry = wordData.find(entry => entry.word === word);
    if (wordEntry && Array.isArray(wordEntry.synonyms)) {
        correctAnswerText.innerText = correct;
        // const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordEntry.word}`);
        // const data = await response.json();
        /*if (data && data.length > 0) {
            console.log(data);
            document.getElementById('searchResults').innerHTML = '';
            data.forEach(entry => {
                displaySearchResults(entry); // Display results for each entry
            });
        }*/
        // console.log("WordEntry:->",wordEntry);
        meaningText.innerText = wordEntry.synonyms.join(', ');
    } else {
      console.error('Invalid wordEntry or meanings:', wordEntry); // Debugging
      correctAnswerText.innerText = correct;
      meaningText.innerText = 'Meaning not available.';
    }
  
    correctAnswerDetails.style.display = 'block';
  
    // Show the Next button
    nextButton.style.display = 'block';
  
    // Update last asked timestamp
    priority[word].lastAsked = Date.now();
    localStorage.setItem('vocabPriority', JSON.stringify(priority));
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

// Add a label for the file input
const fileInput = document.getElementById('importFile');
const fileLabel = document.createElement('label');
fileLabel.setAttribute('for', 'importFile');
fileLabel.className = 'button file-label';
fileLabel.innerText = 'Choose File';
fileInput.parentNode.insertBefore(fileLabel, fileInput.nextSibling);