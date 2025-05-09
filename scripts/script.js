

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

      loginButton.addEventListener("click", async (e) => { // Attach a click event listener to the login button. This function will run when the button is clicked.
        e.preventDefault(); // Prevent the default form submission behavior (page reload).
      
        const email = document.getElementById("login-email").value; // Get the email entered in the login form input.
        const password = document.getElementById("login-password").value; // Get the password entered in the login form input.
      
        const baseUrl = window.location.origin; // Dynamically determine the current domain (useful for dev/prod compatibility).
      
        try {
          const res = await fetch(`${baseUrl}/login`, { // Send a POST request to the backend login endpoint at the same origin.
            method: "POST", // Use the POST HTTP method to send login data securely.
            headers: { "Content-Type": "application/json" }, // Indicate that the request body is JSON.
            body: JSON.stringify({ email, password }) // Convert the email and password into a JSON string to send in the request body.
          });
      
          const data = await res.json(); // Wait for and parse the JSON response from the server.
      
          if (res.ok) { // Check if the HTTP response status is in the 200–299 range, indicating success.
            
            sessionStorage.setItem("userId", data.userId); // Save the returned user ID to session storage for later use in the app.

            window.location.href = "main.html"; // Redirect the user to the main application page (frontend path).
          } else { // If the login attempt failed (bad credentials or other issue)...
            if (data.message === "User not found.") { // Specific check if the user was not found in the backend.
              alert("User not found. Switching to signup..."); // Inform the user and redirect to the signup screen.
              window.location.href = "login.html?action=signup"; // Navigate to the login page with the signup action (triggers signup UI).
            } else {
              alert("Login failed: " + data.message); // Show a generic login failure message returned from the backend.
            }
          }
      
        } catch (err) { // Catch any unexpected errors during the fetch call or response parsing.
          console.error("Login error:", err); // Log the error to the developer console for debugging.
          alert("Something went wrong."); // Show a generic error message to the user.
        }
      });
      
      
    } else {
      console.error("Login button not found in the DOM.");
    }
  });
  
  