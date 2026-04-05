console.log('Happy developing ✨')

// this hasn't been implemented i just wrote this one line
let originTasks = [];

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

function setup() {
    loadEventList();
    wireGlobalTaskForm();
}

// for "global tasks" - no nesting before or after
function wireGlobalTaskForm() {
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

        // add task to storage and display it
        localStorage.setItem(newTask.id, JSON.stringify(newTask));
        loadEventList();

        // reset form data
        addEventForm.reset();
    });
}

function loadEventList() {
    const taskHolder = document.getElementById("container");
    taskHolder.innerHTML = "";

    const allTasks = Object.keys(localStorage);
    allTasks.forEach(key => {
        addToTaskList(taskHolder.id, key);
    });
}

function addToTaskList(locationID, key) {
    // grab container, current task to add
    const task = JSON.parse(localStorage[key]);
    const container = document.getElementById(locationID);

    // set up HTML content for task
    const taskSection = document.createElement("div");
    const completedPiece = task.completed ? `<div class="completed">` : `<div>`;
    taskSection.innerHTML = `${completedPiece}` +
        `<h1>${task.name}, id: ${task.id}</h1>
            <p>${task.description}</p>
            <p>previous task: ${task.before}, next task: ${task.after}</p>
            <button id="${key}-remove">remove task</button>
            <button id="${key}-complete">complete task</button>
            <button id="${key}-after">add next</button>
            <button id="${key}-display">display tree</button>
        </div>`;

    // visually add task to container
    container.appendChild(taskSection);

    // wire up all buttons with js
    wireCompleteButton(key);
    wireRemoveButton(key);
    wireAddNextButton(key);

    // debug button
    wireDisplayButton(key);
}

// create new task as a child (next step) of current task
function wireAddNextButton(key) {
    let button = document.getElementById(`${key}-after`);
    button.addEventListener("click", function () {
        // pull up source task and its next, if it has one
        let sourceTask = JSON.parse(localStorage.getItem(key));
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
    })
}

function wireCompleteButton(key) {
    let button = document.getElementById(`${key}-complete`);
    button.addEventListener("click", function () {
        // grab task object and mark completed value true, store again
        const task = JSON.parse(localStorage.getItem(key));
        task.completed = true;
        localStorage.setItem(key, JSON.stringify(task));

        // visually update the task (if page isn't going to be refreshed)
        button.parentElement.classList.add("completed");
    })
}

function wireRemoveButton(key) {
    let button = document.getElementById(`${key}-remove`);
    button.addEventListener("click", function () {
        // if this one is pointed to by another task, or points to another, clean it up first
        let currentTask = JSON.parse(localStorage.getItem(key));
        let beforeObject = currentTask.before ? JSON.parse(localStorage.getItem(currentTask.before)) : 0;
        let afterObject = currentTask.after ? JSON.parse(localStorage.getItem(currentTask.after)) : 0;

        // if it's between two objects
        if (beforeObject && afterObject) {
            beforeObject.after = afterObject.id;
            afterObject.before = beforeObject.id;
        }

        // if it's at end of list
        if (beforeObject && !afterObject) {
            beforeObject.after = 0;
        }

        // if it's at start of list
        if (!beforeObject && afterObject) {
            afterObject.before = 0;
        }

        // remove task from storage
        localStorage.removeItem(key);

        if (beforeObject !== 0) {
            localStorage.setItem(beforeObject.id, JSON.stringify(beforeObject));
        }
        if (afterObject !== 0) {
            localStorage.setItem(afterObject.id, JSON.stringify(afterObject));
        }

        // visually remove task from list (if page won't refresh)
        button.parentElement.remove();
    })
}



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

setup()