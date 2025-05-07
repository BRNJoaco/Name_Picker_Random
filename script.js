// Global variables
let displayNames = [];
let sequenceNames = [];
let currentIndex = 0;
let history = [];
let isAnimating = false;
let adminPassword = '';
let useSequence = true;
let showAnimation = true;
let uniqueMode = false;
let availableNames = [];
let nameWeights = {};
let groups = {};
let currentGroup = null;
let currentTheme = 'default';
let lastWinner = null;

// Theme colors
const themes = {
    'default': { primary: '#3498db', hover: '#2980b9' },
    'green': { primary: '#2ecc71', hover: '#27ae60' },
    'purple': { primary: '#9b59b6', hover: '#8e44ad' },
    'red': { primary: '#e74c3c', hover: '#c0392b' },
    'orange': { primary: '#f39c12', hover: '#e67e22' }
};

// DOM elements
const namesList = document.getElementById('namesList');
const nameCountDisplay = document.getElementById('nameCountDisplay');
const pickButton = document.getElementById('pickButton');
const resetButton = document.getElementById('resetButton');
const uniqueModeButton = document.getElementById('uniqueModeButton');
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
const removeDuplicatesButton = document.getElementById('removeDuplicates');
const clearNamesButton = document.getElementById('clearNames');
const addWeightsButton = document.getElementById('addWeights');
const clearHistoryButton = document.getElementById('clearHistory');
const themeOptions = document.querySelectorAll('.theme-option');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const addGroupButton = document.getElementById('addGroup');
const groupsContainer = document.getElementById('groupsContainer');
const removeWinnerButton = document.getElementById('removeWinnerButton');
const newWindowButton = document.getElementById('newWindowButton');
const sessionStatus = document.getElementById('sessionStatus');

// Generate a unique session ID for this window
const sessionId = 'window_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
sessionStatus.textContent = `Session: ${sessionId.substr(0, 10)}...`;

// Load saved data from sessionStorage
function loadData() {
    const savedNames = sessionStorage.getItem('namePicker_names');
    const savedSequence = sessionStorage.getItem('namePicker_sequence');
    const savedIndex = sessionStorage.getItem('namePicker_currentIndex');
    const savedHistory = sessionStorage.getItem('namePicker_history');
    const savedPassword = sessionStorage.getItem('namePicker_adminPassword');
    const savedUseSequence = sessionStorage.getItem('namePicker_useSequence');
    const savedShowAnimation = sessionStorage.getItem('namePicker_showAnimation');
    const savedUniqueMode = sessionStorage.getItem('namePicker_uniqueMode');
    const savedNameWeights = sessionStorage.getItem('namePicker_nameWeights');
    const savedGroups = sessionStorage.getItem('namePicker_groups');
    const savedCurrentGroup = sessionStorage.getItem('namePicker_currentGroup');
    const savedTheme = sessionStorage.getItem('namePicker_theme');
    
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
    
    if (savedUniqueMode !== null) {
        uniqueMode = savedUniqueMode === 'true';
        uniqueModeButton.textContent = `Unique Mode: ${uniqueMode ? 'ON' : 'OFF'}`;
        uniqueModeButton.classList.toggle('success', uniqueMode);
    }
    
    if (savedNameWeights) {
        nameWeights = JSON.parse(savedNameWeights);
    }
    
    if (savedGroups) {
        groups = JSON.parse(savedGroups);
        renderGroups();
    }
    
    if (savedCurrentGroup) {
        currentGroup = savedCurrentGroup;
    }
    
    if (savedTheme) {
        currentTheme = savedTheme;
        applyTheme(savedTheme);
        document.querySelector(`.theme-option[data-theme="${savedTheme}"]`).classList.add('selected');
    }
    
    updateCurrentPosition();
    resetAvailableNames();
}

// Save data to sessionStorage
function saveData() {
    sessionStorage.setItem('namePicker_names', namesList.value);
    sessionStorage.setItem('namePicker_sequence', sequenceList.value);
    sessionStorage.setItem('namePicker_currentIndex', currentIndex);
    sessionStorage.setItem('namePicker_history', JSON.stringify(history));
    sessionStorage.setItem('namePicker_adminPassword', adminPassword);
    sessionStorage.setItem('namePicker_useSequence', useSequence);
    sessionStorage.setItem('namePicker_showAnimation', showAnimation);
    sessionStorage.setItem('namePicker_uniqueMode', uniqueMode);
    sessionStorage.setItem('namePicker_nameWeights', JSON.stringify(nameWeights));
    sessionStorage.setItem('namePicker_groups', JSON.stringify(groups));
    sessionStorage.setItem('namePicker_currentGroup', currentGroup);
    sessionStorage.setItem('namePicker_theme', currentTheme);
}

