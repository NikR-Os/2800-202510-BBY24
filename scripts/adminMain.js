/**
 * Checks if the page is one of the protected pages. If it is a protected page, then
 * it checks if the users has a cookie. If the user doesn't have a cookie, then the
 * user is redirected to the login page.
 */
function checkAuth() {
    const userId = sessionStorage.getItem('userId');
    const currentPage = window.location.pathname.split('/').pop();
    
    // List of protected pages that require login
    const protectedPages = ['main.html', 'adminMain.html', 'profile.html', 'setting.html'];
    
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
 * Fetches data from the server side and creating cards for each program in
 * the database. 
 */
fetch('/adminData')
.then(res => res.json())
.then(result => {
    const container = document.getElementById("programCards");
    result.forEach(data => {
        const content = `
            <div class="card m-4 ">
                <h3 class="mt-2">${data.name}</h2>
                <p>Students: ${data.numberOfStudents}</p>
                <p>Access Code: ${data.accessCode}</p>
                <p>Length: ${data.length} weeks</p>
            </div>
        `

        container.insertAdjacentHTML("beforeend", content);
    })    
})
.catch(e => console.error("Error fetching data " + e));