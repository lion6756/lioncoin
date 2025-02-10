function completeTask(reward, taskUrl) {
   
    if (localStorage.getItem(taskUrl) === 'true') {
        alert('You have already completed this task.');
        return;
    }

 
    window.updateBalance(reward);
    localStorage.setItem(taskUrl, 'true');

 
    window.open(taskUrl, '_blank');
}

function claimrewards() {
    const lastClaimTime = localStorage.getItem('lastClaimTime');
    const currentTime = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (lastClaimTime && currentTime - parseInt(lastClaimTime) < cooldownPeriod) {
        const timeRemaining = cooldownPeriod - (currentTime - parseInt(lastClaimTime));
        const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        alert(`Please wait ${hoursRemaining}h ${minutesRemaining}m before claiming again.`);
        updateClaimTimer();
        return;
    }

    // Process the claim
    window.updateBalance(300);
    localStorage.setItem('lastClaimTime', currentTime.toString());
    alert('Successfully claimed 300 🦁!');
    updateClaimTimer();
}

function updateClaimTimer() {
    const timerElement = document.getElementById('claim-timer');
    if (!timerElement) return;

    const lastClaimTime = localStorage.getItem('lastClaimTime');
    const currentTime = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000;

    if (lastClaimTime) {
        const timeRemaining = cooldownPeriod - (currentTime - parseInt(lastClaimTime));
        if (timeRemaining > 0) {
            const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
            const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
            timerElement.textContent = `Next claim in: ${hoursRemaining}h ${minutesRemaining}m`;
        } else {
            timerElement.textContent = 'Claim available!';
        }
    } else {
        timerElement.textContent = 'Claim available!';
    }
}

// Start the timer update interval
setInterval(updateClaimTimer, 60000); // Update every minute