// Update the name count display
function updateNameCount() {
    displayNames = namesList.value.split('\n').filter(name => name.trim() !== '');
    nameCountDisplay.textContent = `${displayNames.length} names entered`;
    resetAvailableNames();
    saveData();
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
    saveData();
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
    saveData();
}

// Update current position display
function updateCurrentPosition() {
    currentPosition.textContent = currentIndex;
    totalInSequence.textContent = sequenceNames.length;
    saveData();
}

// Reset available names for unique mode
function resetAvailableNames() {
    availableNames = [...displayNames];
    saveData();
}

// Apply theme colors
function applyTheme(theme) {
    const colors = themes[theme] || themes['default'];
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--primary-hover', colors.hover);
    
    const primaryButtons = document.querySelectorAll('button:not(.secondary):not(.danger):not(.success)');
    primaryButtons.forEach(button => {
        button.style.backgroundColor = colors.primary;
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = colors.hover;
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = colors.primary;
        });
    });
    
    currentTheme = theme;
    saveData();
}

// Render groups in the groups tab
function renderGroups() {
    groupsContainer.innerHTML = '';
    
    for (const groupName in groups) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-item';
        groupDiv.style.marginBottom = '10px';
        groupDiv.style.padding = '10px';
        groupDiv.style.border = '1px solid #ddd';
        groupDiv.style.borderRadius = '5px';
        
        const groupHeader = document.createElement('div');
        groupHeader.style.display = 'flex';
        groupHeader.style.justifyContent = 'space-between';
        groupHeader.style.alignItems = 'center';
        groupHeader.style.marginBottom = '10px';
        
        const groupTitle = document.createElement('h4');
        groupTitle.textContent = groupName;
        groupTitle.style.margin = '0';
        
        const groupActions = document.createElement('div');
        
        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select';
        selectButton.className = 'secondary';
        selectButton.style.marginRight = '5px';
        selectButton.style.padding = '5px 10px';
        selectButton.style.fontSize = '12px';
        selectButton.addEventListener('click', () => {
            currentGroup = groupName;
            namesList.value = groups[groupName].join('\n');
            updateNameCount();
            saveData();
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'danger';
        deleteButton.style.padding = '5px 10px';
        deleteButton.style.fontSize = '12px';
        deleteButton.addEventListener('click', () => {
            delete groups[groupName];
            if (currentGroup === groupName) {
                currentGroup = null;
            }
            renderGroups();
            saveData();
        });
        
        groupActions.appendChild(selectButton);
        groupActions.appendChild(deleteButton);
        groupHeader.appendChild(groupTitle);
        groupHeader.appendChild(groupActions);
        
        const groupNames = document.createElement('div');
        groupNames.textContent = groups[groupName].join(', ');
        groupNames.style.fontSize = '14px';
        groupNames.style.color = '#7f8c8d';
        
        groupDiv.appendChild(groupHeader);
        groupDiv.appendChild(groupNames);
        groupsContainer.appendChild(groupDiv);
    }
    
    if (Object.keys(groups).length === 0) {
        groupsContainer.innerHTML = '<p>No groups created yet</p>';
    }
}

// Add weights to names
function addWeightsToNames() {
    const names = namesList.value.split('\n').filter(name => name.trim() !== '');
    let newText = '';
    
    names.forEach(name => {
        const cleanName = name.replace(/\s*\(\d+\)$/, '').trim();
        const currentWeight = nameWeights[cleanName] || 1;
        newText += `${cleanName} (${currentWeight})\n`;
    });
    
    namesList.value = newText.trim();
    updateNameCount();
}

// Parse names with weights
function parseNamesWithWeights() {
    const lines = namesList.value.split('\n');
    displayNames = [];
    nameWeights = {};
    
    lines.forEach(line => {
        if (line.trim() === '') return;
        
        const match = line.match(/^(.*?)\s*\((\d+)\)$/);
        if (match) {
            const name = match[1].trim();
            const weight = parseInt(match[2]);
            displayNames.push(name);
            nameWeights[name] = weight;
        } else {
            const name = line.trim();
            displayNames.push(name);
            nameWeights[name] = 1; // Default weight
        }
    });
    
    saveData();
    return displayNames;
}

// Weighted random selection
function weightedRandomSelection(names, weights) {
    const cumulativeWeights = [];
    let totalWeight = 0;
    
    for (let i = 0; i < names.length; i++) {
        totalWeight += weights[names[i]] || 1;
        cumulativeWeights.push(totalWeight);
    }
    
    const random = Math.random() * totalWeight;
    
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (cumulativeWeights[i] > random) {
            return names[i];
        }
    }
    
    return names[names.length - 1];
}

