// 👇 This runs as soon as the page loads
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search); // get query params
  const action = urlParams.get('action'); // look for ?action=signup or ?action=login

document.getElementById("student-signup-choice").addEventListener("click", () => {
  window.location.assign("/login?action=student-signup")
});
document.getElementById("admin-signup-choice").addEventListener("click", () => {
  window.location.assign("/login?action=admin-signup")
});

  // Show the correct form based on the URL
  if (action === "signup") 
  {
    document.getElementById("sign-up-choices").style.display = "block";
  } 
  else if (action === "student-signup") 
  {
    document.getElementById("student-signup-form").style.display = "block";
  } 
  else if (action === "admin-signup") 
  {
    document.getElementById("admin-signup-form").style.display = "block";
  } 
  else 
  {
    document.getElementById("login-form").style.display = "block";
  }
});
