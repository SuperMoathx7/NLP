var cur_lang = "en"

let lang_model = {
    title: {
        en: "Phone Recommender ChatBot",
        ar: "الروبوت مرشِّح الهواتف"
    },
    subTitle: {
        en: "Ask for phone recommendations",
        ar: "اطلب توصيات للهواتف"
    },
    userInput: {
        en: "Enter your question",
        ar: "أدخل سؤالك"
    },
    askButton: {
        en: "Ask!",
        ar: "اسأل!"
    },
    thinking: {
        en: "Thinking...",
        ar: "جارٍ التفكير..."
    },
    searching: {
        en: "Searching...",
        ar: "جارٍ البحث..."
    },
    pleaseEnterMessage: {
        en: "Please enter a message.",
        ar: "رجاءً أدخل رسالة."
    },
    readyMessage: {
        en: "Ready to help you find a phone or review!", // Updated
        ar: "جاهزٌ لمساعدتك في البحث عن الهاتف أو مراجعته!" // Updated
    },
    fetchingReviews: {
        en: "Fetching reviews for",
        ar: "جارٍ جلب المراجعات لـ"
    },
    reviewsFor: {
        en: "Reviews for",
        ar: "مراجعات لـ"
    },
    noReviewsFound: {
        en: "Sorry, I couldn't find any reviews for \"{phoneName}\".",
        ar: "عذرًا، لم أتمكن من العثور على أي مراجعات لـ \"{phoneName}\"."
    },
    showingReviewsForFeature: {
        en: "Showing reviews for {phoneName} (focusing on {feature}):",
        ar: "عرض مراجعات لـ {phoneName} (مع التركيز على {feature}):"
    },
    showingAllReviews: {
        en: "Showing all reviews for {phoneName}:",
        ar: "عرض جميع المراجعات لـ {phoneName}:"
    },
    reviewDataNotLoaded: {
        en: "Review data is not loaded yet. Please try again in a moment.",
        ar: "لم يتم تحميل بيانات المراجعات بعد. يرجى المحاولة مرة أخرى بعد لحظات."
    },
    phoneDataNotLoaded: { // Keep existing if still used elsewhere
        en: "Phone data is not loaded yet.",
        ar: "لم يتم تحميل بيانات الهواتف بعد."
    },
    savedChatsText: {
        en: "Saved Chats",
        ar: "المحادثات المحفوظة"
    },
    chatSaved: {
        en: "Chat saved successfully!",
        ar: "تم حفظ المحادثة بنجاح!"
    },
    noSavedChats: {
        en: "No saved chats found.",
        ar: "لا توجد محادثات محفوظة."
    },
    newChatText: {
        en: "New Chat",
        ar: "محادثة جديدة"
    },
    saveChatText: {
        en: "Save Chat",
        ar: "حفظ المحادثة"
    },
    loadChatsText: {
        en: "Load Chats",
        ar: "تحميل المحادثات"
    },
};

const result_lang_mdoel = [
    {
        en: "Here are some phones that match your request:",
        ar: "إليك بعض الهواتف التي تطابق طلبك:"
    },
    {
        en: "Here are some phones that are close to your request:",
        ar: "إليك بعض الهواتف القريبة من طلبك:"
    },
    {
        en: "Here are some phones that match some of your request:",
        ar: "إليك بعض الهواتف التي تطابق جزءاً من طلبك:"
    },
    {
        en: "No phones match your request, here are the closest ones:",
        ar: "لا توجد هواتف تطابق طلبك تماماً، إليك الأقرب:"
    }
]

function switchLanguage(new_lang) {
    cur_lang = new_lang
    switchButtons()
    switchMainScreen()
    updateResultMessage()
    startNewChat()
}

function switchButtons() {
    if (cur_lang == "en") {
        document.getElementById("en-btn").classList.add("active")
        document.getElementById("ar-btn").classList.remove("active")
    } else {
        document.getElementById("ar-btn").classList.add("active")
        document.getElementById("en-btn").classList.remove("active")
    }
}

function switchMainScreen() {
    if (cur_lang == "en") {
        document.body.classList.remove("ar-text")
        document.body.classList.add("en-text")
    } else {
        document.body.classList.add("ar-text")
        document.body.classList.remove("en-text")
    }
    document.documentElement.lang = cur_lang;
    document.documentElement.dir = cur_lang === 'ar' ? 'rtl' : 'ltr';
    for (const id in lang_model) {
        if (document.getElementById(id)) {
            if (id == "userInput") {
                document.getElementById(id).placeholder = lang_model[id][cur_lang]
            } else {
                document.getElementById(id).textContent = lang_model[id][cur_lang]
            }
        }
    }
}

function updateResultMessage() {
    if (document.getElementById("result-message")) {
        for (let i = 0; i < 4; ++i) {
            if (document.getElementById("result-message").textContent == result_lang_mdoel[i].en || document.getElementById("result-message").textContent == result_lang_mdoel[i].ar) {
                document.getElementById("result-message").textContent = result_lang_mdoel[i][cur_lang]
            }
        }
    }
}