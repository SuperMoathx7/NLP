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
    }

}


function switchLanguage(new_lang) {
    cur_lang = new_lang
    switchButtons()
    switchMainScreen()
      updateResponseReadyMessage(); 
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
        if (id == "userInput") {
            document.getElementById(id).placeholder = lang_model[id][cur_lang]
        } else {
            document.getElementById(id).textContent = lang_model[id][cur_lang]
        }
    }
}