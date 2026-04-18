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

// don't forget about this lol
export function generateTopPiece() {
    // top piece
    let listHeader = document.createElement("div");
    listHeader.classList.add('task', 'taskHeader');
    let completedNote = document.createElement("p");
    completedNote.textContent = `completed: `;

    listHeader.appendChild(completedNote);

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

    let addNextTaskButton = document.createElement("button");
    addNextTaskButton.dataset.id = task.id
    addNextTaskButton.dataset.action = "addNext";
    addNextTaskButton.textContent = "add next";
    addNextTaskButton.classList.add("button");
    buttonSection.appendChild(addNextTaskButton);

    taskContainer.append(buttonSection);


    return taskContainer;
}
