// Task management system
class TaskManager {
    constructor() {
        this.initializeEventListeners();
        this.loadTaskStatus();
    }

    initializeEventListeners() {
        // Quiz task listeners
        document.querySelectorAll('.quiz-task').forEach(task => {
            const taskId = task.id;
            const config = TASK_CONFIG.quizTasks[taskId];
            const button = task.querySelector('.claim-button');
            const input = task.querySelector('.answer-input');
            const hintIcon = task.querySelector('.hint-icon');

            if (hintIcon) {
                hintIcon.addEventListener('click', () => this.showHint(config.hint));
            }

            if (button && input) {
                button.addEventListener('click', () => this.checkAnswer(taskId, input.value, config.answer, config.reward));
                // Add enter key support
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.checkAnswer(taskId, input.value, config.answer, config.reward);
                    }
                });
            }
        });

        // Social task listeners
        document.querySelectorAll('.social-task').forEach(task => {
            const taskId = task.id;
            const config = TASK_CONFIG.socialTasks[taskId];
            const button = task.querySelector('.claim-button');
            
            if (button) {
                button.addEventListener('click', () => this.claimSocialReward(taskId, config.reward));
            }
        });

        // Add verification button listeners
        document.querySelectorAll('.verify-button').forEach(button => {
            button.addEventListener('click', () => this.verifyFollowing(button));
        });
    }

    loadTaskStatus() {
        // Load quiz task status
        Object.keys(TASK_CONFIG.quizTasks).forEach(taskId => {
            const taskElement = document.querySelector(`[data-task-id="quiz_${taskId}"]`);
            if (taskElement && localStorage.getItem(`quiz_${taskId}`) === 'completed') {
                taskElement.classList.add('completed');
                const input = taskElement.querySelector('.answer-input');
                const submitBtn = taskElement.querySelector('.submit-btn');
                if (input && submitBtn) {
                    input.disabled = true;
                    submitBtn.disabled = true;
                }
            }
        });

        // Load social task status
        Object.keys(TASK_CONFIG.socialTasks).forEach(taskId => {
            const taskElement = document.querySelector(`[data-task-id="social_${taskId}"]`);
            if (taskElement && localStorage.getItem(`social_${taskId}`) === 'completed') {
                taskElement.classList.add('completed');
                const claimBtn = taskElement.querySelector('.claim-btn');
                if (claimBtn) {
                    claimBtn.disabled = true;
                }
            }
        });

        // Update total rewards and balance
        this.updateTotalRewards();
        this.updateBalance();
    }

    checkAnswer(taskId, userAnswer, correctAnswer, reward) {
        const taskElement = document.getElementById(taskId);
        if (!taskElement) return;

        if (localStorage.getItem(`quiz_${taskId}`) === 'completed') {
            this.showMessage('You have already completed this task!', 'warning');
            return;
        }

        if (userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase()) {
            // Update balance
            window.updateBalance(reward);
            
            // Mark task as completed
            localStorage.setItem(`quiz_${taskId}`, 'completed');
            this.markTaskCompleted(taskElement);
            
            // Show success message
            this.showMessage(`Correct! You earned ${reward} 🦁`, 'success');
            
            // Update total rewards
            this.updateTotalRewards();
        } else {
            this.showMessage('Incorrect answer, try again!', 'error');
            taskElement.querySelector('.answer-input').classList.add('shake');
            setTimeout(() => {
                taskElement.querySelector('.answer-input').classList.remove('shake');
            }, 500);
        }
    }

    claimSocialReward(taskId, reward) {
        const taskElement = document.getElementById(taskId);
        if (!taskElement) return;

        if (localStorage.getItem(`social_${taskId}`) === 'completed') {
            this.showMessage('You have already claimed this reward!', 'warning');
            return;
        }

        // Verify following status
        this.verifyFollowing(taskElement.querySelector('.verify-button'))
            .then(isFollowing => {
                if (isFollowing) {
                    // Update balance
                    window.updateBalance(reward);
                    
                    // Mark task as completed
                    localStorage.setItem(`social_${taskId}`, 'completed');
                    this.markTaskCompleted(taskElement);
                    
                    // Show success message
                    this.showMessage(`Claimed ${reward} 🦁`, 'success');
                    
                    // Update total rewards
                    this.updateTotalRewards();
                } else {
                    this.showMessage('Please follow us first!', 'warning');
                }
            });
    }

    async verifyFollowing(button) {
        if (!button) return false;
        
        // Show verification in progress
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        
        // Simulate verification (replace with actual API calls)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Reset button
        button.disabled = false;
        button.innerHTML = 'Verify Following';
        
        // For demo, always return true
        // In production, implement actual verification logic
        return true;
    }

    markTaskCompleted(taskElement) {
        if (!taskElement) return;
        
        taskElement.classList.add('completed');
        
        const button = taskElement.querySelector('.claim-button');
        if (button) button.disabled = true;
        
        const input = taskElement.querySelector('.answer-input');
        if (input) input.disabled = true;
        
        const verifyButton = taskElement.querySelector('.verify-button');
        if (verifyButton) verifyButton.style.display = 'none';
    }

    showHint(hint) {
        this.showMessage(hint, 'info');
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Style based on message type
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.info}ee;
            color: white;
            padding: 15px 30px;
            border-radius: 30px;
            font-weight: bold;
            animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }

    updateTotalRewards() {
        const totalRewardsElement = document.getElementById('total-rewards');
        if (totalRewardsElement) {
            let totalRewards = 0;
            let completedRewards = 0;
            
            // Calculate total and completed rewards from quiz tasks
            Object.entries(TASK_CONFIG.quizTasks).forEach(([taskId, task]) => {
                totalRewards += task.reward;
                if (localStorage.getItem(`quiz_${taskId}`) === 'completed') {
                    completedRewards += task.reward;
                }
            });
            
            // Calculate total and completed rewards from social tasks
            Object.entries(TASK_CONFIG.socialTasks).forEach(([taskId, task]) => {
                totalRewards += task.reward;
                if (localStorage.getItem(`social_${taskId}`) === 'completed') {
                    completedRewards += task.reward;
                }
            });
            
            // Update total rewards display
            totalRewardsElement.innerHTML = `${completedRewards}/${totalRewards} 🦁`;

            // Update completion status
            const totalTasks = Object.keys(TASK_CONFIG.quizTasks).length + Object.keys(TASK_CONFIG.socialTasks).length;
            let completedTasks = 0;

            // Count completed quiz tasks
            Object.keys(TASK_CONFIG.quizTasks).forEach(taskId => {
                if (localStorage.getItem(`quiz_${taskId}`) === 'completed') {
                    completedTasks++;
                }
            });

            // Count completed social tasks
            Object.keys(TASK_CONFIG.socialTasks).forEach(taskId => {
                if (localStorage.getItem(`social_${taskId}`) === 'completed') {
                    completedTasks++;
                }
            });

            // Update completion status display
            const completionElement = document.querySelector('.total-lion-text');
            if (completionElement) {
                completionElement.innerHTML = `TOTAL LION COINS (${completedTasks}/${totalTasks} Tasks Completed)`;
            }
        }

        // Update current balance
        this.updateBalance();
    }

    updateBalance() {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            let currentBalance = 0;
            
            // Add completed quiz rewards
            Object.entries(TASK_CONFIG.quizTasks).forEach(([taskId, task]) => {
                if (localStorage.getItem(`quiz_${taskId}`) === 'completed') {
                    currentBalance += task.reward;
                }
            });
            
            // Add completed social rewards
            Object.entries(TASK_CONFIG.socialTasks).forEach(([taskId, task]) => {
                if (localStorage.getItem(`social_${taskId}`) === 'completed') {
                    currentBalance += task.reward;
                }
            });

            // Animate the balance change
            const oldBalance = parseInt(balanceElement.textContent) || 0;
            if (oldBalance !== currentBalance) {
                this.animateBalance(oldBalance, currentBalance);
            }

            // Update local storage
            localStorage.setItem('currentBalance', currentBalance.toString());
        }
    }

    animateBalance(start, end) {
        const balanceElement = document.getElementById('balance');
        const duration = 1000; // Animation duration in milliseconds
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
            const currentValue = start + (end - start) * easeOutCubic(progress);
            
            balanceElement.textContent = Math.round(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Add keyframes for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translate(-50%, -100%); }
        to { transform: translate(-50%, 0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    .hint-icon {
        cursor: pointer;
        color: #ffd700;
        margin-left: 10px;
        transition: all 0.3s ease;
    }
    
    .hint-icon:hover {
        transform: scale(1.2);
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
    
    .verify-button {
        background: linear-gradient(45deg, #2196F3, #64B5F6);
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        margin-top: 5px;
    }
    
    .verify-button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(33, 150, 243, 0.5);
    }
    
    .verify-button:disabled {
        background: #666;
        cursor: not-allowed;
        transform: none;
    }
`;
document.head.appendChild(style);

// Initialize task manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
