import {generateListFormDialog, generateNewTaskDialog, getDataAndRender} from "./ui.js";

export function wireButtons(container) {
    wireCompleteButton(container);
    wireRemoveButton(container);
    wireAddNextButton(container);
    wireAddSubtaskButton(container);
    wireCompleteSubtaskButton(container);
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
/*
export function generateListFormDialog() {
    let dialog = document.createElement('dialog');
    dialog.classList.add('dialog');

    let form = document.createElement("form");
    form.id = "taskAdder";
    form.classList.add("form");

    let nameLabel = document.createElement("label");
    nameLabel.textContent = "new list: ";
    nameLabel.setAttribute("for", "listName");

    let nameInput = document.createElement("input");
    nameInput.classList.add('task-tile-button');
    nameInput.type = "text";
    nameInput.id = "listName";
    nameInput.name = "listName";

    form.append(nameLabel, nameInput);

    let submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.formMethod = 'dialog';
    submitButton.textContent = "add list";

    form.append(submitButton);

    dialog.append(form);
    return dialog;
}

 */

// move to ui
function generateFormDialog() {
    // generate the modal on page
    let dialog = generateListFormDialog();
    document.body.appendChild(dialog);
    dialog.showModal();
    return dialog;
}

function wireListDialog(dialog) {
    let dialogButton = document.getElementById('submitButton');
    dialogButton.addEventListener('click', (event) => {
        // then wire up the buttons
        let inputData = document.getElementById("listName");
        event.preventDefault();
        dialog.close(inputData.value);
    })

    dialog.addEventListener("close", function () {
        if (dialog.returnValue === "") {
            console.log("escaped, canceling");
            dialog.remove();
            return;
        }

        fetch("/add-task", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'listName': dialog.returnValue}),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                getDataAndRender();
                dialog.remove();
            })
            .catch(error => console.log(error));
    });
}

export function wireGlobalTaskForm() {
    let dialogButton = document.getElementById('new-list-button');
    dialogButton.addEventListener('click', () => {
        let dialog = generateFormDialog();
        wireListDialog(dialog);
    })
}


// move to ui
function generateTaskDialog(taskId) {
    let dialog = generateNewTaskDialog(taskId);
    document.body.appendChild(dialog);
    dialog.showModal();
    return dialog;
}

function wireAddNextButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "addNext") {
            let dialog = generateTaskDialog(event.target.dataset.id);
            wireAddNextDialog(dialog);
        }
    })
}

function wireAddNextDialog(dialog) {
    let submitButton = document.getElementById(`submit-button-${dialog.dataset.id}`);
    let newName = document.getElementById(`new-name-${dialog.dataset.id}`);
    let newDescription = document.getElementById(`new-description-${dialog.dataset.id}`);

    submitButton.addEventListener('click', () => {
        dialog.close(JSON.stringify({
            'listId': dialog.dataset.id,
            'newName': newName.value,
            'newDescription': newDescription.value,
        }));
    });

    dialog.addEventListener("close", function () {
        if (dialog.returnValue === "") {
            console.log('no value, canceling');
            dialog.remove();
            return;
        }

        let dataObject = JSON.parse(dialog.returnValue);
        fetch("/add-next", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'newName': dataObject.newName,
                'newDescription': dataObject.newDescription,
                'listId': dataObject.listId,
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                getDataAndRender();
                dialog.remove();
            })
            .catch(error => console.log(error));
    })
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
