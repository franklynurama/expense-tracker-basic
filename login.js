document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alert("clicked");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const authMsg = document.getElementById("auth-msg");
    authMsg.textContent = ""; // Clear previous messages

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        authMsg.textContent = "Invalid email or password!";
      } else {
        authMsg.textContent = "Login successful";
        // Store user ID in local storage
        localStorage.setItem("userId", result.userId);
        setTimeout(() => {
          window.location.href = "expenses.html"; // Redirect on success
        }, 2000);
      }
    } catch (err) {
      authMsg.textContent = "An error occured";
      console.error("Error during login:", err);
    }
  });
});
