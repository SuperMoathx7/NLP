// Chat management functions
function startNewChat() {
    currentChatId = 'chat_' + Date.now();
    chatHistory = [];

    // Reset conversation context
    if (typeof conversationContext !== 'undefined') {
        conversationContext.lastPhoneDiscussed = null;
        conversationContext.lastFeatureDiscussed = null;
        conversationContext.conversationType = null;
        conversationContext.userPreferences = {};
    }

    displayChatHistory();
}

function saveCurrentChat() {
    if (chatHistory.length === 0) {
        alert(cur_lang === 'en' ? 'No messages to save!' : 'لا توجد رسائل للحفظ!');
        return;
    }

    const chatData = {
        id: currentChatId,
        language: cur_lang,
        timestamp: new Date().toISOString(),
        messages: chatHistory,
        preview: chatHistory[0]?.content?.substring(0, 50) + '...' || 'Empty chat'
    };

    const savedChats = getSavedChats();
    savedChats[currentChatId] = chatData;
    localStorage.setItem('phone_bot_chats', JSON.stringify(savedChats));
    
    alert(lang_model.chatSaved[cur_lang]);
}

function getSavedChats() {
    const saved = localStorage.getItem('phone_bot_chats');
    return saved ? JSON.parse(saved) : {};
}

function loadChatHistory() {
    const savedChats = getSavedChats();
    // You can implement auto-loading the last chat here if needed
}

function showSavedChats() {
    const savedChats = getSavedChats();
    const chatsList = document.getElementById('savedChatsList');
    
    if (Object.keys(savedChats).length === 0) {
        chatsList.innerHTML = `<p class="text-center text-muted">${lang_model.noSavedChats[cur_lang]}</p>`;
    } else {
        let chatsHtml = '';
        Object.values(savedChats).reverse().filter(chat => chat.language == cur_lang).forEach(chat => {
            const date = new Date(chat.timestamp).toLocaleDateString(cur_lang === 'ar' ? 'ar' : 'en');
            chatsHtml += `
                <div class="card mb-2">
                    <div class="card-body">
                        <h6 class="card-title">${chat.preview}</h6>
                        <p class="card-text small text-muted">${date} • ${chat.messages.length} messages</p>
                        <button class="btn btn-sm btn-primary" onclick="loadChat('${chat.id}')">
                            ${cur_lang === 'en' ? 'Load' : 'تحميل'}
                        </button>
                        <button class="btn btn-sm btn-danger ml-2" onclick="deleteChat('${chat.id}')">
                            ${cur_lang === 'en' ? 'Delete' : 'حذف'}
                        </button>
                    </div>
                </div>
            `;
        });
        chatsList.innerHTML = chatsHtml;
    }
    
    $('#savedChatsModal').modal('show');
}

function loadChat(chatId) {
    const savedChats = getSavedChats();
    const chat = savedChats[chatId];
    
    if (chat) {
        currentChatId = chatId;
        chatHistory = chat.messages;
        displayChatHistory();
        $('#savedChatsModal').modal('hide');
    }
}

function deleteChat(chatId) {
    if (confirm(cur_lang === 'en' ? 'Delete this chat?' : 'حذف هذه المحادثة؟')) {
        const savedChats = getSavedChats();
        delete savedChats[chatId];
        localStorage.setItem('phone_bot_chats', JSON.stringify(savedChats));
        showSavedChats(); // Refresh the list
    }
}



// Message handling
function addMessage(content, isUser, timestamp = new Date()) {
    const message = {
        content: content,
        isUser: isUser,
        lang: cur_lang,
        timestamp: timestamp.toISOString()
    };
    
    chatHistory.push(message);
    displayMessage(message);
    // scrollToBottom();
}

function displayMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Remove empty state if present
    const emptyState = messagesContainer.querySelector('.empty-chat');
    if (emptyState) {
        emptyState.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.isUser ? 'user-message' : 'bot-message'}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${message.content}
        </div>
        <div class="message-time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

function displayChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    if (chatHistory.length === 0) {
        messagesContainer.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-robot"></i>
                <p id="readyMessage">${lang_model.readyMessage[cur_lang]}</p>
            </div>
        `;
    } else {
        chatHistory.forEach(message => displayMessage(message));
    }
    
    // scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    // scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function removeLastMessage() {
    // Check if there are messages to remove
    if (chatHistory.length === 0) return;

    // Remove from chatHistory
    chatHistory.pop();
    
    // Remove from DOM
    const messagesContainer = document.getElementById('chatMessages');
    const lastMessage = messagesContainer.lastElementChild;
    if (lastMessage) {
        messagesContainer.removeChild(lastMessage);
    }

    // Show empty state if no messages left
    if (chatHistory.length === 0) {
        showEmptyState();
    }
}

// Optional: Helper function to show empty state
function showEmptyState() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
        <div class="empty-chat">
            No messages yet. Start chatting!
        </div>
    `;
}

function getAllChat() {
    console.log(chatHistory.filter(c => c.isUser).map(c => c.content).join(","))
    return chatHistory.filter(c => c.isUser).map(c => c.content).join(",")
}