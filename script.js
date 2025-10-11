document.addEventListener('DOMContentLoaded', () => {
    const worldClockIcon = document.getElementById('icon-world-clock');
    // --- Get DOM Elements ---
    const timeDisplay = document.getElementById('timeDisplay');
    // lapTimeDisplay is inside the .laps container, find it there
    const lapsContainer = document.querySelector('.laps');
    const lapTimeDisplay = document.getElementById('lapTimeDisplay'); // Assuming this ID exists within .laps
    const startStopBtn = document.getElementById('startStopBtn');
    const resetLapBtn = document.getElementById('resetLapBtn');

     // Function to check if the user is on an Android device
    const isAndroid = () => {
        return /Android/i.test(navigator.userAgent);
    };

    // Toggle fullscreen function
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Add click event listener to the world clock icon
    if (worldClockIcon) {
        worldClockIcon.addEventListener('click', () => {
            if (isAndroid()) {
                toggleFullScreen();
            }
        });
    }

    // --- State Variables ---
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let isRunning = false;

    // --- Helper Functions ---

    // Gets individual time components (MM, SS, HH)
    function getTimeParts(time) {
        const totalMilliseconds = Math.max(0, time);
        const hundredths = String(Math.floor((totalMilliseconds % 1000) / 10)).padStart(2, '0');
        const seconds = String(Math.floor((totalMilliseconds / 1000) % 60)).padStart(2, '0');
        const minutes = String(Math.floor((totalMilliseconds / (1000 * 60)) % 60)).padStart(2, '0');
        return { minutes, seconds, hundredths };
    }

    // Updates the time displays using spans for styling separators
    function updateDisplay(displayTime) {
        const parts = getTimeParts(displayTime);
        const newHTML = `
            <span class="time-part minutes">${parts.minutes}</span><span class="time-part colon">:</span><span class="time-part seconds">${parts.seconds}</span><span class="time-part dot">.</span><span class="time-part hundredths">${parts.hundredths}</span>
        `; // Kept on one line to avoid extra whitespace between spans

        timeDisplay.innerHTML = newHTML;

        // Update Lap 1 display similarly if laps are visible and element exists
        if (lapsContainer.style.display !== 'none' && lapTimeDisplay) {
                 lapTimeDisplay.innerHTML = newHTML; // Use same structure
        }
    }

    // Snaps the time so that the entire number (MMSSCC) is divisible by 9
    function snapToNearestMultipleOfNine(timeInMillis) {
        // Convert minutes, seconds, and centiseconds into a single number
        const minutes = Math.floor((timeInMillis / (1000 * 60)) % 60);
        const seconds = Math.floor((timeInMillis / 1000) % 60);
        const centiseconds = Math.floor((timeInMillis % 1000) / 10);
        
        // Create the complete number (MMSSCC)
        // For example, 01:23.45 becomes 12345
        const completeNumber = minutes * 10000 + seconds * 100 + centiseconds;
        
        // Find the nearest multiple of 9
        const remainder = completeNumber % 9;
        let targetNumber;

        if (remainder === 0) {
            targetNumber = completeNumber;
        } else if (remainder <= 4) {
            targetNumber = completeNumber - remainder; // Round down
        } else {
            targetNumber = completeNumber + (9 - remainder); // Round up
        }

        // If we ended up with 0, use the first positive multiple of 9 (9)
        if (targetNumber === 0) {
            targetNumber = 9;
        }
        
        // Convert back to individual components
        const targetMinutes = Math.floor(targetNumber / 10000);
        const targetSeconds = Math.floor((targetNumber % 10000) / 100);
        const targetCentiseconds = targetNumber % 100;
        
        // Convert back to milliseconds
        const adjustedMillis = (targetMinutes * 60 * 1000) + 
                             (targetSeconds * 1000) + 
                             (targetCentiseconds * 10);
        
        return adjustedMillis;
    }

    // --- Core Timer Functions ---

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        // Resume from previously elapsed time if any
        startTime = Date.now() - elapsedTime;

        lapsContainer.style.display = 'block'; // Show laps container

        timerInterval = setInterval(() => {
            // No need to store elapsed time continuously, calculate fresh
            const currentElapsedTime = Date.now() - startTime;
            updateDisplay(currentElapsedTime);
        }, 10); // Update every 10ms for hundredths display

        // Update button appearance and state
        startStopBtn.textContent = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');
        resetLapBtn.textContent = 'Lap';
        resetLapBtn.disabled = false;
    }

    function stopTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;

        // Calculate final raw time at the moment stop was pressed
        const finalRawElapsedTime = Date.now() - startTime;

        // Snap the time according to the rules
        let snappedElapsedTime = snapToNearestMultipleOfNine(finalRawElapsedTime);

        // Store final stopped time
        elapsedTime = snappedElapsedTime;

        // Update display with final snapped time
        updateDisplay(elapsedTime);

        // Update button appearance and state
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
        resetLapBtn.textContent = 'Reset';
        // Reset button remains enabled after stopping
    }

    function resetTimer() {
        // Stop the timer if it's running
        if (isRunning) {
             clearInterval(timerInterval);
             timerInterval = null;
             isRunning = false;
        }

        // Reset time variables
        elapsedTime = 0;
        startTime = 0; // Reset start anchor

        // Update display to zero using the span structure
        updateDisplay(elapsedTime);

        // Hide the laps container
        lapsContainer.style.display = 'none';

        // Reset button appearance and state
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
        resetLapBtn.textContent = 'Reset';
        resetLapBtn.disabled = true; // Disable Reset when at zero
    }

    // --- Event Listeners ---
    startStopBtn.addEventListener('click', () => {
        if (isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    resetLapBtn.addEventListener('click', () => {
        if (isRunning) {
            // --- Lap Functionality Placeholder ---
            console.log('Lap button pressed - Lap functionality not implemented.');
            // const currentLapTime = Date.now() - startTime;
            // 1. Record currentLapTime (maybe adjusted based on last lap time)
            // 2. Create a new lap entry element in the lapsContainer
            // 3. Update the main lap display (Lap X) if needed
            // --- End Placeholder ---
        } else {
            // Reset functionality
            resetTimer();
        }
    });

    // --- Initial Setup on Page Load ---
    lapsContainer.style.display = 'none'; // Ensure laps are hidden initially
    resetLapBtn.disabled = true;          // Reset button starts disabled
    updateDisplay(0);                     // Initialize display to 00:00.00 with spans

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js') // Ensure path is correct relative to index.html
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}); // End DOMContentLoaded
