# FactSure Browser Extension 🔍

A Chrome browser extension that connects directly to your FactSure AI fact-checking conversation bot. Paste any article URL or claim directly from your browser and get instant AI-powered fact-checking.

## Features

- 🚀 **Quick Access**: Check facts without leaving your current page
- 🔗 **URL Analysis**: Paste any article URL for instant fact-checking
- 💬 **Conversational AI**: Interactive chat interface with AI agent
- 📄 **Current Page**: One-click to check the page you're currently viewing
- 💾 **Persistent History**: Your conversation is saved across sessions
- 🎨 **Beautiful UI**: Modern, gradient design with smooth animations

## Prerequisites

Before installing the extension, make sure:

1. **Backend Server is Running**:
   ```bash
   cd backend
   python app.py
   ```
   Server should be running at `http://localhost:5000`

2. **GEMINI_API_KEY is configured** in your backend `.env` file

## Installation Instructions

### Step 1: Prepare Icon Files

The extension needs PNG icons. You can:

**Option A: Use online converter**
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icons/icon128.svg`
3. Convert to PNG at 128x128, 48x48, and 16x16 sizes
4. Save as `icon128.png`, `icon48.png`, `icon16.png` in the `icons/` folder

**Option B: Use ImageMagick (if installed)**
```bash
cd browser-extension/icons
magick icon128.svg -resize 128x128 icon128.png
magick icon128.svg -resize 48x48 icon48.png
magick icon128.svg -resize 16x16 icon16.png
```

**Option C: Use any simple icon**
- Just place any 3 PNG images (128x128, 48x48, 16x16) in the `icons/` folder
- Name them `icon128.png`, `icon48.png`, `icon16.png`

### Step 2: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`

2. Enable **Developer mode** (toggle in top-right corner)

3. Click **"Load unpacked"**

4. Navigate to and select the `browser-extension` folder

5. The FactSure extension should now appear in your extensions list!

### Step 3: Pin the Extension

1. Click the puzzle piece icon in Chrome toolbar
2. Find "FactSure - AI Fact Checker"
3. Click the pin icon to keep it visible

## Usage

### Method 1: Check Current Page
1. Click the FactSure extension icon
2. Click "📄 Current Page" button
3. The current tab's URL will be loaded
4. Click "Check Claim" to analyze

### Method 2: Paste Any URL
1. Click the FactSure extension icon
2. Paste any article URL in the input field
3. Click "Check Claim"
4. The AI will analyze the article

### Method 3: Type Your Claim
1. Click the FactSure extension icon
2. Type your claim or question in the message box
3. Press Enter or click "Send ➤"
4. Have a conversation with the AI

## Features Explained

### 🎤 Conversational Interface
- Ask follow-up questions
- Get detailed explanations
- Natural back-and-forth dialogue

### 💾 Persistent Chat
- Your conversation is automatically saved
- Close and reopen the extension - history remains
- Click "Clear Chat" to start fresh

### 🔗 Smart URL Detection
- Automatically recognizes URLs
- Analyzes article content
- Provides context-aware fact-checking

### 🌐 Open Full App
- Click "Open Full App" link in footer
- Opens your full React app in a new tab
- Seamless integration with main platform

## Troubleshooting

### Extension doesn't load
- Make sure all icon files (icon16.png, icon48.png, icon128.png) exist in `icons/` folder
- Check Chrome DevTools Console for errors
- Try reloading the extension in `chrome://extensions/`

### "Failed to fetch" errors
- Ensure backend is running at `http://localhost:5000`
- Check that CORS is enabled in `app.py`
- Verify the API endpoint `/conversational-fact-check` exists

### Icons not showing
- Convert the SVG file to PNG format (see Step 1 above)
- Make sure PNG files are in `browser-extension/icons/` folder
- Reload the extension after adding icons

### Chat history not saving
- Check browser console for storage errors
- Make sure `chrome.storage` permission is granted
- Try reinstalling the extension

## Configuration

### Change Backend URL
Edit `popup.js`:
```javascript
const API_URL = 'http://your-backend-url:5000/conversational-fact-check';
```

### Change Full App URL
Edit `popup.js`:
```javascript
const FULL_APP_URL = 'http://your-frontend-url:5173';
```

## File Structure

```
browser-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.css           # Styles for popup
├── popup.js            # JavaScript logic
├── README.md           # This file
└── icons/
    ├── icon128.svg     # SVG source icon
    ├── icon128.png     # 128x128 PNG icon (create this)
    ├── icon48.png      # 48x48 PNG icon (create this)
    └── icon16.png      # 16x16 PNG icon (create this)
```

## Tech Stack

- **Vanilla JavaScript**: No frameworks needed
- **Chrome Extensions API**: For browser integration
- **Chrome Storage API**: For persistent conversations
- **Fetch API**: For backend communication

## Development

### Testing Changes
1. Make changes to files
2. Go to `chrome://extensions/`
3. Click refresh icon on FactSure extension
4. Test your changes

### Debugging
1. Right-click extension icon → "Inspect popup"
2. Chrome DevTools will open
3. Check Console for errors
4. Use debugger statements in `popup.js`

## Security Notes

- Extension only works with `localhost:5000` by default
- Update `host_permissions` in `manifest.json` for production
- Never commit API keys in extension files
- All requests go through your backend (API keys stay secure)

## Future Enhancements

- [ ] Support for multiple backend endpoints
- [ ] Export conversation history
- [ ] Dark mode toggle
- [ ] Custom themes
- [ ] Voice input support
- [ ] Share fact-checks on social media
- [ ] Browser notifications for results

## Support

If you encounter issues:
1. Check that backend is running
2. Verify all files are present
3. Check browser console for errors
4. Reload the extension

## License

This extension is part of the FactSure project.

---

Made with 💜 by FactSure Team
