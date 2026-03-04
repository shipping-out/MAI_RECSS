import { createNotice } from "./customElements.js";

const avatarPreview = document.getElementById("avatarPreview");
const avatarPicker = document.getElementById("avatarPicker");
const uploadText = document.getElementById("uploadText");
const uploadIcon = document.getElementById("uploadIcon");
const createForm = document.getElementById("createForm");

const STORAGE_KEY = "new_bot_draft";

const saveToDraft = () => {
    const draftData = {
        avatar: avatarPreview.src,
        botName: document.getElementById("botName").value,
        botChatName: document.getElementById("botChatName").value,
        botBio: document.getElementById("botBio").value,
        botPersonality: document.getElementById("botPersonality").value,
        botExampleMessages: document.getElementById("botExampleMessages").value,
        botStartingMessage: document.getElementById("botStartingMessage").value,
        isPublic: document.getElementById("publicBotButton").checked,
        isDefinitionPublic: document.getElementById("publicPersonalityButton").checked
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
};

const loadFromDraft = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    const data = JSON.parse(savedData);

    document.getElementById("botName").value = data.botName || "";
    document.getElementById("botChatName").value = data.botChatName || "";
    document.getElementById("botBio").value = data.botBio || "";
    document.getElementById("botPersonality").value = data.botPersonality || "";
    document.getElementById("botExampleMessages").value = data.botExampleMessages || "";
    document.getElementById("botStartingMessage").value = data.botStartingMessage || "";

    document.getElementById("publicBotButton").checked = data.isPublic;
    document.getElementById("publicPersonalityButton").checked = data.isDefinitionPublic;

    if (data.avatar && data.avatar.startsWith("data:image")) {
        avatarPreview.src = data.avatar;
        avatarPreview.hidden = false;
        uploadText.hidden = true;
        uploadIcon.hidden = true;
    }
};

createForm.addEventListener("input", saveToDraft);

avatarPicker.addEventListener("change", () => {
    const file = avatarPicker.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        avatarPreview.src = event.target.result;
        avatarPreview.hidden = false;
        uploadText.hidden = true;
        uploadIcon.hidden = true;
        saveToDraft();
    };
    reader.readAsDataURL(file);
});

loadFromDraft();

createForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const botData = {
        avatar: avatarPreview.src,
        botName: document.getElementById("botName").value,
        botChatName: document.getElementById("botChatName").value,
        botBio: document.getElementById("botBio").value,
        botPersonality: document.getElementById("botPersonality").value,
        botExampleMessages: document.getElementById("botExampleMessages").value,
        botStartingMessage: document.getElementById("botStartingMessage").value,
        isPublic: document.getElementById("publicBotButton").checked,
        isDefinitionPublic: document.getElementById("publicPersonalityButton").checked
    };

    const res = await fetch("/api/createBot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(botData)
    });

    const data = await res.json();

    if (res.ok && data.id) {
        localStorage.removeItem(STORAGE_KEY);

        document.location = `bot?id=${data.id}`;
    } else {
        createNotice("Failed to create bot!");
    }
});