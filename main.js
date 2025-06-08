// Global variable to hold the parsed mobile phone data
let mobileData = [];

function updateResponseReadyMessage() {
    const responseDiv = document.getElementById('response');
    if (cur_lang === "ar") {
        responseDiv.innerHTML = 'جاهزٌ لمساعدتك في البحث عن الهاتف المناسب!';
    } else {
        responseDiv.innerHTML = 'Ready to help you find a phone!';
    }
}

// --- 1. Load and Parse the CSV data as soon as the page loads ---
window.onload = function () {
    Papa.parse('mobiles.csv', {
        download: true,
        header: true, // Treat the first row as headers
        dynamicTyping: true, // Automatically convert numbers
        complete: function (results) {
            console.log("CSV data loaded and parsed successfully:", results.data);
            mobileData = results.data;
            
                 updateResponseReadyMessage();
            
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
        if (cur_lang=="en")
        responseDiv.innerHTML = 'Please enter a message.';
    else responseDiv.innerHTML = 'رجاءً أدخل رسالة';
        return;
    }

    responseDiv.innerHTML = 'Thinking...';
    //if the current lang was arabic, send the query to the ai model to translate it, then sent it to us, to process it normally,
        //then the output --will remain english because the output is in english, no need to translate it to arabic..--
    // --- 3. Check if the query is phone-related ---
    let translatedQuery="";
    if(cur_lang=="ar"){
        responseDiv.innerHTML = 'جارٍ التفكير...';
        const propmtt=`Act like a professional multilingual translator with expertise in semantic accuracy and linguistic nuance. Your task is to accurately translate non-English queries into English, ensuring natural phrasing and clear context. You will be provided with a block of foreign language text, clearly delimited. Do not include any commentary or formatting. Only return the fully translated English version of the input text.

Step-by-step:

Step 1: Identify the language of the input text.
Step 2: Translate the entire input text into grammatically correct and contextually accurate English.
Step 3: Remove any non-essential artifacts (e.g., brackets, placeholder notes) unless they are part of the original message's meaning.
Step 4: Return only the translated English text with no preamble or response structure.

Here is the input text:
${input}\n
Take a deep breath and work on this problem step-by-step.`;
        translatedQuery = await getResponse(propmtt);
        console.log(`the query was translated: from this ${input} to this ${translatedQuery}\n`);
    }
    else translatedQuery=input;

    const isPhoneQuery = await checkForPhoneKeywords(translatedQuery.toLowerCase());

    if (isPhoneQuery && mobileData.length > 0) {
        // Handle as a phone query
        if(cur_lang=="en")
        responseDiv.innerHTML = 'Searching...';
    else responseDiv.innerHTML = 'جارٍ البحث...';
        const recommendations = await findPhoneRecommendations(translatedQuery.toLowerCase());
        // responseDiv.innerHTML = recommendations;
    } else {
        // Handle as a general chat query using the API
        if(cur_lang=="en")
        responseDiv.innerHTML = 'Thinking...';
    else {
        responseDiv.innerHTML = 'جارٍ التفكير...';
    }
        let prompt = `Act like a concise assistant named "PhoneFinderBot". You help users pick a phone using only these specs: price, RAM, screen size, CPU type, battery size, camera MP, and weight.

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
        await getGeneralResponse(prompt);//if the input was in arabic, reply in arabic.
    }
}

// --- 4. Phone-related logic --- //need to be given to the AI model, the model will return whether it is related or not.
async function checkForPhoneKeywords(text) {
    const prompt = `Hello, you are a phone expert. I want to give you a piece of text. Tell me if it is related to phones or not. Just answer "yes" or "no" only. Don't say anything else.\n\nThe text is: ${text}`;
    
    let prompt_response = await getResponse(prompt);
    console.log("Prompt response:", prompt_response);

    return prompt_response.trim().toLowerCase() === 'yes';
}


// --- 5. General chat logic (API call) ---
async function getGeneralResponse(input) {
    const responseDiv = document.getElementById('response');
    try {
        // IMPORTANT: This API key is visible in the frontend code.
        // For a real application, this should be handled via a secure backend.
        //const apiKey = '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';
        //const apiKey = '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';
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