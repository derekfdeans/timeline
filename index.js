console.log('Happy developing ✨')

function setup() {
    loadEventList();
}

function loadEventList() {
    const allTasks = Object.keys(localStorage);
    allTasks.forEach(key => {
        addToTaskList(key);
    })
}

const addEventForm = document.getElementById("eventAdder");
addEventForm.addEventListener("submit", function (task) {
    task.preventDefault()

    const formData = new FormData(addEventForm);

    const key = String(Date.now());

    let currentTask = {
        id: key,
        name: formData.get('eventName'),
        description: formData.get('taskDescription'),
        completed: false,
    }

    localStorage.setItem(key, JSON.stringify(currentTask));
    addToTaskList(key);

    addEventForm.reset();
})

function addToTaskList(key) {
    const event = JSON.parse(localStorage[key]);
    const divPiece = event.completed ? `<div class="completed">` : `<div>`;

    const container = document.getElementById("container");
    const div = document.createElement("div");

    div.innerHTML = `${divPiece}` +
        `<h1>${event.name}</h1>
            <p>${event.description}</p>
            <button id="${key}-remove" class="removeTask">remove event</button>
            <button id="${key}-complete" class="completeTask">complete event</button>
        </div>`;

    container.appendChild(div);
    wireCompleteButton(key);
    wireRemoveButton(key);
}

function wireCompleteButton(key) {
    let button = document.getElementById(`${key}-complete`);
    button.addEventListener("click", function () {
        const eventObject = JSON.parse(localStorage.getItem(key));

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