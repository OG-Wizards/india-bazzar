'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  voiceEnabled?: boolean; // Enable mic button if true
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, voiceEnabled, ...props }, ref) => {
    const recognitionRef = React.useRef<any>(null);

    React.useEffect(() => {
      if (voiceEnabled) {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-IN';
        }
      }
    }, [voiceEnabled]);

    const handleVoiceInput = () => {
      if (!recognitionRef.current) {
        alert('Your browser does not support voice input.');
        return;
      }

      recognitionRef.current.start();

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (ref && typeof ref !== 'function' && ref.current) {
          ref.current.value = transcript;
        }
        recognitionRef.current.stop();
      };
    };

    return (
      <div className="relative flex items-center">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {voiceEnabled && (
          <button
            type="button"
            onClick={handleVoiceInput}
            className="absolute right-2 text-gray-500 hover:text-gray-800"
          >
            <Mic size={18} />
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
