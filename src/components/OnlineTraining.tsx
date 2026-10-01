import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Radio, 
  Users, 
  Heart, 
  Send, 
  Share2, 
  Settings, 
  Copy, 
  Check, 
  Eye, 
  BookOpen, 
  FileText, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Flame, 
  ThumbsUp, 
  Lightbulb, 
  HelpCircle,
  Video,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Tv,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Hls from 'hls.js';
import { LiveStreamSession, LiveChatMessage, UserProfile } from '../types';
import { 
  subscribeToLiveStream, 
  updateLiveSession, 
  subscribeToLiveChat, 
  sendLiveChatMessage, 
  defaultLiveSession,
  defaultLiveChatMessages
} from '../firebase';

interface OnlineTrainingProps {
  user: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

// Smart stream source parser
function parseStreamSource(rawUrl: string): { type: 'youtube' | 'hls' | 'iframe' | 'video' | 'empty'; embedUrl: string } {
  if (!rawUrl || !rawUrl.trim()) return { type: 'empty', embedUrl: '' };
  const trimmed = rawUrl.trim();

  // 1. YouTube Watch / Live / Short / Embed
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&playsinline=1&rel=0`
    };
  }

  // 11-char direct video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${trimmed}?autoplay=1&playsinline=1&rel=0`
    };
  }

  // 2. HLS Stream (.m3u8) - e.g. from Cloudflare Stream or Media Server
  if (trimmed.includes('.m3u8')) {
    return { type: 'hls', embedUrl: trimmed };
  }

  // 3. Iframe / Embed link (Cloudflare Stream iframe, Vimeo, Twitch)
  if (trimmed.includes('player.cloudflare.com') || trimmed.includes('player.vimeo.com') || trimmed.includes('player.twitch.tv')) {
    return { type: 'iframe', embedUrl: trimmed };
  }

  // 4. Standard video file (.mp4, .webm)
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm')) {
    return { type: 'video', embedUrl: trimmed };
  }

  return { type: 'iframe', embedUrl: trimmed };
}

