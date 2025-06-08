// Global variable to hold the parsed mobile phone data
let mobileData = [];

// --- 1. Load and Parse the CSV data as soon as the page loads ---
window.onload = function () {
    Papa.parse('mobiles.csv', {
        download: true,
        header: true, // Treat the first row as headers
        dynamicTyping: true, // Automatically convert numbers
        complete: function (results) {
            console.log("CSV data loaded and parsed successfully:", results.data);
            mobileData = results.data;
            document.getElementById('response').innerHTML = 'Data loaded. Ready to help you find a phone!';
        },
        error: function(error) {
            console.error("Error loading or parsing CSV:", error);
            document.getElementById('response').innerHTML = '<strong>Error:</strong> Could not load `mobiles.csv`. Please ensure the file is in the same directory as this HTML file.';
        }
    });
};

// --- 2. Main function to handle user messages ---
async function sendMessage() {
    const input = document.getElementById('userInput').value;
    const responseDiv = document.getElementById('response');
    if (!input) {
        responseDiv.innerHTML = 'Please enter a message.';
        return;
    }

    responseDiv.innerHTML = 'Thinking...';

    // --- 3. Check if the query is phone-related ---
    const isPhoneQuery = checkForPhoneKeywords(input.toLowerCase());

    if (isPhoneQuery && mobileData.length > 0) {
        // Handle as a phone query
        const recommendations = await findPhoneRecommendations(input.toLowerCase());
        // responseDiv.innerHTML = recommendations;
    } else {
        // Handle as a general chat query using the API
        await getGeneralResponse(input);
    }
}

// --- 4. Phone-related logic ---
function checkForPhoneKeywords(text) {
    const keywords = ["phone", "mobile", "battery", "ram", "camera", "screen", "processor", "gb", "mah", "mp", "inch", "snapdragon", "bionic"];
    return keywords.some(keyword => text.includes(keyword));
}

// --- 5. General chat logic (API call) ---
async function getGeneralResponse(input) {
    const responseDiv = document.getElementById('response');
    try {
        // IMPORTANT: This API key is visible in the frontend code.
        // For a real application, this should be handled via a secure backend.
        const apiKey = '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';
        const response = await fetch(
            'https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat:free', // Using a reliable free model
                    messages: [{ role: 'user', content: input }],
                }),
            },
        );
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const markdownText = data.choices?.[0]?.message?.content || 'No response received.';
        responseDiv.innerHTML = marked.parse(markdownText);

    } catch (error) {
        console.error("API Error:", error);
        responseDiv.innerHTML = 'Error communicating with the AI model: ' + error.message;
    }
}