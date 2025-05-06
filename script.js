// Global variables
let displayNames = [];
let sequenceNames = [];
let currentIndex = 0;
let history = [];
let isAnimating = false;
let adminPassword = '';
let useSequence = true;
let showAnimation = true;

// DOM elements
const namesList = document.getElementById('namesList');
const nameCountDisplay = document.getElementById('nameCountDisplay');
const pickButton = document.getElementById('pickButton');
const resetButton = document.getElementById('resetButton');
const result = document.getElementById('result');
const selectionHistory = document.getElementById('selectionHistory');
const adminButton = document.getElementById('adminButton');
const adminPanel = document.getElementById('adminPanel');
const adminPasswordInput = document.getElementById('adminPassword');
const setPasswordButton = document.getElementById('setPasswordButton');
const passwordStatus = document.getElementById('passwordStatus');
const sequenceList = document.getElementById('sequenceList');
const sequenceStatus = document.getElementById('sequenceStatus');
const useSequenceCheckbox = document.getElementById('useSequenceCheckbox');
const showAnimationCheckbox = document.getElementById('showAnimationCheckbox');
const currentPosition = document.getElementById('currentPosition');
const totalInSequence = document.getElementById('totalInSequence');
const resetSequenceButton = document.getElementById('resetSequenceButton');
const closeAdminButton = document.getElementById('closeAdminButton');
const exportDataButton = document.getElementById('exportDataButton');
const importDataButton = document.getElementById('importDataButton');
const importFileInput = document.getElementById('importFileInput');

// Load saved data from localStorage
function loadData() {
    const savedNames = localStorage.getItem('namePicker_names');
    const savedSequence = localStorage.getItem('namePicker_sequence');
    const savedIndex = localStorage.getItem('namePicker_currentIndex');
    const savedHistory = localStorage.getItem('namePicker_history');
    const savedPassword = localStorage.getItem('namePicker_adminPassword');
    const savedUseSequence = localStorage.getItem('namePicker_useSequence');
    const savedShowAnimation = localStorage.getItem('namePicker_showAnimation');
    
    if (savedNames) {
        namesList.value = savedNames;
        displayNames = savedNames.split('\n').filter(name => name.trim() !== '');
        updateNameCount();
    }
    
    if (savedSequence) {
        sequenceList.value = savedSequence;
        sequenceNames = savedSequence.split('\n').filter(name => name.trim() !== '');
        updateSequenceStatus();
    }
    
    if (savedIndex) {
        currentIndex = parseInt(savedIndex);
    }
    
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
    
    if (savedPassword) {
        adminPassword = savedPassword;
        passwordStatus.textContent = 'Password is set';
        passwordStatus.style.color = '#27ae60';
    }
    
    if (savedUseSequence !== null) {
        useSequence = savedUseSequence === 'true';
        useSequenceCheckbox.checked = useSequence;
    }
    
    if (savedShowAnimation !== null) {
        showAnimation = savedShowAnimation === 'true';
        showAnimationCheckbox.checked = showAnimation;
    }
    
    updateCurrentPosition();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('namePicker_names', namesList.value);
    localStorage.setItem('namePicker_sequence', sequenceList.value);
    localStorage.setItem('namePicker_currentIndex', currentIndex);
    localStorage.setItem('namePicker_history', JSON.stringify(history));
    localStorage.setItem('namePicker_adminPassword', adminPassword);
    localStorage.setItem('namePicker_useSequence', useSequence);
    localStorage.setItem('namePicker_showAnimation', showAnimation);
}

// Update the name count display
function updateNameCount() {
    displayNames = namesList.value.split('\n').filter(name => name.trim() !== '');
    nameCountDisplay.textContent = `${displayNames.length} names entered`;
}

// Update the sequence status
function updateSequenceStatus() {
    sequenceNames = sequenceList.value.split('\n').filter(name => name.trim() !== '');
    if (sequenceNames.length > 0) {
        sequenceStatus.textContent = `Sequence has ${sequenceNames.length} names`;
        sequenceStatus.style.color = '#27ae60';
    } else {
        sequenceStatus.textContent = 'No sequence set';
        sequenceStatus.style.color = '#e74c3c';
    }
}

// Update the history display
function updateHistoryDisplay() {
    selectionHistory.innerHTML = '';
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `${index + 1}. ${item}`;
        selectionHistory.appendChild(historyItem);
    });
}

// Update current position display
function updateCurrentPosition() {
    currentPosition.textContent = currentIndex;
    totalInSequence.textContent = sequenceNames.length;
}