// Pick a name function
function pickName() {
    if (isAnimating) return;
    
    parseNamesWithWeights();
    
    if (displayNames.length === 0) {
        result.textContent = 'Please add some names first!';
        removeWinnerButton.style.display = 'none';
        return;
    }
    
    if (uniqueMode && availableNames.length === 0) {
        resetAvailableNames();
    }
    
    let selectedName;
    let namesToUse = uniqueMode ? availableNames : displayNames;
    
    // Determine which name to select
    if (useSequence && sequenceNames.length > 0 && currentIndex < sequenceNames.length) {
        selectedName = sequenceNames[currentIndex];
        
        if (!namesToUse.includes(selectedName)) {
            const lowerSelectedName = selectedName.toLowerCase();
            const possibleMatch = namesToUse.find(name => 
                name.toLowerCase() === lowerSelectedName);
            
            if (possibleMatch) {
                selectedName = possibleMatch;
            } else {
                currentIndex++;
                saveData();
                updateCurrentPosition();
                pickName();
                return;
            }
        }
        
        currentIndex++;
        updateCurrentPosition();
    } else {
        selectedName = weightedRandomSelection(namesToUse, nameWeights);
    }
    
    lastWinner = selectedName;
    removeWinnerButton.style.display = 'none';
    
    if (showAnimation) {
        isAnimating = true;
        let iterations = 0;
        // Random spin duration between 3-5 seconds (40-60 iterations)
        const maxIterations = 40 + Math.floor(Math.random() * 20);
        let animationSpeed = 80; // Start fast (80ms between changes)
        let spinDirection = 1; // Used for back-and-forth effect
        let lastIndex = -1;
        
        const spinInterval = setInterval(() => {
            // Get a random name different from the last one shown
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * namesToUse.length);
            } while (randomIndex === lastIndex && namesToUse.length > 1);
            
            lastIndex = randomIndex;
            result.textContent = namesToUse[randomIndex];
            iterations++;
            
            // Gradually slow down the animation (deceleration effect)
            if (iterations > maxIterations * 0.7) {
                animationSpeed = 120; // Slow down phase 1
            }
            if (iterations > maxIterations * 0.85) {
                animationSpeed = 200; // Slow down phase 2
            }
            if (iterations > maxIterations * 0.95) {
                animationSpeed = 300; // Final slow down
            }
            
            // Occasionally reverse direction for more realism
            if (Math.random() < 0.1) {
                spinDirection *= -1;
            }
            
            if (iterations >= maxIterations) {
                clearInterval(spinInterval);
                
                // Final reveal with dramatic pause
                setTimeout(() => {
                    result.textContent = selectedName;
                    result.classList.add('animate');
                    
                    // Show remove button after highlight animation
                    setTimeout(() => {
                        result.classList.remove('animate');
                        removeWinnerButton.style.display = 'inline-block';
                        removeWinnerButton.textContent = `Remove "${selectedName}" from List`;
                    }, 1000);
                    
                    // Update history and states
                    history.push(selectedName);
                    updateHistoryDisplay();
                    
                    if (uniqueMode) {
                        availableNames = availableNames.filter(name => name !== selectedName);
                    }
                    
                    saveData();
                    isAnimating = false;
                }, 200); // Additional pause before final reveal
            }
        }, animationSpeed);
    } else {
        // Non-animated version
        result.textContent = selectedName;
        result.classList.add('animate');
        
        setTimeout(() => {
            result.classList.remove('animate');
            removeWinnerButton.style.display = 'inline-block';
            removeWinnerButton.textContent = `Remove "${selectedName}" from List`;
        }, 1000);
        
        history.push(selectedName);
        updateHistoryDisplay();
        
        if (uniqueMode) {
            availableNames = availableNames.filter(name => name !== selectedName);
        }
        
        saveData();
    }
}

// Remove winner from all lists
function removeWinnerFromList() {
    if (!lastWinner) return;
    
    let names = namesList.value.split('\n').filter(name => {
        const baseName = name.replace(/\s*\(\d+\)$/, '').trim();
        return baseName !== lastWinner;
    });
    
    namesList.value = names.join('\n');
    
    if (sequenceNames.includes(lastWinner)) {
        sequenceNames = sequenceNames.filter(name => name !== lastWinner);
        sequenceList.value = sequenceNames.join('\n');
        updateSequenceStatus();
    }
    
    for (const group in groups) {
        groups[group] = groups[group].filter(name => name !== lastWinner);
    }
    
    delete nameWeights[lastWinner];
    
    updateNameCount();
    removeWinnerButton.style.display = 'none';
    lastWinner = null;
    saveData();
    
    if (uniqueMode) {
        resetAvailableNames();
    }
    
    result.textContent = 'Winner removed. Pick again!';
}

