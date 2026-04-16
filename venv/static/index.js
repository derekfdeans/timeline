console.log('Happy developing ✨')

/*
CHANGES -- update and complete throughout challenge

generally notice:
    what's stopping me from using this?
    what feels missing/distracting?

cosmetic changes: !
    some colors? give headers different color
better "add next" system - alerts are old !!!
    write a popup window?
a new <div> on top of each task category? still tile style!
    add way to hide/show tasks
add way to edit tasks !!!
    subpage system? click on task to open task editor? or inline add text boxes for input to the current task <div>
figure out more fancy timing system: seconds when less than a minute, minutes when less than an hour, hours when less than a day, etc


eventually add cross-device support -> login system !
    this is all BACKEND WORK
    tools:
        use python: flask for backend
        starting with localhost to practice,
        railway for lightweight hosting (this is the multi-device piece)
        learn authentication - data security
        figure out SQL - true database! (this and auth is key for Michigan)
    when done with server, think about WEBSOCKETS ( live updates, fun )



code-side edits: save for end (when features are all added)
REFACTOR.
    split into separate files
    ensure readability
    find a "parent function" for traversing, pass in a function for each sub-capability (finding completed, finding length)

 */

/*

main goal for 04/15/2026

ensure ui, logic, and data split

 */


// data object - move to python
class taskObject {
    constructor({name, description = ""} = {}) {
        this.id = String(Date.now());
        this.name = name;
        this.description = description;
        this.completed = false;
        this.before = 0;
        this.after = 0;
    }
}

// all ui components! no logic inside
function generateHeaderPiece(container) {
    let headerPiece = document.createElement("div");
    headerPiece.classList.add("headerPiece");
    headerPiece.classList.add("mainSection");
    headerPiece.id = 'headerPiece';

    let leftSideNav = document.createElement("div");
    let headerText = document.createElement("h1");
    headerText.textContent = "your tasks";
    leftSideNav.appendChild(headerText);
    headerPiece.appendChild(leftSideNav);

    let navPiece = document.createElement("div");
    navPiece.classList.add("navPiece");
    let darkModeButton = document.createElement("button");
    darkModeButton.textContent = "dark mode";
    darkModeButton.dataset.action = "dark";
    darkModeButton.classList.add("button");
    navPiece.appendChild(darkModeButton);

    let logInButton = document.createElement("button");
    logInButton.textContent = "log in";
    logInButton.dataset.action = "logIn";
    logInButton.classList.add("button");
    navPiece.appendChild(logInButton);

    headerPiece.appendChild(navPiece);

    container.appendChild(headerPiece);
}

function generateMiddleHTML(container) {
    let middlePiece = document.createElement("div");
    middlePiece.id = "listHolder";
    middlePiece.classList.add("mainSection");

    container.appendChild(middlePiece);
}

function generateFormPiece(container) {
    let formContainer = document.createElement("div");
    formContainer.id = "formContainer";
    formContainer.classList.add("formContainer");
    formContainer.classList.add("mainSection");

    let form = document.createElement("form");
    form.id = "taskAdder";

    let nameSection = document.createElement("div");
    nameSection.classList.add("nameSection");

    let nameLabel = document.createElement("label");
    nameLabel.textContent = "new category task: ";
    nameLabel.setAttribute("for", "taskName");

    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "taskName";
    nameInput.name = "taskName";

    nameSection.append(nameLabel, nameInput);
    form.appendChild(nameSection);


    let descriptionSection = document.createElement("div");
    let descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "description: ";
    nameLabel.setAttribute("for", "taskDescription");

    let descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.id = "taskDescription";
    descriptionInput.name = "taskDescription";

    descriptionSection.append(descriptionLabel, descriptionInput);
    form.appendChild(descriptionSection);

    let submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.textContent = "add task";
    submitButton.classList.add("button");
    submitButton.classList.add("submitButton");

    form.append(submitButton);

    formContainer.append(form);

    container.append(formContainer);
}

function generateTopPiece(parentTask) {
    // top piece
    let listHeader = document.createElement("div");
    listHeader.classList.add('task', 'taskHeader');
    let completedNote = document.createElement("p");
    completedNote.textContent = `completed: `;
    let completedNotePercent = document.createElement("p");
    let completedResult = calculateCompleted(parentTask)
    completedNotePercent.textContent = `${completedResult}%`;

    if (completedResult === 100) {
        listHeader.classList.add('completed');
    }

    listHeader.appendChild(completedNote);
    listHeader.appendChild(completedNotePercent);


    return listHeader;
}

function setupPageHTML(root) {
    generateHeaderPiece(root);
    generateFormPiece(root);
    generateMiddleHTML(root);
}

