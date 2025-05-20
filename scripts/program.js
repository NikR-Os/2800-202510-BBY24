document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("enter-program-btn");
  const formDiv = document.getElementById("program-code-form");
  const submitBtn = document.getElementById("submitProgramCodeBtn");
  const input = document.getElementById("programCodeInput");

  toggleBtn.addEventListener("click", () => {
    formDiv.style.display = formDiv.style.display === "none" ? "block" : "none";
  });

  submitBtn.addEventListener("click", async () => {
    const code = input.value.trim();
    console.log("[Debug] User entered code:", code);

    if (!code) {
      console.warn("[Debug] Code input is empty.");
      return alert("Please enter a program code.");
    }

    const userId = sessionStorage.getItem("userId");
    console.log("[Debug] Retrieved userId from sessionStorage:", userId);

    if (!userId) {
      console.error("[Debug] No userId found in sessionStorage.");
      return alert("User not logged in.");
    }
    try {
      const programRes = await fetch(`/programs/${code}`);
      const program = await programRes.json();

      if (!program || !program.name) {
        console.warn("[Debug] Program lookup failed or returned empty.");
        return alert("No matching program found.");
      }

      sessionStorage.setItem("programName", program.name);
      console.log("[Debug] Found program:", program.name);

      if (program.courses) {
        const updateRes = await fetch(`/profile/student/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ program: program.name, courses: program.courses })
        });

        const updatedStudent = await updateRes.json();
        console.log("[Program] Student program and courses updated:", updatedStudent);

        // Update sessionStorage with new values
        sessionStorage.setItem("programName", updatedStudent.program || "");
        sessionStorage.setItem("courses", JSON.stringify(updatedStudent.courses || []));
      }




      const updateRes = await fetch(`/profile/student/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ program: program.name })
      });

      const updateResult = await updateRes.json();
      console.log("[Debug] Student program field updated:", updateResult);

      input.value = "";
      submitBtn.classList.add("btn-dark");
      alert("Program updated!");
    } catch (err) {
      console.error("Error submitting program code:", err);
      alert("Something went wrong.");
    }

  });
});
