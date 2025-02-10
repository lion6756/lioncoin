class DailyRewards {
    constructor() {
        this.DAILY_REWARD_AMOUNT = 700;
        this.CLAIM_COOLDOWN_HOURS = 24;
        this.initializeElements();
        this.loadLastClaimTime();
        this.startCountdown();
    }

    initializeElements() {
        this.claimButton = document.getElementById('claim-button');
        this.countdownElement = document.getElementById('countdown');
        this.balanceElement = document.getElementById('balance');
    }

    loadLastClaimTime() {
        this.lastClaimTime = localStorage.getItem('lastDailyRewardClaim');
        this.updateClaimButton();
    }

    canClaim() {
        if (!this.lastClaimTime) return true;
        
        const now = new Date().getTime();
        const lastClaim = parseInt(this.lastClaimTime);
        const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
        
        return hoursSinceLastClaim >= this.CLAIM_COOLDOWN_HOURS;
    }

    updateClaimButton() {
        if (this.canClaim()) {
            this.claimButton.disabled = false;
            this.claimButton.innerHTML = `
                <span class="claim-text">Claim Reward</span>
                <span class="lion-icon">🦁</span>
            `;
        } else {
            this.claimButton.disabled = true;
        }
    }

    startCountdown() {
        const updateCountdown = () => {
            if (!this.lastClaimTime) {
                this.countdownElement.textContent = 'Claim available now!';
                return;
            }

            const now = new Date().getTime();
            const lastClaim = parseInt(this.lastClaimTime);
            const nextClaimTime = lastClaim + (this.CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000);
            const timeLeft = nextClaimTime - now;

            if (timeLeft <= 0) {
                this.countdownElement.textContent = 'Claim available now!';
                this.updateClaimButton();
                return;
            }

            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            this.countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        };

        // Update immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    createCoinAnimation() {
        const coinsContainer = document.createElement('div');
        coinsContainer.className = 'coins-animation';
        document.body.appendChild(coinsContainer);

        const buttonRect = this.claimButton.getBoundingClientRect();
        const balanceRect = this.balanceElement.getBoundingClientRect();

        for (let i = 0; i < 10; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.textContent = '🦁';
            coin.style.left = `${buttonRect.left + Math.random() * buttonRect.width}px`;
            coin.style.top = `${buttonRect.top}px`;

            const endX = balanceRect.left + balanceRect.width / 2;
            const endY = balanceRect.top + balanceRect.height / 2;
            
            coin.style.animation = `coinFall 1s ease-out forwards`;
            coinsContainer.appendChild(coin);
        }

        setTimeout(() => coinsContainer.remove(), 1000);
    }

    async claimReward() {
        if (!this.canClaim()) return;

        // Add reward animation
        this.createCoinAnimation();
        
        // Update last claim time
        const now = new Date().getTime();
        localStorage.setItem('lastDailyRewardClaim', now.toString());
        this.lastClaimTime = now;

        // Update button state
        this.updateClaimButton();

        // Add reward to balance
        const currentBalance = parseInt(localStorage.getItem('currentBalance')) || 0;
        const newBalance = currentBalance + this.DAILY_REWARD_AMOUNT;
        localStorage.setItem('currentBalance', newBalance.toString());

        // Animate balance change
        if (window.animateBalance) {
            window.animateBalance(this.balanceElement, currentBalance, newBalance);
        } else {
            this.balanceElement.textContent = newBalance;
        }

        // Show success message
        const rewardCard = document.querySelector('.daily-rewards-card');
        rewardCard.classList.add('reward-claimed');
        setTimeout(() => rewardCard.classList.remove('reward-claimed'), 500);
    }
}

// Initialize daily rewards system
document.addEventListener('DOMContentLoaded', () => {
    window.dailyRewards = new DailyRewards();
});

// Update claim function
window.claimDailyReward = () => {
    if (window.dailyRewards) {
        window.dailyRewards.claimReward();
    }
};
