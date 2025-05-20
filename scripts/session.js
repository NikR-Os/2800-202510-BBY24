async function writeSessions() {
    const baseUrl = window.location.origin;
    const selectedLength = document.getElementById("lengthInput").textContent;
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        alert("You must be logged in to create a session.");
        return;
    }

    try {
        // 1. Fetch user info from MongoDB
        const userRes = await fetch(`${baseUrl}/users/${userId}`);
       
        const user = await userRes.json();

        const userName = user.name;
        const userEmail = user.email;

        // 2. Get current geolocation
        navigator.geolocation.getCurrentPosition(async (position) => {
            const geolocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            // 3. Create the session in MongoDB
            const sessionRes = await fetch(`${baseUrl}/sessions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ownerName: userName,
                    ownerEmail: userEmail,
                    geolocation,
                    length: selectedLength,
                    timestamp: new Date().toISOString(),
                    members: [userId],
                    course: null //  TEMP placeholder until form field is added
                })
            });

            const sessionData = await sessionRes.json();
            const session = sessionData._id;

            // 4. Update the user’s document with the session ID
            await fetch(`${baseUrl}/users/${userId}/session`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session })
            });

            console.log("Session created and user updated successfully.");
            window.location.reload();

        }, (error) => {
            console.error("Geolocation error:", error.message);
            alert("Could not retrieve geolocation. Please try again.");
        });

    } catch (error) {
        console.error("Error creating session:", error);
        alert("Failed to create session. Please try again later.");
    }
}


// ================================
// Delete Current Session Button Setup
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const deleteBtn = document.getElementById("delete-session-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", deleteCurrentUserSession);
    }
});

// ================================
// Load and Display Session Indicator
// ================================
document.addEventListener("DOMContentLoaded", async () => {

    // Get references to the DOM elements that will show the session status
    const baseUrl = window.location.origin;
    const indicator = document.getElementById("session-indicator");         // The coloured dot
    const label = document.getElementById("session-indicator-label");       // The text beside the dot
    const deleteBtn = document.getElementById("delete-session-btn");        // The delete session button
    const statusMessageElem = document.getElementById("session-status-message"); // Message below the indicator
    const userId = sessionStorage.getItem("userId"); // Retrieve the user's ID from sessionStorage
    if (!userId) {
        console.warn("No userId found in sessionStorage.");
        return;
    }

    try {
        // Fetch the user's document from your MongoDB backend
        const res = await fetch(`${baseUrl}/users/${userId}`);
        const userData = await res.json();

        const userName = userData.name || "there";       // Fallback name
        const session = userData.session;              // The session ID stored in user doc

        if (session) {
            // Fetch the session document if user has one
            const sessionRes = await fetch(`${baseUrl}/sessions/${session}`);
            const sessionData = await sessionRes.json();

            const startTime = new Date(sessionData.timestamp); // Convert timestamp to Date
            const length = sessionData.length;

            // Calculate session end time
            let endTime = new Date(startTime);
            if (length === "30 minutes") endTime.setMinutes(endTime.getMinutes() + 30);
            else if (length === "1 hour") endTime.setHours(endTime.getHours() + 1);
            else if (length === "2 hours") endTime.setHours(endTime.getHours() + 2);

            const endTimeString = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            scheduleSessionExpiration(endTime);

            //  Update the UI for an active session
            indicator.style.backgroundColor = "green";
            label.textContent = "Active Session";
            deleteBtn.style.display = "inline-block";
            statusMessageElem.textContent = `Hey ${userName}, your ${length} session ends at ${endTimeString}.`;
        } else {
            //  User has no session — show inactive UI
            indicator.style.backgroundColor = "red";
            label.textContent = "No Active Session";
            deleteBtn.style.display = "none";
            statusMessageElem.textContent = `Hey ${userName}, you have no active sessions.`;
        }
    } catch (err) {
        console.error("Failed to load session data:", err);
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const courseSelect = document.getElementById('courseSelect');
    const programData = document.getElementById('program-data');
    const code = programData.dataset.code;

    if (!code) {
    console.error("Program code not found in DOM.");
    return;
    }

    try {
    const res = await fetch(`/programs/${code}`);
    if (!res.ok) throw new Error('Failed to fetch program data');
    const program = await res.json();

    courseSelect.innerHTML = '<option value="">Select one...</option>';

    program.courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });

    console.log("Courses loaded.");
    } catch (error) {
    console.error('Error loading courses:', error);
    }
});

// ================================
// Delete Current Session
// ================================
async function deleteCurrentUserSession() {
    const baseUrl = window.location.origin;
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
        alert("User not logged in.");
        return;
    }

    try {
        // Fetch the user's document to get the current session ID
        const res = await fetch(`${baseUrl}/users/${userId}`);
        const user = await res.json();
        const session = user.session;

        if (!session) {
            console.warn("No session to delete.");
            return;
        }

        // Delete the session document
        await fetch(`${baseUrl}/sessions/${session}`, {
            method: "DELETE"
        });

        // Clear the session field from the user document
        await fetch(`${baseUrl}/users/${userId}/session`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: null })
        });

        console.log("Session successfully deleted.");
        window.location.reload(); // Refresh to update the UI
    } catch (err) {
        console.error("Error deleting session:", err);
    }
}

function scheduleSessionExpiration(endTime) {
    const now = new Date();
    const delay = new Date(endTime) - now;

    if (delay <= 0) {
        // Stale session: delete it immediately
        deleteCurrentUserSession();
        return;
    }

    // Active session: schedule deletion
    setTimeout(() => {
        deleteCurrentUserSession();
    }, delay);
}

