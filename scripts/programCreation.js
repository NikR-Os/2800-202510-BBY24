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

document.getElementById("generateCode").addEventListener("click", () => {
  const randomCode = generateRandomCode(10); // You can change the length
  document.getElementById("codeOutput").value = randomCode;
});

document.getElementById("submitProgram").addEventListener("click", () => {

  const programName = document.getElementById("programName").value;
  const courses = document.getElementById("courses").value;
  const code = document.getElementById("codeOutput").value;

  console.log("Program Name: " + programName);
  console.log("Courses: " + courses);
  console.log("Code: " + code);

  // window.location.assign("adminMain.html");
})
