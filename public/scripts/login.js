const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const res = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: document.getElementById("usernameField").value,
            password: document.getElementById("passwordField").value,
        })
    });

    const data = await res.json();

    if (res.ok) { window.location.reload() };
});