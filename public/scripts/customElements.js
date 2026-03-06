function formatNumber(n) {
    const absN = Math.abs(n);

    if (absN >= 1_000_000_000) {
        return +(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + 'B';
    } else if (absN >= 1_000_000) {
        return +(n / 1_000_000).toFixed(1).replace(/\.0$/, "") + 'M';
    } else if (absN >= 1_000) {
        return +(n / 1_000).toFixed(1).replace(/\.0$/, "") + 'K';
    } else {
        return n.toString();
    }
}

const placeholder_img = "https://pub-565faf2130f64e41963a6ebebd514d02.r2.dev/images/blind_bot_785635f1-c993-49df-98a5-c97fe91d8c30"
const placeholder_text = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aperiam, ab nesciunt. Dignissimos id fugit odit nostrum temporibus natus cumque dolorem?";

let searchParams = new URL(document.URL).searchParams;
let selectedTags = searchParams.get("tags") ? decodeURIComponent(searchParams.get("tags")).split(",") : [];
let maxTags;

export async function updateBotList() {
    const sortFromButtons = document.querySelectorAll('button[name="sortfrom"]');
    if (!sortFromButtons) { return };
    if (!document.getElementById("botList")) { return };

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
    const res = await fetch(`/botlist?search=${searchParams.get("search")}&tags=${searchParams.get("tags")}`, { method: "GET" });
    const data = await res.json();

    botList.innerHTML = "";
    if (data) {
        data.data.forEach((value) => {
            const newBotButton = document.createElement("m-ai-bot-card");
            newBotButton.setAttribute("messages", value.messages);
            newBotButton.setAttribute("description", value.bio);
            newBotButton.setAttribute("name", value.name);
            newBotButton.setAttribute("tags", value.tags || "");
            newBotButton.setAttribute("src", value.img);

            botList.appendChild(newBotButton);
        })
    } else {
        createNotice("Failed to load bots!");
    }

    console.log(data);

}
// For tags
const tagToggle = document.getElementById("tagToggle");
const standardTags = [
    "Male", "Female", "Dominant", "Submissive", "Smut", "Game", "Anime", "Non-Human",
    "Switch", "Fluff", "Multiple", "Scenario", "Magical", "MLM", "WLW", "MalePOV",
    "FemPOV", "AnyPOV", "Angst", "Furry", "Non-Binary", "RPG", "Horror", "Pokémon",
    "Trans", "Sci-Fi", "Robot", "Comedy"
];

class MAIHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = !this.hasAttribute("empty") ? `
    <header>
        <m-ai-dropdown hamburger>
            <a href="create">Create Bot</a>
            <a href="bots">Your Bots</a>
            <a href="chats">Your Chats</a>
        </m-ai-dropdown>

        <h1>${this.getAttribute("header") || ""}</h1>
        <div class="sub-menu">
            <button class="bell">
                <img src="/icons/bell.png" alt="Notifications">
            </button>
            <button>
                <img src="${placeholder_img}" alt="Profile">
            </button>
        </div>
    </header>
    ` : `<header></header>`;
    }
}
customElements.define("m-ai-header", MAIHeader);

class MAIFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            
        </footer>
        ` // <p>&copy;2026 MlemmyAI</p> // this is inside..

    }
}
customElements.define("m-ai-footer", MAIFooter);

class MAIDropdown extends HTMLElement {
    connectedCallback() {
        let title = this.getAttribute("title") || "";
        const links = this.innerHTML;

        if (this.hasAttribute("hamburger")) {
            title = `<img class="hamburger" src="/icons/dropdown.png" alt="User Profile">`;
        }

        this.innerHTML = `
            <div class="dropdown">
                <button class="dropdown-btn">${title}</button>
                <div class="dropdown-content">
                    ${links}
                </div>
            </div>
        `;
    }
}
customElements.define("m-ai-dropdown", MAIDropdown);

class MAINotice extends HTMLElement {
    connectedCallback() {
        const message = this.innerHTML;

        this.innerHTML = `
        <div>
            <button>X</button>
            <p>${message}</p>
        </div>
        `

    }
}
customElements.define("m-ai-notice", MAINotice);

class MAIChatCard extends HTMLElement {
    connectedCallback() {
        const message = this.innerHTML;

        this.innerHTML = `
        <div>
            <div>
                <p>${this.getAttribute("name") || "Unnamed Chat"}</p>
                <a href="todo"><img src="${this.getAttribute("src") || placeholder_img}" alt="Bot Profile"></a>
            </div>
        </div>
        <div class="info">
            <p>Messages: 8</p>
            <button>Continue</button>
        </div>
        `

    }
}
customElements.define("m-ai-chat-card", MAIChatCard);

class MAIBotCard extends HTMLElement {
    connectedCallback() {
        const message = this.innerHTML;
        let builtTags = "";

        this.getAttribute("tags").split(",").forEach((tag) => {
            if (tag.trim() < 1) { return };
            builtTags += `<li>${tag.trim()}</li>`;
        })

        this.innerHTML = `
        <div>
            <div>
                <p>${this.getAttribute("name") || "Unnamed Bot"}</p>
                <hr>
                <img src="${this.getAttribute("src") || placeholder_img}" alt="Bot Profile">
                <p class="chats">${formatNumber(this.getAttribute("messages"))}</p>
                <hr>
                <ul class="tags">${builtTags}</ul>
                <p class="description">${this.getAttribute("description") || placeholder_text}</p>
            </div>
        </div>
        `

    }
}
customElements.define("m-ai-bot-card", MAIBotCard);

////////
export function renderTags() {
    const tagBox = document.getElementById("tagBox");
    if (!tagBox) { return };

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
                if (maxTags && (selectedTags.length + 1) > maxTags) { return };
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
            updateBotList();
        });
    });
}

class MAITags extends HTMLElement {
    connectedCallback() {
        const message = this.innerHTML;
        maxTags = this.getAttribute("max");

        this.innerHTML = `
        <div class="tagContainer">
            <div id="tagBox" class="tagBox"></div>
            <button type="button" id="tagToggle">⮟</button>
        </div>
        `

        const tagToggle = document.getElementById("tagToggle");
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


        renderTags();
    }
}
customElements.define("m-ai-tags", MAITags);

class MAIChatMessage extends HTMLElement {
    connectedCallback() {
        const message = this.innerHTML;
        maxTags = this.getAttribute("max");

        this.innerHTML = `
        <article class="message">
            <img src="${this.getAttribute("src") || placeholder_img}" alt="Profile Picture">
            <section>
                <span>
                    <p>${this.getAttribute("sender") || "?"}</p>
                    <span class="buttons">
                        <button><img src="./icons/edit.png" alt="Edit"></button>
                        <button><img src="./icons/regenerate.png" alt="Regenerate"></button>
                        <button><img src="./icons/delete.png" alt="Delete"></button>
                    </span>
                </span>
                <article>
                    <p>${this.getAttribute("content") || placeholder_text}</p>
                </article>
            </section>
        </article>
        `

        const tagToggle = document.getElementById("tagToggle");
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


        renderTags();
    }
}
customElements.define("m-ai-chat-message", MAIChatMessage);

///////

// Add for every page
document.body.innerHTML += `<div id="m-ai-popup-utility"></div>`

export function createNotice(text) {
    const newMessage = document.createElement("m-ai-notice");
    newMessage.textContent = text;

    document.getElementById("m-ai-popup-utility").appendChild(newMessage);

    newMessage.querySelector("button").addEventListener("click", () => {
        newMessage.remove();
    });
}