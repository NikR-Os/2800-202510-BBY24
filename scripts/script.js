

// Handle signup using the form's submit event

const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
      const res = await fetch("http://localhost:8000/signup", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful. Logging you in...");
        sessionStorage.setItem("userId", data.userId);
        window.location.href = "main.html";
      } else {
        alert("Signup failed: " + data.message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong during signup.");
    }
  });
}


  
  // Handle login
  document.addEventListener("DOMContentLoaded", () => { //Waits until the entire HTML is fully loaded before running the code.

    console.log("Login page loaded...");
    const loginButton = document.getElementById("login-submit");
    console.log("loginButton:", loginButton);
      
    if (loginButton) { //Makes sure the login button is on the page before trying to use it (prevents your error).

      loginButton.addEventListener("click", async (e) => { //When clicked, prevent the default form action.

        e.preventDefault();
  
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value; //Collects the user’s login credentials from the form.
  
        try {
          const res = await fetch("http://localhost:8000/login", { //hardcoded values 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          }); //Sends the login data to your backend.
  
          const data = await res.json(); //If login is successful, store the user ID and redirect to main.html.
  
          if (res.ok) {
            alert("Login successful!");
            sessionStorage.setItem("userId", data.userId);
            window.location.href = "main.html";
          } else {
            if (data.message === "User not found.") {
              alert("User not found. Switching to signup...");
              window.location.href = "login.html?action=signup";
            } else {
              alert("Login failed: " + data.message);
            }
          }
  
        } catch (err) {
          console.error("Login error:", err);
          alert("Something went wrong.");
        }
      });
    } else {
      console.error("Login button not found in the DOM.");
    }
  });
  
  