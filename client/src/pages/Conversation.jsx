import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Copy, Check } from 'lucide-react';

export default function FactChecker() {
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I\'m your fact-checking assistant. Ask me to verify any claim, and I\'ll search the web for the latest evidence. What would you like me to fact-check?', verdict: 'NONE' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const getVerdictStyle = (verdict) => {
    const styles = {
      'TRUE': { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✓', label: 'TRUE', color: 'text-emerald-700' },
      'FALSE': { bg: 'bg-rose-50', border: 'border-rose-200', icon: '✗', label: 'FALSE', color: 'text-rose-700' },
      'UNVERIFIABLE': { bg: 'bg-sky-50', border: 'border-sky-200', icon: '~', label: 'UNVERIFIABLE', color: 'text-sky-700' },
      'NONE': { bg: 'bg-slate-50', border: 'border-slate-200', icon: '', label: '', color: 'text-slate-700' }
    };
    return styles[verdict?.toUpperCase()] || styles['NONE'];
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { type: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/conversational-fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          conversation_history: messages.map((m) => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch from backend');

      const data = await response.json();
      let parsedResponse = data.response;

      if (typeof parsedResponse === 'string') {
        try {
          const jsonMatch = parsedResponse.match(/json\s*([\s\S]*?)\s*/);
          const jsonString = jsonMatch ? jsonMatch[1] : parsedResponse;
          parsedResponse = JSON.parse(jsonString);
        } catch (e) {
          parsedResponse = null;
        }
      }

      let formattedResponse = '';
      let speakableText = '';
      let verdict = 'NONE';

      if (parsedResponse && typeof parsedResponse === 'object') {
        verdict = parsedResponse.verdict || 'NONE';
        const confidence = parsedResponse.confidence_score || 0;
        const agentResponse = parsedResponse.agent_response || '';
        const evidence = parsedResponse.evidence_summary || '';

        formattedResponse = `${agentResponse}\n\nConfidence: ${confidence}%\n\nEvidence:\n${evidence}`;
        speakableText = `The verdict is ${verdict} with ${confidence} percent confidence. ${agentResponse}`;
      } else {
        formattedResponse = data.response || 'No response from AI.';
        speakableText = formattedResponse;
      }

      const aiMessage = { type: 'ai', text: formattedResponse, verdict };
      setMessages((prev) => [...prev, aiMessage]);
      speakText(speakableText);
    } catch (err) {
      const errorMessage = { type: 'ai', text: `Error: ${err.message}`, verdict: 'NONE' };
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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col ml-72">
      {/* Header */}
      <div className="bg-white bg-opacity-60 backdrop-blur-md border-b border-white border-opacity-40 px-6 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
              ✓
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Fact Check</h1>
              <p className="text-sm text-slate-500 mt-0.5">Verify claims with real-time web evidence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-5">
          {messages.map((message, index) => {
            const verdictStyle = getVerdictStyle(message.verdict);
            return (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl ${message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-400 to-purple-400 text-white rounded-2xl px-5 py-4 shadow-md' 
                  : `${verdictStyle.bg} border ${verdictStyle.border} rounded-2xl px-5 py-4 shadow-sm`}`}>
                  {message.type === 'ai' && message.verdict !== 'NONE' && (
                    <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${verdictStyle.border}`}>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-bold text-sm ${verdictStyle.color}`}>
                        {verdictStyle.icon}
                      </span>
                      <span className={`font-semibold text-sm ${verdictStyle.color}`}>{verdictStyle.label}</span>
                    </div>
                  )}
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${message.type === 'user' ? 'text-white' : 'text-slate-700'}`}>
                    {message.text}
                  </div>
                  {message.type === 'ai' && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200 border-opacity-50">
                      <button
                        onClick={() => speakText(message.text)}
                        disabled={isSpeaking}
                        className={`p-2 rounded-lg transition ${isSpeaking ? 'bg-slate-200' : 'hover:bg-slate-200'} text-slate-700`}
                        title="Play audio"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        onClick={() => copyToClipboard(message.text, index)}
                        className="p-2 rounded-lg hover:bg-slate-200 transition text-slate-700"
                        title="Copy text"
                      >
                        {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white bg-opacity-70 border border-white border-opacity-50 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Fact-checking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white bg-opacity-60 backdrop-blur-md border-t border-white border-opacity-40 px-6 py-5 shadow-sm">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything to fact-check..."
            disabled={loading || isListening}
            className="flex-1 bg-white bg-opacity-70 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition disabled:opacity-50 text-sm shadow-sm"
          />
          <button
            onClick={startListening}
            disabled={loading || isListening}
            className={`px-4 py-3 rounded-xl transition font-medium flex items-center gap-2 shadow-sm ${isListening 
              ? 'bg-rose-100 border-2 border-rose-300 text-rose-700' 
              : 'bg-white bg-opacity-70 border border-slate-200 text-slate-700 hover:bg-opacity-100'} disabled:opacity-50`}
            title="Voice input"
          >
            <Mic size={18} />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputText.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center font-medium shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}