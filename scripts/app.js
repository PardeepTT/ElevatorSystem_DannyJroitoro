
const elevators = [
    { id: 1, currentFloor: 0, busy: false },
    { id: 2, currentFloor: 0, busy: false },
    { id: 3, currentFloor: 0, busy: false },
    { id: 4, currentFloor: 0, busy: false },
    { id: 5, currentFloor: 0, busy: false },
];

const elevatorQueue = [];

document.querySelectorAll('.call-button').forEach(button => {
    button.addEventListener('click', () => {
        // Prevent click if the button is already in 'waiting' or 'arrived' state
        if (button.classList.contains('waiting') || button.classList.contains('arrived')) {
            return; // Exit early and do nothing
        }

        const floor = parseInt(button.getAttribute('data-floor'));
        handleCallRequest(floor, button);
    });
});

function handleCallRequest(floor, button) {
    button.classList.add('waiting');
    button.innerText = 'Waiting';
    updateWaitingTime(floor); // Show waiting time immediately
    elevatorQueue.push({ floor, button });
    processQueue(); // Process request immediately
}

function updateWaitingTime(floor) {
    // Find the nearest available elevator to calculate waiting time
    const elevator = findNearestElevator(floor);
    const waitingTimeSpan = document.getElementById(`waiting-time-${floor}`);

    if (elevator) {
        const distance = Math.abs(elevator.currentFloor - floor);
        const waitingTime = distance * 1;  // Time in seconds (elevator takes 2 seconds per floor)
        waitingTimeSpan.innerText = `Wait: ${waitingTime}s`;
    }
}

function processQueue() {
    if (elevatorQueue.length === 0) return;

    const nextRequest = elevatorQueue.shift();
    const elevator = findNearestElevator(nextRequest.floor);

    if (elevator) {
        moveElevator(elevator, nextRequest.floor, nextRequest.button);
    } else {
        elevatorQueue.unshift(nextRequest);  // Requeue if all are busy
    }
}

function findNearestElevator(requestFloor) {
    return elevators.filter(e => !e.busy)
        .reduce((closest, elevator) => {
            return (!closest || Math.abs(elevator.currentFloor - requestFloor) < Math.abs(closest.currentFloor - requestFloor))
                ? elevator : closest;
        }, null);
}

const elevatorImages = {
    default: 'assets/elevator.svg',
    moving: 'assets/elevator-red.svg',
    arrived: 'assets/elevator-green.svg',
};

const elevatorSound = new Audio('assets/elevator-bell.wav');

function moveElevator(elevator, floor, button) {
    // Prevent unnecessary movement if already on the requested floor
    if (elevator.currentFloor === floor) {
        elevatorReachedFloor(elevator, button);  // Directly trigger arrival
        return;
    }

    elevator.busy = true;
    const elevatorElement = document.getElementById(`elevator${elevator.id}`);
    const elevatorImg = elevatorElement.querySelector('img');

    elevatorImg.src = 'assets/elevator-red.svg';

    const distance = Math.abs(elevator.currentFloor - floor);
    let remainingTime = distance;

    const waitingTimeSpan = document.getElementById(`waiting-time-${button.getAttribute('data-floor')}`);
    const moveInterval = setInterval(() => {
        remainingTime--;
        waitingTimeSpan.innerText = `Wait: ${remainingTime}s`;
        elevator.currentFloor += (elevator.currentFloor < floor) ? 1 : -1;
        elevatorElement.style.transform = `translateY(-${elevator.currentFloor * 60}px)`;

        if (remainingTime <= 0) {
            clearInterval(moveInterval);
            if(elevator.currentFloor === floor) {
                setTimeout(() => {
                    elevatorReachedFloor(elevator, button);
                },1000)            
            }

        }
    }, 1000);
}

function elevatorReachedFloor(elevator, button) {
    const elevatorElement = document.getElementById(`elevator${elevator.id}`);
    const elevatorImg = elevatorElement.querySelector('img');

    elevatorSound.play();

    elevatorImg.src = elevatorImages.arrived;
    button.classList.remove('waiting');
    button.classList.add('arrived');
    button.innerText = 'Arrived';

    setTimeout(() => {
        resetElevator(elevator, button);
    }, 2000);  // 2-second delay
}

function resetElevator(elevator, button) {
    const elevatorElement = document.getElementById(`elevator${elevator.id}`);
    const elevatorImg = elevatorElement.querySelector('img');
    
    elevatorImg.src = elevatorImages.default;

    const waitingTimeSpan = document.getElementById(`waiting-time-${button.getAttribute('data-floor')}`);
    if (waitingTimeSpan) {
        waitingTimeSpan.innerText = '';  // Clear the text
    }

    button.classList.remove('arrived', 'waiting');
    button.innerText = 'Call';

    elevator.busy = false;
    processQueue();  // Process next request
}