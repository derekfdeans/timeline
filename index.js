console.log('Happy developing ✨')

function generateHeaderPiece(container) {
    let headerPiece = document.createElement("div");
    headerPiece.id = "headerPiece";

    let headerText = document.createElement("h1");
    headerText.textContent = "your tasks";
    headerPiece.appendChild(headerText);

    container.appendChild(headerPiece);
}

function generateMiddleHTML(container) {
    let middlePiece = document.createElement("div");
    middlePiece.id = "listHolder";

    container.appendChild(middlePiece);
}

function generateFormPiece(container) {
    let formContainer = document.createElement("div");
    formContainer.id = "formContainer";

    let form = document.createElement("form");
    form.id = "eventAdder";

    let nameLabel = document.createElement("label");
    nameLabel.textContent = "new task: ";
    nameLabel.setAttribute("for", "eventName");

    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "eventName";
    nameInput.name = "eventName";

    form.append(nameLabel, nameInput);

    let descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "description: ";
    nameLabel.setAttribute("for", "taskDescription");

    let descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.id = "taskDescription";
    descriptionInput.name = "taskDescription";

    form.append(descriptionLabel, descriptionInput);

    let submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.textContent = "add task";

    form.append(submitButton);

    formContainer.append(form);

    container.append(formContainer);
}


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

function initializeORIGINSArray() {
    if (localStorage.getItem('ORIGINS') === null) {
        localStorage.setItem('ORIGINS', JSON.stringify([]));
    }
}

function setupPageHTML(root) {
    generateHeaderPiece(root);
    generateMiddleHTML(root);
    generateFormPiece(root);
}

function wireUpButtons(container) {
    wireCompleteButton(container);
    wireRemoveButton(container);
    wireAddNextButton(container);
    wireGlobalTaskForm(container);
}

function setup() {
    initializeORIGINSArray();

    const root = document.querySelector("body");
    setupPageHTML(root);

    const container = document.getElementById('listHolder');

    wireUpButtons(container);

    displayTaskLists(container);
}

// step through parents, for each generate a "section" (div)
// for lists, load them horizontally in order with flexbox
function displayTaskLists(container) {
    let origins = JSON.parse(localStorage.getItem('ORIGINS'));
    container.textContent = "";
    container.classList.add("taskContainer");

    for (let parentID of origins) {
        let taskSection = document.createElement('div');
        taskSection.classList.add('taskSection');

        let parentTask = JSON.parse(localStorage.getItem(parentID));

        let taskList = traverseForDisplay(parentTask);
        for (let task of taskList) {
            console.log(`current addition:`);
            console.log(task);
            taskSection.appendChild(task);
        }

        container.appendChild(taskSection);
    }
}

