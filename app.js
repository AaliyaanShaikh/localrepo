document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const messagesContainer = document.getElementById('messages');
    const alertDiv = document.getElementById('guardrail-alert');

    // Function to display a user message
    function displayUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to display a companion message
    function displayCompanionMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message companion-message';
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to handle sending the message
    async function sendMessage() {
        const text = userInput.value.trim();
        userInput.value = ''; // Clear input field

        if (text === '') return;

        displayUserMessage(text);

        // --- Frontend Basic Guardrail: Length and Simple Profanity Check ---
        // The real, complex guardrails are on the backend, but basic checks save bandwidth.
        if (text.length > 500) {
            alertDiv.textContent = '⚠️ Message is too long. Please shorten your text.';
            alertDiv.classList.remove('hidden');
            // Hide the alert after a few seconds
            setTimeout(() => alertDiv.classList.add('hidden'), 5000);
            return;
        }

        // Simulating a backend call to the guardrail/LLM API
        try {
            const response = await fetch('/api/chat', { // Assuming /api/chat is the endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // d. Access Controls: Ideally, a secure token for user authentication is sent here
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();

            // Check for explicit backend guardrail trigger
            if (data.is_blocked) {
                // Backend determined the input was toxic/restricted
                alertDiv.textContent = '⚠️ I cannot process that request. Please try a different approach.';
                alertDiv.classList.remove('hidden');
                setTimeout(() => alertDiv.classList.add('hidden'), 5000);
                
                // Remove the user's message that was blocked for visual cue (optional, based on UX choice)
                messagesContainer.lastElementChild.remove();
                return;
            }

            // Display the companion's response
            displayCompanionMessage(data.response);

        } catch (error) {
            console.error('API Error:', error);
            displayCompanionMessage("I'm sorry, I'm having trouble connecting right now. Please try again.");
        }
    }

    sendButton.addEventListener('click', sendMessage);

    // Allow sending message with Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});