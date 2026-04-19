/*
If you want a practical refactor path, do it in this order:

1.Add generateListHTML(list) in ui.js. It should create the section, append the top piece, loop tasks, and return the whole list DOM node.

2.Add generateTaskBlock(task) in ui.js. It should create the wrapper div, append the task card, append the subtask holder, and return it.

3.Shrink displayTaskLists() so it only:
    ◦fetches
    ◦clears container
    ◦loops data
    ◦appends generateListHTML(list)
 */

export function generateListHTML(list) {
    let listSection = document.createElement("div");
    listSection.classList.add("listSection");

    let header = generateTopPiece(list);
    listSection.append(header);

    for (let task of list.tasks) {
        listSection.append(generateTaskBlock(task));
    }

    return listSection;
}

export function generateSubtaskBlock(task) {
    let subtaskContainer = document.createElement("div");
    subtaskContainer.classList.add("subtaskContainer");
    let subtaskHeader = document.createElement('p');
    subtaskHeader.classList.add("subtaskHeader");
    subtaskHeader.textContent = 'subtasks: '
    subtaskContainer.append(subtaskHeader);

    for (let subtask of task.subtasks) {
        subtaskContainer.append(generateSubtaskHTML(subtask));
    }

    return subtaskContainer;
}

export function generateTaskBlock(task) {
    let taskWrapper = document.createElement("div");

    let taskTile = document.createElement("div");
    taskTile.append(generateTaskHTML(task));
    taskWrapper.append(taskTile);

    if (task.subtasks.length !== 0) {
        let subtaskContainer = generateSubtaskBlock(task);
        taskWrapper.append(subtaskContainer);
    }

    return taskWrapper;
}

export function generateHeaderPiece(container) {
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
    darkModeButton.id = "darkModeButton";
    darkModeButton.textContent = "dark mode";

    darkModeButton.classList.add("button");
    navPiece.appendChild(darkModeButton);

    let logInButton = document.createElement("button");
    logInButton.textContent = "log in";
    logInButton.id = 'logInButton';
    logInButton.classList.add("button");
    navPiece.appendChild(logInButton);

    headerPiece.appendChild(navPiece);

    container.appendChild(headerPiece);
}

export function generateMiddleHTML(container) {
    let middlePiece = document.createElement("div");
    middlePiece.id = "listHolder";
    middlePiece.classList.add("mainSection");

    container.appendChild(middlePiece);
}

export function generateFormPiece(container) {
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

export function generateTopPiece(list) {
    let listHeader = document.createElement("div");
    listHeader.classList.add('task', 'taskHeader');

    // TODO finish completed %
    let completedNote = document.createElement("p");
    completedNote.textContent = `completed: `;

    let addNextTaskButton = document.createElement("button");
    addNextTaskButton.dataset.id = list.id
    addNextTaskButton.dataset.action = "addNext";
    addNextTaskButton.textContent = "add next";
    addNextTaskButton.classList.add("button");

    listHeader.appendChild(completedNote);
    listHeader.appendChild(addNextTaskButton);

    return listHeader;
}

export function setupPageHTML(root) {
    generateHeaderPiece(root);
    generateFormPiece(root);
    generateMiddleHTML(root);
}

export function generateTaskHTML(task) {
    let taskContainer = document.createElement("div");

    taskContainer.classList.add("task");
    taskContainer.dataset.type = "task";
    taskContainer.dataset.id = task.id;

    if (task.completed) taskContainer.classList.add("completed");

    let headerSection = document.createElement("div");
    headerSection.classList.add("taskHeader");

    let taskHeader = document.createElement("h1");
    taskHeader.textContent = task.name;
    headerSection.appendChild(taskHeader);

    let taskCounter = document.createElement("p");
    headerSection.appendChild(taskCounter);

    taskContainer.appendChild(headerSection);


    let taskBody = document.createElement("div");
    taskBody.classList.add("taskBody");

    let dateTime = document.createElement("p");
    // patch up "created x minutes ago" later
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

    let newSubtaskButton = document.createElement("button");
    newSubtaskButton.dataset.id = task.id
    newSubtaskButton.dataset.action = "addSubtask";
    newSubtaskButton.textContent = "subtask";
    newSubtaskButton.classList.add("button");
    buttonSection.appendChild(newSubtaskButton);

    taskContainer.append(buttonSection);


    return taskContainer;
}

export function generateSubtaskHTML(subtask) {
    let subtaskButton = document.createElement('button');
    subtaskButton.dataset.id = subtask.id;
    subtaskButton.dataset.action = "completeSubtask";
    subtaskButton.classList.add("subtask");
    subtaskButton.textContent = subtask.content;
    return subtaskButton;
}