function generateTaskHTML(task, counter, listLength) {
    let taskContainer = document.createElement("div");
    taskContainer.classList.add("task");
    if (task.completed) taskContainer.classList.add("completed");
    if (task.after !== 0) taskContainer.classList.add("hasNext");

    let headerSection = document.createElement("div");
    headerSection.classList.add("taskHeader");

    let taskHeader = document.createElement("h1");
    taskHeader.textContent = task.name;
    headerSection.appendChild(taskHeader);

    let taskCounter = document.createElement("p");
    taskCounter.textContent = `${counter} / ${listLength}`;
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
    buttonSection.appendChild(removeTaskButton);

    let completeTaskButton = document.createElement("button");
    completeTaskButton.dataset.id = task.id
    completeTaskButton.dataset.action = "complete";
    completeTaskButton.textContent = "complete";
    buttonSection.appendChild(completeTaskButton);

    let addNextTaskButton = document.createElement("button");
    addNextTaskButton.dataset.id = task.id
    addNextTaskButton.dataset.action = "addNext";
    addNextTaskButton.textContent = "add next";
    buttonSection.appendChild(addNextTaskButton);

    taskContainer.append(buttonSection);



    return taskContainer;
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

// goal: return a list of taskContainers, essentially a big collection of divs each for a task
function traverseForDisplay(task) {
    if (task !== null) { // if there's a first task
        let counter = 1;
        let maxValue = findListLength(task);
        let listOfTasks = new Array(generateTaskHTML(task, counter, maxValue)); // create new list with node

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

// for "global tasks" - no nesting before or after
function wireGlobalTaskForm(container) {
    const addEventForm = document.getElementById("eventAdder");
    addEventForm.addEventListener("submit", function (task) {
        // prevent reload, grab data from form
        task.preventDefault()
        const formData = new FormData(addEventForm);

        // use data to create a new task
        let newTask = new taskObject({
            name: formData.get('eventName'),
            description: formData.get('taskDescription'),
        });

        // add new task to the origin
        let originsList = JSON.parse(localStorage.getItem('ORIGINS'));
        originsList.push(newTask.id);

        // add task and list to storage
        localStorage.setItem('ORIGINS', JSON.stringify(originsList));
        localStorage.setItem(newTask.id, JSON.stringify(newTask));

        // reset form data
        addEventForm.reset();
        displayTaskLists(container);
    });
}

// create new task as a child (next step) of current task
function wireAddNextButton(container) {
    container.addEventListener("click", function (event) {
        // pull up source task and its next, if it has one
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "addNext") {
            console.log("adding next...");
            let sourceTask = JSON.parse(localStorage.getItem(event.target.dataset.id));
            let sourceTaskNext = sourceTask.after ? JSON.parse(localStorage.getItem(sourceTask.after)) : 0;

            // collect new task data and build object
            let title = prompt("new task name?");
            let description = prompt("new task description?");
            let newTask = new taskObject({name: title, description: description});

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
            console.log("completing task...");

            // grab task object and mark completed value true, store again
            const task = JSON.parse(localStorage.getItem(event.target.dataset.id));
            task.completed = true;
            localStorage.setItem(event.target.dataset.id, JSON.stringify(task));

            displayTaskLists(container);
        }
    })
}

function wireRemoveButton(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "remove") {
            console.log("removing task...");

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

                // update origins list
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




/*
function loadEventList() {
    const taskHolder = document.getElementById("container");
    taskHolder.innerHTML = "";

    const allTasks = Object.keys(localStorage);
    allTasks.forEach(key => {
        addToTaskList(taskHolder.id, key);
    });
}

 */

/*
function addToTaskList(locationID, key) {
    // grab container, current task to add
    const task = JSON.parse(localStorage[key]);
    const container = document.getElementById(locationID);

    // set up HTML content for task
    const taskSection = document.createElement("div");
    const completedClass = task.completed ? "completed" : "";
    taskSection.innerHTML =
        `<div class="task ${completedClass}">
            <h1>${task.name}, id: ${task.id}</h1>
            <p>${task.description}</p>
            <p>previous task: ${task.before}, next task: ${task.after}</p>
            <button id="${key}-remove">remove task</button>
            <button id="${key}-complete">complete task</button>
            <button id="${key}-after">add next</button>
            <button id="${key}-display">display tree</button>
        </div>`;

    // visually add task to container
    container.appendChild(taskSection);

    // debug button
    wireDisplayButton(key);
}
*/

/*
// DEBUG TOOLS
// essentially traverse a nested list, using "after" as steps
function displayDataStructureFromNode(key) {
    console.log("displaying tree");

    // generate container for list
    let listHolder = document.getElementById("listHolder");

    // grab the start object from key
    let start = JSON.parse(localStorage.getItem(key));

    // generate HTML from recursive function
    listHolder.innerHTML = traverse(start);
}

// recursive function that steps through children, generating a list
function traverse(node) {
    // grab "child node" text from going to the lower node, if it exists
    let childNode = "";
    if (node.after !== 0) {
        let subNode = JSON.parse(localStorage.getItem(node.after));
        childNode = traverse(subNode);
    }

    // if no more children, then this returns; a piece of the list with the child nested inside
    return `<ul>
        <li>${node.name}</li>
        ${childNode}
    </ul>`;
}

// to generate a visual tree below all the tasks, step through one of the nodes (input is the "start", top). this is debug, not for user
function wireDisplayButton(key) {
    let button = document.getElementById(`${key}-display`);
    button.addEventListener("click", function () {
        displayDataStructureFromNode(key);
    });
}

 */




setup()