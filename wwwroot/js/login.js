document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/User/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);
        window.location.href = "profile.html";
    } else {
        const errorText = await response.text();
        alert("Error in connect" + errorText);
    }
});