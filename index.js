console.log('Happy developing ✨')

let list_of_events = [];

const html_form = document.getElementById("add_event");
html_form.addEventListener("submit", function (event) {
    event.preventDefault()

    const formData = new FormData(html_form);
    list_of_events.push({
        eventName: formData.get("event_name"),
        eventDesc: formData.get("event_description"),
    },);

    console.log(list_of_events);
    updateEventList();

    html_form.reset();
})

const html_event_list = document.getElementById("event_holder");
function updateEventList() {
    let newHTML = "";
    for (let event of list_of_events) {
        newHTML += `<div>
        <h1>${event.eventName}</h1>
        <p>${event.eventDesc}</p>
    </div>`;
    }

    html_event_list.innerHTML = newHTML;
}

