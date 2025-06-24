const apiKey = '';


// Global variable to hold the parsed mobile phone data
let mobileData = [];
let reviewsData = []; // To store reviews.csv data
let mobileDataLoaded = false;
let reviewsDataLoaded = false;

function checkAllDataLoaded() {
    if (mobileDataLoaded && reviewsDataLoaded) {
        updateResponseReadyMessage();
    }
}

function updateResponseReadyMessage() {
    const responseDiv = document.getElementById('readyMessage');
    // Use the lang_model for localization
    responseDiv.textContent = lang_model.readyMessage[cur_lang];
}

// --- 1. Load and Parse CSV data ---
window.onload = function () {
    Papa.parse('mobiles.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            console.log("mobiles.csv loaded:", results.data.length, "records");
            mobileData = results.data.filter(row => row["Model Name"]); // Filter out empty rows
            mobileDataLoaded = true;
            checkAllDataLoaded();
        },
        error: function(error) {
            console.error("Error loading mobiles.csv:", error);
            document.getElementById('response').innerHTML = '<strong>Error:</strong> Could not load `mobiles.csv`.';
        }
    });

    Papa.parse('reviews.csv', { // Load reviews.csv
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            console.log("reviews.csv loaded:", results.data.length, "records");
            reviewsData = results.data.filter(row => row.Model && row.Review); // Filter out empty/invalid rows
            reviewsDataLoaded = true;
            checkAllDataLoaded();
        },
        error: function(error) {
            console.error("Error loading reviews.csv:", error);
            document.getElementById('response').innerHTML = '<strong>Error:</strong> Could not load `reviews.csv`.';
        }
    });

    loadChatHistory();
    startNewChat();
};

// --- Helper to extract phone name and feature for review ---
async function extractPhoneNameAndFeatureForReview(text) {
    const prompt = `
Analyze the user query.
If it's a request for a review of a specific phone model, or a review of a specific feature (like camera, battery, performance, display) of a specific phone model, extract:
1. The full phone model name as accurately as possible.
2. The specific feature being asked about (e.g., "camera", "battery", "performance", "display", "overall"). If no specific feature is mentioned or it's a general review request, use "overall".

Respond ONLY in JSON format like this: {"phone_name": "extracted_phone_name_or_null", "feature": "extracted_feature_or_overall_or_null"}
If it's NOT a review request for a specific phone, respond with: {"phone_name": null, "feature": null}

Examples:
Query: "What is the review for iPhone 15 Pro?"
Response: {"phone_name": "iPhone 15 Pro", "feature": "overall"}

Query: "Tell me about the camera of Samsung Galaxy S24 Ultra"
Response: {"phone_name": "Samsung Galaxy S24 Ultra", "feature": "camera"}

Query: "iPhone 15 battery review"
Response: {"phone_name": "iPhone 15", "feature": "battery"}

Query: "How is the performance of Google Pixel 8?"
Response: {"phone_name": "Google Pixel 8", "feature": "performance"}

Query: "I want a phone with good battery"
Response: {"phone_name": null, "feature": null}

Query: "مراجعة ايفون 15 برو"
Response: {"phone_name": "iPhone 15 Pro", "feature": "overall"}

Query: "ما رأيك في بطارية سامسونج اس 23؟"
Response: {"phone_name": "Samsung S23", "feature": "battery"}

User query: "${text}"
consider the previous chats in order: "${getAllChat()}" 
Response:`;

    let llmResponse = await getResponse(prompt); // Assuming getResponse is your existing function
    try {
        // Attempt to clean up potential markdown code block fences
        llmResponse = llmResponse.replace(/^```json\s*|```\s*$/g, '').trim();
        const parsed = JSON.parse(llmResponse);
        if (parsed && typeof parsed.phone_name !== 'undefined' && typeof parsed.feature !== 'undefined') {
            return parsed;
        }
        return { phone_name: null, feature: null };
    } catch (e) {
        console.error("Error parsing LLM response for review extraction:", e, "LLM Response:", llmResponse);
        return { phone_name: null, feature: null }; // Fallback
    }
}


