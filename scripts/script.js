/**
 * Handles the student sign up through a student sign up button. After clicking the button
 * the values of name, email and password are taken from page and sent to the server side.
 * If the server side was successful, the values taken are used to creation a student cookie.
 */
document.addEventListener("DOMContentLoaded", () => {
  const studentBtn = document.getElementById("student-signup-submit");

  if (studentBtn) {
    studentBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      // The website's orginal url
  const baseUrl = window.location.origin;

  // Grabbing values from the page
  const name = document.getElementById("student-signup-name").value;
  const email = document.getElementById("student-signup-email").value;
  const password = document.getElementById("student-signup-password").value;

  try {
    // Sending the values to the server side
    const res = await fetch(`${baseUrl}/signup?type=student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

      // Checking if the server side was successful
      if (res.ok) {
        // Informing the user that the sign up was successful
        alert("Signup successful. Logging you in...");
        // Creating a cookie for the user
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem('userRole', data.role);
        sessionStorage.setItem('userName', data.name);
        sessionStorage.setItem('email', data.email);
        // Redirecting the user to the main page
        window.location.href = "main.html";
      } else {
        // Informing the user that the sign up was a failure
        alert("Signup failed: " + data.message);
      }
  } catch (err) {
    // Informing the user if there are any errors when sending data to the server
    console.error("Signup error:", err);
    alert("Something went wrong during signup.");
  }
    }); //  closes studentBtn.addEventListener
  } //  closes if (studentBtn)
}); //  closes DOMContentLoaded

/**
 * Handles the admin sign up through a admin sign up button. After clicking the button
 * the values of name, email and password are taken from page and sent to the server side.
 * If the server side was successful, the values taken are used to creation an admin cookie.
 */
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("admin-signup-submit");

  if (adminBtn) {
    adminBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      // The website's orginal url
  const baseUrl = window.location.origin;

  // Grabbing values from the page
  const name = document.getElementById("admin-signup-name").value;
  const email = document.getElementById("admin-signup-email").value;
  const password = document.getElementById("admin-signup-password").value;

  try {
    // Sending the values to the server side
    const res = await fetch(`${baseUrl}/signup?type=admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    // Checking if the server side was successful
    if (res.ok) {
      // Informing the user that the sign up was successful
      alert("Signup successful. Logging you in...");
      // Optionally auto-login after signup
      // Creating a cookie for the user
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem('userRole', data.role);
      sessionStorage.setItem('userName', data.name);
      // Redirecting the user to the admin main page
      window.location.href = "adminMain.html";
    } else {
      // Informing the user that the sign up was a failure
      alert("Signup failed: " + data.message);
    }
  } catch (err) {
    // Informing the user if there are any errors when sending data to the server
    console.error("Signup error:", err);
    alert("Something went wrong during signup.");
  }
    });
  }
});

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
          sessionStorage.setItem("email", data.email);// Store the user's email in session storage for future reference.
         console.log("[Login] Stored email in sessionStorage:", data.email);
          sessionStorage.setItem("userEmail", email); // Store the user's email in session storage for future reference.


          sessionStorage.setItem("userRole", data.role); // store user role 
          sessionStorage.setItem("programName", data.program); 
          console.log("[Login] Program name set in sessionStorage:", data.program);
          sessionStorage.setItem("name", data.name);
          sessionStorage.setItem("userName", data.name);


          sessionStorage.setItem("courses", JSON.stringify(data.courses));
          console.log("[Login] Stored courses:", data.courses);

          if (data.role === "admin") {
            window.location.href = "adminMain.html";
          } else {
            window.location.href = "main.html";
          }
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
