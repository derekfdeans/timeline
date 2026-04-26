/*
CHANGES -- update and complete throughout challenge

generally notice:
    what's stopping me from using this?
    what feels missing/distracting?

cosmetics
    write up a phone view - it's obnoxiously small on phone. @media tag
    rewrite the new list form - buttons are inconsistent
    put a class on everything actually; no default styles

logics/features
    add edit task system - also use dialogs
        click tiles to edit, click mini-list element in sidebar to edit
    add way to hide/show tasks
    rewrite timing system; add a "due," show when due
    add a "time until due" in days, hours, minutes, etc.
    add login backend support (start basic, no security, then add it lol)
    delete list button - for me debugging and for "users"

    long term:
    more intuitive usage; drag around tasks for order, right click/hold to edit/manage, etc.
    websockets for immediate updates across all pages - mild rewrite

code-side
    clean up all ui code; break apart into functions, find reusables
 */

// main goal for 04-25-2026 - write up dialogues

import {generatePage, generateFormPiece, getDataAndRender} from "./ui.js"
import {wireButtons} from "./events.js"

function setup() {
    const root = document.querySelector("body");
    generatePage(root);

    const navContent = document.getElementById('sidebar-list');
    generateFormPiece(navContent);

    getDataAndRender();

    const bodyContent = document.getElementById('content-body');
    wireButtons(bodyContent);
}

// run when document is loaded! more complicated than defer
document.addEventListener("DOMContentLoaded", function () {
    setup();
});