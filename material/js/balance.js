// Centralized balance management
function initializeBalance() {
    if (localStorage.getItem('userBalance') === null) {
        localStorage.setItem('userBalance', '0');
    }
}

function getBalance() {
    initializeBalance();
    return parseInt(localStorage.getItem('userBalance'));
}

function setBalance(amount) {
    localStorage.setItem('userBalance', amount.toString());
    updateAllBalanceDisplays();
}

function updateBalance(amount) {
    const currentBalance = getBalance();
    setBalance(currentBalance + amount);
}

function updateAllBalanceDisplays() {
    const currentBalance = getBalance();
    // Update all balance display elements
    const balanceElements = document.querySelectorAll('[data-balance-display]');
    balanceElements.forEach(element => {
        element.textContent = currentBalance;
    });
}

// Function to update balance display
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    const totalRewardsElement = document.getElementById('total-rewards');
    
    if (balanceElement) {
        let currentBalance = 0;
        let totalRewards = 1950; // Total available rewards
        
        // Get completed quiz tasks and their rewards
        if (window.TASK_CONFIG) {
            Object.entries(TASK_CONFIG.quizTasks).forEach(([taskId, task]) => {
                if (localStorage.getItem(`quiz_${taskId}`) === 'completed') {
                    currentBalance += task.reward;
                }
            });
            
            // Get completed social tasks and their rewards
            Object.entries(TASK_CONFIG.socialTasks).forEach(([taskId, task]) => {
                if (localStorage.getItem(`social_${taskId}`) === 'completed') {
                    currentBalance += task.reward;
                }
            });
        }
        
        // Animate balance change
        const oldBalance = parseInt(balanceElement.textContent) || 0;
        if (oldBalance !== currentBalance) {
            animateBalance(balanceElement, oldBalance, currentBalance);
        }
        
        // Update total rewards display
        if (totalRewardsElement) {
            totalRewardsElement.textContent = `${currentBalance}/${totalRewards}`;
        }
    }
}

// Function to animate balance changes
function animateBalance(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const currentValue = start + (end - start) * easeOutCubic(progress);
        
        element.textContent = Math.round(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// Initialize balance display when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeBalance();
    updateAllBalanceDisplays();
    updateBalanceDisplay();
});

// Update balance display when storage changes (for cross-page synchronization)
window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('quiz_') || e.key.startsWith('social_')) {
        updateBalanceDisplay();
    }
});

// Export functions for use in other files
window.getBalance = getBalance;
window.setBalance = setBalance;
window.updateBalance = updateBalance;
window.updateAllBalanceDisplays = updateAllBalanceDisplays;
