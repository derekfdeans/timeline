console.log('Happy developing ✨')

const CONTAINER_ID = 'listHolder'

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
    if (localStorage.getItem('ORIGINS') === null) {
        localStorage.setItem('ORIGINS', JSON.stringify([]));
    }

    let container = document.getElementById(CONTAINER_ID);

    wireGlobalTaskForm();
    newDisplayFormat();

    // wire up the buttons inside container
    wireCompleteButton(container);
    wireRemoveButton(container);
    wireAddNextButton(container);
}

// step through parents, for each generate a "section" (div)
// for lists, load them horizontally in order with flexbox
function newDisplayFormat() {
    let origins = JSON.parse(localStorage.getItem('ORIGINS'));
    let container = document.getElementById(CONTAINER_ID);
    container.textContent = "";

    for (let parentID of origins) {
        let taskSection = document.createElement('div');
        let parentTask = JSON.parse(localStorage.getItem(parentID));

        taskSection.innerHTML = traverseForDisplay(parentTask);

        container.appendChild(taskSection);
    }
}

// generates html for task section
function traverseForDisplay(task) {
    if (task !== null) {
        // grab "child task" text from going to the lower task, if it exists
        let taskAfter = "";
        if (task.after !== 0) {
            let subTask = JSON.parse(localStorage.getItem(task.after));
            taskAfter = traverseForDisplay(subTask);
        }

        // if no more children, then this returns
        let completedPiece = task.completed ? "completed" : "";
        return `<div class="task ${completedPiece}">
                <h1>${task.name}</h1>
                <p>${task.description}</p>
                <button data-id="${task.id}" data-action="remove">remove task</button>
                <button data-id="${task.id}" data-action="complete">complete task</button>
                <button data-id="${task.id}" data-action="add-next">add next</button>
            </div>
            ${taskAfter}`;
    } else {
        return "nothing to see here!";
    }
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

        // add new task to the origin
        let originsList = JSON.parse(localStorage.getItem('ORIGINS'));
        originsList.push(newTask.id);

        // add task and list to storage
        localStorage.setItem('ORIGINS', JSON.stringify(originsList));
        localStorage.setItem(newTask.id, JSON.stringify(newTask));

        // reset form data
        addEventForm.reset();
        newDisplayFormat();
    });
}

// create new task as a child (next step) of current task
function wireAddNextButton(container) {
    container.addEventListener("click", function (event) {
        // pull up source task and its next, if it has one
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "add-next") {
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

            newDisplayFormat();
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

            newDisplayFormat();
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

            newDisplayFormat();
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