"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";

type Message = {
  id: string;
  threadId: string;
  content: string;
  sender: string;
  createdAt: string;
};

export default function MessagingSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const THREAD_ID = "demo_thread_123";

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messaging?threadId=${THREAD_ID}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      // Polling for demo purposes, could use websockets in prod
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText("");
    setIsLoading(true);

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      threadId: THREAD_ID,
      content: text,
      sender: "patient",
      createdAt: new Date().toISOString()
    }]);

    try {
      await fetch('/api/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: THREAD_ID,
          content: text,
          sender: "patient"
        })
      });
      // Refresh to get actual DB record
      await fetchMessages();
    } catch (e) {
      console.error("Failed to send", e);
      alert("Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 z-50"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-zinc-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div>
            <h3 className="font-bold text-lg text-white">Clinic Chat</h3>
            <p className="text-xs text-zinc-400">Ask questions about your scan</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-50" />
              <p className="text-sm text-center">No messages yet.<br/>Send a message to your clinic!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isPatient = msg.sender === "patient";
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isPatient 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-2 rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 sm:hidden z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
