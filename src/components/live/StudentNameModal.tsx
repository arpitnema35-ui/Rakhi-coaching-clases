import React, { useState } from 'react';
import { User, CheckCircle2, BookOpen, Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentNameModalProps {
  isOpen: boolean;
  currentName: string;
  currentGrade?: string;
  onClose?: () => void;
  onSubmit: (name: string, grade: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

const AVATAR_OPTIONS = ['👨‍🎓', '👩‍🎓', '📚', '🎯', '⭐', '🔥'];

export default function StudentNameModal({
  isOpen,
  currentName,
  currentGrade = 'Class 12th Commerce',
  onClose,
  onSubmit,
  isSubmitting = false
}: StudentNameModalProps) {
  const [name, setName] = useState(currentName);
  const [grade, setGrade] = useState(currentGrade);
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍🎓');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name to proceed.');
      return;
    }
    setError(null);
    onSubmit(name.trim(), grade);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-950/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7"
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 text-2xl">
              {selectedAvatar}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Student Registration
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              Please enter your name so Faculty Arpit Nema can identify and admit you to the live class.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                Full Name (छात्र का पूरा नाम) *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Rohit Verma / Pooja Sharma"
                className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-orange-50/50 dark:bg-stone-800/80 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
              />
              {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}
            </div>

            {/* Class / Grade Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                Select Class / Stream
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Class 12th Commerce',
                  'Class 11th Commerce',
                  'Accounts Special',
                  'Board Revision'
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      grade === g
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25'
                        : 'bg-white dark:bg-stone-800/60 text-slate-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                    }`}
                  >
                    <span>{g}</span>
                    {grade === g && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Choose Avatar Badge
              </label>
              <div className="flex items-center justify-center gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-orange-100 dark:bg-orange-950/80 border-2 border-orange-500 scale-110 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 border border-transparent hover:scale-105'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full mt-2 py-3 px-5 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Registering in Lobby...' : 'Join Class / Request Entry'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
