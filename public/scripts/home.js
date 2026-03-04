import { createNotice } from './customElements.js';

const tagBox = document.getElementById("tagBox");
const botList = document.getElementById("botList");
const tagToggle = document.getElementById("tagToggle");
const searchBar = document.getElementById("searchBar");
const sortFromButtons = document.querySelectorAll('button[name="sortfrom"]');

const standardTags = [
    "Male", "Female", "Dominant", "Submissive", "Smut", "Game", "Anime", "Non-Human",
    "Switch", "Fluff", "Multiple", "Scenario", "Magical", "MLM", "WLW", "MalePOV",
    "FemPOV", "AnyPOV", "Angst", "Furry", "Non-Binary", "RPG", "Horror", "Pokémon",
    "Trans", "Sci-Fi", "Robot", "Comedy"
];

let searchParams = new URL(document.URL).searchParams;
let selectedTags = searchParams.get("tags") ? decodeURIComponent(searchParams.get("tags")).split(",") : [];

async function updateBotList() {
    searchParams = new URL(window.location.href).searchParams;

    const pageId = searchParams.get("page") || 1;

    const sortValue = searchParams.get("sortfrom") || "all";
    const foundSortButton = document.getElementById(`sf-${sortValue}`);

    sortFromButtons.forEach((button) => {
        button.classList.add("inactive");
    });

    if (foundSortButton) {
        foundSortButton.classList.remove("inactive");
    }

    // Get bots
    const res = await fetch(`/botlist?search=${searchParams.get("search")}`, { method: "GET" });
    const data = await res.json();

    botList.innerHTML = "";
    if (data) {
        data.data.forEach((value) => {
            const newBotButton = document.createElement("m-ai-bot-card");
            newBotButton.setAttribute("description", value.bio);
            newBotButton.setAttribute("name", value.name);
            newBotButton.setAttribute("src", value.img);

            botList.appendChild(newBotButton);
        })
    } else {
        createNotice("Failed to load bots!");
    }

    console.log(data);

}
updateBotList();

function renderTags() {
    tagBox.innerHTML = "";

    const sortedTags = [
        ...selectedTags.filter(tag => standardTags.includes(tag)),
        ...standardTags.filter(tag => !selectedTags.includes(tag))
    ];

    sortedTags.forEach(tag => {
        const tagButton = document.createElement("button");
        tagButton.textContent = tag;
        tagButton.type = "button";

        if (selectedTags.includes(tag)) tagButton.classList.add("selected");

        tagBox.appendChild(tagButton);

        tagButton.addEventListener("click", () => {
            const index = selectedTags.indexOf(tag);
            if (index > -1) {
                selectedTags.splice(index, 1);
            } else {
                selectedTags.push(tag);
            }

            const url = new URL(window.location.href);

            if (selectedTags.length > 0) {
                url.searchParams.set("tags", selectedTags.join(","));
            } else {
                url.searchParams.delete("tags");
            }

            history.replaceState(null, "", url);

            renderTags();
        });
    });
}
renderTags();

tagToggle.addEventListener("click", (event) => {
    event.preventDefault();

    if (tagBox.classList.contains("open")) {
        tagBox.classList.remove("open");
        tagBox.style.maxHeight = "35px";
        tagToggle.textContent = "⮟";
    } else {
        tagBox.classList.add("open");
        tagBox.style.maxHeight = tagBox.scrollHeight + "px";
        tagToggle.textContent = "⮝";
    }
});

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