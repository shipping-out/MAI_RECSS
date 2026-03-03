const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const res = await fetch("/login", {
        method: "POST",
        body: {
            username: document.getElementById("usernameField").value,
            password: document.getElementById("passwordField").value,
        }
    });

    const data = await res.data();
    console.log(data);

})