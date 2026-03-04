import { createNotice, updateBotList } from './customElements.js';

const tagBox = document.getElementById("tagBox");
const tagToggle = document.getElementById("tagToggle");

const botList = document.getElementById("botList");
const searchBar = document.getElementById("searchBar");
const sortFromButtons = document.querySelectorAll('button[name="sortfrom"]');

let searchParams = new URL(document.URL).searchParams;
let selectedTags = searchParams.get("tags") ? decodeURIComponent(searchParams.get("tags")).split(",") : [];

updateBotList();

const form = document.querySelector(".sortControls");

searchBar.value = searchParams.get("search");
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const url = new URL(window.location.href);
    const searchValue = searchBar.value.trim();

    if (searchValue) {
        url.searchParams.set("search", searchValue);
    } else {
        url.searchParams.delete("search");
    }

    history.replaceState(null, "", url);
    updateBotList();
});

sortFromButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sortfrom", button.textContent.toLowerCase());

        history.replaceState(null, "", url);
        updateBotList();
    })
})