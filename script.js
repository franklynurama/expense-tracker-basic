document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");

  // Navigate to Register page
  registerBtn.addEventListener("click", () => {
    window.location.href = "register.html";
  });

  // Navigate to Login page
  loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
});
