import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const encodedText = encodeURIComponent(
      message || "Hello Rakhi Coaching Classes, I would like to enquire about your coaching admissions and online study materials."
    );
    window.open(`https://wa.me/917828908559?text=${encodedText}`, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div id="whatsapp-widget" className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-teal-100 dark:border-teal-900 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                    R
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Rakhi Coaching Classes</h4>
                  <p className="text-xs text-teal-100">Typically replies within 5 minutes</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-teal-200 transition-colors"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 h-48 bg-teal-50/50 dark:bg-slate-950/50 overflow-y-auto space-y-3">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-xs text-slate-700 dark:text-slate-300">
                <p className="font-medium text-teal-600 dark:text-teal-400 mb-1">Rakhi Coaching Support</p>
                Hi there! Welcome to Rakhi Coaching Classes. 📚 
                How can we help you achieve your goals today?
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 bg-white dark:bg-slate-900">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-full p-2 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Send Message"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-xl flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} className="animate-pulse" />
      </motion.button>
    </div>
  );
}
