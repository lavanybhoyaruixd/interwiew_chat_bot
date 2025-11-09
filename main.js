// Get DOM elements
const sendButton = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBody = document.querySelector(".chat-body");
import 'bulma/css/bulma.min.css';


// Function to display messages
function displayMessage(message, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${className}`;
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to simulate bot response
function getBotResponse(input) {
    const userText = input.toLowerCase();
    if (userText.includes("hello")) return "Hi there! 👋";
    if (userText.includes("how are you")) return "I'm just code, but I'm doing great!";
    if (userText.includes("your name")) return "I'm your chatbot assistant.";
    return "Sorry, I didn't understand that.";
}

// Send message on button click
sendButton.addEventListener("click", () => {
    const input = userInput.value.trim();
    if (input === "") return;

    displayMessage(input, "user");
    userInput.value = "";

    setTimeout(() => {
        const response = getBotResponse(input);
        displayMessage(response, "bot");
    }, 500);
});