function generateTaskHTML(task) {
    let taskContainer = document.createElement("div");

    taskContainer.classList.add("task");
    taskContainer.dataset.type = "task";
    taskContainer.dataset.id = task.id;

    if (task.completed) taskContainer.classList.add("completed");
    if (task.after !== 0) taskContainer.classList.add("hasNext");

    let headerSection = document.createElement("div");
    headerSection.classList.add("taskHeader");

    let taskHeader = document.createElement("h1");
    taskHeader.textContent = task.name;
    headerSection.appendChild(taskHeader);

    let taskCounter = document.createElement("p");
    // taskCounter.textContent = `${counter} / ${listLength}`;
    headerSection.appendChild(taskCounter);

    taskContainer.appendChild(headerSection);


    let taskBody = document.createElement("div");
    taskBody.classList.add("taskBody");

    let dateTime = document.createElement("p");
    let dateOfTask = new Date(+task.id);
    let timeDifferenceInSeconds = Math.floor((Date.now() - dateOfTask) / 1000 / 60);
    dateTime.textContent = `created ${timeDifferenceInSeconds} minutes ago`
    dateTime.classList.add("subHeading");
    taskBody.appendChild(dateTime);

    let taskDescription = document.createElement("p");
    taskDescription.textContent = task.description;
    taskBody.appendChild(taskDescription);

    taskContainer.appendChild(taskBody);


    let buttonSection = document.createElement("div");
    buttonSection.classList.add("buttonSection");

    let removeTaskButton = document.createElement("button");
    removeTaskButton.dataset.id = task.id
    removeTaskButton.dataset.action = "remove";
    removeTaskButton.textContent = "remove";
    removeTaskButton.classList.add("button");
    buttonSection.appendChild(removeTaskButton);

    let completeTaskButton = document.createElement("button");
    completeTaskButton.dataset.id = task.id
    completeTaskButton.dataset.action = "complete";
    completeTaskButton.textContent = "complete";
    completeTaskButton.classList.add("button");
    buttonSection.appendChild(completeTaskButton);

    let addNextTaskButton = document.createElement("button");
    addNextTaskButton.dataset.id = task.id
    addNextTaskButton.dataset.action = "addNext";
    addNextTaskButton.textContent = "add next";
    addNextTaskButton.classList.add("button");
    buttonSection.appendChild(addNextTaskButton);

    taskContainer.append(buttonSection);


    return taskContainer;
}


function wireUpButtons(container) {
    wireCompleteButton(container);
    wireRemoveButton(container);
    wireAddNextButton(container);
    wireGlobalTaskForm(container);
    wireEditTaskClickEvent(container);
}

// try to clean this up; somewhat messy looking
function displayTaskLists(container) {
    fetch('/get-tasks', {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            container.textContent = "";
            container.classList.add("taskContainer");

            let origins = data.origins;
            let tasks = data.tasks;

            // try to rewrite this into python maybe; return a clean format, like nested json for the list
            for (let parentID of origins) {
                let taskSection = document.createElement('div');
                taskSection.classList.add('taskSection');
                let task = generateTaskHTML(JSON.parse(tasks[parentID]));
                console.log(tasks[parentID]);

                taskSection.appendChild(task);
                container.appendChild(taskSection);
            }

            /*
            for (let parentID of origins) {
                let parentTask = tasks[parentID];

                let taskSection = document.createElement('div');
                taskSection.classList.add('taskSection');
                let listHeader = generateTopPiece(parentTask);

                taskSection.appendChild(listHeader);


                let taskList = traverseForDisplay(parentTask);
                for (let task of taskList) {
                    taskSection.appendChild(task);
                }

                container.appendChild(taskSection);
            }
             */
        })
        .catch(error => console.log(error));
}


// rewrite using fetch
function initializeDarkMode(root) {
    if (localStorage.getItem('darkMode') === null) {
        localStorage.setItem('darkMode', JSON.stringify(false));
        root.classList.add('darkMode');
    }
}


function setup() {
    const root = document.querySelector("body");
    setupPageHTML(root);
    initializeDarkMode(root);

    const container = document.getElementById('listHolder');
    wireUpButtons(container);

    let headerContainer = document.getElementById('headerPiece');
    wireDarkModeButton(headerContainer);

    displayTaskLists(container);
}

// logic somewhat; decides cosmetic feature but is a calculation. move to python, use fetch to collect lists
function calculateCompleted(rootNode) {
    let lengthCounter = 0;
    let completedCounter = 0;

    if (rootNode !== null) {
        let current = rootNode;
        lengthCounter += 1;
        if (rootNode.completed === true) {
            completedCounter += 1;
        }

        if (rootNode.after !== 0) {
            while (current.after !== 0) {

                let nextTask = JSON.parse(localStorage.getItem(current.after));
                lengthCounter += 1;
                if (nextTask.completed === true) {
                    completedCounter += 1;
                }

                current = nextTask;
            }
        }
    }

    return Math.floor((completedCounter / lengthCounter) * 100);
}

