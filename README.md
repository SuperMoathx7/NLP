# 📱 Phone Recommender ChatBot

An interactive web-based chatbot that gives personalized phone recommendations and review summaries based on user input. Supports English and Arabic. Built using HTML, CSS, JS, Bootstrap, and CSV datasets—no backend needed.

---

## 🔥 Features

- 📊 Recommends phones based on user-defined specs (RAM, battery, screen, etc.)
- 💬 Displays user reviews from a CSV dataset
- 🌐 Supports English + Arabic (RTL compatible)
- 💾 Local chat saving & loading (via browser localStorage)
- 🧠 Smart prompt logic for parsing input and guiding conversation
- 📈 Responsive UI with smooth UX

---

## 🧠 Tech Stack

- Vanilla JavaScript (modular)
- Bootstrap 4.3
- Font Awesome
- PapaParse (CSV parsing)
- Marked.js (Markdown support)
- OpenRouter API (GPT model backend)

---

## 📂 File Structure

```plaintext
📁 project-root/
├── index.html            # Main UI layout
├── style.css             # Custom styles
├── main.js               # App entry + data loading
├── chat.js               # Chat history + localStorage logic
├── language.js           # Bilingual UI + dynamic translation
├── recommendation.js     # Core logic for phone suggestions
├── review.js             # Review parsing + summarization
├── mobiles.csv           # Phone data
├── reviews.csv           # User review data
```

---

## 🚀 Getting Started

1. **Clone the repo:**

```bash
git clone https://github.com/your-username/phone-recommender-chatbot.git
cd phone-recommender-chatbot
```

2. **Run locally:**

Open `index.html` directly in your browser.

> ⚠️ Some browsers (like Chrome) block local CSV access unless served over HTTP. Use a local server:
```bash
npx serve .
# or
python3 -m http.server
```

3. **Set your API key:**

Replace the `apiKey` in `main.js`:

```js
const apiKey = 'sk-or-...'; // Replace with your OpenRouter API key
```

> Never expose your real keys in public. For production, move API access to a backend.

---

## 🌍 Language Support

Switch between English and Arabic using the buttons at the top of the UI. The layout adjusts automatically (RTL for Arabic).

---

## 🧪 Example Prompts

- “I need a phone with 8GB RAM and a great camera.”
- “ما أفضل هاتف ببطارية قوية؟”
- “Review for iPhone 15 Pro”
- “How’s the camera on Galaxy S24?”

---

## 💬 Chat Management

- 💾 Save chats to localStorage
- 📂 Load and continue past conversations
- 🗑️ Delete saved chats

---

## 🛠️ Developer Notes

- All logic is handled client-side (no backend required)
- Modular JS structure
- Dynamic feature extraction and review summarization using GPT
- CSV parsing done with PapaParse

---

## 👥 Contributors

- **Your Name** – Full-stack Dev / Project Creator  
- **ChatGPT** – Prompting, architecture suggestions, review logic (LLM assistant)  

Want to contribute? Open an issue or PR.

---

## 📜 License

MIT – free to use, modify, or distribute. Just don't expose your real keys or misuse third-party APIs.
