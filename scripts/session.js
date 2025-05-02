// session.js (MongoDB version, no Firebase)

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
        const res = await fetch(`http://localhost:8000/users/${userId}`);
        const userData = await res.json();

        const userName = userData.name || "there";       // Fallback name
        const sessionId = userData.session;              // The session ID stored in user doc

        if (sessionId) {
            // Fetch the session document if user has one
            const sessionRes = await fetch(`http://localhost:8000/sessions/${sessionId}`);
            const sessionData = await sessionRes.json();

            const startTime = new Date(sessionData.timestamp); // Convert timestamp to Date
            const length = sessionData.length;

            // Calculate session end time
            let endTime = new Date(startTime);
            if (length === "30 minutes") endTime.setMinutes(endTime.getMinutes() + 30);
            else if (length === "1 hour") endTime.setHours(endTime.getHours() + 1);
            else if (length === "2 hours") endTime.setHours(endTime.getHours() + 2);

            const endTimeString = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

// ================================
// Delete Current Session
// ================================
async function deleteCurrentUserSession() {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
        alert("User not logged in.");
        return;
    }

    try {
        // Fetch the user's document to get the current session ID
        const res = await fetch(`http://localhost:8000/users/${userId}`);
        const user = await res.json();
        const sessionId = user.session;

        if (!sessionId) {
            console.warn("No session to delete.");
            return;
        }

        // Delete the session document
        await fetch(`http://localhost:8000/sessions/${sessionId}`, {
            method: "DELETE"
        });

        // Clear the session field from the user document
        await fetch(`http://localhost:8000/users/${userId}/session`, {
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