export default function OnlineTraining({ user, setActiveTab }: OnlineTrainingProps) {
  // Live Stream state synced with Firebase
  const [stream, setStream] = useState<LiveStreamSession>(defaultLiveSession);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(defaultLiveChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'notes' | 'schedule' | 'archive'>('overview');
  
  // Video player controls state
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);

  // OBS Control Modal state
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [obsTab, setObsTab] = useState<'youtube' | 'rtmp'>('youtube');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Form edit states for stream
  const [editTitle, setEditTitle] = useState(stream.title);
  const [editStreamUrl, setEditStreamUrl] = useState(stream.streamUrl);
  const [editStreamKey, setEditStreamKey] = useState(stream.streamKey);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [quickUrlInput, setQuickUrlInput] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Floating reactions state
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // 1. Subscribe to Live Stream & Chat from Firebase
  useEffect(() => {
    const unsubStream = subscribeToLiveStream((updatedStream) => {
      setStream(updatedStream);
      setEditTitle(updatedStream.title);
      setEditStreamUrl(updatedStream.streamUrl);
      setEditStreamKey(updatedStream.streamKey);
      if (updatedStream.streamUrl) {
        setQuickUrlInput(updatedStream.streamUrl);
      }
    });

    const unsubChat = subscribeToLiveChat((messages) => {
      if (messages.length > 0) {
        setChatMessages(messages);
      }
    });

    return () => {
      unsubStream();
      unsubChat();
    };
  }, []);

  // Parse stream type
  const parsedSource = parseStreamSource(stream.streamUrl);

  // 2. Setup Video / HLS Stream Player for .m3u8 sources
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream.isLive || parsedSource.type !== 'hls') return;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(parsedSource.embedUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(e => console.log('Autoplay prevented:', e));
        });
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = parsedSource.embedUrl;
      video.play().catch(e => console.log('Safari playback notice:', e));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [parsedSource.embedUrl, stream.isLive, parsedSource.type]);

  // Video control helpers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('live-player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Toggle Live status in Firebase
  const handleToggleLiveStatus = async () => {
    setIsUpdatingStatus(true);
    const newLiveState = !stream.isLive;
    const updates: Partial<LiveStreamSession> = {
      isLive: newLiveState,
      viewerCount: newLiveState ? 120 + Math.floor(Math.random() * 40) : 0
    };
    if (newLiveState && !stream.streamUrl && quickUrlInput.trim()) {
      updates.streamUrl = quickUrlInput.trim();
    }
    await updateLiveSession(updates);
    setStream(prev => ({ ...prev, ...updates }));
    setIsUpdatingStatus(false);
  };

  // Quick Go Live handler right from offline card
  const handleQuickGoLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrlInput.trim()) {
      setIsObsModalOpen(true);
      return;
    }
    setIsUpdatingStatus(true);
    const updates: Partial<LiveStreamSession> = {
      streamUrl: quickUrlInput.trim(),
      isLive: true,
      viewerCount: 140 + Math.floor(Math.random() * 50)
    };
    await updateLiveSession(updates);
    setStream(prev => ({ ...prev, ...updates }));
    setIsUpdatingStatus(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Save OBS Settings in Firebase
  const handleSaveObsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    const updates: Partial<LiveStreamSession> = {
      title: editTitle,
      streamUrl: editStreamUrl.trim(),
      streamKey: editStreamKey,
      isLive: Boolean(editStreamUrl.trim())
    };
    await updateLiveSession(updates);
    setStream(prev => ({
      ...prev,
      ...updates
    }));
    setIsUpdatingStatus(false);
    setIsObsModalOpen(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Send message to Firebase Live Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const senderRole = user?.role || 'student';
    const senderName = user?.displayName || (senderRole === 'teacher' ? 'Arpit Nema (Teacher)' : 'Student User');

    const msgData: Omit<LiveChatMessage, 'id'> = {
      senderName,
      senderRole,
      text: newMessage.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    const optimisticMsg: LiveChatMessage = {
      id: `local_${Date.now()}`,
      ...msgData
    };
    setChatMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    // Firebase Firestore sync
    await sendLiveChatMessage(msgData);
  };

  // Add floating reaction
  const handleReaction = async (emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 70) + 15;
    setFloatingReactions(prev => [...prev, { id, emoji, left }]);

    setStream(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
    updateLiveSession({ likesCount: stream.likesCount + 1 });

    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  // Auto-scroll chat to bottom
  const chatScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {saveSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Live Stream settings synced to Firebase!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Bar with Live Indicator & OBS Setup Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-orange-200/70 dark:border-orange-950/60 p-4 sm:p-5 rounded-3xl shadow-lg shadow-orange-500/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {stream.isLive && stream.streamUrl ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                🔴 LIVE NOW
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                Stream Offline
              </span>
            )}
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100/70 dark:bg-orange-950/50 px-2.5 py-0.5 rounded-lg">
              {stream.grade} • {stream.subject}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-stone-100 tracking-tight">
            {stream.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400">
            Faculty: <span className="font-semibold text-slate-800 dark:text-stone-200">{stream.teacherName}</span>
          </p>
        </div>

        {/* OBS Stream Setup & Controls (Tarika 1) */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => setIsObsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md shadow-orange-500/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4 animate-spin-slow" />
            <span>OBS Stream Console</span>
          </button>

          <button
            onClick={() => handleReaction('❤️')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
            title="Cheer with heart"
          >
            <Heart className="w-4 h-4 fill-red-500" />
            <span>{stream.likesCount}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Live Stream & Live Chat Layout */}
      <div className={`grid grid-cols-1 ${isTheatreMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        
        {/* Left Column: Live Video Player & Under-Player Controls */}
        <div className={`${isTheatreMode ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-4`}>
          
          {/* Video Player Box */}
          <div 
            id="live-player-container"
            className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-stone-800 group select-none flex items-center justify-center"
          >
            {stream.isLive && stream.streamUrl ? (
              <>
                {/* 1. YouTube Live / Embed Player */}
                {parsedSource.type === 'youtube' && (
                  <iframe
                    src={parsedSource.embedUrl}
                    title="Live Stream"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}

                {/* 2. HLS (.m3u8) / Cloudflare Stream HTML5 Video */}
                {parsedSource.type === 'hls' && (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      playsInline
                      autoPlay
                      onClick={togglePlay}
                    />

                    {/* Custom Overlay Controls on Hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <span className="text-xs font-medium text-stone-300">
                          OBS Live Ingest (HLS)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsTheatreMode(!isTheatreMode)}
                          className="hidden sm:block p-1.5 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          {isTheatreMode ? 'Standard' : 'Theatre'}
                        </button>
                        <button
                          onClick={toggleFullscreen}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* 3. General Iframe (Twitch / Vimeo / Cloudflare) */}
                {parsedSource.type === 'iframe' && (
                  <iframe
                    src={parsedSource.embedUrl}
                    title="Live Stream Embed"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {/* Floating Reactions overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <AnimatePresence>
                    {floatingReactions.map(reaction => (
                      <motion.div
                        key={reaction.id}
                        initial={{ opacity: 1, y: 180, scale: 0.8 }}
                        animate={{ opacity: 0, y: -100, scale: 1.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        className="absolute bottom-10 text-2xl"
                        style={{ left: `${reaction.left}%` }}
                      >
                        {reaction.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Top Overlay Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase bg-red-600/90 text-white backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    LIVE
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/70 text-white backdrop-blur-md">
                    <Users className="w-3.5 h-3.5 text-orange-400" />
                    {stream.viewerCount || 128} watching
                  </span>
                  <span className="hidden sm:flex items-center px-2 py-1 rounded-lg text-[10px] font-medium bg-black/60 text-white/90 backdrop-blur-md">
                    OBS Studio Stream • 1080p
                  </span>
                </div>
              </>
            ) : (
              /* Professional Offline & Stream Ingest Setup Screen (NO DUMMY CARTOON VIDEO!) */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#18110b] via-[#120a06] to-black text-white relative">
                
                {/* Background decorative glow */}
                <div className="absolute w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-lg space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Tv className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-2">
                      Live Classroom Offline
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                      Rakhi Coaching Live Classroom
                    </h2>
                    <p className="text-stone-400 text-xs sm:text-sm mt-1">
                      Faculty <strong>{stream.teacherName}</strong> has not started broadcasting from OBS Studio yet. Next scheduled session: <span className="text-orange-400 font-semibold">{stream.scheduledTime}</span>.
                    </p>
                  </div>

                  {/* Direct Input for Teacher to Start Live Stream with OBS Link */}
                  <form onSubmit={handleQuickGoLive} className="pt-2 space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-stone-900/90 p-1.5 rounded-2xl border border-stone-800">
                      <input
                        type="text"
                        value={quickUrlInput}
                        onChange={(e) => setQuickUrlInput(e.target.value)}
                        placeholder="Teacher: Paste YouTube Live or Stream URL here..."
                        className="w-full px-3 py-2 text-xs bg-transparent text-white placeholder:text-stone-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isUpdatingStatus}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer shrink-0"
                      >
                        {isUpdatingStatus ? 'Starting...' : '🔴 Start Stream'}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-stone-400">
                      <button
                        type="button"
                        onClick={() => setIsObsModalOpen(true)}
                        className="text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
                      >
                        OBS Studio RTMP & Stream Key Settings
                      </button>
                    </div>
                  </form>

                </div>

              </div>
            )}
          </div>

          {/* Quick Interactive Emoji Bar (Realtime Cheer to teacher) */}
          <div className="flex items-center justify-between bg-white/70 dark:bg-stone-900/70 border border-orange-200/60 dark:border-orange-950/60 p-3 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Live Reaction to Faculty:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[
                { emoji: '👏', label: 'Clap' },
                { emoji: '🔥', label: 'Fire' },
                { emoji: '💡', label: 'Understood' },
                { emoji: '❤️', label: 'Love' },
                { emoji: '👍', label: 'Good' },
                { emoji: '❓', label: 'Doubt' }
              ].map(reaction => (
                <button
                  key={reaction.label}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-orange-100 dark:hover:bg-stone-800 flex items-center justify-center text-lg sm:text-xl transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                  title={reaction.label}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Information Tabs */}
          <div className="bg-white/70 dark:bg-stone-900/70 border border-orange-200/60 dark:border-orange-950/60 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Tab Buttons */}
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-stone-800 pb-3 overflow-x-auto">
              {[
                { id: 'overview', label: 'Class Overview', icon: BookOpen },
                { id: 'notes', label: 'Attached Notes (PDF)', icon: FileText },
                { id: 'schedule', label: 'Timetable', icon: Calendar },
                { id: 'archive', label: 'Past Recordings', icon: Play }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                      activeSubTab === tab.id
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                        : 'text-slate-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Overview */}
            {activeSubTab === 'overview' && (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-stone-300 leading-relaxed">
                  {stream.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-orange-50/50 dark:bg-stone-800/50 border border-orange-200/40 dark:border-stone-700/50">
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">Today's Topic</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-stone-200">Revaluation A/c & Goodwill</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-orange-50/50 dark:bg-stone-800/50 border border-orange-200/40 dark:border-stone-700/50">
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">Target Exam</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-stone-200">CBSE & State Board 2026</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-orange-50/50 dark:bg-stone-800/50 border border-orange-200/40 dark:border-stone-700/50">
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">Broadcast Standard</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-stone-200">OBS Studio Direct Ingest</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Attached Notes */}
            {activeSubTab === 'notes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800/70 border border-amber-200 dark:border-stone-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-stone-100">
                        {stream.notesTitle || "Class 12th Partnership Accounts Formula Sheet"}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-stone-400">12 Pages • High Yield Quick Revision</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('class12')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View Notes</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Timetable */}
            {activeSubTab === 'schedule' && (
              <div className="space-y-2">
                {[
                  { time: 'Today, 05:00 PM', subject: 'Accountancy', topic: 'Partnership Accounts: Admission of Partner' },
                  { time: 'Tomorrow, 05:00 PM', subject: 'Business Studies', topic: 'Principles of Management & Case Studies' },
                  { time: 'Friday, 06:00 PM', subject: 'Economics', topic: 'Macroeconomics: National Income Numericals' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-stone-800/50 border border-slate-200 dark:border-stone-700/60 text-xs">
                    <div>
                      <span className="font-bold text-orange-600 dark:text-orange-400 mr-2">{item.time}</span>
                      <span className="font-semibold text-slate-800 dark:text-stone-200">[{item.subject}] {item.topic}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-stone-700 text-orange-800 dark:text-orange-300">
                      Scheduled
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Past Recordings */}
            {activeSubTab === 'archive' && (
              <div className="space-y-2">
                {[
                  { title: 'Class 12: Goodwill Valuation 3 Methods Solved', duration: '1 hr 12 min', date: 'Yesterday' },
                  { title: 'Class 12: Profit & Loss Appropriation A/c Numerical Breakdown', duration: '58 min', date: '3 days ago' }
                ].map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-stone-800/50 border border-slate-200 dark:border-stone-700/60 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Play className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-stone-200">{rec.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-stone-400">{rec.duration} • {rec.date}</div>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-700 transition-colors">
                      Watch Replay
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Real-time Live Chat & Doubts (Firebase Connected) */}
        {!isTheatreMode && (
          <div className="lg:col-span-1 flex flex-col h-[580px] bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-orange-200/70 dark:border-orange-950/60 rounded-3xl shadow-lg shadow-orange-500/5 overflow-hidden">
            
            {/* Chat Header */}
            <div className="px-4 py-3.5 border-b border-orange-100 dark:border-stone-800 bg-orange-50/50 dark:bg-stone-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-stone-100">
                  Live Doubts & Chat
                </h3>
              </div>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-md">
                Firebase Real-time
              </span>
            </div>

            {/* Pinned Faculty Announcement */}
            <div className="p-2.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border-b border-orange-200/40 dark:border-orange-950/40 text-[11px] text-slate-700 dark:text-stone-300 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
              <span>
                <strong>Faculty Notice:</strong> Feel free to ask any doubt during today's live class!
              </span>
            </div>

            {/* Chat Messages List */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => {
                const isTeacher = msg.senderRole === 'teacher' || msg.senderRole === 'admin';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col text-xs ${
                      isTeacher 
                        ? 'bg-orange-100/70 dark:bg-orange-950/40 border border-orange-300/60 dark:border-orange-800/40 p-2.5 rounded-2xl' 
                        : 'bg-slate-50 dark:bg-stone-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-black ${isTeacher ? 'text-orange-600 dark:text-orange-400 flex items-center gap-1' : 'text-slate-800 dark:text-stone-200'}`}>
                        {msg.senderName}
                        {isTeacher && (
                          <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.2 rounded-md font-bold uppercase">
                            Faculty
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-stone-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-stone-300 break-words leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-orange-100 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask your doubt or comment..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-stone-800 text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 border border-transparent focus:border-orange-500 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white transition-all cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>

      {/* 3. OBS Studio Configuration & Firebase Sync Modal (Tarika 1) */}
      <AnimatePresence>
        {isObsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-orange-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-orange-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-stone-100">
                      OBS Studio Live Ingest & Firebase Sync
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-stone-400">
                      OBS Studio se apni official website par live broadcast connect karein.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsObsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-500 dark:text-stone-400 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-stone-800/80 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setObsTab('youtube')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    obsTab === 'youtube'
                      ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-200'
                  }`}
                >
                  ⭐ Option 1: YouTube Live via OBS (100% Free & Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setObsTab('rtmp')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    obsTab === 'rtmp'
                      ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-200'
                  }`}
                >
                  Option 2: Cloudflare / Custom RTMP Server
                </button>
              </div>

              {/* Instructions per selected tab */}
              {obsTab === 'youtube' ? (
                <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/60 dark:border-stone-700/60 space-y-2 text-xs">
                  <h4 className="font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    YouTube Live + OBS Studio Setup (Sabse Saral):
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-stone-300">
                    <li>Apne computer me <strong>OBS Studio</strong> open karein.</li>
                    <li><strong>Settings &gt; Stream</strong> me jakar Service me <strong>YouTube - RTMPS</strong> chunein.</li>
                    <li>OBS me <strong>"Start Streaming"</strong> button dabayein.</li>
                    <li>Apne YouTube Live stream ka link ya Video ID neeche input box me paste karein.</li>
                    <li><strong>"Save Changes & Go Live"</strong> dabate hi website par live stream shuru ho jayegi!</li>
                  </ol>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-3 text-xs">
                  <h4 className="font-black text-slate-800 dark:text-stone-200 uppercase tracking-wider text-[11px]">
                    Custom RTMP Ingest Credentials:
                  </h4>
                  
                  {/* RTMP Server URL */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-400 mb-1">
                      Server (RTMP Ingest URL):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={stream.rtmpServerUrl}
                        className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-stone-900 text-slate-800 dark:text-stone-200 border border-slate-200 dark:border-stone-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(stream.rtmpServerUrl, 'server')}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white cursor-pointer"
                      >
                        {copiedField === 'server' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Stream Key */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-400 mb-1">
                      Stream Key:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showStreamKey ? "text" : "password"}
                        readOnly
                        value={stream.streamKey}
                        className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-stone-900 text-slate-800 dark:text-stone-200 border border-slate-200 dark:border-stone-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStreamKey(!showStreamKey)}
                        className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-stone-700 text-slate-700 dark:text-stone-300 cursor-pointer"
                      >
                        {showStreamKey ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(stream.streamKey, 'key')}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white cursor-pointer"
                      >
                        {copiedField === 'key' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Form to update Stream metadata & live status */}
              <form onSubmit={handleSaveObsSettings} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-stone-200 mb-1">
                    Live Stream URL ya Video ID (YouTube Live Link / HLS .m3u8):
                  </label>
                  <input
                    type="text"
                    value={editStreamUrl}
                    onChange={(e) => setEditStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ya https://.../stream.m3u8"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-stone-800 text-slate-900 dark:text-stone-100 border border-slate-200 dark:border-stone-700 focus:border-orange-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-stone-400 mt-1">
                    Jab tak aap yahan apna live stream link nahi daalenge, tab tak koi faltu ya dummy video nahi chalegi, sirf official classroom screen dikhayi degi.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-stone-200 mb-1">
                    Class Title / Topic:
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-stone-800 text-slate-900 dark:text-stone-100 border border-slate-200 dark:border-stone-700 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Status Toggle & Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-orange-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={handleToggleLiveStatus}
                    disabled={isUpdatingStatus}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      stream.isLive 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>{stream.isLive ? '🔴 Currently LIVE (Click to End Stream)' : '▶️ Currently Offline (Click to Go Live)'}</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsObsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingStatus}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 cursor-pointer"
                    >
                      {isUpdatingStatus ? 'Saving to Firebase...' : 'Save & Update'}
                    </button>
                  </div>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
