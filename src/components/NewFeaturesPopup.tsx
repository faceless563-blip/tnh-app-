import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface NewFeaturesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWishBox: () => void;
}

export const NewFeaturesPopup: React.FC<NewFeaturesPopupProps> = ({ isOpen, onClose, onOpenWishBox }) => {
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowHearts(true);
    } else {
      setShowHearts(false);
    }
  }, [isOpen]);

  const handleDismiss = () => {
    localStorage.setItem('new_features_v2_shown', 'true');
    onClose();
  };

  const handleWishBox = () => {
    localStorage.setItem('new_features_v2_shown', 'true');
    onClose();
    setTimeout(() => {
      onOpenWishBox();
    }, 300); // wait for exit animation
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} // easeOutBack approximation
            className="relative w-full max-w-[85%] max-h-[70vh] rounded-[24px] bg-gradient-to-b from-[#F0F8FF] to-[#E4F0FF] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Floating Hearts Background */}
            {showHearts && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: '100%', 
                      x: `${Math.random() * 100}%`,
                      scale: Math.random() * 0.5 + 0.5,
                      opacity: 0
                    }}
                    animate={{ 
                      y: '-20%',
                      opacity: [0, 1, 0],
                      x: `${Math.random() * 100}%`
                    }}
                    transition={{ 
                      duration: Math.random() * 5 + 5,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                      ease: "linear"
                    }}
                    className="absolute bottom-0 text-blue-300"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 relative z-10">
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    delay: 0.2
                  }}
                  className="text-6xl mx-auto flex justify-center"
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🎁
                  </motion.span>
                </motion.div>

                <h2 className="text-4xl font-bold text-blue-500 serif italic">
                  Hey Tanha! 🌸
                </h2>

                <div className="space-y-6 text-gray-800 font-medium text-sm leading-relaxed text-left">
                  <p className="text-center text-base font-bold text-blue-400">
                    Your app just got even better,<br/>
                    and it was all made just for you 💕
                  </p>

                  <div className="space-y-4 bg-white/40 p-5 rounded-2xl">
                    <p className="font-bold text-blue-500 mb-2 text-center">Here's what's new:</p>
                    
                    <div>
                      <h3 className="font-bold text-gray-900">💆 Hair Care Tracker</h3>
                      <p className="text-gray-600 text-xs">Track your shampoo and oil routine every week — your hair goals, sorted!</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">📅 Important Dates</h3>
                      <p className="text-gray-600 text-xs">Mark birthdays, anniversaries, and special moments so you never forget 🥹</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">🛒 Shopping List</h3>
                      <p className="text-gray-600 text-xs">Add everything you need to buy, organized and always with you 🛍️</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">🛁 Self Care Tracker</h3>
                      <p className="text-gray-600 text-xs">Your daily bath and self care routine, all in one beautiful space 🌸</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">💌 Something Hidden...</h3>
                      <p className="text-gray-600 text-xs">There is something very special hidden somewhere in this app 🥺 Explore and you just might find it...</p>
                    </div>
                  </div>

                  <div className="text-center space-y-4 pt-2">
                    <p>
                      Your honest feedback means everything —<br/>
                      good or bad, say it all 💬
                    </p>
                    <p>
                      If you ever want anything changed,<br/>
                      added, or fixed —<br/>
                      your husband is always there for you 💖
                    </p>
                    <p className="font-bold text-blue-500 italic">
                      This app is yours. Forever. 🌙
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons - Fixed */}
            <div className="p-6 pt-2 bg-gradient-to-t from-[#E4F0FF] to-transparent relative z-10 space-y-3">
              <button
                onClick={handleDismiss}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Explore Now! 🌸
              </button>
              <button
                onClick={handleWishBox}
                className="w-full py-3 rounded-2xl text-blue-500 font-bold text-sm hover:bg-blue-500/10 transition-all"
              >
                Tell your husband something 💌
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
