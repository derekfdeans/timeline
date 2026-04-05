console.log('Happy developing ✨')

/* FOR THE FULL REFACTOR

first off: try to clean up the id situation where everything is essentially just {event.name} wrapped in a different way. use a unique id, like date.now() (suggested by claude) for unique keys that don't actually need to be used by me! just keeping track of events

another: separate out functions more; loadEventList shouldn't also handle adding a new div node. bring out the div node so that it can be recycled by the html form to add a task to the list

 */

function setup() {
    loadEventList();
}

function loadEventList() {
    let allTasks = Object.keys(localStorage);
    allTasks.forEach(key => {
        addToTaskList(key);
    })
}

const addEventForm = document.getElementById("eventAdder");
addEventForm.addEventListener("submit", function (task) {
    task.preventDefault()

    const formData = new FormData(addEventForm);

    let currentTask = {
        name: formData.get('eventName'),
        description: formData.get('taskDescription'),
        completed: false,
    }

    let key = String(Date.now());

    localStorage.setItem(key, JSON.stringify(currentTask));
    addToTaskList(key);

    addEventForm.reset();
})

function addToTaskList(key) {
    let event = JSON.parse(localStorage[key]);
    let divPiece = event.completed ? `<div class="completed">` : `<div>`;

    const container = document.getElementById("container");

    container.innerHTML += `${divPiece}` +
        `<h1>${event.name}</h1>
            <p>${event.description}</p>
            <button id="${key}-remove" class="removeTask">remove event</button>
            <button id="${key}-complete" class="completeTask">complete event</button>
        </div>`;

    wireCompleteButton(key);
    wireRemoveButton(key);
}

function wireCompleteButton(key) {
    let button = document.getElementById(`${key}-complete`);
    button.addEventListener("click", function () {
        let eventObject = JSON.parse(localStorage.getItem(key));

        eventObject.completed = true;
        localStorage.setItem(key, JSON.stringify(eventObject));
        button.disabled = true;

        button.parentElement.classList.add("completed");
    })
}

function wireRemoveButton(key) {
    let button = document.getElementById(`${key}-remove`);
    button.addEventListener("click", function () {
        localStorage.removeItem(key);

        button.parentElement.remove();
    })
}

setup()