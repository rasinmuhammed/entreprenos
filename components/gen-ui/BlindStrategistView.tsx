
import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { askOmniStrategist } from '../../services/geminiService';
import { Camera } from 'lucide-react';

export const BlindStrategistView: React.FC = () => {
  const { blindStrategist, setBlindStrategistImage, addBlindStrategistMessage, setBlindStrategistProcessing, widgets, context } = useAppStore();
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // If context is missing, we can't perform a full strategic analysis, but we shouldn't crash.
    // We'll let the service handle it gracefully or warn the user.
    if (!context) {
       addBlindStrategistMessage({ 
         id: Math.random().toString(), 
         sender: 'ai', 
         text: "I need to know more about your business context first. Please complete the onboarding.", 
         timestamp: Date.now() 
       });
       return;
    }

    addBlindStrategistMessage({ id: Math.random().toString(), sender: 'user', text: input, timestamp: Date.now() });
    setInput("");
    setBlindStrategistProcessing(true);

    try {
       const response = await askOmniStrategist(input, blindStrategist.imageUrl, widgets, context);
       addBlindStrategistMessage({ id: Math.random().toString(), sender: 'ai', text: response, timestamp: Date.now() });
       window.speechSynthesis.speak(new SpeechSynthesisUtterance(response));
    } catch (err) { 
        console.error(err); 
        addBlindStrategistMessage({ 
         id: Math.random().toString(), 
         sender: 'ai', 
         text: "I encountered an error analyzing that strategy.", 
         timestamp: Date.now() 
       });
    } 
    finally { setBlindStrategistProcessing(false); }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-x-4 border-yellow-400" role="region" aria-label="Omniscient Strategist Chat">
      <div className="p-6 bg-yellow-400 text-black font-bold text-2xl uppercase tracking-widest flex items-center gap-3">
         <Camera className="w-8 h-8" aria-hidden="true" /> 
         <h1>Omniscient Strategist</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6" aria-live="polite">
         {!blindStrategist.imageUrl && (
            <div className="text-center py-10">
               <button 
                 onClick={() => fileInputRef.current?.click()} 
                 className="px-8 py-6 bg-white text-black text-xl font-bold rounded-xl border-4 border-transparent hover:border-yellow-400 focus:ring-4 focus:ring-yellow-400 focus:outline-none"
                 aria-label="Upload Context Image"
               >
                 UPLOAD CONTEXT IMAGE
               </button>
               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) {
                     const reader = new FileReader();
                     reader.onload = (ev) => setBlindStrategistImage((ev.target?.result as string).split(',')[1]);
                     reader.readAsDataURL(e.target.files[0]);
                  }
               }} />
            </div>
         )}
         {blindStrategist.messages.map(msg => (
            <div key={msg.id} className={`p-6 text-xl rounded-xl ${msg.sender === 'user' ? 'bg-zinc-800 text-white ml-12' : 'bg-yellow-400 text-black mr-12 font-bold'}`}>
              <span className="sr-only">{msg.sender === 'user' ? 'You said:' : 'AI said:'}</span>
              {msg.text}
            </div>
         ))}
         {blindStrategist.isProcessing && (
           <div className="text-yellow-400 animate-pulse text-xl font-mono" role="status">THINKING...</div>
         )}
      </div>
      <form onSubmit={handleSend} className="p-6 border-t-4 border-yellow-400 bg-zinc-950 flex gap-4">
         <label htmlFor="strategy-input" className="sr-only">Ask a strategic question</label>
         <input 
           id="strategy-input"
           value={input} 
           onChange={(e) => setInput(e.target.value)} 
           placeholder="Ask a strategic question..." 
           className="flex-1 bg-zinc-800 text-white text-xl p-4 rounded-lg focus:ring-4 focus:ring-yellow-400 outline-none" 
         />
         <button 
           type="submit" 
           disabled={blindStrategist.isProcessing} 
           className="px-8 bg-white text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 focus:ring-4 focus:ring-yellow-400 focus:outline-none"
         >
           SEND
         </button>
      </form>
    </div>
  );
};
