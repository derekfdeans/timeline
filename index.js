console.log('Happy developing ✨')

let list_of_events = [];

const html_form = document.getElementById("add_event");
html_form.addEventListener("submit", function (event) {
    event.preventDefault()

    const formData = new FormData(html_form);
    list_of_events.push(formData.get("event_name"));

    console.log(list_of_events);
    updateEventList();

    html_form.reset();
})

const html_event_list = document.getElementById("event_list");
function updateEventList() {
    let newHTML = "";
    for (let event of list_of_events) {
        newHTML += `<li>${event}</li>`;
    }

    html_event_list.innerHTML = newHTML;
}