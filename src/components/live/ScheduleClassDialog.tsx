import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Link2, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (classData: {
    roomCode: string;
    link: string;
    title: string;
    subject: string;
    date: string;
    time: string;
    thumbnail: string;
  }) => void;
}

const THUMBNAIL_PRESETS = [
  {
    name: 'Commerce Classroom',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Accountancy Lecture',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Board Exam Preparation',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function ScheduleClassDialog({
  isOpen,
  onClose,
  onClassCreated
}: ScheduleClassDialogProps) {
  const [title, setTitle] = useState('Class 12th Commerce: Partnership Accounts & Balance Sheet Live Masterclass');
  const [subject, setSubject] = useState('Accountancy & Business Studies');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('05:00 PM IST');
  const [thumbnail, setThumbnail] = useState(THUMBNAIL_PRESETS[0].url);
  const [createdResult, setCreatedResult] = useState<{ roomCode: string; link: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const timeSuffix = Date.now().toString(36).substring(4);
    const roomCode = `class_${randomSuffix}_${timeSuffix}`;
    const generatedLink = `${window.location.origin}/#onlinetraining?room=${roomCode}`;

    const newClassData = {
      roomCode,
      link: generatedLink,
      title: title.trim(),
      subject: subject.trim(),
      date,
      time,
      thumbnail
    };

    setCreatedResult({ roomCode, link: generatedLink });
    onClassCreated(newClassData);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const shareToWhatsApp = () => {
    if (!createdResult) return;
    const msg = `🔴 *Rakhi Coaching Classes - Live Class Invitation!*\n\n*Topic:* ${title}\n*Subject:* ${subject}\n*Faculty:* Arpit Nema (Director & Faculty Head)\n*Date:* ${date}\n*Time:* ${time}\n\n👇 *Join Live Class Link:* \n${createdResult.link}\n\n_Note: Please enter your name upon opening the link to request admission in the live classroom!_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-950/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-1 mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Live Class Generator
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Schedule Class & Generate Unique URL
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select date, time, and topic. Students will see a live countdown until class begins, with student admission security.
            </p>
          </div>

          {!createdResult ? (
            <form onSubmit={handleGenerateClass} className="space-y-4">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                  Class Title (Topic) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class 12th Partnership Numerical Solving"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-orange-50/50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Subject Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-stone-300">
                  Subject / Stream *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Accountancy, Business Studies, Economics"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-orange-50/50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-orange-50/50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 05:00 PM IST"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-orange-50/50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              {/* Thumbnail Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                  Select Classroom Thumbnail
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {THUMBNAIL_PRESETS.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setThumbnail(t.url)}
                      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                        thumbnail === t.url
                          ? 'border-orange-500 scale-102 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                      {thumbnail === t.url && (
                        <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-2xl text-xs font-black bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                <Link2 className="w-4 h-4" />
                <span>Create & Generate Unique Link</span>
              </button>
            </form>
          ) : (
            /* Created Result Card with Copy and Share */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  Class Successfully Created!
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Unique room code: <strong>{createdResult.roomCode}</strong>. Students will see the countdown timer and enter their name when opening this link.
                </p>
              </div>

              {/* Unique URL Box */}
              <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-stone-800/80 border border-orange-200 dark:border-stone-700 space-y-2">
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block uppercase">
                  Unique Student Link:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.link}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-slate-800 dark:text-stone-200"
                  />
                  <button
                    onClick={() => copyToClipboard(createdResult.link)}
                    className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm cursor-pointer transition-colors"
                    title="Copy Link"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={shareToWhatsApp}
                  className="py-3 px-4 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-2xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-200 cursor-pointer transition-colors"
                >
                  Go to Classroom
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