// --- 2. Main function to handle user messages ---
async function sendMessage() {
    const inputElement = document.getElementById('userInput');
    const input = inputElement.value.trim();
    inputElement.value = ""
    const responseDiv = document.getElementById('chatMessages');

    if (!input.trim()) {
        // responseDiv.innerHTML = lang_model.pleaseEnterMessage[cur_lang];
        return;
    }

    // responseDiv.innerHTML = lang_model.thinking[cur_lang];

    addMessage(input, true)

    showTypingIndicator();  

    let translatedQuery = input;
    if (cur_lang === "ar") {
        const propmtt = `Act like a professional multilingual translator with expertise in semantic accuracy and linguistic nuance. Your task is to accurately translate non-English queries into English, ensuring natural phrasing and clear context. You will be provided with a block of foreign language text, clearly delimited. Do not include any commentary or formatting. Only return the fully translated English version of the input text.

Step-by-step:

Step 1: Identify the language of the input text.
Step 2: Translate the entire input text into grammatically correct and contextually accurate English.
Step 3: Remove any non-essential artifacts (e.g., brackets, placeholder notes) unless they are part of the original message's meaning.
Step 4: Return only the translated English text with no preamble or response structure.

Here is the input text:
${input}\n
Take a deep breath and work on this problem step-by-step.`;
        translatedQuery = await getResponse(propmtt);
        console.log(`Query translated: from "${input}" to "${translatedQuery}"`);
    }

    // Attempt to extract review request
    const reviewQueryParts = await extractPhoneNameAndFeatureForReview(translatedQuery);

    if (reviewQueryParts && reviewQueryParts.phone_name) {
        await displayPhoneReviewsFromCSV(reviewQueryParts.phone_name, reviewQueryParts.feature);
    } else {
        // Proceed with recommendation or general chat if not a specific review request
        const isPhoneQuery = await checkForPhoneKeywords(translatedQuery.toLowerCase());

        if (isPhoneQuery && mobileDataLoaded) {
            await findPhoneRecommendations(translatedQuery.toLowerCase()); // This function is in recommendation.js
        } else if (!mobileDataLoaded && isPhoneQuery) {
            // responseDiv.innerHTML = lang_model.phoneDataNotLoaded[cur_lang];
            addMessage(lang_model.phoneDataNotLoaded[cur_lang], false)
        }
        else {
            let generalPrompt = `Act like a concise assistant named "PhoneFinderBot". You help users pick a phone using only these specs: price, RAM, screen size, CPU type, battery size, camera MP, and weight.

You do not answer general phone questions. Only reply briefly, and always remind users you can help based on these specs only.

Follow these steps (don't reply with steps, just the text):
Step 1: Detect if the user writes in Arabic or English. Respond in the same language.
Step 2: If the question is off-topic, reply briefly and remind them of your spec-based help, ask the user if he needs any help with phones recomendations or reviews in nicely
Step 3: If specs are mentioned, acknowledge and ask for more info if needed to assist.

Take a deep breath and work on this problem step-by-step.

here is the text ${input}`;
            await getGeneralResponse(generalPrompt);
        }
    }
    hideTypingIndicator()
}

// --- 4. Phone-related logic (for recommendations) ---
async function checkForPhoneKeywords(text) {
    // ... (your existing checkForPhoneKeywords function)
    const prompt = `Hello, you are a phone expert. I want to give you a piece of text. Tell me if it is related to phones or not. Just answer "yes" or "no" only. Don't say anything else.\n\nThe text is: "${text}" consider the previous chats in order: "${getAllChat()}"`;
    let prompt_response = await getResponse(prompt);
    console.log("checkForPhoneKeywords response:", prompt_response);
    return prompt_response.trim().toLowerCase().split('yes').length > 1;
}


// --- 5. General chat logic (API call) & getResponse ---
// Ensure getResponse is defined here or accessible. It's used by many functions now.
// If getResponse is in recommendation.js, consider moving it to main.js or a utility file.
// For this example, assuming getResponse is the one from your recommendation.js or main.js
async function getResponse(input) { // Copied from recommendation.js for completeness if not already here
    // const responseDiv = document.getElementById('response'); // Can be removed if not directly updating UI
    try {
        // const apiKey = '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';
        const fetchResponse = await fetch(
            'https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat:free',
                    messages: [{ role: 'user', content: input }],
                }),
            },
        );
        
        if (!fetchResponse.ok) {
            const errorData = await fetchResponse.text();
            console.error("API Error Data:", errorData);
            throw new Error(`API request failed with status ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }

        const data = await fetchResponse.json();
        const markdownText = data.choices?.[0]?.message?.content || 'No response received.';
        return markdownText.trim();

    } catch (error) {
        console.error("API Error in getResponse:", error);
        // document.getElementById('response').innerHTML = 'Error communicating with the AI model: ' + error.message; // Avoid direct UI update here
        throw error; // Re-throw error to be handled by caller
    }
}

async function getGeneralResponse(input) {
    const responseDiv = document.getElementById('readyMessage');
    try {
        const markdownText = await getResponse(input);
        // responseDiv.innerHTML = marked.parse(markdownText);
        addMessage(markdownText, false)
    } catch (error) {
        // Error is already logged by getResponse
        // responseDiv.innerHTML = 'Error communicating with the AI model. Please try again. (' + error.message + ')';
        addMessage('Error communicating with the AI model. Please try again. (' + error.message + ')', false)
    }
}
// ... (rest of your main.js, if any)
