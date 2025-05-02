// Handle signup using the form's submit event
document.getElementById("signup-form").addEventListener("submit", async (e) => {
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
      // Optionally auto-login after signup
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

  
  // Handle login
  document.getElementById("login-submit").addEventListener("click", async (e) => {
    e.preventDefault();
  
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
  
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert("Login successful!");
      sessionStorage.setItem("userId", data.userId); // ✅ store user ID
      window.location.href = "main.html";
    } else {
      if (data.message === "User not found.") {
        alert("User not found. Switching to signup...");
        window.location.href = "login.html?action=signup"; // 👈 switch form
      } else {
        alert("Login failed: " + data.message);
      }
    }
  });
  