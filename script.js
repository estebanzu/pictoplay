document.addEventListener("DOMContentLoaded", () => {
    const FULL_DASH_ARRAY = 283;
    const WARNING_THRESHOLD = 10;
    const ALERT_THRESHOLD = 5;

    const COLOR_CODES = {
        info: { color: "green" },
        warning: { color: "orange", threshold: WARNING_THRESHOLD },
        alert: { color: "red", threshold: ALERT_THRESHOLD }
    };

    const TIME_LIMIT = 60; // Set the time limit to 60 seconds
    let timePassed = 0;
    let timeLeft = TIME_LIMIT;
    let timerInterval = null;
    let remainingPathColor = COLOR_CODES.info.color;

    document.getElementById("app").innerHTML = `
    <div class="base-timer">
      <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
          <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining ${remainingPathColor}"
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
        </g>
      </svg>
      <span id="base-timer-label" class="base-timer__label">${formatTime(timeLeft)}</span>
    </div>
    `;

    function onTimesUp() {
        clearInterval(timerInterval);
        document.getElementById("start-button").style.display = 'none'; // Hide button when time is up
    }

    function startTimer() {
        if (timerInterval) return; // Prevent multiple intervals
        timerInterval = setInterval(() => {
            timePassed += 1;
            timeLeft = TIME_LIMIT - timePassed;
            document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
            setCircleDasharray();
            setRemainingPathColor(timeLeft);

            // Play beep sound in the last 5 seconds
            if (timeLeft <= 5 && timeLeft > 0) {
                document.getElementById("beep-sound").play();
            }

            if (timeLeft === 0) {
                onTimesUp();
            }
        }, 1000);
        document.getElementById("start-button").style.display = 'none'; // Hide start button when timer starts
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        timePassed = 0;
        timeLeft = TIME_LIMIT;
        document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
        document.getElementById("start-button").style.display = 'block'; // Show button when resetting
        setCircleDasharray(); // Reset the timer circle
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    }

    function setRemainingPathColor(timeLeft) {
        const { alert, warning, info } = COLOR_CODES;
        if (timeLeft <= alert.threshold) {
            document.getElementById("base-timer-path-remaining").classList.remove(warning.color);
            document.getElementById("base-timer-path-remaining").classList.add(alert.color);
        } else if (timeLeft <= warning.threshold) {
            document.getElementById("base-timer-path-remaining").classList.remove(info.color);
            document.getElementById("base-timer-path-remaining").classList.add(warning.color);
        }
    }

    function calculateTimeFraction() {
        const rawTimeFraction = timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }

    function setCircleDasharray() {
        const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
        document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
    }

    // Control de los botones
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const changeItemButton = document.getElementById('change-item-button');
    const selector = document.getElementById('selector');

    // Load data for movies, animals, and things
    Promise.all([
        fetch('movies.json').then(response => response.json()).then(data => movies = data),
        fetch('animals.json').then(response => response.json()).then(data => animals = data),
        fetch('things.json').then(response => response.json()).then(data => things = data)
    ]).then(() => {
        updateItem(); // Initializes with an item
        startButton.addEventListener('click', startTimer);
        resetButton.addEventListener('click', () => {
            resetTimer();
            updateItem();
        });
        changeItemButton.addEventListener('click', () => {
            resetTimer();
            updateItem();
        });
        selector.addEventListener('change', () => {
            resetTimer();
            updateItem();
        });
    }).catch(error => console.error('Error al cargar los datos:', error));

    // Function to update the displayed item
    function updateItem() {
        const selectedValue = selector.value;
        const itemArray = selectedValue === 'movies' ? movies : selectedValue === 'animals' ? animals : things;
        const randomItem = getRandomElement(itemArray);
        document.getElementById("item-name").textContent = randomItem;
        document.getElementById("item-name").style.color = "#008080"; // Set teal text color
    }

    function getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color === '#FFFFFF' ? getRandomColor() : color; // Avoid white
    }
});