function findListLength(root) {
    let counter = 0;

    if (root !== null) {
        let current = root;
        counter += 1;

        if (root.after !== 0) {
            while (current.after !== 0) {
                let nextTask = JSON.parse(localStorage.getItem(current.after));
                counter += 1;
                current = nextTask;
            }
        }
    }

    return counter;
}

// most likely to stay, the "for display" is important. maybe don't build the list in the function though, just loop over a list
function traverseForDisplay(task) {
    if (task !== null) { // if there's a first task
        let counter = 1;
        let maxValue = findListLength(task);
        let listOfTasks = new Array(generateTaskHTML(task, counter, maxValue)); // create new list with 1 node

        // now: basically look over the task's "after" value to see if there's an after, and add it to the list
        let current = task;
        while (current.after !== 0) {
            let nextTask = JSON.parse(localStorage.getItem(current.after));
            counter += 1;
            listOfTasks.push(generateTaskHTML(nextTask, counter, maxValue));
            current = nextTask;
        }

        return listOfTasks;

    } else {
        let placeholder = document.createElement("p");
        placeholder.textContent = "nothing to see here!";

        return placeholder;
    }
}


function wireGlobalTaskForm(container) {
    const addEventForm = document.getElementById("taskAdder");
    addEventForm.addEventListener("submit", function (task) {
        task.preventDefault();

        const data = new FormData(addEventForm);

        fetch("/add-task", {
            method: 'POST',
            body: data,
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));

        addEventForm.reset();
        displayTaskLists(container);
    });
}

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
            let newTask = new taskObject({name: title, description: description});

            let sourceTask = JSON.parse(localStorage.getItem(event.target.dataset.id));
            let sourceTaskNext = sourceTask.after ? JSON.parse(localStorage.getItem(sourceTask.after)) : 0;

            sourceTask.after = newTask.id; // source task's next task is current task
            newTask.before = sourceTask.id; // current task's previous is previous task

            // if there is an original next
            if (sourceTaskNext !== 0) {
                sourceTaskNext.before = newTask.id; // the previous task of the original source's next task is the new task's id
                newTask.after = sourceTaskNext.id;
            }

            localStorage.setItem(newTask.id, JSON.stringify(newTask));
            localStorage.setItem(sourceTask.id, JSON.stringify(sourceTask));

            if (sourceTaskNext !== 0) {
                localStorage.setItem(sourceTaskNext.id, JSON.stringify(sourceTaskNext));
            }

            displayTaskLists(container);
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
                }),
            })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.log(error));

            displayTaskLists(container);
        }
    })
}

function wireDarkModeButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "dark") {
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

            localStorage.setItem('darkMode', JSON.stringify(darkModeSetting));
        }
    })
}

function wireRemoveButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "remove") {
            // if this one is pointed to by another task, or points to another, clean it up first
            let currentTask = JSON.parse(localStorage.getItem(event.target.dataset.id));
            let taskBefore = currentTask.before ? JSON.parse(localStorage.getItem(currentTask.before)) : 0;
            let taskAfter = currentTask.after ? JSON.parse(localStorage.getItem(currentTask.after)) : 0;
            let originsList = JSON.parse(localStorage.getItem('ORIGINS'));

            // if it's between two objects
            if (taskBefore && taskAfter) {
                taskBefore.after = taskAfter.id;
                taskAfter.before = taskBefore.id;
            }

            // if it's at end of list
            if (taskBefore && !taskAfter) {
                taskBefore.after = 0;
            }

            // if it's at start of a list and there's a next
            if (!taskBefore && taskAfter) {
                taskAfter.before = 0;

                // make sure to update origins list
                originsList.push(taskAfter.id);
            }

            // remove task from storage and origins list
            originsList = originsList.filter(id => id !== currentTask.id);
            localStorage.removeItem(event.target.dataset.id);

            if (taskBefore !== 0) {
                localStorage.setItem(taskBefore.id, JSON.stringify(taskBefore));
            }
            if (taskAfter !== 0) {
                localStorage.setItem(taskAfter.id, JSON.stringify(taskAfter));
            }

            localStorage.setItem('ORIGINS', JSON.stringify(originsList));

            displayTaskLists(container);
        }
    })
}


// run when document is loaded! more complicated than defer
document.addEventListener("DOMContentLoaded", function () {
    setup();
});