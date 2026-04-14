console.log('Happy developing ✨')

/*
CHANGES -- update and complete throughout challenge

generally notice:
    what's stopping me from using this?
    what feels missing/distracting?

cosmetic changes: !
    some colors? give headers different color
make new category input more beautiful
better "add next" system - can't cancel as-is, alerts are old !!!
    write a popup window?
a new <div> on top of each task category? still tile style !!
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
        figure out sql - true database! (this and auth is key for umich)
    when done with server, think about WEBSOCKETS ( live updates, fun )



code-side edits: save for end (when features are allll added)
REFACTOR.
    split into separate files
    ensure ui, logic, and data split
    ensure readability
    find a "parent function" for traversing, pass in a function for each sub-capability (finding completed, finding length)

 */

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


function generateHeaderPiece(container) {
    let headerPiece = document.createElement("div");
    headerPiece.classList.add("headerPiece");
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
    navPiece.appendChild(darkModeButton);

    let logInButton = document.createElement("button");
    logInButton.textContent = "log in";
    logInButton.dataset.action = "logIn";
    navPiece.appendChild(logInButton);

    headerPiece.appendChild(navPiece);

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
    nameLabel.textContent = "new category: ";
    nameLabel.setAttribute("for", "eventName");

    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "eventName";
    nameInput.name = "eventName";

    form.append(nameLabel, nameInput);

    /*
    let descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "description: ";
    nameLabel.setAttribute("for", "taskDescription");

    let descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.id = "taskDescription";
    descriptionInput.name = "taskDescription";

    form.append(descriptionLabel, descriptionInput);
*/

    let submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.textContent = "add task";

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

function initializeORIGINSArray() {
    if (localStorage.getItem('ORIGINS') === null) {
        localStorage.setItem('ORIGINS', JSON.stringify([]));
    }
}

function setupPageHTML(root) {
    generateHeaderPiece(root);
    generateFormPiece(root);
    generateMiddleHTML(root);
}

function wireUpButtons(container) {
    wireCompleteButton(container);
    wireRemoveButton(container);
    wireAddNextButton(container);
    wireGlobalTaskForm(container);
    wireEditTaskClickEvent(container);
}

function setup() {
    initializeORIGINSArray();

    const root = document.querySelector("body");
    setupPageHTML(root);

    const container = document.getElementById('listHolder');
    wireUpButtons(container);

    // pull this out into function later
    if (localStorage.getItem('darkMode') === null) {
        localStorage.setItem('darkMode', JSON.stringify(true));
    }
    root.classList.add('darkMode');

    let headerContainer = document.getElementById('headerPiece');
    wireDarkModeButton(headerContainer);


    displayTaskLists(container);
}

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


// step through parents, for each generate a "section" (div)
// for lists, load them horizontally in order with flexbox
function displayTaskLists(container) {
    let origins = JSON.parse(localStorage.getItem('ORIGINS'));
    container.textContent = "";
    container.classList.add("taskContainer");

    for (let parentID of origins) {
        let parentTask = JSON.parse(localStorage.getItem(parentID));

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
}

function generateTaskHTML(task, counter, listLength) {
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

function wireEditTaskClickEvent(container) {
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "DIV" && event.target.dataset.type === "task") {
            let taskId = event.target.dataset.id;
            let newDescription = prompt("new description?");

            let currentTask = JSON.parse(localStorage.getItem(taskId));
            currentTask.description = newDescription;

            localStorage.setItem(taskId, JSON.stringify(currentTask));

            displayTaskLists(container);
        }
    })
}

// create new task as a child (next step) of current task
function wireAddNextButton(container) {
    container.addEventListener("click", function (event) {
        // pull up source task and its next, if it has one
        if (event.target.tagName === "BUTTON" && event.target.dataset.action === "addNext") {
            // collect new task data and build object
            let title = prompt("new task name?");
            if (title === null) {
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
            // grab task object and mark completed value true, store again
            const task = JSON.parse(localStorage.getItem(event.target.dataset.id));
            task.completed = true;
            localStorage.setItem(event.target.dataset.id, JSON.stringify(task));

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