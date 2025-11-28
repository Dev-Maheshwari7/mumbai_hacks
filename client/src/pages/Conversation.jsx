import { useState, useRef, useEffect } from 'react';

export default function ConversationalFactChecker() {
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I am your AI fact-checking agent. You can speak or type your claim, and I will investigate it for you. What would you like me to fact-check today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (event.results[event.results.length - 1].isFinal) {
          setInputText(transcript);
        }
      };
    }
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text to Speech
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('hhttp://localhost:5173/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          conversation_history: messages.map((m) => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from backend');
      }

      const data = await response.json();
      const aiMessage = { type: 'ai', text: data.response };
      setMessages((prev) => [...prev, aiMessage]);

      // Speak the response
      speakText(data.response);
    } catch (err) {
      const errorMessage = { type: 'ai', text: `Error: ${err.message}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>AI Fact-Checking Agent</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Speak or type your claim, and I'll investigate it for you</p>

      {/* Messages Container */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '15px', display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '70%',
                padding: '10px 15px',
                borderRadius: '8px',
                backgroundColor: message.type === 'user' ? '#007bff' : '#e9ecef',
                color: message.type === 'user' ? 'white' : 'black',
                wordWrap: 'break-word',
              }}
            >
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.text}</p>
              {message.type === 'ai' && (
                <button
                  onClick={() => speakText(message.text)}
                  style={{
                    marginTop: '8px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: '#495057',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSpeaking ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && <p style={{ textAlign: 'center', color: '#666' }}>AI is thinking...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your claim or use voice..."
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          disabled={loading || isListening}
        />

        <button
          onClick={startListening}
          disabled={loading || isListening}
          style={{
            padding: '10px 15px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isListening ? '#dc3545' : '#17a2b8',
            color: 'white',
            cursor: isListening ? 'not-allowed' : 'pointer',
          }}
          title="Click to start speaking"
        >
          {isListening ? '🎤 Listening...' : '🎤 Speak'}
        </button>

        <button
          onClick={handleSendMessage}
          disabled={loading || !inputText.trim()}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Analyzing...' : 'Send'}
        </button>
      </div>
    </div>
  );
}