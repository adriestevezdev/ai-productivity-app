// Game State
const gameState = {
    player: {
        name: "You",
        level: 8,
        currentXP: 850,
        maxXP: 1000,
        totalXP: 7850,
        streak: 3,
        tasksCompleted: 0,
        achievements: []
    },
    tasks: [],
    categories: {
        work: { name: "Work", icon: "💼", color: "#4A90E2" },
        personal: { name: "Personal", icon: "🏠", color: "#9B59B6" },
        health: { name: "Health", icon: "💪", color: "#4CAF50" },
        learning: { name: "Learning", icon: "📚", color: "#F39C12" }
    },
    selectedCategory: null,
    selectedPriority: "medium",
    todayTime: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTimers();
    attachEventListeners();
    updateUI();
});

// Event Listeners
function attachEventListeners() {
    // Task checkboxes
    document.querySelectorAll('.pixel-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleTaskComplete);
    });

    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });

    // Task form
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }

    // Category options in modal
    document.querySelectorAll('.category-option').forEach(btn => {
        btn.addEventListener('click', selectCategory);
    });

    // Priority options in modal
    document.querySelectorAll('.priority-option').forEach(btn => {
        btn.addEventListener('click', selectPriority);
    });

    // Importance slider
    const importanceSlider = document.getElementById('taskImportance');
    if (importanceSlider) {
        importanceSlider.addEventListener('input', handleImportanceChange);
    }
    
    // Checklist input Enter key
    const checklistInput = document.getElementById('checklistInput');
    if (checklistInput) {
        checklistInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChecklistItem();
            }
        });
    }

    // AI suggestions
    document.querySelectorAll('.suggestion-pill').forEach(pill => {
        pill.addEventListener('click', handleSuggestionClick);
    });

    // AI input
    document.querySelector('.send-btn').addEventListener('click', handleAIChat);
    document.querySelector('.pixel-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAIChat();
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavClick);
    });
}

// Task Completion Handler
function handleTaskComplete(e) {
    const checkbox = e.target;
    const taskItem = checkbox.closest('.task-item');
    const xpReward = parseInt(taskItem.dataset.xp);

    if (checkbox.checked && !taskItem.classList.contains('completed')) {
        // Mark as completed
        taskItem.classList.add('completed');
        
        // Show floating XP
        showFloatingXP(xpReward, taskItem);
        
        // Update player XP
        addPlayerXP(xpReward);
        
        // Update player stats
        updatePlayerStats();
        
        // Play sound effect (if implemented)
        playSound('complete');
        
        // Update task text
        const xpSpan = taskItem.querySelector('.xp-reward');
        xpSpan.textContent = `+${xpReward} XP ✓`;
    }
}

// XP System
function addPlayerXP(amount) {
    gameState.player.currentXP += amount;
    gameState.player.totalXP += amount;
    
    // Check for level up
    if (gameState.player.currentXP >= gameState.player.maxXP) {
        levelUp();
    }
    
    updateUI();
}

function levelUp() {
    gameState.player.level++;
    gameState.player.currentXP = gameState.player.currentXP - gameState.player.maxXP;
    gameState.player.maxXP = calculateXPForLevel(gameState.player.level);
    
    // Show level up modal
    showLevelUpModal(gameState.player.level);
    
    // Play level up sound
    playSound('levelup');
}

function calculateXPForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// UI Updates
function updateUI() {
    // Update player stats
    updateXPBar('.player-xp', gameState.player.currentXP, gameState.player.maxXP);
    document.querySelector('.xp-text').textContent = 
        `${gameState.player.currentXP}/${gameState.player.maxXP} XP`;
    document.querySelector('.level-text').textContent = 
        `Level ${gameState.player.level}`;
    document.querySelector('.streak-text').textContent = 
        `🔥 ${gameState.player.streak} day streak`;
    
    // Update stats
    document.getElementById('tasksCompleted').textContent = gameState.player.tasksCompleted;
    document.getElementById('totalXP').textContent = gameState.player.totalXP;
    document.getElementById('achievements').textContent = gameState.player.achievements.length;
    
    // Update daily progress
    updateDailyProgress();
}

function updateXPBar(selector, current, max) {
    const bar = document.querySelector(selector);
    const percentage = (current / max) * 100;
    bar.style.width = `${percentage}%`;
}

