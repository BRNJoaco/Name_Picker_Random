// Global variables
let displayNames = [];
let sequenceNames = [];
let currentIndex = 0;
let history = [];
let isSpinning = false;
let adminPassword = '';
let useSequence = true;
let wheelItems = [];

// DOM elements
const namesList = document.getElementById('namesList');
const nameCountDisplay = document.getElementById('nameCountDisplay');
const spinButton = document.getElementById('spinButton');
const resetButton = document.getElementById('resetButton');
const result = document.getElementById('result');
const selectionHistory = document.getElementById('selectionHistory');
const rouletteWheel = document.getElementById('rouletteWheel');
const adminButton = document.getElementById('adminButton');
const adminPanel = document.getElementById('adminPanel');
const adminPasswordInput = document.getElementById('adminPassword');
const setPasswordButton = document.getElementById('setPasswordButton');
const passwordStatus = document.getElementById('passwordStatus');
const sequenceList = document.getElementById('sequenceList');
const sequenceStatus = document.getElementById('sequenceStatus');
const useSequenceCheckbox = document.getElementById('useSequenceCheckbox');
const currentPosition = document.getElementById('currentPosition');
const totalInSequence = document.getElementById('totalInSequence');
const resetSequenceButton = document.getElementById('resetSequenceButton');
const closeAdminButton = document.getElementById('closeAdminButton');
const exportDataButton = document.getElementById('exportDataButton');
const importDataButton = document.getElementById('importDataButton');
const importFileInput = document.getElementById('importFileInput');

// Initialize the app
function init() {
    loadData();
    updateNameCount();
    renderWheel();
    setupEventListeners();
}

// Load saved data
function loadData() {
    const savedNames = localStorage.getItem('namePicker_names');
    const savedSequence = localStorage.getItem('namePicker_sequence');
    const savedIndex = localStorage.getItem('namePicker_currentIndex');
    const savedHistory = localStorage.getItem('namePicker_history');
    const savedPassword = localStorage.getItem('namePicker_adminPassword');
    const savedUseSequence = localStorage.getItem('namePicker_useSequence');
    
    if (savedNames) {
        namesList.value = savedNames;
        displayNames = savedNames.split('\n').filter(name => name.trim() !== '');
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
    
    updateCurrentPosition();
}

// Save data
function saveData() {
    localStorage.setItem('namePicker_names', namesList.value);
    localStorage.setItem('namePicker_sequence', sequenceList.value);
    localStorage.setItem('namePicker_currentIndex', currentIndex);
    localStorage.setItem('namePicker_history', JSON.stringify(history));
    localStorage.setItem('namePicker_adminPassword', adminPassword);
    localStorage.setItem('namePicker_useSequence', useSequence);
}

// Render the wheel with clear segments
function renderWheel() {
    rouletteWheel.innerHTML = '';
    wheelItems = [];
    
    if (displayNames.length === 0) {
        rouletteWheel.style.background = '#eee';
        rouletteWheel.innerHTML = '<div class="empty-wheel">Add names to begin</div>';
        return;
    }
    
    const angle = 360 / displayNames.length;
    const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6'];
    
    // Create divider lines
    for (let i = 0; i < displayNames.length; i++) {
        const divider = document.createElement('div');
        divider.className = 'wheel-divider';
        divider.style.transform = `rotate(${angle * i}deg)`;
        rouletteWheel.appendChild(divider);
    }
    
    // Create name segments
    displayNames.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'roulette-item';
        item.textContent = name.length > 10 ? name.substring(0, 8) + '...' : name;
        item.style.transform = `rotate(${angle * index + angle/2}deg)`;
        item.style.color = 'white';
        item.style.backgroundColor = colors[index % colors.length];
        item.dataset.fullName = name;
        
        rouletteWheel.appendChild(item);
        wheelItems.push(item);
    });
}