// Reset the picker
function resetPicker() {
    history = [];
    currentIndex = 0;
    updateHistoryDisplay();
    updateCurrentPosition();
    result.textContent = 'Names will appear here';
    resetAvailableNames();
    removeWinnerButton.style.display = 'none';
    saveData();
}

// Remove duplicate names
function removeDuplicates() {
    const names = namesList.value.split('\n').filter(name => name.trim() !== '');
    const uniqueNames = [...new Set(names)];
    namesList.value = uniqueNames.join('\n');
    updateNameCount();
}

// Clear all names
function clearNames() {
    if (confirm('Are you sure you want to clear all names?')) {
        namesList.value = '';
        updateNameCount();
    }
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear the history?')) {
        history = [];
        updateHistoryDisplay();
    }
}

// Toggle unique mode
function toggleUniqueMode() {
    uniqueMode = !uniqueMode;
    uniqueModeButton.textContent = `Unique Mode: ${uniqueMode ? 'ON' : 'OFF'}`;
    uniqueModeButton.classList.toggle('success', uniqueMode);
    resetAvailableNames();
    saveData();
}

// Add a new group
function addGroup() {
    const groupName = prompt('Enter group name:');
    if (groupName) {
        const names = namesList.value.split('\n').filter(name => name.trim() !== '');
        if (names.length > 0) {
            groups[groupName] = names;
            renderGroups();
            saveData();
        } else {
            alert('Please add some names first!');
        }
    }
}

// Admin panel functions
function toggleAdminPanel() {
    if (adminPassword && adminPanel.style.display !== 'flex') {
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
        showAnimation: showAnimation,
        uniqueMode: uniqueMode,
        nameWeights: nameWeights,
        groups: groups,
        currentGroup: currentGroup,
        theme: currentTheme
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

// Open new independent window
function openNewWindow() {
    window.open(window.location.href, '_blank');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    document.documentElement.style.setProperty('--primary-color', themes['default'].primary);
    document.documentElement.style.setProperty('--primary-hover', themes['default'].hover);
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

pickButton.addEventListener('click', pickName);
resetButton.addEventListener('click', resetPicker);
uniqueModeButton.addEventListener('click', toggleUniqueMode);
adminButton.addEventListener('click', toggleAdminPanel);
closeAdminButton.addEventListener('click', toggleAdminPanel);
setPasswordButton.addEventListener('click', setAdminPassword);
resetSequenceButton.addEventListener('click', resetSequence);
exportDataButton.addEventListener('click', exportData);
importDataButton.addEventListener('click', importData);
removeDuplicatesButton.addEventListener('click', removeDuplicates);
clearNamesButton.addEventListener('click', clearNames);
addWeightsButton.addEventListener('click', addWeightsToNames);
clearHistoryButton.addEventListener('click', clearHistory);
addGroupButton.addEventListener('click', addGroup);
removeWinnerButton.addEventListener('click', removeWinnerFromList);
newWindowButton.addEventListener('click', openNewWindow);

namesList.addEventListener('input', updateNameCount);
sequenceList.addEventListener('input', updateSequenceStatus);
useSequenceCheckbox.addEventListener('change', () => {
    useSequence = useSequenceCheckbox.checked;
    saveData();
});
showAnimationCheckbox.addEventListener('change', () => {
    showAnimation = showAnimationCheckbox.checked;
    saveData();
});

themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        themeOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        applyTheme(option.dataset.theme);
    });
});

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        const tabId = button.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
    });
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
            if (data.uniqueMode !== undefined) {
                uniqueMode = data.uniqueMode;
                uniqueModeButton.textContent = `Unique Mode: ${uniqueMode ? 'ON' : 'OFF'}`;
                uniqueModeButton.classList.toggle('success', uniqueMode);
            }
            if (data.nameWeights) nameWeights = data.nameWeights;
            if (data.groups) groups = data.groups;
            if (data.currentGroup) currentGroup = data.currentGroup;
            if (data.theme) {
                currentTheme = data.theme;
                applyTheme(currentTheme);
                document.querySelector(`.theme-option[data-theme="${currentTheme}"]`).classList.add('selected');
            }
            
            updateNameCount();
            updateSequenceStatus();
            updateHistoryDisplay();
            updateCurrentPosition();
            renderGroups();
            saveData();
            
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data: ' + error);
        }
    };
    
    reader.readAsText(file);
});