// Floating XP Animation
function showFloatingXP(amount, element) {
    const floatingXP = document.getElementById('floatingXP');
    const rect = element.getBoundingClientRect();
    
    floatingXP.textContent = `+${amount} XP`;
    floatingXP.style.left = `${rect.left + rect.width / 2}px`;
    floatingXP.style.top = `${rect.top}px`;
    floatingXP.style.display = 'block';
    
    // Trigger animation
    floatingXP.style.animation = 'none';
    void floatingXP.offsetWidth; // Force reflow
    floatingXP.style.animation = 'coinFloat 1s ease-out forwards';
    
    setTimeout(() => {
        floatingXP.style.display = 'none';
    }, 1000);
}

// Level Up Modal
function showLevelUpModal(level) {
    const modal = document.getElementById('levelUpModal');
    document.getElementById('newLevel').textContent = level;
    modal.style.display = 'block';
}

function closeLevelUpModal() {
    document.getElementById('levelUpModal').style.display = 'none';
}

// Timers
function initializeTimers() {
    // Set today's remaining time
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    gameState.todayTime = Math.floor((endOfDay - now) / 1000);
    
    // Update timers every second
    setInterval(updateTimers, 1000);
}

function updateTimers() {
    // Update today's time
    if (gameState.todayTime > 0) {
        gameState.todayTime--;
        document.getElementById('timeLeft').textContent = formatTime(gameState.todayTime);
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Track player stats
function updatePlayerStats() {
    gameState.player.tasksCompleted++;
    
    // Check for achievements
    checkAchievements();
    
    // Update streak (simplified for now)
    // In a full implementation, you'd check if tasks were completed yesterday
    updateStreak();
}

// Achievements System
const achievements = {
    firstTask: { id: 'firstTask', name: 'First Step', desc: 'Complete your first task', icon: '🏆' },
    tenTasks: { id: 'tenTasks', name: 'Getting Started', desc: 'Complete 10 tasks', icon: '⭐' },
    level10: { id: 'level10', name: 'Double Digits', desc: 'Reach level 10', icon: '🎯' },
    streak7: { id: 'streak7', name: 'Week Warrior', desc: '7 day streak', icon: '🔥' },
    xp1000: { id: 'xp1000', name: 'XP Master', desc: 'Earn 1000 total XP', icon: '💎' }
};

function checkAchievements() {
    // First task
    if (gameState.player.tasksCompleted === 1 && !hasAchievement('firstTask')) {
        unlockAchievement('firstTask');
    }
    
    // 10 tasks
    if (gameState.player.tasksCompleted === 10 && !hasAchievement('tenTasks')) {
        unlockAchievement('tenTasks');
    }
    
    // Level 10
    if (gameState.player.level >= 10 && !hasAchievement('level10')) {
        unlockAchievement('level10');
    }
    
    // 7 day streak
    if (gameState.player.streak >= 7 && !hasAchievement('streak7')) {
        unlockAchievement('streak7');
    }
    
    // 1000 XP
    if (gameState.player.totalXP >= 1000 && !hasAchievement('xp1000')) {
        unlockAchievement('xp1000');
    }
}

function hasAchievement(id) {
    return gameState.player.achievements.includes(id);
}

function unlockAchievement(id) {
    const achievement = achievements[id];
    gameState.player.achievements.push(id);
    showAchievementNotification(achievement);
    updateUI();
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function updateStreak() {
    // This is simplified - in production you'd check actual dates
    // For now, we'll just increment it when tasks are completed
    // Reset would happen at midnight if no tasks completed
}

function updateDailyProgress() {
    const completedToday = document.querySelectorAll('.task-item.completed').length;
    const dailyGoal = 5; // Default daily goal
    document.getElementById('dailyProgress').textContent = `${completedToday}/${dailyGoal} tasks`;
    
    // Add visual indicator
    const progressElement = document.getElementById('dailyProgress');
    if (completedToday >= dailyGoal) {
        progressElement.style.color = 'var(--pixel-green)';
    } else {
        progressElement.style.color = 'var(--pixel-yellow)';
    }
}

// Category Filter
function handleCategoryFilter(e) {
    const btn = e.target;
    const category = btn.dataset.category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Filter tasks
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach(task => {
        if (category === 'all' || task.dataset.category === category) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    });
}

// Task Modal Functions
function openTaskModal() {
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('taskName').focus();
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    document.getElementById('taskForm').reset();
    document.getElementById('checklistItems').innerHTML = '';
    document.getElementById('importanceValue').textContent = '50';
    document.getElementById('taskImportance').value = 50;
    
    // Reset importance labels
    document.querySelectorAll('.importance-label').forEach(label => label.classList.remove('active'));
    document.querySelectorAll('.importance-label')[2].classList.add('active');
    
    gameState.selectedCategory = null;
    gameState.selectedPriority = 'medium';
    gameState.selectedXP = 20;
    updateModalButtons();
}

function selectCategory(e) {
    const btn = e.target;
    gameState.selectedCategory = btn.dataset.category;
    document.querySelectorAll('.category-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function selectPriority(e) {
    const btn = e.target;
    gameState.selectedPriority = btn.dataset.priority;
    document.querySelectorAll('.priority-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function updateModalButtons() {
    // Reset category buttons
    document.querySelectorAll('.category-option').forEach(b => b.classList.remove('active'));
    if (gameState.selectedCategory) {
        document.querySelector(`.category-option[data-category="${gameState.selectedCategory}"]`)?.classList.add('active');
    }
    
    // Reset priority buttons
    document.querySelectorAll('.priority-option').forEach(b => b.classList.remove('active'));
    document.querySelector(`.priority-option[data-priority="${gameState.selectedPriority}"]`)?.classList.add('active');
}

// Handle importance slider
function handleImportanceChange(e) {
    const value = e.target.value;
    const importanceValue = document.getElementById('importanceValue');
    importanceValue.textContent = value;
    
    // Update labels
    const labels = document.querySelectorAll('.importance-label');
    labels.forEach(label => label.classList.remove('active'));
    
    let activeIndex = 2; // Default to Med
    if (value <= 20) activeIndex = 0;
    else if (value <= 40) activeIndex = 1;
    else if (value <= 60) activeIndex = 2;
    else if (value <= 80) activeIndex = 3;
    else activeIndex = 4;
    
    labels[activeIndex].classList.add('active');
    
    // Update XP based on importance
    const xpMap = [10, 15, 20, 30, 50];
    gameState.selectedPriority = ['min', 'low', 'medium', 'high', 'max'][activeIndex];
    gameState.selectedXP = xpMap[activeIndex];
}

// Checklist functionality
function addChecklistItem() {
    const input = document.getElementById('checklistInput');
    const itemText = input.value.trim();
    
    if (!itemText) return;
    
    const checklistItems = document.getElementById('checklistItems');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item';
    itemDiv.innerHTML = `
        <input type="checkbox" class="pixel-checkbox">
        <span>${itemText}</span>
        <button type="button" onclick="removeChecklistItem(this)">X</button>
    `;
    
    checklistItems.appendChild(itemDiv);
    input.value = '';
}

function removeChecklistItem(button) {
    button.parentElement.remove();
}

// Get checklist items from modal
function getChecklistItems() {
    const items = [];
    document.querySelectorAll('#checklistItems .checklist-item').forEach(item => {
        const text = item.querySelector('span').textContent;
        const checked = item.querySelector('input[type="checkbox"]').checked;
        items.push({ text, checked });
    });
    return items;
}

// Handle Task Form Submission
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskName = document.getElementById('taskName').value.trim();
    const project = document.getElementById('taskProject').value || gameState.selectedCategory;
    
    if (!taskName || !project) {
        showNotification('Please fill in all required fields!');
        return;
    }
    
    // Get importance from slider
    const importance = parseInt(document.getElementById('taskImportance').value);
    const xp = gameState.selectedXP || 20; // Default to medium if not set
    
    // Gather all task data
    const taskData = {
        name: taskName,
        category: project,
        priority: gameState.selectedPriority,
        xp: xp,
        dueDate: document.getElementById('taskDueDate').value,
        description: document.getElementById('taskDescription').value,
        checklist: getChecklistItems(),
        recurring: document.getElementById('taskRecurring').checked,
        importance: importance
    };
    
    createTask(taskData);
    closeTaskModal();
}

// Create Task
function createTask(taskData) {
    const tasksContainer = document.querySelector('.tasks-container');
    const taskId = `task${Date.now()}`;
    
    const categoryInfo = gameState.categories[taskData.category];
    
    const newTask = document.createElement('div');
    newTask.className = 'task-item';
    newTask.dataset.xp = taskData.xp;
    newTask.dataset.category = taskData.category;
    newTask.dataset.priority = taskData.priority;
    newTask.dataset.taskData = JSON.stringify(taskData);
    
    // Build task HTML with additional info
    let taskHTML = `
        <input type="checkbox" class="pixel-checkbox" id="${taskId}">
        <div class="task-content">
            <label for="${taskId}">${taskData.name}</label>
            <div class="task-meta">
                <span class="task-category">${categoryInfo.icon} ${categoryInfo.name}</span>
                <span class="task-priority priority-${taskData.priority}">${taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}</span>
    `;
    
    // Add due date if exists
    if (taskData.dueDate) {
        const dueDate = new Date(taskData.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        taskHTML += `<span class="task-due-date">📅 ${formattedDate}</span>`;
    }
    
    // Add recurring indicator
    if (taskData.recurring) {
        taskHTML += `<span class="task-recurring">🔁</span>`;
    }
    
    // Add checklist indicator if has items
    if (taskData.checklist && taskData.checklist.length > 0) {
        const completedCount = taskData.checklist.filter(item => item.checked).length;
        taskHTML += `<span class="task-checklist">📋 ${completedCount}/${taskData.checklist.length}</span>`;
    }
    
    taskHTML += `
            </div>
        </div>
        <span class="xp-reward">${taskData.xp} XP</span>
    `;
    
    newTask.innerHTML = taskHTML;
    
    tasksContainer.appendChild(newTask);
    
    // Add event listener
    newTask.querySelector('.pixel-checkbox').addEventListener('change', handleTaskComplete);
    
    // Animate appearance
    newTask.style.opacity = '0';
    newTask.style.transform = 'translateY(20px)';
    setTimeout(() => {
        newTask.style.transition = 'all 0.3s ease';
        newTask.style.opacity = '1';
        newTask.style.transform = 'translateY(0)';
    }, 100);
    
    // Store task in gameState
    gameState.tasks.push({
        id: taskId,
        name,
        category,
        priority,
        xp,
        completed: false
    });
    
    showNotification(`Task created: ${name} (+${xp} XP)`);
}

// AI Assistant
function handleSuggestionClick(e) {
    const suggestion = e.target.textContent;
    document.querySelector('.pixel-input').value = suggestion;
    handleAIChat();
}

function handleAIChat() {
    const input = document.querySelector('.pixel-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Simulate AI response
    showNotification(`AI: I'll help you with "${message}". Creating tasks...`);
    
    // Create sample tasks based on input
    setTimeout(() => {
        if (message.includes('community')) {
            addAITask('Research community platforms', 15);
            addAITask('Create content calendar', 20);
            addAITask('Engage with 10 users', 25);
        } else if (message.includes('SaaS')) {
            addAITask('Market research', 20);
            addAITask('Define MVP features', 30);
            addAITask('Create landing page', 25);
        } else {
            addAITask('Break down the project', 20);
            addAITask('Set milestones', 15);
        }
        
        showNotification('AI: Tasks created! Good luck!');
    }, 1000);
    
    input.value = '';
}

function addAITask(taskName, xp) {
    const tasksContainer = document.querySelector('.tasks-container');
    const taskId = `task${Date.now()}${Math.random()}`;
    
    const newTask = document.createElement('div');
    newTask.className = 'task-item';
    newTask.dataset.xp = xp;
    newTask.innerHTML = `
        <input type="checkbox" class="pixel-checkbox" id="${taskId}">
        <label for="${taskId}">${taskName} (AI suggested)</label>
        <span class="xp-reward">${xp} XP</span>
    `;
    
    tasksContainer.appendChild(newTask);
    newTask.querySelector('.pixel-checkbox').addEventListener('change', handleTaskComplete);
    
    // Animate appearance
    newTask.style.opacity = '0';
    newTask.style.transform = 'translateY(20px)';
    setTimeout(() => {
        newTask.style.transition = 'all 0.3s ease';
        newTask.style.opacity = '1';
        newTask.style.transform = 'translateY(0)';
    }, 100);
}

// Navigation
function handleNavClick(e) {
    const navItem = e.currentTarget;
    
    // Remove active from all
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active to clicked
    navItem.classList.add('active');
    
    // Toggle submenu if expandable
    if (navItem.classList.contains('expandable')) {
        const submenu = navItem.nextElementSibling;
        if (submenu && submenu.classList.contains('sub-menu')) {
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
        }
    }
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${gameState.player.level > gameState.rival.level ? '#4CAF50' : '#E74C3C'};
        color: white;
        padding: 15px 20px;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        border: 2px solid #000;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Sound Effects (placeholder)
function playSound(type) {
    // In a real implementation, you would play actual sound files
    console.log(`Playing sound: ${type}`);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
    }
`;
document.head.appendChild(style);