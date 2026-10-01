import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, User, KeyRound, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyAndSaveAdminSecurity } from '../../firebase';

interface AdminAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export default function AdminAuthDialog({
  isOpen,
  onClose,
  onAuthenticated
}: AdminAuthDialogProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    const cleanId = userId.trim();
    const cleanPass = password.trim();

    try {
      const isValid = await verifyAndSaveAdminSecurity(cleanId, cleanPass);
      if (isValid) {
        sessionStorage.setItem('rakhi_admin_live_auth', 'true');
        onAuthenticated();
        onClose();
        setUserId('');
        setPassword('');
      } else {
        setError('Invalid User ID or Password. Please enter nema2810@gmail.com and password arpit2810.');
      }
    } catch {
      // In case of any unexpected runtime issue, direct fallback verify
      const isDirectMatch = (
        cleanId.toLowerCase() === "nema2810@gmail.com" || 
        cleanId.toLowerCase() === "nema@2810" || 
        cleanId.toLowerCase() === "nema2810" ||
        cleanId.toLowerCase() === "arpitnema35@gmail.com"
      ) && cleanPass === "arpit2810";

      if (isDirectMatch) {
        sessionStorage.setItem('rakhi_admin_live_auth', 'true');
        onAuthenticated();
        onClose();
      } else {
        setError('Invalid credentials. Check user ID and password.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="relative w-full max-w-sm bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-950/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Faculty / Admin Access
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Enter your secure faculty credentials to unlock Host Broadcast & Student Admission control.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                Admin User ID
              </label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. nema2810@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-orange-50/50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-orange-50/50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !userId.trim() || !password.trim()}
              className="w-full py-3 px-5 rounded-2xl text-xs font-black bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <span>{isVerifying ? 'Verifying with Firebase...' : 'Unlock Teacher Studio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
