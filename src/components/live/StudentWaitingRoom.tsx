import React from 'react';
import { Clock, Calendar, ShieldCheck, User, Edit3, AlertCircle, RefreshCw, XCircle, BookOpen, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { LiveStreamSession } from '../../types';

interface StudentWaitingRoomProps {
  stream: LiveStreamSession;
  studentName: string;
  admissionStatus: 'idle' | 'waiting' | 'admitted' | 'rejected' | 'kicked';
  countdownText: string;
  isClassTimeReached: boolean;
  onOpenNameModal: () => void;
  onRetryAdmission: () => void;
  onExit: () => void;
}

export default function StudentWaitingRoom({
  stream,
  studentName,
  admissionStatus,
  countdownText,
  isClassTimeReached,
  onOpenNameModal,
  onRetryAdmission,
  onExit
}: StudentWaitingRoomProps) {
  return (
    <div className="w-full h-full min-h-[460px] relative flex flex-col items-center justify-center p-4 sm:p-8 text-center text-white overflow-hidden rounded-3xl">
      {/* Background Session Thumbnail with Blur and Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-md brightness-[0.35] transform scale-110"
        style={{ 
          backgroundImage: `url(${stream.thumbnailUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'})` 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl bg-black/65 backdrop-blur-xl border border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5"
      >
        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2">
          {stream.isLive ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600/90 text-white shadow-lg shadow-red-500/30 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              Live Class In Progress
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/30 text-orange-300 border border-orange-500/40">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Upcoming Live Session
            </span>
          )}
        </div>

        {/* Title & Faculty Info */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {stream.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 flex items-center justify-center gap-2">
            <span>Subject: <strong>{stream.subject}</strong></span>
            <span>•</span>
            <span>Faculty: <strong className="text-orange-400">{stream.teacherName}</strong></span>
          </p>
        </div>

        {/* Countdown Timer Block (If before live session or scheduled) */}
        {!stream.isLive && (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-900/90 to-black/90 border border-orange-500/30 shadow-inner space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-orange-400 block flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Live Class Countdown
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400">
              {countdownText || `${stream.scheduledDate || 'Today'} ${stream.scheduledTime || '05:00 PM IST'}`}
            </div>
            <p className="text-[11px] text-stone-400">
              Scheduled Date: {stream.scheduledDate || 'Today'} | Time: {stream.scheduledTime || '05:00 PM IST'}
            </p>
          </div>
        )}

        {/* Student Identification Pill with Edit Button */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs text-stone-200">
          <User className="w-4 h-4 text-orange-400" />
          <span>Student: <strong className="text-white">{studentName || 'Guest Student'}</strong></span>
          <button
            onClick={onOpenNameModal}
            className="flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-orange-300 underline ml-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Change</span>
          </button>
        </div>

        {/* State-specific Notification Boxes */}
        {admissionStatus === 'waiting' && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-pulse">
            <div className="font-extrabold text-sm flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Waiting in Class Lobby
            </div>
            <p className="text-stone-300 text-xs leading-relaxed max-w-md mx-auto">
              Aapka join request <strong>{stream.teacherName}</strong> ke paas pahunch gaya hai. 
              Jaise hi faculty allow karenge, aap live class aur whiteboard screen me enter ho jayenge!
            </p>
            <span className="text-[10px] text-amber-300 font-semibold block">
              Kripya is window ko band mat kijiye (Please stay on this page)...
            </span>
          </div>
        )}

        {admissionStatus === 'idle' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-300">
              Live training me join karne ke liye apna naam confirm kijiye:
            </p>
            <button
              onClick={onOpenNameModal}
              className="w-full py-3 px-5 rounded-2xl text-xs font-black bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/30 transition-all cursor-pointer"
            >
              🙋 Enter Name & Request Admission
            </button>
          </div>
        )}

        {admissionStatus === 'rejected' && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs space-y-3">
            <div className="font-bold text-sm flex items-center justify-center gap-1.5 text-red-400">
              <XCircle className="w-4 h-4" />
              Admission Declined by Faculty
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              Faculty dwara aapka admission request abhi approve nahi kiya gaya hai. 
              Kripya apna sahi naam aur roll number daalkar dobara try karein ya coaching se sampark karein.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={onRetryAdmission}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white cursor-pointer transition-colors shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again with Correct Name</span>
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

        {admissionStatus === 'kicked' && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs space-y-3">
            <div className="font-bold text-sm flex items-center justify-center gap-1.5 text-red-400">
              <AlertCircle className="w-4 h-4" />
              Removed from Session
            </div>
            <p className="text-stone-300 text-xs">
              Aapko faculty dwara live session se disconnect kar diya gaya hai.
            </p>
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 cursor-pointer transition-colors"
            >
              Return to Commerce Notes
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
