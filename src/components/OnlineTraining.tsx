import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  PenTool, 
  Users, 
  Heart, 
  Send, 
  Share2, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Sparkles, 
  Download, 
  Flame, 
  ThumbsUp, 
  Lightbulb, 
  HelpCircle,
  CheckCircle2,
  Trash2,
  Eraser,
  Palette,
  Tv,
  Layers,
  PhoneCall,
  Maximize2,
  MessageCircle,
  PlusCircle,
  Radio,
  ExternalLink,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function OnlineTraining({ user, setActiveTab }: OnlineTrainingProps) {
  // 1. Room Code Detection from URL hash/query
  const getInitialRoom = () => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('room');
    if (!code && hash.includes('room=')) {
      const match = hash.match(/room=([a-zA-Z0-9_-]+)/);
      if (match) code = match[1];
    }
    return code || 'current';
  };

  const [currentRoomCode, setCurrentRoomCode] = useState<string>(getInitialRoom());

  // Role: Teacher / Student toggle (auto teacher if user role is teacher or host)
  const isTeacherDefault = user?.role === 'teacher' || user?.role === 'admin';
  const [isHostMode, setIsHostMode] = useState<boolean>(isTeacherDefault);

  // Live Stream state synced with Firebase
  const [stream, setStream] = useState<LiveStreamSession>(defaultLiveSession);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(defaultLiveChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'notes' | 'schedule'>('overview');

  // Media streams & in-browser Studio states
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeDisplayMode, setActiveDisplayMode] = useState<'camera' | 'screen' | 'whiteboard'>('camera');
  
  // Media refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Digital Whiteboard Canvas refs & states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#ea580c'); // orange default
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Class 12th Commerce: Partnership Accounts & Financial Statements');
  const [newSubject, setNewSubject] = useState('Accountancy & Commerce');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('05:00 PM IST');
  
  // Notification states
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Floating reactions state
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // 1. Subscribe to Firebase live stream session & chat for current room
  useEffect(() => {
    const unsubStream = subscribeToLiveStream(currentRoomCode, (updatedStream) => {
      setStream(updatedStream);
      if (updatedStream.activeMode) {
        setActiveDisplayMode(updatedStream.activeMode);
      }
    });

    const unsubChat = subscribeToLiveChat(currentRoomCode, (messages) => {
      if (messages.length > 0) {
        setChatMessages(messages);
      }
    });

    return () => {
      unsubStream();
      unsubChat();
    };
  }, [currentRoomCode]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2. Camera & Mic Access (WebRTC Chrome native API)
  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(e => console.log(e));
      }
      setCameraActive(true);
      setMicActive(true);
      setActiveDisplayMode('camera');
      showToast('Camera and Microphone connected successfully!');
    } catch (err: any) {
      console.warn('Camera access denied or error:', err);
      showToast('Camera permission denied or camera not found.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setCameraActive(false);
    setMicActive(false);
  };

  const toggleMic = () => {
    if (!mediaStreamRef.current) return;
    const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicActive(audioTrack.enabled);
      showToast(audioTrack.enabled ? 'Mic Unmuted 🎙️' : 'Mic Muted 🔇');
    }
  };

  // 3. Screen Mirroring / Screen Share (PPT, PDF, Windows)
  const startScreenShare = async () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      screenStreamRef.current = screenStream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = screenStream;
        videoPreviewRef.current.play().catch(e => console.log(e));
      }
      setScreenSharing(true);
      setActiveDisplayMode('screen');
      showToast('Screen sharing started! Showing your PPT/PDF presentation.');

      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('Screen share canceled:', err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    setScreenSharing(false);
    if (cameraActive && mediaStreamRef.current) {
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStreamRef.current;
        videoPreviewRef.current.play().catch(e => console.log(e));
      }
      setActiveDisplayMode('camera');
    } else {
      setActiveDisplayMode('whiteboard');
    }
  };

  // 4. Whiteboard Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 450;

    // Fill canvas background with clean board texture
    ctx.fillStyle = '#111827'; // Dark slate chalkboard
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Initial greeting on whiteboard
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.fillText('Rakhi Coaching Digital Whiteboard', 30, 45);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Topic: Partnership Accounts | Use Pen to write formulas & numericals', 30, 75);
  }, [activeDisplayMode]);

  // Sync whiteboard drawing to student's canvas in real-time
  useEffect(() => {
    if (!isHostMode && stream.whiteboardData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = stream.whiteboardData;
    }
  }, [stream.whiteboardData, isHostMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.beginPath();

    // Broadcast whiteboard snapshot to Firebase for students
    if (isHostMode && stream.isLive) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      updateLiveSession(currentRoomCode, { whiteboardData: dataUrl });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#111827' : penColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (isHostMode && stream.isLive) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      updateLiveSession(currentRoomCode, { whiteboardData: dataUrl });
    }
    showToast('Whiteboard cleared!');
  };

  // 5. Host Go Live / End Class Handler
  const handleToggleLiveSession = async () => {
    const newLiveState = !stream.isLive;
    if (newLiveState) {
      // Starting live class
      if (!cameraActive && !screenSharing) {
        await startCamera();
      }
    } else {
      stopCamera();
      stopScreenShare();
    }

    const updates: Partial<LiveStreamSession> = {
      isLive: newLiveState,
      activeMode: activeDisplayMode,
      viewerCount: newLiveState ? 38 + Math.floor(Math.random() * 15) : 0,
      updatedAt: new Date().toISOString()
    };

    await updateLiveSession(currentRoomCode, updates);
    setStream(prev => ({ ...prev, ...updates }));
    showToast(newLiveState ? '🔴 LIVE CLASS STARTED! Students can now watch.' : 'Live Class ended.');
  };

  // 6. Schedule / Create Unique Room Link
  const handleCreateScheduledClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const uniqueRoom = `class_${Date.now().toString(36)}`;
    const newSessionData: Partial<LiveStreamSession> = {
      id: uniqueRoom,
      roomCode: uniqueRoom,
      title: newTitle.trim(),
      subject: newSubject.trim(),
      grade: 'Class 12',
      teacherName: 'Arpit Nema (Director & Faculty Head)',
      isLive: true,
      activeMode: 'camera',
      scheduledDate: newDate,
      scheduledTime: newTime,
      viewerCount: 25,
      likesCount: 150,
      description: `Live interactive classroom for ${newSubject}. Join with the link to attend live doubts and discussions.`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await updateLiveSession(uniqueRoom, newSessionData);
    setCurrentRoomCode(uniqueRoom);
    setStream(prev => ({ ...prev, ...newSessionData }));
    setIsScheduleModalOpen(false);

    // Update URL hash
    window.location.hash = `onlinetraining?room=${uniqueRoom}`;

    // Auto-start camera if in host mode
    if (isHostMode) {
      startCamera();
    }
    showToast('Unique Live Class created! Copy link to share with students.');
  };

  // Generate shareable link
  const getShareableLink = () => {
    return `${window.location.origin}/#onlinetraining?room=${currentRoomCode}`;
  };

  const handleCopyLink = () => {
    const link = getShareableLink();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedLink(true);
        showToast('Class link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 3000);
      }).catch(() => {
        fallbackCopyText(link);
      });
    } else {
      fallbackCopyText(link);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedLink(true);
      showToast('Class link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      showToast('Could not copy automatically. Link: ' + text);
    }
    document.body.removeChild(textArea);
  };

  const handleShareWhatsApp = () => {
    const text = `🔴 *Rakhi Coaching Classes - Live Class Alert!*\n\n*Topic:* ${stream.title}\n*Faculty:* ${stream.teacherName}\n*Scheduled:* ${stream.scheduledDate || 'Today'} at ${stream.scheduledTime || '05:00 PM'}\n\n👇 *Join Live Class Link:* \n${getShareableLink()}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    const a = document.createElement('a');
    a.href = whatsappUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 7. Send Live Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const senderRole = isHostMode ? 'teacher' : (user?.role || 'student');
    const senderName = isHostMode 
      ? 'Arpit Nema (Faculty)' 
      : (user?.displayName || 'Student');

    const msgData: Omit<LiveChatMessage, 'id'> = {
      senderName,
      senderRole,
      text: newMessage.trim(),
      createdAt: new Date().toISOString()
    };

    const optimistic: LiveChatMessage = {
      id: `local_${Date.now()}`,
      ...msgData
    };
    setChatMessages(prev => [...prev, optimistic]);
    setNewMessage('');

    await sendLiveChatMessage(currentRoomCode, msgData);
  };

  // 8. Real-time floating reaction
  const handleReaction = async (emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 70) + 15;
    setFloatingReactions(prev => [...prev, { id, emoji, left }]);

    setStream(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
    updateLiveSession(currentRoomCode, { likesCount: stream.likesCount + 1 });

    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  // Auto-scroll chat
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
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Studio Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-orange-200/80 dark:border-orange-950/70 p-5 rounded-3xl shadow-xl shadow-orange-500/5">
        
        {/* Title & Live Status */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {stream.isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                🔴 LIVE NOW
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                Class Scheduled
              </span>
            )}
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-lg">
              Room: {currentRoomCode}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
              {stream.grade} • {stream.subject}
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-stone-100 tracking-tight">
            {stream.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400">
            Faculty: <span className="font-bold text-slate-800 dark:text-stone-200">{stream.teacherName}</span> • Time: <span className="font-semibold text-orange-600 dark:text-orange-400">{stream.scheduledDate || 'Today'}, {stream.scheduledTime || '05:00 PM'}</span>
          </p>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center shrink-0">
          
          {/* Schedule / New Room Button */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800/80 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>Schedule New Class</span>
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800 transition-all cursor-pointer"
            title="Copy Student Room Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-orange-500" />}
            <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          {/* Share on WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Share with students on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Toggle Role: Host Studio vs Student View */}
          <button
            onClick={() => setIsHostMode(!isHostMode)}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
              isHostMode
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
            }`}
          >
            {isHostMode ? '👨‍🏫 Teacher Studio' : '👨‍🎓 Student View'}
          </button>

        </div>

      </div>

      {/* 2. Main Live Interactive Arena (Video/Whiteboard + Live Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Broadcast Screen & Interactive Tools */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Main Stage Viewport (16:9) */}
          <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-stone-800 flex items-center justify-center select-none">
            
            {/* Top Status Overlay Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
              {stream.isLive ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase bg-red-600/90 text-white backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  LIVE BROADCAST
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-stone-800/90 text-stone-300 backdrop-blur-md">
                  STANDBY
                </span>
              )}

              {/* Active Joined Count */}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/70 text-white backdrop-blur-md">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span>{stream.isLive ? (stream.viewerCount || 38) : 0} Students Joined</span>
              </span>

              <span className="hidden sm:flex items-center px-2 py-1 rounded-lg text-[10px] font-medium bg-black/60 text-white/80 backdrop-blur-md">
                Mode: {activeDisplayMode.toUpperCase()}
              </span>
            </div>

            {/* Display Mode 1: Camera or Screen Share Video Stream */}
            <video
              ref={videoPreviewRef}
              className={`w-full h-full object-contain ${
                (activeDisplayMode === 'camera' && cameraActive) || (activeDisplayMode === 'screen' && screenSharing)
                  ? 'block'
                  : 'hidden'
              }`}
              playsInline
              autoPlay
              muted={isHostMode} // avoid feedback loop for host
            />

            {/* Display Mode 2: Interactive Digital Whiteboard */}
            <div className={`w-full h-full relative ${activeDisplayMode === 'whiteboard' ? 'block' : 'hidden'}`}>
              <canvas
                ref={canvasRef}
                onMouseDown={isHostMode ? startDrawing : undefined}
                onMouseUp={isHostMode ? stopDrawing : undefined}
                onMouseMove={isHostMode ? draw : undefined}
                onTouchStart={isHostMode ? startDrawing : undefined}
                onTouchEnd={isHostMode ? stopDrawing : undefined}
                onTouchMove={isHostMode ? draw : undefined}
                className={`w-full h-full ${isHostMode ? 'cursor-crosshair' : 'cursor-default'}`}
              />

              {/* Whiteboard Drawing Toolbar (Host Only) */}
              {isHostMode && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700 shadow-xl">
                  {/* Colors */}
                  {['#ea580c', '#ef4444', '#2563eb', '#16a34a', '#ffffff', '#eab308'].map(color => (
                    <button
                      key={color}
                      onClick={() => { setPenColor(color); setIsEraser(false); }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        penColor === color && !isEraser ? 'scale-125 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Color: ${color}`}
                    />
                  ))}

                  <div className="w-[1px] h-4 bg-stone-700 mx-1"></div>

                  {/* Eraser */}
                  <button
                    onClick={() => setIsEraser(!isEraser)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isEraser ? 'bg-orange-500 text-white' : 'text-stone-300 hover:bg-stone-800'
                    }`}
                    title="Eraser"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>

                  {/* Clear Canvas */}
                  <button
                    onClick={clearWhiteboard}
                    className="p-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Clear Whiteboard"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Offline Waiting Poster when Teacher has not started broadcast */}
            {!cameraActive && !screenSharing && activeDisplayMode !== 'whiteboard' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#18110b] via-[#120a06] to-black text-white relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-orange-500/25">
                  <Tv className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">
                  Rakhi Coaching Live Classroom
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 max-w-md mt-1 mb-4">
                  {stream.isLive 
                    ? 'Faculty is connecting presentation. Class is LIVE!' 
                    : `Class scheduled: ${stream.scheduledDate || 'Today'} at ${stream.scheduledTime || '05:00 PM'}.`}
                </p>

                {/* Host Start broadcast button */}
                {isHostMode ? (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleToggleLiveSession}
                      className="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/25 transition-all cursor-pointer"
                    >
                      🔴 Start Live Broadcast (Turn on Camera)
                    </button>
                    <button
                      onClick={() => setActiveDisplayMode('whiteboard')}
                      className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 transition-all cursor-pointer"
                    >
                      Open Whiteboard ✏️
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-800 text-xs text-stone-300">
                    Waiting for faculty <strong>{stream.teacherName}</strong> to begin. Please stay on this page!
                  </div>
                )}
              </div>
            )}

            {/* Floating Reactions Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
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

          </div>

          {/* Teacher Broadcast Control Bar (Camera, Mic, Screen Share, Whiteboard, Go Live) */}
          {isHostMode && (
            <div className="p-3 sm:p-4 bg-white/80 dark:bg-stone-900/80 border border-orange-200/80 dark:border-orange-950/70 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 1. Camera Access Button */}
                <button
                  onClick={cameraActive ? stopCamera : startCamera}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    cameraActive 
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20' 
                      : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200'
                  }`}
                >
                  {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-red-500" />}
                  <span>{cameraActive ? 'Camera ON' : 'Turn On Cam'}</span>
                </button>

                {/* 2. Mic Access Button */}
                <button
                  onClick={toggleMic}
                  disabled={!cameraActive}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                    micActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{micActive ? 'Mic ON' : 'Muted'}</span>
                </button>

                {/* 3. Screen Mirroring / Screen Share */}
                <button
                  onClick={screenSharing ? stopScreenShare : startScreenShare}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    screenSharing 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                      : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200'
                  }`}
                  title="Share PPT, PDF, or Entire Screen"
                >
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span>{screenSharing ? 'Stop Screen' : 'Share PPT/Screen'}</span>
                </button>

                {/* 4. Whiteboard View Toggle */}
                <button
                  onClick={() => setActiveDisplayMode('whiteboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDisplayMode === 'whiteboard'
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-orange-500" />
                  <span>Whiteboard</span>
                </button>

              </div>

              {/* 5. Master Go Live / End Stream Button */}
              <button
                onClick={handleToggleLiveSession}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                  stream.isLive 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{stream.isLive ? 'End Live Class' : '🔴 Go Live Now'}</span>
              </button>
            </div>
          )}

          {/* Quick Interactive Emoji Bar (Realtime Thumbs up to Faculty) */}
          <div className="flex items-center justify-between bg-white/80 dark:bg-stone-900/80 border border-orange-200/80 dark:border-orange-950/70 p-3 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Realtime Thumbs & Reactions:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[
                { emoji: '👍', label: 'Thumbs Up' },
                { emoji: '🔥', label: 'Fire' },
                { emoji: '👏', label: 'Clap' },
                { emoji: '❤️', label: 'Love' },
                { emoji: '💡', label: 'Understood' },
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

          {/* Lesson Details & Tabs */}
          <div className="bg-white/80 dark:bg-stone-900/80 border border-orange-200/80 dark:border-orange-950/70 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-stone-800 pb-3">
              {[
                { id: 'overview', label: 'Class Overview', icon: Users },
                { id: 'notes', label: 'Download Notes (PDF)', icon: FileText },
                { id: 'schedule', label: 'Live Timetable', icon: Calendar }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
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

            {activeSubTab === 'overview' && (
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-stone-300 leading-relaxed">
                <p>{stream.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                    <span className="text-[10px] font-bold text-orange-600 uppercase block">Mode</span>
                    <span className="font-bold text-slate-800 dark:text-stone-200">Chrome Direct Studio</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                    <span className="text-[10px] font-bold text-orange-600 uppercase block">Screen Mirroring</span>
                    <span className="font-bold text-slate-800 dark:text-stone-200">PPT / PDF Support</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                    <span className="text-[10px] font-bold text-orange-600 uppercase block">Whiteboard</span>
                    <span className="font-bold text-slate-800 dark:text-stone-200">Interactive Canvas</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                    <span className="text-[10px] font-bold text-orange-600 uppercase block">Doubts</span>
                    <span className="font-bold text-slate-800 dark:text-stone-200">Firebase Real-time</span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'notes' && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800/70 border border-amber-200 dark:border-stone-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-stone-100">
                      {stream.notesTitle || "Class 12th Partnership Accounts Formula Sheet"}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-stone-400">High Yield Handout • Direct Download</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('class12')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}

            {activeSubTab === 'schedule' && (
              <div className="space-y-2">
                {[
                  { time: `${stream.scheduledDate || 'Today'}, ${stream.scheduledTime || '05:00 PM'}`, topic: stream.title },
                  { time: 'Tomorrow, 05:00 PM', topic: 'Business Studies: Principles of Management & Case Studies' },
                  { time: 'Friday, 06:00 PM', topic: 'Economics: National Income & Aggregate Demand Numericals' }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-stone-800/50 border border-slate-200 dark:border-stone-700/60 text-xs">
                    <div>
                      <span className="font-bold text-orange-600 dark:text-orange-400 mr-2">{s.time}</span>
                      <span className="font-semibold text-slate-800 dark:text-stone-200">{s.topic}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-stone-700 text-orange-800 dark:text-orange-300">
                      Scheduled
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Firebase Real-time Live Chat & Doubts */}
        <div className="lg:col-span-1 flex flex-col h-[600px] bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-orange-200/80 dark:border-orange-950/70 rounded-3xl shadow-xl shadow-orange-500/5 overflow-hidden">
          
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

          {/* Pinned Notice */}
          <div className="p-2.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border-b border-orange-200/40 dark:border-orange-950/40 text-[11px] text-slate-700 dark:text-stone-300 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
            <span>
              <strong>Faculty:</strong> Type your questions here for instant live answers!
            </span>
          </div>

          {/* Chat Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => {
              const isFaculty = msg.senderRole === 'teacher' || msg.senderRole === 'admin';
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col text-xs ${
                    isFaculty 
                      ? 'bg-orange-100/70 dark:bg-orange-950/40 border border-orange-300/60 dark:border-orange-800/40 p-2.5 rounded-2xl' 
                      : 'bg-slate-50 dark:bg-stone-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-black ${isFaculty ? 'text-orange-600 dark:text-orange-400 flex items-center gap-1' : 'text-slate-800 dark:text-stone-200'}`}>
                      {msg.senderName}
                      {isFaculty && (
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

          {/* Chat Input */}
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

      </div>

      {/* 3. Schedule & Unique Room Link Generator Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-stone-900 border border-orange-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-orange-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-stone-100">
                      Create / Schedule Live Class
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-stone-400">
                      Direct Chrome Studio with unique student join link.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateScheduledClass} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                    Class Title / Topic:
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-stone-800 text-slate-900 dark:text-stone-100 border border-slate-200 dark:border-stone-700 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-stone-800 text-slate-900 dark:text-stone-100 border border-slate-200 dark:border-stone-700 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                      Date:
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-stone-800 text-slate-900 dark:text-stone-100 border border-slate-200 dark:border-stone-700 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                      Time (IST):
                    </label>
                    <input
                      type="text"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="05:00 PM IST"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-stone-800 text-slate-900 dark:text-stone-100 border border-slate-200 dark:border-stone-700 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-orange-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    Create & Generate Link 🔗
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
