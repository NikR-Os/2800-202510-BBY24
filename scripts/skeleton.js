// 👇 This runs as soon as the page loads
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search); // get query params
    const action = urlParams.get('action'); // look for ?action=signup or ?action=login
  
    // Show the correct form based on the URL
    if (action === "signup") {
      document.getElementById("signup-form").style.display = "block";
    } else {
      document.getElementById("login-form").style.display = "block";
    }
  });
  