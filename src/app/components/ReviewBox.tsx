"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Mic, StopCircle } from "lucide-react";

export default function ReviewBox({ productId }: { productId: string }) {
  const [review, setReview] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-IN";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setReview((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognitionRef.current.onerror = () => {
      toast.error("Speech recognition error.");
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
    setIsRecording(true);
    toast.info("Listening...");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) {
      toast.error("Review cannot be empty");
      return;
    }
    // Here you would send review + productId to your backend
    toast.success("Review submitted successfully!");
    setReview("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="w-full p-2 border rounded-lg"
        placeholder="Write your review..."
      />

      <div className="flex gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Mic size={16} className="mr-1" /> Speak
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <StopCircle size={16} className="mr-1" /> Stop
          </button>
        )}

        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
