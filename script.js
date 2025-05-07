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

// Initialize the application
function initializeApp() {
    // Start with empty lists
    namesList.value = '';
    sequenceList.value = '';
    
    // Set default states
    useSequenceCheckbox.checked = useSequence;
    showAnimationCheckbox.checked = showAnimation;
    uniqueModeButton.textContent = `Unique Mode: ${uniqueMode ? 'ON' : 'OFF'}`;
    uniqueModeButton.classList.toggle('success', uniqueMode);
    
    // Apply default theme
    applyTheme(currentTheme);
    document.querySelector(`.theme-option[data-theme="${currentTheme}"]`).classList.add('selected');
    
    // Update displays
    updateNameCount();
    updateSequenceStatus();
    updateHistoryDisplay();
    updateCurrentPosition();
    renderGroups();
    
    // Set current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Update the name count display
function updateNameCount() {
    displayNames = namesList.value.split('\n').filter(name => name.trim() !== '');
    nameCountDisplay.textContent = `${displayNames.length} names entered`;
    resetAvailableNames();
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

// Reset available names for unique mode
function resetAvailableNames() {
    availableNames = [...displayNames];
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
}

// Render groups in the groups tab
function renderGroups() {
    groupsContainer.innerHTML = '';
    
    for (const groupName in groups) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-item';
        
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

// [Rest of your existing functions remain exactly the same, just remove any saveData() calls]
// [Keep all the functions like pickName(), removeWinnerFromList(), resetPicker(), etc.]
// [Just remove any lines that call saveData() or reference localStorage]

// Event listeners
document.addEventListener('DOMContentLoaded', initializeApp);

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

namesList.addEventListener('input', updateNameCount);
sequenceList.addEventListener('input', updateSequenceStatus);
useSequenceCheckbox.addEventListener('change', () => {
    useSequence = useSequenceCheckbox.checked;
});
showAnimationCheckbox.addEventListener('change', () => {
    showAnimation = showAnimationCheckbox.checked;
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
            
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data: ' + error);
        }
    };
    
    reader.readAsText(file);
});