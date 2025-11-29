// Backend API URL
const API_URL = 'http://localhost:5000/conversational-fact-check';
const FULL_APP_URL = 'http://localhost:5173'; // Your React app URL

// Conversation history
let conversationHistory = [];

// DOM Elements
const urlInput = document.getElementById('urlInput');
const checkUrlBtn = document.getElementById('checkUrl');
const getCurrentUrlBtn = document.getElementById('getCurrentUrl');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const chatContainer = document.getElementById('chatContainer');
const loadingDiv = document.getElementById('loading');
const clearChatBtn = document.getElementById('clearChat');
const openFullAppLink = document.getElementById('openFullApp');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadConversationHistory();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  checkUrlBtn.addEventListener('click', handleCheckUrl);
  getCurrentUrlBtn.addEventListener('click', handleGetCurrentUrl);
  sendMessageBtn.addEventListener('click', handleSendMessage);
  clearChatBtn.addEventListener('click', handleClearChat);
  openFullAppLink.addEventListener('click', handleOpenFullApp);
  
  // Enter key to send
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Enter key to check URL
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckUrl();
    }
  });
}

// Get current page URL
async function handleGetCurrentUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      urlInput.value = tab.url;
    }
  } catch (error) {
    console.error('Error getting current URL:', error);
    showError('Could not get current page URL');
  }
}

// Handle URL check
async function handleCheckUrl() {
  const url = urlInput.value.trim();
  
  if (!url) {
    showError('Please enter a URL');
    return;
  }

  const message = `I want to fact-check this article: ${url}`;
  await sendMessageToBot(message);
  urlInput.value = '';
}

// Handle send message
async function handleSendMessage() {
  const message = messageInput.value.trim();
  
  if (!message) {
    return;
  }

  await sendMessageToBot(message);
  messageInput.value = '';
  messageInput.style.height = 'auto';
}

// Send message to bot
async function sendMessageToBot(message) {
  // Add user message to chat
  addMessageToChat('user', message);
  
  // Show loading
  showLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        conversation_history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the response structure from backend
    let botMessage = '';
    if (data.response && typeof data.response === 'object') {
      // New format with structured response
      const verdict = data.response.verdict || 'NONE';
      const confidence = data.response.confidence_score || 0;
      const agentResponse = data.response.agent_response || '';
      const evidence = data.response.evidence_summary || '';
      
      // Format the message
      if (verdict !== 'NONE') {
        botMessage = `${agentResponse}\n\nVerdict: ${verdict}\nConfidence: ${confidence}%\n\nEvidence:\n${evidence}`;
      } else {
        botMessage = agentResponse;
      }
    } else if (typeof data.response === 'string') {
      // Fallback for string response
      botMessage = data.response;
    } else {
      botMessage = 'No response from AI.';
    }
    
    // Add bot response to chat
    addMessageToChat('ai', botMessage);
    
  } catch (error) {
    console.error('Error:', error);
    addMessageToChat('ai', `Sorry, I encountered an error: ${error.message}. Make sure the backend server is running at ${API_URL}`);
  } finally {
    showLoading(false);
  }
}

// Add message to chat
function addMessageToChat(type, text) {
  // Add to history
  conversationHistory.push({
    role: type === 'user' ? 'user' : 'assistant',
    content: text,
  });

  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const textP = document.createElement('p');
  textP.textContent = text;
  
  contentDiv.appendChild(textP);
  messageDiv.appendChild(contentDiv);
  
  chatContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  // Save conversation
  saveConversationHistory();
}

// Show loading indicator
function showLoading(show) {
  loadingDiv.style.display = show ? 'flex' : 'none';
  sendMessageBtn.disabled = show;
  checkUrlBtn.disabled = show;
}

// Show error
function showError(message) {
  addMessageToChat('ai', `⚠️ ${message}`);
}

// Clear chat
function handleClearChat() {
  if (confirm('Are you sure you want to clear the chat history?')) {
    conversationHistory = [];
    chatContainer.innerHTML = `
      <div class="message ai-message">
        <div class="message-content">
          <p>👋 Hello! I'm your AI fact-checking agent.</p>
          <p>Paste a URL above or type your claim below, and I'll investigate it for you!</p>
        </div>
      </div>
    `;
    saveConversationHistory();
  }
}

// Open full app
function handleOpenFullApp(e) {
  e.preventDefault();
  chrome.tabs.create({ url: FULL_APP_URL });
}

// Save conversation history to chrome.storage
function saveConversationHistory() {
  chrome.storage.local.set({ conversationHistory: conversationHistory });
}

// Load conversation history from chrome.storage
function loadConversationHistory() {
  chrome.storage.local.get(['conversationHistory'], (result) => {
    if (result.conversationHistory && result.conversationHistory.length > 0) {
      conversationHistory = result.conversationHistory;
      
      // Clear welcome message
      chatContainer.innerHTML = '';
      
      // Restore messages
      conversationHistory.forEach((msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.role === 'user' ? 'user' : 'ai'}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textP = document.createElement('p');
        textP.textContent = msg.content;
        
        contentDiv.appendChild(textP);
        messageDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(messageDiv);
      });
      
      // Scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
}

// Auto-resize textarea
messageInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});