// Spin the wheel
function spinWheel() {
    if (isSpinning || displayNames.length === 0) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    result.textContent = 'Spinning...';
    
    let selectedIndex;
    if (useSequence && sequenceNames.length > 0) {
        if (currentIndex >= sequenceNames.length) {
            result.textContent = 'All names in sequence selected!';
            isSpinning = false;
            spinButton.disabled = false;
            return;
        }
        
        const selectedName = sequenceNames[currentIndex];
        selectedIndex = displayNames.findIndex(name => 
            name.toLowerCase() === selectedName.toLowerCase());
        
        if (selectedIndex === -1) {
            currentIndex++;
            saveData();
            updateCurrentPosition();
            spinWheel();
            return;
        }
    } else {
        selectedIndex = Math.floor(Math.random() * displayNames.length);
    }
    
    const spinDuration = 5000;
    const targetAngle = 360 * 5 + (360 - (360 / displayNames.length) * selectedIndex);
    const startTime = performance.now();
    
    function animateSpin(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        rouletteWheel.style.transform = `rotate(${easeProgress * targetAngle}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            finishSpin(selectedIndex);
        }
    }
    
    requestAnimationFrame(animateSpin);
}

// Finish spin animation
function finishSpin(selectedIndex) {
    const selectedName = displayNames[selectedIndex];
    
    // Highlight the winner
    wheelItems.forEach((item, index) => {
        if (index === selectedIndex) {
            item.style.fontWeight = 'bold';
            item.style.fontSize = '14px';
            item.style.textDecoration = 'underline';
        } else {
            item.style.fontWeight = 'normal';
            item.style.fontSize = '12px';
            item.style.textDecoration = 'none';
        }
    });
    
    // Display winner
    result.textContent = `WINNER: ${selectedName.toUpperCase()}!`;
    result.style.animation = 'none';
    void result.offsetWidth;
    result.style.animation = 'pulse 2s infinite';
    
    // Add to history
    history.unshift({
        name: selectedName,
        time: new Date().toLocaleTimeString()
    });
    
    if (history.length > 10) history.pop();
    updateHistoryDisplay();
    
    // Update sequence position
    if (useSequence) {
        currentIndex++;
        updateCurrentPosition();
    }
    
    saveData();
    isSpinning = false;
    spinButton.disabled = false;
}

// Update functions
function updateNameCount() {
    displayNames = namesList.value.split('\n').filter(name => name.trim() !== '');
    nameCountDisplay.textContent = `${displayNames.length} names in wheel`;
    renderWheel();
}

function updateSequenceStatus() {
    sequenceNames = sequenceList.value.split('\n').filter(name => name.trim() !== '');
    sequenceStatus.textContent = sequenceNames.length > 0 ? 
        `Sequence has ${sequenceNames.length} names` : 'No sequence set';
    sequenceStatus.style.color = sequenceNames.length > 0 ? '#27ae60' : '#e74c3c';
    totalInSequence.textContent = sequenceNames.length;
}

function updateHistoryDisplay() {
    selectionHistory.innerHTML = '';
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span>${index + 1}. ${item.name}</span>
            <small>${item.time}</small>
        `;
        selectionHistory.appendChild(historyItem);
    });
}

function updateCurrentPosition() {
    currentPosition.textContent = currentIndex;
    totalInSequence.textContent = sequenceNames.length;
}

// Reset functions
function resetPicker() {
    history = [];
    updateHistoryDisplay();
    result.textContent = 'Ready to spin!';
    result.style.animation = 'none';
    saveData();
}

function resetSequence() {
    currentIndex = 0;
    updateCurrentPosition();
    saveData();
}

// Admin functions
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

// Data export/import
function exportData() {
    const data = {
        displayNames: namesList.value,
        sequenceNames: sequenceList.value,
        currentIndex: currentIndex,
        history: history,
        useSequence: useSequence
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'name_roulette_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    importFileInput.click();
}

// Event listeners
function setupEventListeners() {
    spinButton.addEventListener('click', spinWheel);
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
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);