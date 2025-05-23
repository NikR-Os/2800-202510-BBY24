
console.log("[Debug] session.js script loaded"); // Top of session.js

async function writeSessions() {
    console.log("[Debug] writeSessions() has been called");

    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("name");
    const userEmail = sessionStorage.getItem("email");
    const program = sessionStorage.getItem("programName");
    const courses = JSON.parse(sessionStorage.getItem("courses"));
    console.log("[Debug] Courses from sessionStorage:", courses);

    const selectedLength = document.getElementById("sessionLengthValue").value;
    const courseSelect = document.getElementById("courseSelect");

    // Ensure a course is selected before continuing
    const selectedCourse = courseSelect?.value;

    if (!selectedCourse) {
        alert("Please select a course.");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }
    console.log("[Geo] Requesting one-time location for session creation...");

try {
    const latest = window.latestCoords;

    if (!latest || latest.length !== 2) {
        console.error("[Geo] No recent coordinates found. Aborting session creation.");
        alert("We couldn't determine your location. Please ensure location services are enabled.");
        return;
    }

    const geolocation = {
        latitude: latest[1],
        longitude: latest[0]
    };

    console.log("[Geo] Using cached coordinates for session:", geolocation);

    const baseUrl = window.location.origin;
    console.log("[Debug] ownerName:", userName);
    console.log("[Debug] ownerEmail:", userEmail);
    console.log("[Debug] geolocation:", geolocation);
    console.log("[Debug] session length:", selectedLength);
    console.log("[Debug] selected course:", selectedCourse);
    console.log("[Debug] program:", program);
    console.log("[Debug] courses array:", courses);
    console.log("[Debug] userId (for members):", userId);

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
            program,
            courses,
            course: selectedCourse
        })
    });
    console.log("[POST] Session POST complete. Status:", sessionRes.status);

    const data = await sessionRes.json();
    console.log("[writeSessions] Session created:", data);
    console.log("[PUT] Updating user document with session ID:", data._id);

    // update student document with new session id
    await fetch(`${baseUrl}/profile/student/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ session: data._id })
    });

    window.location.reload();
} catch (err) {
    console.error("[writeSessions] Failed to create session:", err);
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

