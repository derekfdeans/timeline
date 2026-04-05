console.log('Happy developing ✨')

/* FOR THE FULL REFACTOR

first off: try to clean up the id situation where everything is essentially just {event.name} wrapped in a different way. use a unique id, like date.now() (suggested by claude) for unique keys that don't actually need to be used by me! just keeping track of events

another: separate out functions more; loadEventList shouldn't also handle adding a new div node. bring out the div node so that it can be recycled by the html form to add a task to the list

 */

function setup() {
    loadEventList();
}

const html_form = document.getElementById("add_event");
html_form.addEventListener("submit", function (event) {
    event.preventDefault()

    const formData = new FormData(html_form);

    let currentEvent = {
        name: formData.get('event_name'),
        description: formData.get('event_description'),
        completed: false,
    }

    localStorage.setItem(`${currentEvent.name}`, JSON.stringify(currentEvent));
    console.log(`added new event: ${currentEvent.name}`)

    loadEventList();

    html_form.reset();
})

const html_event_list = document.getElementById("event_holder");

function loadEventList() {
    let newHTML = "";
    Object.keys(localStorage).forEach(key => {
        let event = JSON.parse(localStorage[key]);

        let divPiece = event.completed ? `<div class="completed">` : `<div>`;

        newHTML += `${divPiece}` +
            `<h1>${event.name}</h1>
            <p>${event.description}</p>
            <button id="${event.name}" class="remove_event">remove event</button>
            <button id="${event.name}-complete" class="complete_event">complete event</button>
        </div>`;
    })

    html_event_list.innerHTML = newHTML;
    wireUpRemoveButtons();
    wireUpCompleteButtons();
}

function wireUpCompleteButtons() {
    let completeEventButtons = document.getElementsByClassName("complete_event");

    for (let button of completeEventButtons) {
        button.addEventListener("click", function () {
            let objectKey = button.id.slice(0, button.id.lastIndexOf("-complete"));
            let eventObject = JSON.parse(localStorage.getItem(objectKey));

            eventObject.completed = true;
            localStorage.setItem(objectKey, JSON.stringify(eventObject));
            button.disabled = true;

            button.parentElement.classList.add("completed");
        })
    }
}

function wireUpRemoveButtons() {
    let removeEventButtons = document.getElementsByClassName("remove_event");

    for (let button of removeEventButtons) {
        button.addEventListener("click", function () {
            localStorage.removeItem(`${button.id}`);
            console.log(`removed event: ${button.id}`);

            button.parentElement.remove();
        });
    }
}

setup()