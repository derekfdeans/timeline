import {wireGlobalTaskForm} from "./events.js";

// adding a new project
export function generateListFormDialog() {
    let dialog = document.createElement('dialog');
    dialog.classList.add('dialog');
    dialog.id = 'form-dialog';

    let dialogHolder = document.createElement('div');

    let dialogHeader = document.createElement("p");
    dialogHeader.textContent = "create new list";
    dialogHeader.classList.add('dialog-header');
    dialogHolder.appendChild(dialogHeader);

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
    submitButton.id = "submitButton";
    submitButton.formMethod = 'dialog';
    submitButton.textContent = "add list";

    form.append(submitButton);

    dialogHolder.append(form);
    dialog.append(dialogHolder);
    return dialog;
}

// adding a new task
export function generateNewTaskDialog(taskId) {
    let dialog = document.createElement('dialog');
    dialog.classList.add('dialog');
    dialog.id = 'new-task-dialog';
    dialog.dataset.id = taskId;

    let dialogContainer = document.createElement("div");
    dialogContainer.classList.add('dialog-holder');

    let dialogHeader = document.createElement("p");
    dialogHeader.textContent = "creating new task";
    dialogHeader.classList.add('dialog-header');
    dialogContainer.appendChild(dialogHeader);

    let form = document.createElement("form");
    form.id = "new-task-form";
    form.classList.add("form");

    let nameInputSection = document.createElement("div");
    nameInputSection.classList.add('form-input-section');

    let nameLabel = document.createElement("label");
    nameLabel.textContent = "new task: ";
    nameLabel.setAttribute("for", "new-task-name");

    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `new-name-${taskId}`;

    form.append(nameLabel, nameInput);


    let descriptionInputSection = document.createElement("div");
    descriptionInputSection.classList.add('form-input-section');

    let descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "description: ";
    descriptionLabel.setAttribute("for", "new-task-description");

    let descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.id = `new-description-${taskId}`;

    form.append(descriptionLabel, descriptionInput);

    let submitButton = document.createElement('button');
    submitButton.type = "submit";
    submitButton.formMethod = 'dialog';
    submitButton.textContent = 'add new task';
    submitButton.id = `submit-button-${taskId}`;
    form.append(submitButton);

    dialogContainer.append(form);
    dialog.append(dialogContainer);
    return dialog;
}

// adding a subtask (or somehow do this inline; have a text field popup and then "enter" converts it to task)

// later: editing tasks dialog (click task to edit?)



export function getDataAndRender() {
    fetch('/get-tasks', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            // sidebar piece
            let sidebarList = document.getElementById('sidebar-list');
            sidebarList.textContent = '';
            generateFormPiece(sidebarList);
            wireGlobalTaskForm();
            generateSidebarList(sidebarList, data);

            // main content piece
            let mainSection = document.getElementById('content-body');
            mainSection.textContent = '';
            generateListBlock(mainSection, data);
        })
        .catch(error => console.log(error));
}


export function generateListBlock(container, data) {
    for (let list of data) {
        container.append(generateListHTML(list));
    }
}

export function generateListHTML(list) {
    let listSection = document.createElement("div");
    listSection.classList.add("list-container");

    let header = generateTopPiece(list);
    listSection.append(header);

    for (let task of list.tasks) {
        listSection.append(generateTaskBlock(task));
    }

    return listSection;
}

export function generateTopPiece(list) {
    let listHeader = document.createElement("div");
    listHeader.classList.add('list-header-tile');

    let header = document.createElement("p");
    header.textContent = list.name;
    header.classList.add('list-header-text');
    listHeader.append(header);

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

export function generateTaskBlock(task) {
    let taskWrapper = document.createElement("div");
    taskWrapper.classList.add('task-container');


    let taskTile = document.createElement("div");
    taskTile.append(generateTaskHTML(task));
    taskWrapper.append(taskTile);

    if (task.subtasks.length !== 0) {
        let subtaskContainer = generateSubtaskBlock(task);
        taskWrapper.append(subtaskContainer);
    }

    return taskWrapper;
}

export function generateTaskHTML(task) {
    let taskContainer = document.createElement("div");

    taskContainer.classList.add("task-main-tile");
    taskContainer.dataset.type = "task";
    taskContainer.dataset.id = task.id;

    if (task.completed) taskContainer.classList.add("completed");

    let headerSection = document.createElement("div");
    headerSection.classList.add("task-tile-header");

    let taskHeader = document.createElement("p");
    taskHeader.textContent = task.name;
    headerSection.appendChild(taskHeader);

    let taskCounter = document.createElement("p");
    headerSection.appendChild(taskCounter);

    taskContainer.appendChild(headerSection);


    let taskBody = document.createElement("div");
    taskBody.classList.add("task-tile-body");

    let dateTime = document.createElement("p");
    // patch up "created x minutes ago" later
    taskBody.appendChild(dateTime);

    let taskDescription = document.createElement("p");
    taskDescription.textContent = task.description;
    taskBody.appendChild(taskDescription);

    taskContainer.appendChild(taskBody);


    let buttonSection = document.createElement("div");
    buttonSection.classList.add("task-tile-button-container");

    let removeTaskButton = document.createElement("button");
    removeTaskButton.dataset.id = task.id
    removeTaskButton.dataset.action = "remove";
    removeTaskButton.textContent = "remove";
    removeTaskButton.classList.add("task-tile-button", "btn-danger");
    buttonSection.appendChild(removeTaskButton);

    let completeTaskButton = document.createElement("button");
    completeTaskButton.dataset.id = task.id
    completeTaskButton.dataset.action = "complete";
    completeTaskButton.textContent = "complete";
    completeTaskButton.classList.add("task-tile-button", "btn-positive");
    buttonSection.appendChild(completeTaskButton);

    let newSubtaskButton = document.createElement("button");
    newSubtaskButton.dataset.id = task.id
    newSubtaskButton.dataset.action = "addSubtask";
    newSubtaskButton.textContent = "subtask";
    newSubtaskButton.classList.add("task-tile-button", "btn-secondary");
    buttonSection.appendChild(newSubtaskButton);

    taskContainer.append(buttonSection);


    return taskContainer;
}

export function generateSubtaskBlock(task) {
    let subtaskContainer = document.createElement("div");
    subtaskContainer.classList.add("task-subtask-container");
    let subtaskHeader = document.createElement('p');
    subtaskHeader.classList.add("task-subtask-header");
    subtaskHeader.textContent = 'subtasks: '
    subtaskContainer.append(subtaskHeader);

    for (let subtask of task.subtasks) {
        subtaskContainer.append(generateSubtaskHTML(subtask));
    }

    return subtaskContainer;
}

export function generateSubtaskHTML(subtask) {
    let subtaskButton = document.createElement('button');
    subtaskButton.dataset.id = subtask.id;
    subtaskButton.dataset.action = "completeSubtask";
    subtaskButton.classList.add("task-subtask-tile");
    subtaskButton.textContent = subtask.content;
    return subtaskButton;
}


export function generatePage(root) {
    let page = document.createElement("div");
    page.classList.add('page');

    let navigationSection = generateNavigation();
    let mainContent = generateMainContent();

    page.append(navigationSection, mainContent);
    root.append(page);
}

function generateNavigation() {
    let navSidebar = document.createElement("div");
    navSidebar.classList.add('sidebar');
    navSidebar.id = 'nav-content';

    let sidebarHeader = document.createElement("div");
    sidebarHeader.classList.add('sidebar-header');
    generateSidebarHeader(sidebarHeader);

    let sidebarList = document.createElement("div");
    sidebarList.classList.add('sidebar-list-container');
    sidebarList.id = 'sidebar-list';

    let sidebarFooter = document.createElement("div");
    sidebarFooter.classList.add('sidebar-footer');
    generateSidebarFooter(sidebarFooter);

    navSidebar.append(sidebarHeader, sidebarList, sidebarFooter);
    return navSidebar;
}

function generateSidebarHeader(sidebarHeader) {
    let header = document.createElement("h1");
    header.textContent = "timeline";
    header.classList.add('sidebar-header-text');
    sidebarHeader.append(header);
}

function generateSidebarList(sidebarList, data) {
    for (let list of data) {
        sidebarList.append(generateSidebarListPiece(list));
    }
}

function generateSidebarListPiece(list) {
    let listHolder = document.createElement("div");
    listHolder.classList.add('sidebar-list');

    let listHeader = document.createElement("div");
    listHeader.classList.add('sidebar-list-header');

    let listName = document.createElement("p");
    listName.textContent = list.name;

    let listCompleted = document.createElement("p");
    listCompleted.textContent = "% done";

    listHeader.append(listName, listCompleted);
    listHolder.append(listHeader);

    let bulletedList = document.createElement('div');
    bulletedList.classList.add('sidebar-bulleted-list');

    for (let task of list.tasks) {
        let listElement = document.createElement("div");
        listElement.classList.add('sidebar-list-element');

        let taskText = document.createElement("p");
        taskText.textContent = task.name;

        let taskComplete = document.createElement("input");
        taskComplete.type = 'checkbox';
        taskComplete.dataset.id = task.id;
        taskComplete.textContent = "done";

        listElement.append(taskComplete, taskText);
        bulletedList.append(listElement);
    }

    listHolder.append(bulletedList);
    return listHolder;
}

function generateSidebarFooter(sidebarFooter) {
    let avatar = document.createElement("div");
    avatar.classList.add('avatar');
    avatar.textContent = 'user'

    let settingsButton = document.createElement("button");
    settingsButton.classList.add('settings-button');
    settingsButton.textContent = 'settings';

    sidebarFooter.append(avatar, settingsButton);
}

function generateMainContent() {
    let mainContent = document.createElement("div");
    mainContent.classList.add('main-content');
    mainContent.id = 'main-content';

    let contentHeader = document.createElement("div");
    contentHeader.classList.add('main-content-header-container');

    let headerText = document.createElement("h1");
    headerText.textContent = 'all tasks';
    contentHeader.append(headerText);

    let contentBody = document.createElement('div');
    contentBody.classList.add('main-content-body');
    contentBody.id = 'content-body';

    mainContent.append(contentHeader, contentBody);
    return mainContent;
}


export function generateFormPiece(container) {
    let button = document.createElement("button");
    button.textContent = 'create list';
    button.id = 'new-list-button';
    container.append(button);
}
