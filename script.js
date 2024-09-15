let drawIntervalId;
let drawTimeoutId;
let drawnNames = [];

document.addEventListener('DOMContentLoaded', () => {
    const settingsOverlay = document.getElementById('settingsOverlay');
    const namesTextarea = document.getElementById('names');
    const errorMessage = document.querySelector('.error-message');
    const saveButton = document.getElementById('save');
    const removeWinnerToggle = document.getElementById('removeWinnerToggle');
    const fileUpload = document.getElementById('fileUpload');
    const historyList = document.getElementById('history-list');
    const nameContainer = document.getElementById('name-container');
    const drawingTimeInput = document.getElementById('drawingTime');
    const menuButton = document.getElementById('menu');
    const closeSidebarButton = document.getElementById('closeSidebar');
    const clearHistoryButton = document.getElementById('clearHistory');

    // Function to toggle settings overlay
    function toggleSettingsOverlay() {
        settingsOverlay.classList.toggle('open');
    }

    // Event listener for the Settings button
    menuButton.addEventListener('click', () => {
        loadNames();
        toggleSettingsOverlay();
    });

    // Event listener for the Close button in settings overlay
    closeSidebarButton.addEventListener('click', toggleSettingsOverlay);

    // Handle file upload
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 100000) { // Limit file size to 100KB
                alert("File is too large. Please upload a file smaller than 100KB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileNames = e.target.result.split(/\r?\n/).filter(name => name.trim() !== '');
                namesTextarea.value = fileNames.join('\n');
            };
            reader.readAsText(file);
        }
    });

    // Event listener for the Save button
    saveButton.addEventListener('click', () => {
        const names = namesTextarea.value.split('\n').filter(name => name.trim() !== '');
        if (names.length > 500) {
            errorMessage.hidden = false;
            return;
        }
        errorMessage.hidden = true;
        if (names.length === 0) {
            alert("Please enter names in the names container.");
            return;
        }
        localStorage.setItem('names', JSON.stringify(names));
        localStorage.setItem('drawingTime', drawingTimeInput.value);
        localStorage.setItem('removeWinner', removeWinnerToggle.checked);
        toggleSettingsOverlay();
    });

    // Event listener for the Clear History button
    clearHistoryButton.addEventListener('click', () => {
        drawnNames = [];
        localStorage.removeItem('drawnNames');
        historyList.innerHTML = '';
    });

    // Function to generate random names
    function generateRandomName(names) {
        const randomIndex = Math.floor(Math.random() * names.length);
        return names[randomIndex];
    }

    // Update drawn names history
    function updateHistory(name) {
        drawnNames.unshift(name); // Add to the beginning of the array
        renderHistory();
        localStorage.setItem('drawnNames', JSON.stringify(drawnNames));
    }

    // Render drawn names history
    function renderHistory() {
        historyList.innerHTML = '';
        drawnNames.forEach((name, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = name;
            listItem.style.animationDelay = `${index * 0.1}s`;
            historyList.appendChild(listItem);
        });
    }

    // Load drawn names from localStorage
    function loadDrawnNames() {
        const storedDrawnNames = JSON.parse(localStorage.getItem('drawnNames') || '[]');
        drawnNames = storedDrawnNames;
        renderHistory();
    }

    // Initial load
    loadDrawnNames();

    // Event listener for the Draw button
    document.getElementById('draw').addEventListener('click', () => {
        let names = JSON.parse(localStorage.getItem('names') || '[]');
        const drawingTime = parseInt(localStorage.getItem('drawingTime') || drawingTimeInput.value, 10) * 1000;
        const removeWinner = localStorage.getItem('removeWinner') === 'true';

        // Prevent duplicate winners if toggle is on
        if (removeWinner) {
            names = names.filter(name => !drawnNames.includes(name));
        }

        if (names.length > 0) {
            clearInterval(drawIntervalId);
            clearTimeout(drawTimeoutId);

            drawIntervalId = setInterval(() => {
                nameContainer.innerText = generateRandomName(names);
            }, 150); // Faster spinning

            drawTimeoutId = setTimeout(() => {
                clearInterval(drawIntervalId);
                const chosenName = generateRandomName(names);
                nameContainer.innerText = chosenName;

                // Add animation
                nameContainer.classList.add('drawn-name-animation');
                setTimeout(() => {
                    nameContainer.classList.remove('drawn-name-animation');
                }, 500);

                // Update history
                updateHistory(chosenName);

                // Remove the winner from the list if toggle is on
                if (removeWinner) {
                    names = names.filter(name => name !== chosenName);
                    localStorage.setItem('names', JSON.stringify(names));
                }

                // Trigger confetti
                confetti({
                    particleCount: 120,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }, drawingTime);
        } else {
            alert("No names left to draw.");
        }
    });

    // Load names from localStorage into textarea when opening settings
    function loadNames() {
        const storedNames = JSON.parse(localStorage.getItem('names') || '[]');
        namesTextarea.value = storedNames.join('\n');

        // Load drawing time and remove winner toggle state
        const storedDrawingTime = localStorage.getItem('drawingTime') || '5';
        drawingTimeInput.value = storedDrawingTime;

        const storedRemoveWinner = localStorage.getItem('removeWinner') === 'true';
        removeWinnerToggle.checked = storedRemoveWinner;
    }
});

// Existing code...

// Function to rotate names smoothly
function rotateNames(names) {
    nameContainer.classList.remove('rotating-text');
    void nameContainer.offsetWidth; // Trigger reflow to restart animation
    nameContainer.innerText = generateRandomName(names);
    nameContainer.classList.add('rotating-text');
  }
  
  // Event listener for the Draw button
  document.getElementById('draw').addEventListener('click', () => {
    let names = JSON.parse(localStorage.getItem('names') || '[]');
    const drawingTime = parseInt(localStorage.getItem('drawingTime') || drawingTimeInput.value, 10) * 1000;
    const removeWinner = localStorage.getItem('removeWinner') === 'true';
  
    // Prevent duplicate winners if toggle is on
    if (removeWinner) {
      names = names.filter(name => !drawnNames.includes(name));
    }
  
    if (names.length > 0) {
      clearInterval(drawIntervalId);
      clearTimeout(drawTimeoutId);
  
      rotateNames(names); // Show the first name with animation
  
      drawIntervalId = setInterval(() => {
        rotateNames(names);
      }, 700); // Match the duration of the CSS animation
  
      drawTimeoutId = setTimeout(() => {
        clearInterval(drawIntervalId);
        nameContainer.classList.remove('rotating-text');
        const chosenName = generateRandomName(names);
        nameContainer.innerText = chosenName;
  
        // Add animation to the final name
        nameContainer.classList.add('drawn-name-animation');
        setTimeout(() => {
          nameContainer.classList.remove('drawn-name-animation');
        }, 500);
  
        // Update history
        updateHistory(chosenName);
  
        // Remove the winner from the list if toggle is on
        if (removeWinner) {
          names = names.filter(name => name !== chosenName);
          localStorage.setItem('names', JSON.stringify(names));
        }
  
        // Trigger confetti
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 }
        });
      }, drawingTime);
    } else {
      alert("No names left to draw.");
    }
  });
  
  // Existing code...
  