// Pick a name function
function pickName() {
    if (isAnimating) return;
    
    displayNames = namesList.value.split('\n').filter(name => name.trim() !== '');
    
    if (displayNames.length === 0) {
        result.textContent = 'Please add some names first!';
        return;
    }
    
    let selectedName;
    
    // Determine which name to select
    if (useSequence && sequenceNames.length > 0) {
        // Use the predetermined sequence if available
        if (currentIndex >= sequenceNames.length) {
            result.textContent = 'All names in the sequence have been selected!';
            return;
        }
        
        selectedName = sequenceNames[currentIndex];
        
        // Check if the name exists in the display list
        if (!displayNames.includes(selectedName)) {
            // Try to find a close match if the exact name isn't found
            const lowerSelectedName = selectedName.toLowerCase();
            const possibleMatch = displayNames.find(name => 
                name.toLowerCase() === lowerSelectedName);
            
            if (possibleMatch) {
                selectedName = possibleMatch;
            } else {
                // Skip this name and move to the next one
                currentIndex++;
                saveData();
                updateCurrentPosition();
                // Try picking again
                pickName();
                return;
            }
        }
    } else {
        // Use truly random selection
        const randomIndex = Math.floor(Math.random() * displayNames.length);
        selectedName = displayNames[randomIndex];
    }
    
    if (showAnimation) {
        // Show "random" animation
        isAnimating = true;
        let iterations = 0;
        const maxIterations = 20;
        
        const animationInterval = setInterval(() => {
            // Display a random name during animation
            const randomIndex = Math.floor(Math.random() * displayNames.length);
            result.textContent = displayNames[randomIndex];
            
            iterations++;
            
            if (iterations >= maxIterations) {
                clearInterval(animationInterval);
                
                // Show the selected name
                result.textContent = selectedName;
                result.classList.add('animate');
                setTimeout(() => {
                    result.classList.remove('animate');
                }, 1000);
                
                // Add to history
                history.push(selectedName);
                updateHistoryDisplay();
                
                // Increment index if using sequence
                if (useSequence) {
                    currentIndex++;
                    updateCurrentPosition();
                }
                
                // Save data
                saveData();
                
                isAnimating = false;
            }
        }, 100);
    } else {
        // No animation, just show the name
        result.textContent = selectedName;
        result.classList.add('animate');
        setTimeout(() => {
            result.classList.remove('animate');
        }, 1000);
        
        // Add to history
        history.push(selectedName);
        updateHistoryDisplay();
        
        // Increment index if using sequence
        if (useSequence) {
            currentIndex++;
            updateCurrentPosition();
        }
        
        // Save data
        saveData();
    }
}

// Reset the picker
function resetPicker() {
    history = [];
    updateHistoryDisplay();
    result.textContent = 'Names will appear here';
    saveData();
}

// Admin panel functions
function toggleAdminPanel() {
    if (adminPassword && adminPanel.style.display !== 'flex') {
        // Ask for password
        const enteredPassword = prompt('Enter admin password:');
        if (enteredPassword !== adminPassword) {
            alert('Incorrect password');
            return;
        }
    }
    
    adminPanel.style.display = adminPanel.style.display === 'flex' ? 'none' : 'flex';
}

function setAdminPassword() {
    const newPassword = adminPasswordInput.value.trim();
    if (newPassword) {
        adminPassword = newPassword;
        passwordStatus.textContent = 'Password is set';
        passwordStatus.style.color = '#27ae60';
        saveData();
    } else {
        alert('Please enter a valid password');
    }
}

function resetSequence() {
    currentIndex = 0;
    updateCurrentPosition();
    saveData();
}

// Export all data as JSON
function exportData() {
    const data = {
        displayNames: namesList.value,
        sequenceNames: sequenceList.value,
        currentIndex: currentIndex,
        history: history,
        useSequence: useSequence,
        showAnimation: showAnimation
    };
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'name_picker_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import data from JSON file
function importData() {
    importFileInput.click();
}

// Event listeners
pickButton.addEventListener('click', pickName);
resetButton.addEventListener('click', resetPicker);
adminButton.addEventListener('click', toggleAdminPanel);
closeAdminButton.addEventListener('click', toggleAdminPanel);
setPasswordButton.addEventListener('click', setAdminPassword);
resetSequenceButton.addEventListener('click', resetSequence);
exportDataButton.addEventListener('click', exportData);
importDataButton.addEventListener('click', importData);

namesList.addEventListener('input', () => {
    updateNameCount();
    saveData();
});

sequenceList.addEventListener('input', () => {
    updateSequenceStatus();
    saveData();
});

useSequenceCheckbox.addEventListener('change', () => {
    useSequence = useSequenceCheckbox.checked;
    saveData();
});

showAnimationCheckbox.addEventListener('change', () => {
    showAnimation = showAnimationCheckbox.checked;
    saveData();
});

importFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.displayNames) namesList.value = data.displayNames;
            if (data.sequenceNames) sequenceList.value = data.sequenceNames;
            if (data.currentIndex !== undefined) currentIndex = data.currentIndex;
            if (data.history) history = data.history;
            if (data.useSequence !== undefined) {
                useSequence = data.useSequence;
                useSequenceCheckbox.checked = useSequence;
            }
            if (data.showAnimation !== undefined) {
                showAnimation = data.showAnimation;
                showAnimationCheckbox.checked = showAnimation;
            }
            
            updateNameCount();
            updateSequenceStatus();
            updateHistoryDisplay();
            updateCurrentPosition();
            saveData();
            
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data: ' + error);
        }
    };
    
    reader.readAsText(file);
});

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadData);