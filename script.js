document.addEventListener('DOMContentLoaded', () => {
    const worldClockIcon = document.getElementById('icon-world-clock');
    // --- Elementos do DOM ---
    const timeDisplay = document.getElementById('timeDisplay');
    const lapsContainer = document.querySelector('.laps');
    const lapTimeDisplay = document.getElementById('lapTimeDisplay');
    const startStopBtn = document.getElementById('startStopBtn');
    const resetLapBtn = document.getElementById('resetLapBtn');

    // Detecta Android
    const isAndroid = () => /Android/i.test(navigator.userAgent);

    // Fullscreen (aciona no ícone do relógio mundial, apenas Android)
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    if (worldClockIcon) {
        worldClockIcon.addEventListener('click', () => {
            if (isAndroid()) toggleFullScreen();
        });
    }

    // --- Estado ---
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let isRunning = false;

    // --- Helpers ---
    function getTimeParts(time) {
        const totalMilliseconds = Math.max(0, time);
        const hundredths = String(Math.floor((totalMilliseconds % 1000) / 10)).padStart(2, '0');
        const seconds = String(Math.floor((totalMilliseconds / 1000) % 60)).padStart(2, '0');
        const minutes = String(Math.floor((totalMilliseconds / (1000 * 60)) % 60)).padStart(2, '0');
        return { minutes, seconds, hundredths };
    }

    function updateDisplay(displayTime) {
        const parts = getTimeParts(displayTime);
        const newHTML = `<span class="time-part minutes">${parts.minutes}</span><span class="time-part colon">:</span><span class="time-part seconds">${parts.seconds}</span><span class="time-part comma">.</span><span class="time-part hundredths">${parts.hundredths}</span>`;
        timeDisplay.innerHTML = newHTML;

        // Atualiza a “Volta 1” se visível
        if (lapsContainer.style.display !== 'none' && lapTimeDisplay) {
            lapTimeDisplay.innerHTML = newHTML;
        }
    }

    // Ajuste para que MMSSCC seja múltiplo de 9
    function snapToNearestMultipleOfNine(timeInMillis) {
        const minutes = Math.floor((timeInMillis / (1000 * 60)) % 60);
        const seconds = Math.floor((timeInMillis / 1000) % 60);
        const centiseconds = Math.floor((timeInMillis % 1000) / 10);
        const completeNumber = minutes * 10000 + seconds * 100 + centiseconds;

        const remainder = completeNumber % 9;
        let targetNumber;
        if (remainder === 0) {
            targetNumber = completeNumber;
        } else if (remainder <= 4) {
            targetNumber = completeNumber - remainder; // arredonda p/ baixo
        } else {
            targetNumber = completeNumber + (9 - remainder); // arredonda p/ cima
        }
        if (targetNumber === 0) targetNumber = 9;

        const targetMinutes = Math.floor(targetNumber / 10000);
        const targetSeconds = Math.floor((targetNumber % 10000) / 100);
        const targetCentiseconds = targetNumber % 100;

        return (targetMinutes * 60000) + (targetSeconds * 1000) + (targetCentiseconds * 10);
    }

    // --- Núcleo ---
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startTime = Date.now() - elapsedTime;

        lapsContainer.style.display = 'block';

        timerInterval = setInterval(() => {
            const currentElapsedTime = Date.now() - startTime;
            updateDisplay(currentElapsedTime);
        }, 10);

        // rótulos pt-BR
        startStopBtn.textContent = 'Parar';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');
        resetLapBtn.textContent = 'Volta';
        resetLapBtn.disabled = false;
    }

    function stopTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;

        const finalRawElapsedTime = Date.now() - startTime;
        const snappedElapsedTime = snapToNearestMultipleOfNine(finalRawElapsedTime);
        elapsedTime = snappedElapsedTime;

        updateDisplay(elapsedTime);

        // rótulos pt-BR
        startStopBtn.textContent = 'Iniciar';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
        resetLapBtn.textContent = 'Zerar';
        // permanece habilitado
    }

    function resetTimer() {
        if (isRunning) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
        }

        elapsedTime = 0;
        startTime = 0;

        updateDisplay(elapsedTime);
        lapsContainer.style.display = 'none';

        // rótulos pt-BR
        startStopBtn.textContent = 'Iniciar';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
        resetLapBtn.textContent = 'Zerar';
        resetLapBtn.disabled = true;
    }

    // --- Eventos ---
    startStopBtn.addEventListener('click', () => {
        if (isRunning) { stopTimer(); } else { startTimer(); }
    });

    resetLapBtn.addEventListener('click', () => {
        if (isRunning) {
            // Placeholder de Volta (não implementado)
            console.log('Botão Volta pressionado — funcionalidade de volta não implementada.');
        } else {
            resetTimer();
        }
    });

    // --- Inicialização ---
    lapsContainer.style.display = 'none';
    resetLapBtn.disabled = true;
    updateDisplay(0);

    // --- PWA: Service Worker ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Use caminho relativo (GitHub Pages): ./sw.js
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('ServiceWorker registrado com escopo:', registration.scope);
                })
                .catch(err => {
                    console.log('Falha ao registrar ServiceWorker:', err);
                });
        });
    }
}); // End DOMContentLoaded


