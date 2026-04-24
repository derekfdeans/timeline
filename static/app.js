/*
CHANGES -- update and complete throughout challenge

generally notice:
    what's stopping me from using this?
    what feels missing/distracting?

cosmetic changes: !
    some colors? give headers different color
better "add next" system - alerts are old !!!
    write a popup window?
a new <div> on top of each task category? still tile style!
    add way to hide/show tasks
add way to edit tasks !!!
    subpage system? click on task to open task editor? or inline add text boxes for input to the current task <div>
figure out more fancy timing system: seconds when less than a minute, minutes when less than an hour, hours when less than a day, etc


eventually add cross-device support -> login system !
    this is all BACKEND WORK
    tools:
        learn authentication - data security
    when done with server, think about WEBSOCKETS ( live updates, fun )


code-side edits: save for end (when features are all added)
REFACTOR.
    ensure readability
 */



import {generatePage, generateFormPiece} from "./ui.js"
import {wireElements, displayTaskLists, wireForm} from "./events.js"

function setup() {
    const root = document.querySelector("body");
    generatePage(root);

    const mainContainer = document.getElementById('mainContent');
    const navContainer = document.getElementById('directoryContainer');

    generateFormPiece(navContainer);
    wireForm(navContainer);

    let listHolder = document.getElementById('listHolder');
    displayTaskLists(listHolder);
    wireElements(mainContainer);

}

// run when document is loaded! more complicated than defer
document.addEventListener("DOMContentLoaded", function () {
    setup();
});