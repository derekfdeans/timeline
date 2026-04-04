console.log('Happy developing ✨')

function setup() {
    updateEventList();
}

const html_form = document.getElementById("add_event");
html_form.addEventListener("submit", function (event) {
    event.preventDefault()

    const formData = new FormData(html_form);

    let currentEvent = {
        name: formData.get('event_name'),
        description: formData.get('event_description'),
    }

    localStorage.setItem(`${formData.get('event_name')}`, JSON.stringify(currentEvent));

    updateEventList();

    html_form.reset();
})

const html_event_list = document.getElementById("event_holder");
function updateEventList() {
    let newHTML = "";
    Object.keys(localStorage).forEach(key => {
        let event = JSON.parse(localStorage[key]);

        newHTML += `<div>
            <h1>${event.name}</h1>
            <p>${event.description}</p>
        </div>`;
    })

    html_event_list.innerHTML = newHTML;
}

setup()