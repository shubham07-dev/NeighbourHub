import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import './AIChatbot.css';

const getBotResponse = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('plumber') || lowerText.includes('plumbing') || lowerText.includes('leak')) {
    return "To find a plumber, head to your Dashboard and select the 'Plumbing' category. You can browse verified profiles, see their hourly rates, and click 'Book Service' to schedule them right away!";
  }
  if (lowerText.includes('electrician') || lowerText.includes('electrical') || lowerText.includes('wire')) {
    return "Need an electrician? Select the 'Electrical' tab on your dashboard. You can read reviews from your neighbours and securely book a visit in seconds.";
  }
  if (lowerText.includes('cleaning') || lowerText.includes('cleaner') || lowerText.includes('maid')) {
    return "For cleaning services, browse the 'Cleaning' section. You can find top-rated cleaners and book them instantly.";
  }
  if (lowerText.includes('approach') || lowerText.includes('contact') || lowerText.includes('message')) {
    return "You can contact service providers directly through their profile page. Also, once you book a service, you can open a real-time support ticket if you need any direct help from our team!";
  }
  if (lowerText.includes('pay') || lowerText.includes('cost') || lowerText.includes('price')) {
    return "Prices are listed clearly on each provider's card. Payment is securely handled through our Razorpay integration once you confirm a booking.";
  }
  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
    return "Hello there! 👋 How can I assist you with NeighbourLink today?";
  }

  const randomResponses = [
    "You can book services directly by clicking 'Book Service' on a provider's profile.",
    "All our providers are continuously verified to ensure top quality.",
    "I'm your AI assistant, always here to guide you through the marketplace.",
    "If you need emergency services, just look for the green 'Live' or 'Available Now' indicators!",
    "You can manage your current and past bookings in the 'My Jobs' section."
  ];
  return randomResponses[Math.floor(Math.random() * randomResponses.length)];
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! 👋 I'm your NeighbourLink AI Assistant. How can I help you?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMessage = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const responseText = getBotResponse(inputText);
      setMessages((prev) => [...prev, { id: Date.now(), text: responseText, sender: 'bot' }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="chatbot-fab"
            onClick={() => setIsOpen(true)}
          >
            <Sparkles className="fab-icon-decor" size={14} />
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="chatbot-window"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="bot-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="bot-title">NeighbourLink AI</h3>
                  <span className="bot-status">
                    <span className="status-dot"></span> Online
                  </span>
                </div>
              </div>
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="chatbot-messages">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`message-wrapper ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="message-avatar bot">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="message-avatar user">
                      <User size={14} />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="message-wrapper message-bot">
                  <div className="message-avatar bot">
                    <Bot size={14} />
                  </div>
                  <div className="message-bubble typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="chatbot-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={!inputText.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
