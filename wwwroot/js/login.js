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
        decodedToken = parseJwt(data.token);
        console.log(decodedToken); // הצגת ה־payload המפוענח
        console.log(decodedToken.role);
        if (decodedToken.role == "Admin") {
            window.location.href = "users.html";
        }
        else
        {
            window.location.href = "profile.html";
        }
        
    } else {
        const errorText = await response.text();
        alert("Error in connect" + errorText);
    }
});

function parseJwt(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      
      const parsed = JSON.parse(jsonPayload);
      // מיפוי של השדות
      return {
        id: parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        name: parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      };
    } catch (e) {
      console.error("Failed to parse JWT", e);
      return null;
    }
  }
  