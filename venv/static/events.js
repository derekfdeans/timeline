import {generateTaskHTML} from "./ui.js";

export function displayTaskLists(container) {
    fetch('/get-tasks', {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            container.textContent = "";
            container.classList.add("taskContainer");

            for (let list of data) {
                let taskContainer = document.createElement("div");
                taskContainer.classList.add("taskSection");

                for (let task of list.tasks) {
                    taskContainer.append(generateTaskHTML(task));
                }

                container.appendChild(taskContainer);
            }
        })
        .catch(error => console.log(error));
}

export function wireElements(container) {
    wireCompleteButton(container);
    wireRemoveButton(container);
    wireAddNextButton(container);
    wireGlobalTaskForm(container);
    wireDarkModeButton();
}


// FORMS

function wireGlobalTaskForm(container) {
    const addEventForm = document.getElementById("taskAdder");
    addEventForm.addEventListener("submit", function (task) {
        task.preventDefault();

        const form_data = Object.fromEntries(new FormData(addEventForm));

        fetch("/add-task", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form_data),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)

                addEventForm.reset();
                displayTaskLists(container);
            })
            .catch(error => console.log(error));

    });
}


// BUTTONS

// work out with flask/database
function wireDarkModeButton() {
    let button = document.getElementById("darkModeButton");
    button.addEventListener("click", function () {
        let bodySection = document.querySelector("body");
        let darkModeSetting = JSON.parse(localStorage.getItem('darkMode'));

        if (darkModeSetting === true) {
            bodySection.classList.remove("darkMode");
            bodySection.classList.add("lightMode");
            darkModeSetting = false;
        } else if (darkModeSetting === false) {
            bodySection.classList.remove("lightMode");
            bodySection.classList.add("darkMode");
            darkModeSetting = true;
        }
    })
}

function wireAddNextButton(container) {
    container.addEventListener("click", function (event) {
        // pull up source task and its next, if it has one
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "addNext") {
            // collect new task data and build object
            let title = prompt("new task name?");
            if (title === null || title === "") {
                return;
            }
            let description = prompt("new task description?");

            fetch("/add-next", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'newName': title,
                    'newDescription': description,
                    'taskId': event.target.dataset.id,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    displayTaskLists(container);
                })
                .catch(error => console.log(error));
        }
    })
}

function wireCompleteButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "complete") {
            fetch('/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId: event.target.dataset.id,
                    completed: true,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    displayTaskLists(container);
                })
                .catch(error => console.log(error));

        }
    })
}

function wireRemoveButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "remove") {
            fetch('/delete-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'taskId': event.target.dataset.id})
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    displayTaskLists(container);
                })
                .catch(error => console.log(error));
        }
    })
}


// rewrite with flask - missing functionality components
function wireEditTaskClickEvent(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "DIV" && event.target.dataset.type === "task") {

            let taskId = event.target.dataset.id;
            let newDescription = prompt("new description?");

            if (newDescription === null || newDescription === "") {
                return;
            }

            let currentTask = JSON.parse(localStorage.getItem(taskId));
            currentTask.description = newDescription;

            localStorage.setItem(taskId, JSON.stringify(currentTask));

            displayTaskLists(container);
        }
    })
}

