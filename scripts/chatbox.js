// Declare global variables
let lastSender = null;
let currentUserName = ""; // updated from DB
let currentUserId = sessionStorage.getItem("userId"); // used to fetch the name
console.log("Current userId from sessionStorage:", currentUserId);

const socket = io();
let socketConnected = false;
let usernameLoaded = false;

socket.on("connect", () => {
  console.log("Connected with socket ID:", socket.id);
  socketConnected = true;

  if (usernameLoaded && currentUserName) {
    socket.emit("register", currentUserName);
    console.log("Sent register to server as:", currentUserName);
  } else {
    console.warn("Socket connected before username was ready.");
  }
});

// Show/hide the chat form
function toggleChatForm() {
  const chatForm = document.getElementById("chatFormPopup");
  const badge = document.getElementById("chatNotification");

  // Show the form
  if (chatForm.style.display === "none" || chatForm.style.display === "") {
    chatForm.style.display = "block";

    // Hide the red notification badge if visible
    if (badge) badge.style.display = "none";

    // Only pre-fill the recipient if it's a different user
    if (lastSender && lastSender !== currentUsername) {
      document.getElementById("recipientUsername").value = lastSender;
    }
  } else {
    chatForm.style.display = "none";
  }
}

// Wait until page is fully loaded
window.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Fetching user details from DB for:", currentUserId);
const response = await fetch(`/profile/${currentUserId}`);
    const data = await response.json();
    currentUserName = data.name;
    console.log("Fetched current username from DB:", currentUserName);

    usernameLoaded = true;

    if (socketConnected && currentUserName) {
      socket.emit("register", currentUserName);
      console.log("Sent register to server as:", currentUserName);
    }

  } catch (err) {
    console.error("Could not fetch user data from DB");
    console.error("Failed to fetch current user's name:", err);
  }
});




// Called when user submits the chat form
function sendMessage() {
  const recipient = document.getElementById("recipientUsername").value;
  const message = document.getElementById("chatInput").value;

  // Don't send if fields are empty
  if (!recipient || !message) {
    console.warn("Missing recipient or message");
    return;
  }

  // Confirm currentUsername is valid before sending
  if (!currentUserName) {
    console.warn("currentUserName is missing — cannot send.");
    return;
  }

  // Log message info for debugging
  console.log("Sending message:", {
    from: currentUserName,
    to: recipient,
    msg: message
  });

  // Emit the message to the server
  const senderId = sessionStorage.getItem("userId");

  socket.emit("private message", {
    toUsername: recipient,
    fromUserId: senderId, // send ID instead of name
    message
  });
  
  console.log("📤 Message emitted to server.");

  // Add the message to your own UI
  addMessage(`You: ${message}`);
  document.getElementById("chatInput").value = ""; // Clear the input field
}

// Receive a message from another user
socket.on("private message", ({ message, fromUsername }) => {
  // Only display messages from others
  if (fromUsername !== currentUserName) {
    console.log("Displaying message:", message);
    addMessage(`${fromUsername}: ${message}`);

    // Show red notification icon
    const badge = document.getElementById("chatNotification");
    if (badge) badge.style.display = "inline-block";

    // Save the last person who messaged you so you can reply quickly
    lastSender = fromUsername;
  } else {
    // Prevent duplicate display of your own messages
    console.log("Ignoring self-sent message.");
  }
});

// Append a message to the chat window
function addMessage(text) {
  const li = document.createElement("li");
  li.textContent = text;
  document.getElementById("chat-messages").appendChild(li);
}
