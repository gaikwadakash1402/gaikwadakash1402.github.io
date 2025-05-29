// my-portfolio/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Smooth scrolling for navigation links ---
    document.querySelectorAll('header nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default anchor click behavior

            // Get the target section's ID from the href attribute (e.g., "#about")
            const targetId = this.getAttribute('href');
            // Scroll to the target section smoothly
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Chatbot functionality ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWidget = document.getElementById('chatbot-widget');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // IMPORTANT: This is the URL of your deployed FastAPI backend.
    // For local testing, use 'http://127.0.0.1:5000/chat'
    // When deployed, you MUST replace this with your actual Render.com URL (e.g., 'https://your-fastapi-app.onrender.com/chat')
    const BACKEND_URL = 'http://127.0.0.1:8000/chat'; // <-- CHANGE THIS FOR DEPLOYMENT!

    // Event Listeners for Chatbot Toggle Button
    chatbotToggle.addEventListener('click', () => {
        chatbotWidget.classList.toggle('active'); // Toggle 'active' class to show/hide
        if (chatbotWidget.classList.contains('active')) {
            userInput.focus(); // Automatically focus on the input field when opened
        }
    });

    // Event Listener for Chatbot Close Button
    chatbotClose.addEventListener('click', () => {
        chatbotWidget.classList.remove('active'); // Hide the chatbot widget
    });

    // Event Listeners for Sending Messages (button click and Enter key)
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- Core Chatbot Message Handling Functions ---
    async function sendMessage() {
        const message = userInput.value.trim(); // Get message and remove whitespace
        if (message === '') return; // Don't send empty messages

        appendMessage(message, 'user-message'); // Display user's message in the chat
        userInput.value = ''; // Clear the input field
        scrollToBottom(); // Scroll to the latest message

        // Show a "Typing..." loading indicator while waiting for AI response
        const loadingMessageDiv = appendMessage("Typing...", 'bot-message loading');
        scrollToBottom();

        try {
            // Send the message to your FastAPI backend
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Specify content type
                },
                body: JSON.stringify({ message: message }), // Send message as JSON
            });

            // Check if the HTTP response was successful (status code 200-299)
            if (!response.ok) {
                // Attempt to parse error details from the backend, if available
                const errorData = await response.json().catch(() => ({}));
                // FastAPI typically returns errors in a 'detail' field
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            // Parse the successful response from the backend
            const data = await response.json();

            loadingMessageDiv.remove(); // Remove the loading indicator
            appendMessage(data.response, 'bot-message'); // Display the AI's response
            scrollToBottom(); // Scroll to the latest message

        } catch (error) {
            console.error('Error sending message to backend:', error);
            loadingMessageDiv.remove(); // Remove loading indicator even on error
            appendMessage(`Sorry, I'm having trouble connecting or processing your request right now. Please try again later. Details: ${error.message || 'Unknown error'}`, 'bot-message error');
            scrollToBottom();
        }
    }

    function appendMessage(text, type) {
        const messageDiv = document.createElement('div');
        // 'type' can be 'user-message' or 'bot-message loading', so split by space
        messageDiv.classList.add('message', ...type.split(' '));
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        return messageDiv; // Return the created div so it can be removed (e.g., loading indicator)
    }

    function scrollToBottom() {
        // Scroll the messages container to the bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});