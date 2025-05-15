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
        const userRes = await fetch(`${baseUrl}/profile/${userId}`);

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
            // Get program from sessionStorage
            const program = sessionStorage.getItem("programName");
            console.log("[writeSessions] Using program name from sessionStorage:", program);

            const courses = JSON.parse(sessionStorage.getItem("courses"));
            if (courses) {
                console.log("[writeSessions] Including courses in session:", courses);
            } else {
                console.warn("[writeSessions] No courses found in sessionStorage");
            }

            if (!program) {
                alert("Program name not set. Did you enter the group code?");
                return;
            }

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
                    course: null,
                    courses, 
                    program 
                })
            });


            const sessionData = await sessionRes.json();
            const session = sessionData._id;

            // 4. Update the user’s document with the session ID
            await fetch(`${baseUrl}/profile/student/${userId}`, {
                method: "PUT",
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

    const baseUrl = window.location.origin;
    const indicator = document.getElementById("session-indicator");
    const label = document.getElementById("session-indicator-label");
    const deleteBtn = document.getElementById("delete-session-btn");
    const statusMessageElem = document.getElementById("session-status-message");
    const userId = sessionStorage.getItem("userId");

    if (!indicator || !label || !deleteBtn || !statusMessageElem) {
        console.warn("[SessionIndicator] Missing one or more UI elements");
        return;
    }

    if (!userId) {
        console.warn("[SessionIndicator] No userId found in sessionStorage");
        return;
    }

    try {
        console.log(`[SessionIndicator] Fetching profile for userId: ${userId}`);
        const res = await fetch(`${baseUrl}/profile/${userId}`);
        const userData = await res.json();
        console.log("[SessionIndicator] User profile fetched:", userData);

        const userName = userData.name || "there";
        const session = userData.session;
        console.log(`[SessionIndicator] Extracted session ID: ${session}`);

        if (session) {
            console.log(`[SessionIndicator] Fetching session data for ID: ${session}`);
            const sessionRes = await fetch(`${baseUrl}/sessions/${session}`);
            const sessionData = await sessionRes.json();
            console.log("[SessionIndicator] Session data:", sessionData);

            const startTime = new Date(sessionData.timestamp);
            const length = sessionData.length;

            let endTime = new Date(startTime);
            if (length === "30 minutes") endTime.setMinutes(endTime.getMinutes() + 30);
            else if (length === "1 hour") endTime.setHours(endTime.getHours() + 1);
            else if (length === "2 hours") endTime.setHours(endTime.getHours() + 2);

            const endTimeString = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            console.log(`[SessionIndicator] Active session ends at ${endTimeString}`);

            scheduleSessionExpiration(endTime);

            indicator.style.backgroundColor = "green";
            label.textContent = "Active Session";
            deleteBtn.style.display = "inline-block";
            statusMessageElem.textContent = `Hey ${userName}, your ${length} session ends at ${endTimeString}.`;
        } else {
            console.log(`[SessionIndicator] No session ID found for user ${userName}`);
            indicator.style.backgroundColor = "red";
            label.textContent = "No Active Session";
            deleteBtn.style.display = "none";
            statusMessageElem.textContent = `Hey ${userName}, you have no active sessions.`;
        }
    } catch (err) {
        console.error("[SessionIndicator] Error loading session data:", err);
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
        const res = await fetch(`${baseUrl}/profile/${userId}`);
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
        await fetch(`${baseUrl}/profile/student/${userId}`, {
            method: "PUT",
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

