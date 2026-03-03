import { createNotice } from './customElements.js';

const tagBox = document.getElementById("tagBox");
const tagToggle = document.getElementById("tagToggle");
const searchBar = document.getElementById("searchBar");

const standardTags = [
    "Male", "Female", "Dominant", "Submissive", "Smut", "Game", "Anime", "Non-Human",
    "Switch", "Fluff", "Multiple", "Scenario", "Magical", "MLM", "WLW", "MalePOV",
    "FemPOV", "AnyPOV", "Angst", "Furry", "Non-Binary", "RPG", "Horror", "Pokémon",
    "Trans", "Sci-Fi", "Robot", "Comedy"
];

const searchParams = new URL(document.URL).searchParams;
let selectedTags = searchParams.get("tags") ? decodeURIComponent(searchParams.get("tags")).split(",") : [];

function updateBotList() {
    const pageId = searchParams.get("page") || 1;
}

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
})

const foundSortButton = document.getElementById(`sf-${searchParams.get("sortfrom")}`)
if (foundSortButton) {
    foundSortButton.classList.remove("inactive");
} else {
    createNotice(`Sorting type "${searchParams.get("sortfrom")}" doesn't exist!`)
}

let timeout;
searchBar.addEventListener("input", (event) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        const value = searchBar.value.trim();
        console.log("Search after pause:", value);
    }, 300);

    updateBotList();
});

const form = document.querySelector(".sortControls");

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