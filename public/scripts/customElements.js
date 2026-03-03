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

const placeholder_img = "https://pub-565faf2130f64e41963a6ebebd514d02.r2.dev/images/blind_bot_11658e3d-b054-4186-b2a6-faf82f4f5248.png";
const placeholder_text = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aperiam, ab nesciunt. Dignissimos id fugit odit nostrum temporibus natus cumque dolorem?";

class MAIHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = !this.hasAttribute("empty") ? `
    <header>
        <m-ai-dropdown hamburger>
            <a href="create">Create bot</a>
            <a href="bots">Your bots</a>
            <a href="chats">Your chats</a>
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

        this.innerHTML = `
        <div>
            <div>
                <p>${this.getAttribute("name") || "Unnamed Bot"}</p>
                <hr>
                <img src="${this.getAttribute("src") || placeholder_img}" alt="Bot Profile">
                <p class="chats">${formatNumber((Math.floor((Math.random() * 5000) / 10)) * 10) || this.getAttribute("chats")}</p>
                <hr>
                <ul class="tags">
                    <li>Test</li>
                </ul>
                <p class="description">${this.getAttribute("description") || placeholder_text}</p>
            </div>
        </div>
        `

    }
}
customElements.define("m-ai-bot-card", MAIBotCard);


// Add for every page
document.body.innerHTML += `<div id="m-ai-popup-utility"></div>`
// <m-ai-notice>Text</m-ai-notice>

export function createNotice(text) {
    const newMessage = document.createElement("m-ai-notice");
    newMessage.textContent = text;

    document.getElementById("m-ai-popup-utility").appendChild(newMessage);

    newMessage.querySelector("button").addEventListener("click", () => {
        newMessage.remove();
    });
}