// Used to store all the courses added
const courses = [];

/**
 * Checks if the page is one of the protected pages. If it is a protected page, then
 * it checks if the users has a cookie. If the user doesn't have a cookie, then the
 * user is redirected to the login page.
 */
function checkAuth() {
    const userId = sessionStorage.getItem('userId');
    const currentPage = window.location.pathname.split('/').pop();
    
    // List of protected pages that require login
    const protectedPages = ['main.html', 'adminMain.html', 'programCreation.html', 'profile.html', 'setting.html'];
    
    if (protectedPages.includes(currentPage) && !userId) {
        // Redirect to index.html if not logged in
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Run the check before anything else
if (!checkAuth()) {
    // Stop execution if not authenticated
    throw new Error("Unauthorized access - redirecting to login");
}

/**
 * Generates a random code from letter A-z and numbers 0-9
 */
function generateRandomCode(length) 
{
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) 
  {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Handles the adding of courses. Takes the value in the input and
 * checks if the course is unique in the array of courses. If the course is unique, 
 * change the letters to be uppercase, input it into the array and show the course in the html.
 */
function addingCourses()
{
  const course = document.getElementById("course").value;
  let exists = false;
  // Checking if the course already exists in the program creation values
  for(let i = 0; i < courses.length; i++)
  {
    if(course.toLowerCase() == courses[i].toLowerCase())
    {
      exists = true;
      alert("Course already inputted");
      console.log(exists);
    }
  }

  // If the added course is unique, input into courses array and show course in html
  if(!exists)
  {
    const container = document.getElementById("courses");
    const courseName = course.toUpperCase();
    console.log(courseName);
    const content = `
    <div>
      <p>${courseName}</p>
    </div>
    `
    courses.push(courseName);
    container.insertAdjacentHTML("beforeend", content);
  }  
  // Clears the input field
  document.getElementById("course").value = "";
  console.log(courses);
}

/**
 * Generates a 10 alphanum code when the generate code button is pressed and 
 * shows the code in the html
 */
document.getElementById("generateCode").addEventListener("click", () => {
  const randomCode = generateRandomCode(10); // You can change the length
  document.getElementById("codeOutput").value = randomCode;
});

/**
 * Handles the program submittion through a submit program button. After clicking the button
 * the values of programName, programLength, accessCode and subject are taken from page and 
 * sent to the server side. An appropriate message is sent to the user after the server is complete.
 */
document.getElementById("submitProgram").addEventListener("click", async () => {

  // The website's orginal url
  const baseUrl = window.location.origin;

  // Grabbing values from the page
  const name = document.getElementById("programName").value;
  const length = document.getElementById("programLength").value;
  const code = document.getElementById("codeOutput").value;
  const subject = document.getElementById("subject").value;

  try {
    // Sending the values to the server side
    const res = await fetch(`${baseUrl}/programCreation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, length, courses, code, subject })
    });
    const data = await res.json();

    // Checking if the server side was successful
    if(res.ok)
    {
      // Informing the user that the program creation was a success
      alert("Program Creation Successful");
      console.log("Program success");
      // Redirecting the user back to the admin main page
      window.location.href = "adminMain.html";
    }
    else
    {
      // Informing the user that the program creation was a failure
      alert("Program Creation failed " + data.message);
      console.log("Program failure");
    }
  }
  catch(e)
  {
    // Informing the user if there are any errors when sending data to the server
    console.error("Program Creation error:" + e);
    alert("Something went wrong during program creation");
  }
})
