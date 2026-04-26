import {getDataAndRender} from "./ui.js";

export function wireButtons(container) {
    wireCompleteButton(container);
    wireRemoveButton(container);
    wireAddNextButton(container);
    wireAddSubtaskButton(container);
    wireCompleteSubtaskButton(container);
}

export function wireForm(container) {
    wireGlobalTaskForm(container);
}

// work out with flask/database
// function wireDarkModeButton() {
//     let button = document.getElementById("darkModeButton");
//     button.addEventListener("click", function () {
//         let bodySection = document.querySelector("body");
//         let darkModeSetting = JSON.parse(localStorage.getItem('darkMode'));
//
//         if (darkModeSetting === true) {
//             bodySection.classList.remove("darkMode");
//             bodySection.classList.add("lightMode");
//             darkModeSetting = false;
//         } else if (darkModeSetting === false) {
//             bodySection.classList.remove("lightMode");
//             bodySection.classList.add("darkMode");
//             darkModeSetting = true;
//         }
//     })
// }
//
// // rewrite with flask - missing functionality components
// function wireEditTaskClickEvent(container) {
//     container.addEventListener("click", function (event) {
//         if (event.target.tagName === "DIV" && event.target.dataset.type === "task") {
//
//             let taskId = event.target.dataset.id;
//             let newDescription = prompt("new description?");
//
//             if (newDescription === null || newDescription === "") {
//                 return;
//             }
//
//             let currentTask = JSON.parse(localStorage.getItem(taskId));
//             currentTask.description = newDescription;
//
//             localStorage.setItem(taskId, JSON.stringify(currentTask));
//
//             displayTaskLists(container);
//         }
//     })
// }

// FORMS
function wireGlobalTaskForm() {
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
                getDataAndRender();
                addEventForm.reset();
            })
            .catch(error => console.log(error));
    });
}

// BUTTONS
function wireAddSubtaskButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "addSubtask") {
            let title = prompt("new task name?");
            if (title === null || title === "") {
                return;
            }

            fetch("/add-subtask", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'newName': title,
                    'taskId': event.target.dataset.id,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    getDataAndRender();
                })
                .catch(error => console.log(error));
        }
    })
}

function wireAddNextButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "addNext") {
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
                    'listId': event.target.dataset.id,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    getDataAndRender();
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
                    getDataAndRender();
                    console.log(data);
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
                body: JSON.stringify({
                    'taskId': event.target.dataset.id
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    getDataAndRender();
                })
                .catch(error => console.log(error));
        }
    })
}

function wireCompleteSubtaskButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "completeSubtask") {
            fetch('/complete-subtask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'subtaskId': event.target.dataset.id,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    getDataAndRender();
                })
                .catch(error => console.log(error));
        }
    })
}
