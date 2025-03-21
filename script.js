let wordData = [];
let priority = {};

// Load data on page load
window.onload = () => {
  wordData = JSON.parse(localStorage.getItem('vocabWords')) || [];
  priority = JSON.parse(localStorage.getItem('vocabPriority')) || {};
  document.getElementById("TAPIKEY").value = localStorage.getItem("TAPIKEY") || "";
  document.getElementById("DAPIKEY").value = localStorage.getItem("DAPIKEY") || "";
  document.getElementById("OAPIKEY").value = localStorage.getItem("OAPIKEY") || "";
  document.getElementById("OAPIID").value = localStorage.getItem("OAPIID") || "";
  document.getElementById('dictType').value = localStorage.getItem("dictType") || "default";
  document.getElementById('hoursSinceLastAsked').value = parseFloat(localStorage.getItem("hoursSinceLastAsked")) || 0;
  
};
// Function to delete dictionary total
function deleteDict(){
  localStorage.removeItem('vocabWords');
  localStorage.removeItem('vocabPriority');
  wordData = [];
  priority = {};
}
// Show the selected section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

// Fetch word data from DictionaryAPI
function searchWord(){
  const searchType = document.getElementById('dictType').value;
  localStorage.setItem('dictType',searchType);
  if (searchType==="default"){
    searchWordDefault();
  }
  else if (searchType==="TAPIKEY"){
    const API_KEY = document.getElementById(searchType).value.trim();
    localStorage.setItem("TAPIKEY", API_KEY);
    searchWordThesaurus('thesaurus', API_KEY);
  }
  else if (searchType==="DAPIKEY"){
    const API_KEY = document.getElementById(searchType).value.trim();
    localStorage.setItem("DAPIKEY", API_KEY);
    searchWordDictionary('collegiate', API_KEY);

  }
  else{
    const API_ID = document.getElementById("OAPIID").value.trim();
    const API_KEY = document.getElementById("OAPIKEY").value.trim();
    localStorage.setItem("OAPIID", API_ID);
    localStorage.setItem("OAPIKEY", API_KEY);
    
    searchWorOxford(API_ID, API_KEY);
  }
}
function saveWordDict(entry) {
  const word = entry.hwi.hw; // Extract the word from the entry
  const definitions = entry.shortdef || [];
  console.log(definitions);
  // Check if the word already exists in wordData
  const existingWord = wordData.find(item => item.word === word);
  if (existingWord) {
    // Update synonyms and antonyms for the existing word
    if (entry.meta.syns) {
      existingWord.synonyms = [...new Set([...existingWord.synonyms, ...entry.meta.syns.flat(), ...definitions])];
    }
    if (entry.meta.ants) {
      existingWord.antonyms = [...new Set([...existingWord.antonyms, ...entry.meta.ants.flat()])];
    }
  } else {
    // Create a new entry with the word, synonyms, and antonyms
    const synonyms = entry.meta.syns ? entry.meta.syns.flat() : [];
    const antonyms = entry.meta.ants ? entry.meta.ants.flat() : [];
    wordData.push({
      word,
      synonyms: [...new Set([...synonyms, ...definitions])], // Remove duplicates
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
async function searchWordDictionary(API, API_KEY){
  const word = document.getElementById('searchInput').value.trim();
  if (!word) return;

  try {
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/${API}/json/${word}?key=${API_KEY}`);
    const data = await response.json();
    const data_filtered = data.filter(ele => ele?.hwi?.hw === word);    
    console.log("Unfiltered",data);
    console.log("Filtered",data_filtered);
    document.getElementById('searchResults').innerHTML = '';
    if (data_filtered && data_filtered.length > 0) {
      document.getElementById('searchResults').innerHTML = '';
      data_filtered.forEach(entry => {
        displaySearchResultsDictionary(entry); // Display results for each entry
        saveWordDict(entry);
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

function displaySearchResultsDictionary(entry){
  /*
  const resultsDiv = document.getElementById('searchResults');

  // Display the word
  resultsDiv.innerHTML += `<h3>${entry.hwi.hw}</h3>`;

  // Display part of speech
  if (entry.fl) {
    resultsDiv.innerHTML += `<p><strong>Part of Speech:</strong> ${entry.fl}</p>`;
  }

  // Display short definitions
  if (entry.shortdef && entry.shortdef.length > 0) {
    resultsDiv.innerHTML += `<h4>Definitions:</h4>`;
    entry.shortdef.forEach((def, index) => {
      resultsDiv.innerHTML += `<p><strong>${index + 1}.</strong> ${def}</p>`;
    });
  }

  // Display synonyms
  if (entry.meta.syns && entry.meta.syns.length > 0) {
    resultsDiv.innerHTML += `<h4>Synonyms:</h4>`;
    entry.meta.syns.forEach((synGroup, index) => {
      resultsDiv.innerHTML += `<p><strong>Group ${index + 1}:</strong> ${synGroup.join(', ')}</p>`;
    });
  }

  // Display antonyms
  if (entry.meta.ants && entry.meta.ants.length > 0) {
    resultsDiv.innerHTML += `<h4>Antonyms:</h4>`;
    entry.meta.ants.forEach((antGroup, index) => {
      resultsDiv.innerHTML += `<p><strong>Group ${index + 1}:</strong> ${antGroup.join(', ')}</p>`;
    });
  }

  // Display examples (if available)
  if (entry.def && entry.def.length > 0) {
    resultsDiv.innerHTML += `<h4>Examples:</h4>`;
    entry.def.forEach((def, index) => {
      if (def.sseq) {
        def.sseq.forEach((sense) => {
          sense.forEach((senseItem) => {
            if (senseItem[0] === 'sense' && senseItem[1].dt) {
              senseItem[1].dt.forEach((dtItem) => {
                if (dtItem[0] === 'vis' && dtItem[1]) {
                  dtItem[1].forEach((example) => {
                    resultsDiv.innerHTML += `<p><strong>${index + 1}:</strong><em>${example.t.replace(`{wi}`,`<b>`).replace(`{/wi}`,`</b>`)}</em></p>`;
                  });
                }
              });
            }
          });
        });
      }
    });
  }

  // Show the search results
  resultsDiv.classList.add('active');
  */
  const resultsDiv = document.getElementById('searchResults');

// Display the word
resultsDiv.innerHTML += `
  <h1 class="word-title">${entry.hwi.hw}</h1>
`;

// Display part of speech
if (entry.fl) {
  resultsDiv.innerHTML += `
    <div class="part-of-speech">
      <span class="part-of-speech-text">${entry.fl}</span>
    </div>
  `;
}

// Display definitions
if (entry.shortdef && entry.shortdef.length > 0) {
  resultsDiv.innerHTML += `
    <div class="definitions">
      <h2 class="section-title">Definitions</h2>
      <ol class="definitions-list">
        ${entry.shortdef.map((def, index) => {
          let exampleHTML = '';
          // Check for examples in the entry
          if (entry.def && entry.def[index] && entry.def[index].sseq) {
            entry.def[index].sseq.forEach((sense) => {
              sense.forEach((senseItem) => {
                if (senseItem[0] === 'sense' && senseItem[1].dt) {
                  senseItem[1].dt.forEach((dtItem) => {
                    if (dtItem[0] === 'vis' && dtItem[1]) {
                      dtItem[1].forEach((example) => {
                        exampleHTML += `
                          <div class="example-item">
                            <span class="example-text">${example.t.replace(`{wi}`, `<b>`).replace(`{/wi}`, `</b>`)}</span>
                          </div>
                        `;
                      });
                    }
                  });
                }
              });
            });
          }
          return `
            <li class="definition-item">
              <span class="definition-text">${def}</span>
              ${exampleHTML}
            </li>
          `;
        }).join('')}
      </ol>
    </div>
  `;
}

// Display synonyms (if available)
if (entry.meta.syns && entry.meta.syns.length > 0) {
  resultsDiv.innerHTML += `
    <div class="synonyms">
      <h2 class="section-title">Synonyms</h2>
      <ul class="synonyms-list">
        ${entry.meta.syns.map((synGroup, index) => `
          <li class="synonym-group">
            <span class="synonym-text">${synGroup.join(', ')}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

// Show the search results
resultsDiv.classList.add('active');
}
async function searchWordThesaurus(API, API_KEY) {

  const word = document.getElementById('searchInput').value.trim();
  if (!word) return;

  try {
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/${API}/json/${word}?key=${API_KEY}`);
    const data = await response.json();
    const data_filtered = data.filter(ele => ele?.hwi?.hw === word);    
    console.log("Unfiltered",data);
    console.log("Filtered",data_filtered);
    document.getElementById('searchResults').innerHTML = '';
    if (data_filtered && data_filtered.length > 0) {
      document.getElementById('searchResults').innerHTML = '';
      data_filtered.forEach(entry => {
        displaySearchResultsThesaurus(entry); // Display results for each entry
        saveWordDict(entry);
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
function displaySearchResultsThesaurus(entry) {
  const resultsDiv = document.getElementById('searchResults');

  // Display the word
  resultsDiv.innerHTML += `<h3>${entry.hwi.hw}</h3>`;

  // Display part of speech
  if (entry.fl) {
    resultsDiv.innerHTML += `<p><strong>Part of Speech:</strong> ${entry.fl}</p>`;
  }

  // Display short definitions
  if (entry.shortdef && entry.shortdef.length > 0) {
    resultsDiv.innerHTML += `<h4>Definitions:</h4>`;
    entry.shortdef.forEach((def, index) => {
      resultsDiv.innerHTML += `<p><strong>${index + 1}.</strong> ${def}</p>`;
    });
  }

  // Display synonyms
  if (entry.meta.syns && entry.meta.syns.length > 0) {
    resultsDiv.innerHTML += `<h4>Synonyms:</h4>`;
    entry.meta.syns.forEach((synGroup, index) => {
      resultsDiv.innerHTML += `<p><strong>Group ${index + 1}:</strong> ${synGroup.join(', ')}</p>`;
    });
  }

  // Display antonyms
  if (entry.meta.ants && entry.meta.ants.length > 0) {
    resultsDiv.innerHTML += `<h4>Antonyms:</h4>`;
    entry.meta.ants.forEach((antGroup, index) => {
      resultsDiv.innerHTML += `<p><strong>Group ${index + 1}:</strong> ${antGroup.join(', ')}</p>`;
    });
  }

  // Display examples (if available)
  if (entry.def && entry.def.length > 0) {
    resultsDiv.innerHTML += `<h4>Examples:</h4>`;
    entry.def.forEach((def, index) => {
      if (def.sseq) {
        def.sseq.forEach((sense) => {
          sense.forEach((senseItem) => {
            if (senseItem[0] === 'sense' && senseItem[1].dt) {
              senseItem[1].dt.forEach((dtItem) => {
                if (dtItem[0] === 'vis' && dtItem[1]) {
                  dtItem[1].forEach((example) => {
                    resultsDiv.innerHTML += `<p><em>${example.t}</em></p>`;
                  });
                }
              });
            }
          });
        });
      }
    });
  }

  // Show the search results
  resultsDiv.classList.add('active');
}
// import fetch from 'node-fetch';
// const axios = require('axios');
async function searchWorOxford(APP_ID, APP_KEY){
  const LANGUAGE = 'en-gb'; // Language code (English)
  const word = document.getElementById('searchInput').value.trim();
  if (!word) {
    alert('Please enter a word.');
    return;
  }
  const url = 'https://od-api-sandbox.oxforddictionaries.com/api/v2/entries/en-gb/ace';
const options = {
  method: 'GET',
  headers: {
    app_id: 'd75cbb6d',
    app_key: '83d953def94fe401d6b03384bebed339',
    Accept: 'application/json'
  }
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
  /*
  $.support.cors = false;
  const settings = {
  async: true,
  crossDomain: true,
  url: 'https://od-api-sandbox.oxforddictionaries.com/api/v2/entries/en-gb/ace',
  method: 'GET',
  headers: {
    app_id: 'd75cbb6d',
    app_key: '83d953def94fe401d6b03384bebed339',
    Accept: 'application/json'
  }
};

$.ajax(settings).done(function (response) {
  console.log(response);
});
*/
/*
const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('error', function () {
  console.error('Request failed');
});

xhr.addEventListener('readystatechange', function () {
  if (this.readyState === this.DONE) {
    if (this.status === 200) {
      console.log(this.responseText);
    } else {
      console.error('Error:', this.status, this);
    }
  }
});

xhr.open('GET', 'https://od-api-sandbox.oxforddictionaries.com/api/v2/entries/en-gb/ace');
xhr.setRequestHeader('app_id', 'd75cbb6d');
xhr.setRequestHeader('app_key', '83d953def94fe401d6b03384bebed339');
xhr.setRequestHeader('Accept', 'application/json');

xhr.send(data);
*/
/*
fetch('https://od-api-sandbox.oxforddictionaries.com/api/v2/entries/en-gb/ace', {
  method: 'GET',
  headers: {
    'app_id': 'd75cbb6d',
    'app_key': '83d953def94fe401d6b03384bebed339',
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include credentials if needed
})
  .then(response => response.content.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
  */

  /*
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const apiUrl = `https://od-api.oxforddictionaries.com/api/v2/entries/${LANGUAGE}/${word}`;
  const myHeaders = new Headers();
  myHeaders.append("app_id", String(APP_ID));
  myHeaders.append("app_key", String(APP_KEY));
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const options = {
    // method: 'GET',
    // // mode: 'cors',
    // headers: {
    //   'app_id': ,
    //   'app_key': ,
    //   'Accept': 'application/json',
    //   'Access-Control-Allow-Origin' : "Test",
    // }
  };
  // try {
  //   const response = await fetch(apiUrl,options);

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! Status: ${response.status}`);
  //   }

  //   const data = await response.json();
  //   console.log(data);
  //   document.getElementById('searchResults').innerHTML = '';
  //   displayOxfordResults(data); // Display the results
  // } catch (error) {
  //   console.error('Error fetching word data:', error);
  //   alert('Failed to fetch word data. Please try again.');
  // }
  fetch(apiUrl, requestOptions)
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));*/
}
function displayOxfordResults(data) {
  const resultsDiv = document.getElementById('searchResults');

  // Display the word
  const word = data.word;
  resultsDiv.innerHTML += `<h3>${word}</h3>`;

  // Loop through each lexical entry
  data.results.forEach(result => {
    result.lexicalEntries.forEach(lexicalEntry => {
      // Display part of speech
      resultsDiv.innerHTML += `<p><strong>Part of Speech:</strong> ${lexicalEntry.lexicalCategory.text}</p>`;

      // Loop through entries and senses
      lexicalEntry.entries.forEach(entry => {
        entry.senses.forEach(sense => {
          // Display definitions
          if (sense.definitions) {
            sense.definitions.forEach((definition, index) => {
              resultsDiv.innerHTML += `<p><strong>Definition ${index + 1}:</strong> ${definition}</p>`;
            });
          }

          // Display examples
          if (sense.examples) {
            sense.examples.forEach(example => {
              resultsDiv.innerHTML += `<p><em>Example:</em> ${example.text}</p>`;
            });
          }

          // Display synonyms
          if (sense.synonyms) {
            resultsDiv.innerHTML += `<p><strong>Synonyms:</strong> ${sense.synonyms.map(syn => syn.text).join(', ')}</p>`;
          }

          // Display antonyms
          if (sense.antonyms) {
            resultsDiv.innerHTML += `<p><strong>Antonyms:</strong> ${sense.antonyms.map(ant => ant.text).join(', ')}</p>`;
          }
        });
      });
    });
  });

  // Show the search results
  resultsDiv.classList.add('active');
}
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function searchWordDefault() {
  const word = document.getElementById('searchInput').value.trim();
  if (!word) return;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();
    if (data && data.length > 0) {
        // console.log(data);
        document.getElementById('searchResults').innerHTML = '';
        data.forEach(entry => {
            displaySearchResultsDefault(entry); // Display results for each entry
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
  function displaySearchResultsDefault(entry) {
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
    localStorage.setItem('hoursSinceLastAsked', hoursSinceLastAskedValue);
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
                displaySearchResultsDefault(entry); // Display results for each entry
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

/*
// Replace with your Oxford Dictionary API credentials

const APP_ID = '';
const APP_KEY = '';

// CORS proxy URL
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

// Function to fetch word definition
async function fetchWordDefinition(word) {
    const API_URL = `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word}`;
    const url = PROXY_URL + API_URL; // Use the CORS proxy

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'app_id': APP_ID,
                'app_key': APP_KEY,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching word definition:', error);
        return null;
    }
}

// Example usage
fetchWordDefinition('ace');
*/