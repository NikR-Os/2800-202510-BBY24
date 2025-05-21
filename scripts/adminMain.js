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