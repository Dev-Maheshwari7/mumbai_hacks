/**
 * FREE WhatsApp Fact-Checking Bot using whatsapp-web.js
 * No Twilio, No API keys, 100% FREE!
 * 
 * This uses your own WhatsApp account via WhatsApp Web
 * Works exactly like WhatsApp Web in your browser
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:5000';
const conversationStore = {};

// Create WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR code for authentication
client.on('qr', (qr) => {
    console.log('\n🔐 Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Open WhatsApp > Menu > Linked Devices > Link a Device');
    console.log('📸 Scan the QR code above\n');
});

// Client is ready
client.on('ready', () => {
    console.log('✅ WhatsApp Fact-Checking Bot is ready!');
    console.log('📱 Your bot is now connected to WhatsApp');
    console.log('💬 Send a message to your WhatsApp to test the bot\n');
    console.log('Commands:');
    console.log('  - Send any claim to fact-check');
    console.log('  - Share a URL to analyze');
    console.log('  - Type "help" for commands');
    console.log('  - Type "clear" to reset conversation\n');
});

// Handle authentication success
client.on('authenticated', () => {
    console.log('🔓 Authentication successful!');
});

// Handle authentication failure
client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

// Handle disconnection
client.on('disconnected', (reason) => {
    console.log('⚠️ Client was disconnected:', reason);
});

// Function to call backend API for fact-checking
async function factCheckMessage(message, conversationHistory = []) {
    try {
        const response = await axios.post(`${BACKEND_URL}/conversational-fact-check`, {
            message: message,
            conversation_history: conversationHistory
        });

        return response.data.response;
    } catch (error) {
        console.error('Error calling backend:', error.message);
        return `Sorry, I encountered an error while fact-checking. Please try again later.`;
    }
}

// Handle incoming messages
client.on('message', async (msg) => {
    try {
        const chatId = msg.from;
        const messageText = msg.body.trim();

        console.log(`📨 Received message from ${chatId}: ${messageText}`);
        console.log(`   fromMe: ${msg.fromMe}, hasMedia: ${msg.hasMedia}`);

        // Ignore group messages (optional - remove this if you want group support)
        const chat = await msg.getChat();
        if (chat.isGroup) {
            console.log(`⏭️ Ignoring group message`);
            return; // Ignore group messages
        }

        console.log(`📨 Processing message from ${chatId}: ${messageText}`);

        // Handle commands
        if (messageText.toLowerCase() === 'help') {
            const helpText = `🔍 *Fact-Checking Bot Commands*

• Send any claim to fact-check
• Share a URL to analyze
• Type *clear* to reset conversation
• Type *help* to see this message

*Examples:*
"Does drinking lemon water cure cancer?"
"https://example.com/article"

*How it works:*
✓ For URLs: I'll scrape and analyze the content
✓ For text claims: I'll search the web for real-time information
✓ I use AI to provide accurate fact-checking`;

            await msg.reply(helpText);
            return;
        }

        if (messageText.toLowerCase() === 'clear') {
            conversationStore[chatId] = [];
            await msg.reply('✅ Conversation cleared! Send me a new claim to fact-check.');
            return;
        }

        // Get or create conversation history
        if (!conversationStore[chatId]) {
            conversationStore[chatId] = [];
        }

        // Show typing indicator
        chat.sendStateTyping();

        // Fact-check the message
        console.log(`🔍 Fact-checking: "${messageText.substring(0, 50)}..."`);
        const response = await factCheckMessage(messageText, conversationStore[chatId]);
        console.log(`📝 Response: "${response.substring(0, 100)}..."`);

        // Store conversation
        conversationStore[chatId].push({ role: 'user', content: messageText });
        conversationStore[chatId].push({ role: 'assistant', content: response });

        // Keep only last 10 messages
        if (conversationStore[chatId].length > 10) {
            conversationStore[chatId] = conversationStore[chatId].slice(-10);
        }

        // Send response
        await msg.reply(response);
        console.log(`✅ Response sent to ${chatId}\n`);

    } catch (error) {
        console.error('Error handling message:', error);
        await msg.reply('Sorry, I encountered an error processing your message. Please try again.');
    }
});

// Initialize the client
console.log('🚀 Starting WhatsApp Fact-Checking Bot...');
console.log('⏳ Please wait for QR code...\n');
client.initialize();

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down bot...');
    await client.destroy();
    process.exit(0);
});
