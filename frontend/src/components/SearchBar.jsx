import { useState, useEffect, useRef } from "react";

function SearchBar({ search, setSearch, onVoiceSearchEnd, autoStart, onAutoStartDone, placeholder }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (autoStart && supported && !isListening) {
      const timer = setTimeout(() => {
        toggleListen(true); 
      }, 150);
      
      if (onAutoStartDone) onAutoStartDone();
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, supported, isListening, onAutoStartDone]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().replace(/\.$/, '');
        
        const exitWords = ["thanks", "thank you", "okay", "stop", "close", "nevermind", "that's it"];
        if (exitWords.some(word => transcript.includes(word))) {
          setIsListening(false);
          return;
        }

        const isCompass = /compass|locate|point|show me where|guide me/.test(transcript);
        const isRoute = /route|direction|map|take me|path/.test(transcript);
        
        // Removed "hey gemini", replaced with system-appropriate wake words
        const cleanSearch = transcript
          .replace(/hey cashspot|hey system|could you|can you|please|now|immediately/g, "")
          .replace(/switch to|show me|take me to|open the|guide me/g, "")
          .replace(/compass|directions|direction|route|map|locate/g, "")
          .replace(/the nearest|for the/g, "")
          .trim();

        if (cleanSearch !== "") {
          setSearch(cleanSearch);
        }
        
        setIsListening(false);
        if (onVoiceSearchEnd) onVoiceSearchEnd({ 
          text: cleanSearch || search, 
          isCompass, 
          isRoute,
          raw: transcript 
        });
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    } else {
      setSupported(false);
    }
  }, [setSearch, onVoiceSearchEnd, search]);

  const toggleListen = (keepText = false) => {
    if (!supported || isListening) return;
    if (!keepText) setSearch(""); 
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (e) {
      console.error("Mic error:", e);
    }
  };

  return (
    <div className={`w-full flex items-center bg-white dark:bg-[#0a0a0a] border ${isListening ? 'border-[#cc0000] dark:border-[#ff0000] shadow-[0_0_20px_rgba(204,0,0,0.2)]' : 'border-gray-200 dark:border-gray-800'} rounded-full p-1 transition-all duration-500`}>
      <input 
        type="text" 
        // Dynamically uses the prop we passed from Locator.jsx, or falls back to a default
        placeholder={isListening ? "Awaiting voice input..." : (placeholder || "Scan for active financial nodes...")} 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={isListening}
        className={`flex-1 bg-transparent px-4 py-2.5 font-medium outline-none text-sm min-w-0 transition-all ${isListening ? 'text-[#cc0000] dark:text-[#ff0000] italic animate-pulse' : 'text-black dark:text-white placeholder-gray-400'}`}
      />
      
      {supported && (
        <button 
          onClick={() => { if(!isListening) toggleListen(); else recognitionRef.current?.stop(); }}
          className={`w-9 h-9 flex shrink-0 items-center justify-center rounded-full mr-1 transition-all ${isListening ? 'bg-[#cc0000] text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}

      {!isListening && (
        <div className="w-9 h-9 flex shrink-0 items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full mr-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default SearchBar;