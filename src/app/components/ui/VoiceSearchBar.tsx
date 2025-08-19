import React, { useState, useRef } from "react";

// TypeScript fix: declare SpeechRecognition on window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceSearchBarProps {
  onSearch: (query: string) => void;
}

const VoiceSearchBar: React.FC<VoiceSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current.start();
  };

  return (
    <div className="flex items-center gap-2 border rounded-lg px-2 py-1 w-full max-w-md bg-white">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Search..."
        className="flex-1 outline-none"
      />
      <button
        type="button"
        onClick={startListening}
        className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
      >
        🎤
      </button>
    </div>
  );
};

export default VoiceSearchBar;
