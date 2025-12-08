
import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { analyzeSpatialQuery } from '../../services/geminiService';
import { Camera, Send, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export const SpatialChat: React.FC = () => {
  const { spatialChat, setSpatialImage, addSpatialMessage, setSpatialProcessing } = useAppStore();
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setSpatialImage((ev.target?.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !spatialChat.imageUrl) return;

    const userMsg = { id: Math.random().toString(), sender: 'user' as const, text: input, timestamp: Date.now() };
    addSpatialMessage(userMsg);
    setInput("");
    setSpatialProcessing(true);

    try {
       const response = await analyzeSpatialQuery(spatialChat.imageUrl, input, spatialChat.messages);
       addSpatialMessage({ 
         id: Math.random().toString(), 
         sender: 'ai', 
         text: response, 
         timestamp: Date.now() 
       });
       
       // Announce for screen reader
       const utterance = new SpeechSynthesisUtterance(response);
       window.speechSynthesis.speak(utterance);
    } catch (err) {
       console.error(err);
    } finally {
       setSpatialProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-x-4 border-yellow-400">
      <div className="p-6 bg-yellow-400 text-black font-bold text-2xl uppercase tracking-widest flex items-center gap-3">
         <Camera className="w-8 h-8" /> Spatial Interrogator
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" aria-live="polite">
         {!spatialChat.imageUrl ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="px-8 py-6 bg-white text-black text-2xl font-bold rounded-xl hover:scale-105 transition-transform border-4 border-transparent hover:border-yellow-400"
               >
                 UPLOAD IMAGE CONTEXT
               </button>
               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
         ) : (
            <>
               <div className="p-4 bg-zinc-800 text-yellow-400 font-mono text-sm border border-yellow-400/30 rounded">
                  IMAGE CONTEXT ACTIVE. ASK SPATIAL QUESTIONS.
               </div>
               {spatialChat.messages.map(msg => (
                  <div key={msg.id} className={`p-6 text-xl rounded-xl ${msg.sender === 'user' ? 'bg-zinc-800 text-white ml-12' : 'bg-yellow-400 text-black mr-12 font-bold'}`}>
                     {msg.text}
                  </div>
               ))}
               {spatialChat.isProcessing && (
                  <div className="text-yellow-400 animate-pulse text-xl font-mono">ANALYZING SPATIAL VECTORS...</div>
               )}
            </>
         )}
      </div>

      <form onSubmit={handleSend} className="p-6 border-t-4 border-yellow-400 bg-zinc-950 flex gap-4">
         <input 
           value={input}
           onChange={(e) => setInput(e.target.value)}
           placeholder="Ask: 'Where is the door?'"
           className="flex-1 bg-zinc-800 text-white text-xl p-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400"
           disabled={!spatialChat.imageUrl}
         />
         <button 
           type="submit" 
           disabled={!spatialChat.imageUrl || spatialChat.isProcessing}
           className="px-8 bg-white text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
         >
           SEND
         </button>
      </form>
    </div>
  );
};
