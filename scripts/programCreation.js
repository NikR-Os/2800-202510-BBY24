const courses = [];

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

function addingCourses()
{
  const course = document.getElementById("course").value;
  let exists = false;
  for(let i = 0; i < courses.length; i++)
  {
    if(course.toLowerCase() == courses[i].toLowerCase())
    {
      exists = true;
      alert("Course already inputted");
      console.log(exists);
    }
  }

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
  
  document.getElementById("course").value = "";
  console.log(courses);
}

document.getElementById("generateCode").addEventListener("click", () => {
  const randomCode = generateRandomCode(10); // You can change the length
  document.getElementById("codeOutput").value = randomCode;
});

document.getElementById("submitProgram").addEventListener("click", async () => {

  const baseUrl = window.location.origin;
  const name = document.getElementById("programName").value;
  const length = document.getElementById("programLength").value;
  const code = document.getElementById("codeOutput").value;
  const subject = document.getElementById("subject").value;

  try {
    const res = await fetch(`${baseUrl}/programCreation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, length, courses, code, subject })
    });
    const data = await res.json();
    if(res.ok)
    {
      alert("Program Creation Successful");
      console.log("Program success");
      window.location.href = "adminMain.html";
    }
    else
    {
      alert("Program Creation failed " + data.message);
      console.log("Program failure");
    }
  }
  catch(e)
  {
    console.error("Program Creation error:" + e);
    alert("Something went wrong during program creation");
  }
})
