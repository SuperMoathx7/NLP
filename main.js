//const apiKey = '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'
//const apiKey = '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';
//const apiKey = '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';
const apiKey = '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'



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
    const responseDiv = document.getElementById('response');
    // Use the lang_model for localization
    responseDiv.innerHTML = `<div class="response-placeholder"><i class="fas fa-robot"></i><p>${lang_model.readyMessage[cur_lang]}</p></div>`;
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
};

// --- Helper to generate star ratings ---
function generateStarRating(rating) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return '<span>No rating</span>';
    }
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>'; // Using far for empty star
    }
    return `<div class="star-rating">${stars} (${rating.toFixed(1)})</div>`;
}


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

// --- Display reviews from CSV ---
async function displayPhoneReviewsFromCSV(phoneName, requestedFeature) {
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = `${lang_model.fetchingReviews[cur_lang]} "${phoneName}"...`;

    if (!reviewsDataLoaded) {
        responseDiv.innerHTML = lang_model.reviewDataNotLoaded[cur_lang];
        return;
    }

    const lowerPhoneName = phoneName.toLowerCase();
    // Filter reviews: Model name in reviews.csv should contain the extracted phoneName.
    // This allows "iPhone 15" to match "iPhone 15 128GB", "iPhone 15 256GB", etc.
    const matchingReviews = reviewsData.filter(review =>
        review.Model && typeof review.Model === 'string' && review.Model.toLowerCase().includes(lowerPhoneName)
    );

    if (matchingReviews.length > 0) {
        let htmlResponse = '';
        if (requestedFeature && requestedFeature.toLowerCase() !== 'overall') {
            htmlResponse += `<h5>${lang_model.showingReviewsForFeature[cur_lang].replace("{phoneName}", phoneName).replace("{feature}", requestedFeature)}</h5>`;
        } else {
            htmlResponse += `<h5>${lang_model.showingAllReviews[cur_lang].replace("{phoneName}", phoneName)}</h5>`;
        }

        // Limit number of reviews shown, e.g., top 5 or random 5
        const reviewsToShow = matchingReviews.slice(0, 5); 

        reviewsToShow.forEach(review => {
            htmlResponse += `
                <div class="review-item">
                    ${generateStarRating(parseFloat(review.Rating))}
                    <p>${review.Review}</p>
                    <small class="text-muted">Model: ${review.Model} (Company: ${review.Company || 'N/A'})</small>
                </div>`;
        });
        if(cur_lang=="ar"){//send the result to the model to translate it then return it back and show it up to the display....
            let prompt = `Act like an expert HTML content translator with deep knowledge of preserving web structure integrity.

Objective: You will receive an HTML document that contains various tags and elements. Your task is to translate only the text inside the <p> and <h5> tags into Arabic, while keeping the rest of the HTML code unchanged. Do not modify any other tags, attributes, or structural parts of the HTML. The output must be a clean, complete HTML string that mirrors the input structure exactly—except for the translated contents of the specified tags.

Follow these steps meticulously:

Step 1: Identify and extract the contents of all <p> and <h5> tags in the HTML string.

Step 2: Translate only the textual content found inside these tags into the target language, without affecting any HTML tags, inline styles, classes, or attributes.

Step 3: Replace the original text within each <p> and <h5> tag with the translated version while preserving the rest of the document exactly as it is.

Step 4: Return the full HTML document with the updated translations, ensuring that it remains valid and correctly formatted.

Step 5: Do not add any commentary or explanation—just return the updated HTML string.

Here is the HTML content for translation:
${htmlResponse}

Take a deep breath and work on this problem step-by-step.
`;
            responseDiv.innerHTML = await getResponse(prompt);
        }
        else{
            responseDiv.innerHTML = htmlResponse;
            console.log(htmlResponse);}
    } else {
        responseDiv.innerHTML = lang_model.noReviewsFound[cur_lang].replace("{phoneName}", phoneName);
    }
}


// --- 2. Main function to handle user messages ---
async function sendMessage() {
    const inputElement = document.getElementById('userInput');
    const input = inputElement.value;
    const responseDiv = document.getElementById('response');

    if (!input.trim()) {
        responseDiv.innerHTML = lang_model.pleaseEnterMessage[cur_lang];
        return;
    }

    responseDiv.innerHTML = lang_model.thinking[cur_lang];

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
            responseDiv.innerHTML = lang_model.searching[cur_lang];
            await findPhoneRecommendations(translatedQuery.toLowerCase()); // This function is in recommendation.js
        } else if (!mobileDataLoaded && isPhoneQuery) {
            responseDiv.innerHTML = lang_model.phoneDataNotLoaded[cur_lang];
        }
        else {
            responseDiv.innerHTML = lang_model.thinking[cur_lang];
            let generalPrompt = `Act like a concise assistant named "PhoneFinderBot". You help users pick a phone using only these specs: price, RAM, screen size, CPU type, battery size, camera MP, and weight.

You do not answer general phone questions. Only reply briefly, and always remind users you can help based on these specs only.

Follow these steps:
Step 1: Detect if the user writes in Arabic or English. Respond in the same language.
Step 2: If the question is off-topic, reply briefly and remind them of your spec-based help.
Step 3: If specs are mentioned, acknowledge and ask for more info if needed to assist.

Example replies:
EN: “I help with phone specs only (price, RAM, CPU, etc.). Please share your preferences.”
AR: "أساعدك حسب المواصفات فقط (السعر، الرام، المعالج...). من فضلك أرسل تفضيلاتك."

Take a deep breath and work on this problem step-by-step.

here is the text ${input}`;
            await getGeneralResponse(generalPrompt);
        }
    }
}

// --- 4. Phone-related logic (for recommendations) ---
async function checkForPhoneKeywords(text) {
    // ... (your existing checkForPhoneKeywords function)
    const prompt = `Hello, you are a phone expert. I want to give you a piece of text. Tell me if it is related to phones or not. Just answer "yes" or "no" only. Don't say anything else.\n\nThe text is: ${text}`;
    let prompt_response = await getResponse(prompt);
    console.log("checkForPhoneKeywords response:", prompt_response);
    return prompt_response.trim().toLowerCase() === 'yes';
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
    const responseDiv = document.getElementById('response');
    try {
        const markdownText = await getResponse(input);
        responseDiv.innerHTML = marked.parse(markdownText);
    } catch (error) {
        // Error is already logged by getResponse
        responseDiv.innerHTML = 'Error communicating with the AI model. Please try again. (' + error.message + ')';
    }
}
// ... (rest of your main.js, if any)