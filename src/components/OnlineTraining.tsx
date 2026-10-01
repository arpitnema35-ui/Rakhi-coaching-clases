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
  Tv,
  Layers,
  PhoneCall,
  Maximize2,
  MessageCircle,
  PlusCircle,
  Radio,
  ExternalLink,
  FileText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  UserMinus,
  Image as ImageIcon,
  Minimize2,
  RefreshCw,
  Sliders,
  Minus,
  ArrowRight,
  LogOut,
  Camera,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LiveStreamSession, LiveChatMessage, LiveParticipant, UserProfile } from '../types';
import { 
  subscribeToLiveStream, 
  updateLiveSession, 
  subscribeToLiveChat, 
  sendLiveChatMessage, 
  subscribeToParticipants, 
  requestJoinLiveRoom, 
  updateParticipantStatus, 
  allowAllWaitingParticipants, 
  subscribeToMyParticipantStatus, 
  verifyAndSaveAdminSecurity, 
  defaultLiveSession, 
  defaultLiveChatMessages 
} from '../firebase';

// Modular Live Sub-components
import StudentNameModal from './live/StudentNameModal';
import StudentWaitingRoom from './live/StudentWaitingRoom';
import AdminLobbyManager from './live/AdminLobbyManager';
import WhiteboardModule from './live/WhiteboardModule';
import LiveChatModule from './live/LiveChatModule';
import ScheduleClassDialog from './live/ScheduleClassDialog';
import AdminAuthDialog from './live/AdminAuthDialog';

interface OnlineTrainingProps {
  user: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

export default function OnlineTraining({ user, setActiveTab }: OnlineTrainingProps) {
  // 1. Room Code Resolution (Hash or URL Parameter)
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

  // 1b. Real-time URL parameter listener (Ensures Admin and Student stay in exact same room)
  useEffect(() => {
    const handleUrlRoomChange = () => {
      const room = getInitialRoom();
      if (room && room !== currentRoomCode) {
        setCurrentRoomCode(room);
      }
    };
    window.addEventListener('hashchange', handleUrlRoomChange);
    window.addEventListener('popstate', handleUrlRoomChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoomChange);
      window.removeEventListener('popstate', handleUrlRoomChange);
    };
  }, [currentRoomCode]);

  // 2. Admin Authentication State (Persists across tab refreshes and matches email)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const savedLocal = localStorage.getItem('rakhi_admin_live_auth') === 'true';
    const savedSession = sessionStorage.getItem('rakhi_admin_live_auth') === 'true';
    const isEmailAdmin = user?.email === 'nema2810@gmail.com' || user?.email === 'arpitnema35@gmail.com';
    return savedLocal || savedSession || user?.role === 'admin' || isEmailAdmin;
  });
  const [isAdminAuthDialogOpen, setIsAdminAuthDialogOpen] = useState(false);

  // Mode: Host Studio (if authenticated admin) vs Student Classroom
  const [isHostMode, setIsHostMode] = useState<boolean>(isAdminAuthenticated);

  useEffect(() => {
    if (isAdminAuthenticated) {
      setIsHostMode(true);
      localStorage.setItem('rakhi_admin_live_auth', 'true');
      sessionStorage.setItem('rakhi_admin_live_auth', 'true');
    }
  }, [isAdminAuthenticated]);

  // 3. Firestore Session Data
  const [stream, setStream] = useState<LiveStreamSession>(defaultLiveSession);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(defaultLiveChatMessages);
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'lobby' | 'notes' | 'schedule'>('overview');

  // 3b. Pleasant Audio Chime when student knocks / requests to join
  const playKnockChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const prevWaitingCountRef = useRef<number>(0);
  useEffect(() => {
    const currentWaiting = participants.filter(p => p.status === 'waiting').length;
    if (isHostMode && currentWaiting > prevWaitingCountRef.current) {
      playKnockChime();
      showToast(`🔔 ${currentWaiting} student${currentWaiting > 1 ? 's' : ''} waiting for admission!`);
    }
    prevWaitingCountRef.current = currentWaiting;
  }, [participants, isHostMode]);

  // 4. Student Name & Admission State
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('rakhi_student_name') || user?.displayName || '';
  });
  const [studentGrade, setStudentGrade] = useState('Class 12th Commerce');
  const [studentParticipantId, setStudentParticipantId] = useState<string | null>(() => {
    return localStorage.getItem('rakhi_student_pid') || null;
  });
  const [admissionStatus, setAdmissionStatus] = useState<'idle' | 'waiting' | 'admitted' | 'rejected' | 'kicked'>(() => {
    return (localStorage.getItem('rakhi_admission_status') as any) || 'idle';
  });
  const [isStudentNameModalOpen, setIsStudentNameModalOpen] = useState(false);
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);

  // If student hasn't entered their name yet and is in student mode, open the modal
  useEffect(() => {
    if (!isHostMode && !studentName.trim() && admissionStatus === 'idle') {
      setIsStudentNameModalOpen(true);
    }
  }, [isHostMode, studentName, admissionStatus]);

  // 5. Chrome In-Browser Studio Media State
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [activeDisplayMode, setActiveDisplayMode] = useState<'camera' | 'screen' | 'whiteboard'>('camera');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isWhiteboardFullscreen, setIsWhiteboardFullscreen] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenCaptureIntervalRef = useRef<any>(null);
  const slideUploadRef = useRef<HTMLInputElement>(null);

  // Local real-time screen mirror frame cache (for smooth instant preview in multi-tab student mode)
  const [localScreenFrame, setLocalScreenFrame] = useState<string | null>(() => {
    return localStorage.getItem(`rakhi_screen_${currentRoomCode}`) || null;
  });

  useEffect(() => {
    if (isHostMode) return;
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(`rakhi_screen_${currentRoomCode}`);
        bc.onmessage = (event) => {
          if (event.data?.frameData) {
            setLocalScreenFrame(event.data.frameData);
          }
        };
      } catch {}
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `rakhi_screen_${currentRoomCode}` && e.newValue) {
        setLocalScreenFrame(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentRoomCode, isHostMode]);

  // Slide / Presentation Image Upload handler (guarantees screen mirror capability anywhere)
  const handleSlideUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLocalScreenFrame(dataUrl);
        try {
          localStorage.setItem(`rakhi_screen_${currentRoomCode}`, dataUrl);
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel(`rakhi_screen_${currentRoomCode}`);
            bc.postMessage({ type: 'SCREEN_FRAME', frameData: dataUrl });
            bc.close();
          }
        } catch {}
        updateLiveSession(currentRoomCode, {
          activeMode: 'screen',
          whiteboardData: dataUrl,
          isLive: true,
          isWhiteboardActive: false
        });
        setActiveDisplayMode('screen');
        setIsWhiteboardOpen(false);
        showToast('📄 Study Slide / PPT presentation mirrored to students!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Clean up media streams and intervals on unmount
  useEffect(() => {
    return () => {
      if (screenCaptureIntervalRef.current) {
        clearInterval(screenCaptureIntervalRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // 6. Schedule Modal State
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // 7. Countdown Timer State
  const [countdownText, setCountdownText] = useState<string>('');
  const [isClassTimeReached, setIsClassTimeReached] = useState(false);

  // 8. Floating Reactions & Toast Notifications
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Safe Clipboard Copy Helper
  const copyLinkToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedLink(true);
        showToast('Class link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2800);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setCopiedLink(true);
      showToast('Class link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2800);
    } catch {
      showToast('Could not copy link automatically.');
    }
    document.body.removeChild(el);
  };

  // 9. Subscribe to Real-time Firestore Session Room Data
  useEffect(() => {
    const unsubStream = subscribeToLiveStream(currentRoomCode, (updatedStream) => {
      setStream(updatedStream);
      if (updatedStream.activeMode) {
        setActiveDisplayMode(updatedStream.activeMode);
      }
      if (updatedStream.isWhiteboardActive !== undefined) {
        setIsWhiteboardOpen(updatedStream.isWhiteboardActive);
      }
    });

    const unsubChat = subscribeToLiveChat(currentRoomCode, (messages) => {
      if (messages.length > 0) {
        setChatMessages(messages);
      }
    });

    const unsubParticipants = subscribeToParticipants(currentRoomCode, (list) => {
      setParticipants(list);
    });

    return () => {
      unsubStream();
      unsubChat();
      unsubParticipants();
    };
  }, [currentRoomCode]);

  // 10. Student Listens to Personal Admission Status in Real-Time
  useEffect(() => {
    if (isHostMode || !studentParticipantId) return;

    const unsubMyStatus = subscribeToMyParticipantStatus(currentRoomCode, studentParticipantId, (status) => {
      setAdmissionStatus(status);
      localStorage.setItem('rakhi_admission_status', status);

      if (status === 'admitted') {
        showToast('🎉 You have been admitted to the live class by Faculty Arpit Nema!');
      } else if (status === 'kicked') {
        showToast('You were removed from this session by the faculty.');
      } else if (status === 'rejected') {
        showToast('Admission was declined by faculty.');
      }
    });

    return () => {
      unsubMyStatus();
    };
  }, [currentRoomCode, studentParticipantId, isHostMode]);

  // 11. Countdown Timer Calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!stream.scheduledDate) {
        setCountdownText('');
        setIsClassTimeReached(true);
        return;
      }

      const timeStr = stream.scheduledTime || '05:00 PM';
      const cleanTime = timeStr.replace(' IST', '').trim();
      const targetDate = new Date(`${stream.scheduledDate} ${cleanTime}`);
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0 || stream.isLive) {
        setIsClassTimeReached(true);
        setCountdownText('Live class is starting now!');
      } else {
        setIsClassTimeReached(false);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setCountdownText(
          `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stream.scheduledDate, stream.scheduledTime, stream.isLive]);

  // 12. Student Name Submission Handler
  const handleStudentNameSubmit = async (name: string, grade: string) => {
    setIsRegisteringStudent(true);
    setStudentName(name);
    setStudentGrade(grade);
    localStorage.setItem('rakhi_student_name', name);

    try {
      const pId = await requestJoinLiveRoom(
        currentRoomCode, 
        name, 
        studentParticipantId || undefined, 
        { grade }
      );
      setStudentParticipantId(pId);
      localStorage.setItem('rakhi_student_pid', pId);
      setAdmissionStatus('waiting');
      localStorage.setItem('rakhi_admission_status', 'waiting');
      setIsStudentNameModalOpen(false);
      showToast(`Welcome ${name}! Join request sent to Faculty Arpit Nema.`);
    } catch {
      showToast('Could not register join request. Please retry.');
    } finally {
      setIsRegisteringStudent(false);
    }
  };

  // 13. Camera Controls (Front & Rear + Mic)
  const startCamera = async (facingMode: 'user' | 'environment' = cameraFacingMode) => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      mediaStreamRef.current = media;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = media;
        videoPreviewRef.current.play().catch(e => console.log(e));
      }
      setCameraActive(true);
      setMicActive(true);
      setCameraFacingMode(facingMode);
      setActiveDisplayMode('camera');
      showToast(`Camera ON (${facingMode === 'user' ? 'Front' : 'Back'}) & Mic Connected 🎙️`);
    } catch (err) {
      console.warn('Camera access denied:', err);
      showToast('Camera permission denied or camera not found.');
    }
  };

  const switchCameraFacingMode = async () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    if (cameraActive) {
      await startCamera(nextMode);
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

  // 14. Screen Mirroring / Sharing (Google Meet Style)
  const startScreenShare = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      showToast('⚠️ Screen mirroring is supported on desktop/laptop Chrome or Edge browsers.');
      return;
    }

    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }

      // Automatically turn off whiteboard view so screen video is immediately visible
      setIsWhiteboardOpen(false);

      let screenStream: MediaStream;
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always"
          } as any,
          audio: false
        });
      } catch (err1) {
        // Fallback for minimal constraints
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      screenStreamRef.current = screenStream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = screenStream;
        await videoPreviewRef.current.play().catch(e => console.log(e));
      }

      setScreenSharing(true);
      setActiveDisplayMode('screen');

      // Update Firestore live session mode so all students switch to screen view
      if (isHostMode) {
        await updateLiveSession(currentRoomCode, {
          activeMode: 'screen',
          isWhiteboardActive: false,
          isLive: true
        });
      }

      showToast('🖥️ Screen Mirroring Started! Sharing window / PPT with students.');

      // Periodically capture frame and broadcast to students via Firestore
      if (screenCaptureIntervalRef.current) {
        clearInterval(screenCaptureIntervalRef.current);
      }

      const captureFrame = () => {
        const v = videoPreviewRef.current;
        if (!v || v.videoWidth === 0 || v.videoHeight === 0) return;
        try {
          const offCanvas = document.createElement('canvas');
          const maxDim = 800;
          const scale = Math.min(maxDim / v.videoWidth, maxDim / v.videoHeight, 1);
          offCanvas.width = Math.round(v.videoWidth * scale);
          offCanvas.height = Math.round(v.videoHeight * scale);
          const ctx = offCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, offCanvas.width, offCanvas.height);
            const frameData = offCanvas.toDataURL('image/jpeg', 0.55);
            try {
              localStorage.setItem(`rakhi_screen_${currentRoomCode}`, frameData);
              if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel(`rakhi_screen_${currentRoomCode}`);
                bc.postMessage({ type: 'SCREEN_FRAME', frameData });
                bc.close();
              }
            } catch {}
            updateLiveSession(currentRoomCode, { whiteboardData: frameData });
          }
        } catch (e) {
          console.warn("Screen frame broadcast notice:", e);
        }
      };

      setTimeout(captureFrame, 600);
      screenCaptureIntervalRef.current = setInterval(captureFrame, 2000);

      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err: any) {
      console.warn('Screen share error or canceled:', err);
      if (err.name === 'NotAllowedError') {
        showToast('Screen sharing permission was cancelled.');
      } else {
        showToast('Could not start screen mirror: ' + (err.message || 'Please check browser settings.'));
      }
    }
  };

  const stopScreenShare = () => {
    if (screenCaptureIntervalRef.current) {
      clearInterval(screenCaptureIntervalRef.current);
      screenCaptureIntervalRef.current = null;
    }
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
      if (isHostMode) {
        updateLiveSession(currentRoomCode, { activeMode: 'camera' });
      }
    } else {
      setActiveDisplayMode(isWhiteboardOpen ? 'whiteboard' : 'camera');
      if (isHostMode) {
        updateLiveSession(currentRoomCode, { activeMode: isWhiteboardOpen ? 'whiteboard' : 'camera' });
      }
    }
    showToast('Screen sharing stopped.');
  };

  // 15. Whiteboard Toggle
  const toggleWhiteboard = async () => {
    const nextState = !isWhiteboardOpen;
    setIsWhiteboardOpen(nextState);
    if (nextState) {
      setActiveDisplayMode('whiteboard');
    } else {
      setActiveDisplayMode(screenSharing ? 'screen' : 'camera');
    }
    if (isHostMode) {
      await updateLiveSession(currentRoomCode, { 
        isWhiteboardActive: nextState, 
        activeMode: nextState ? 'whiteboard' : (screenSharing ? 'screen' : 'camera') 
      });
    }
  };

  // 16. Chat Box Toggle
  const handleToggleChat = async () => {
    const nextChatState = !(stream.isChatEnabled ?? true);
    await updateLiveSession(currentRoomCode, { isChatEnabled: nextChatState });
    setStream(prev => ({ ...prev, isChatEnabled: nextChatState }));
    showToast(nextChatState ? 'Chat Box Enabled for Students' : 'Chat Box Disabled by Faculty');
  };

  // 17. Master Go Live / End Class Handler
  const handleToggleLiveSession = async () => {
    const newLiveState = !stream.isLive;
    if (newLiveState) {
      if (!cameraActive && !screenSharing && !isWhiteboardOpen) {
        await startCamera();
      }
    } else {
      stopCamera();
      stopScreenShare();
    }

    const updates: Partial<LiveStreamSession> = {
      isLive: newLiveState,
      activeMode: activeDisplayMode,
      viewerCount: newLiveState ? (participants.filter(p => p.status === 'admitted').length || 32) : 0,
      updatedAt: new Date().toISOString()
    };

    await updateLiveSession(currentRoomCode, updates);
    setStream(prev => ({ ...prev, ...updates }));
    showToast(newLiveState ? '🔴 LIVE CLASS STARTED! Students admitted can watch.' : 'Live Class ended.');
  };

  // 18. Whiteboard Sync to Firebase
  const handleSyncWhiteboard = (dataUrl: string) => {
    if (isHostMode && stream.isLive) {
      updateLiveSession(currentRoomCode, { whiteboardData: dataUrl });
    }
  };

  // 19. Send Live Chat Message
  const handleSendChatMessage = async (text: string) => {
    const senderRole = isHostMode ? 'teacher' : 'student';
    const senderName = isHostMode 
      ? 'Arpit Nema (Faculty)' 
      : (studentName || 'Student');

    const msgData: Omit<LiveChatMessage, 'id'> = {
      senderName,
      senderRole,
      text,
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    setChatMessages(prev => [...prev, { id: `local_${Date.now()}`, ...msgData }]);
    await sendLiveChatMessage(currentRoomCode, msgData);
  };

  // 20. Reactions Handlers
  const handleReaction = (emoji: string) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 70) + 15
    };
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);

    // Also send reaction to chat if appropriate
    if (stream.isChatEnabled ?? true) {
      sendLiveChatMessage(currentRoomCode, {
        senderName: isHostMode ? 'Arpit Nema (Faculty)' : (studentName || 'Student'),
        senderRole: isHostMode ? 'teacher' : 'student',
        text: emoji,
        createdAt: new Date().toISOString()
      });
    }
  };

  // 21. Participant Management Handlers (Admin)
  const handleAllowStudent = async (participantId: string) => {
    await updateParticipantStatus(currentRoomCode, participantId, 'admitted');
    showToast('Student admitted to live class!');
  };

  const handleDisallowStudent = async (participantId: string) => {
    await updateParticipantStatus(currentRoomCode, participantId, 'rejected', 'Admission request declined by faculty.');
    showToast('Student admission disallowed.');
  };

  const handleKickoutStudent = async (participantId: string) => {
    await updateParticipantStatus(currentRoomCode, participantId, 'kicked');
    showToast('Student removed from session.');
  };

  const handleAllowAllWaiting = async () => {
    const waitingIds = participants.filter(p => p.status === 'waiting').map(p => p.id);
    await allowAllWaitingParticipants(currentRoomCode, waitingIds);
    showToast(`Admitted all ${waitingIds.length} waiting students!`);
  };

  // 22. Class Creation from Schedule Dialog
  const handleClassCreated = (newClass: {
    roomCode: string;
    link: string;
    title: string;
    subject: string;
    date: string;
    time: string;
    thumbnail: string;
  }) => {
    setCurrentRoomCode(newClass.roomCode);
    window.location.hash = `onlinetraining?room=${newClass.roomCode}`;

    const newSessionData: Partial<LiveStreamSession> = {
      id: newClass.roomCode,
      roomCode: newClass.roomCode,
      title: newClass.title,
      subject: newClass.subject,
      grade: 'Class 12',
      teacherName: 'Arpit Nema (Director & Faculty Head)',
      isLive: true,
      activeMode: 'camera',
      isWhiteboardActive: false,
      isChatEnabled: true,
      scheduledDate: newClass.date,
      scheduledTime: newClass.time,
      thumbnailUrl: newClass.thumbnail,
      viewerCount: 24,
      likesCount: 130,
      description: `Live interactive training session for ${newClass.subject}. Hosted directly in Google Chrome with real-time camera, screen mirror, and whiteboard.`,
      updatedAt: new Date().toISOString()
    };

    setStream(prev => ({ ...prev, ...newSessionData }));
    updateLiveSession(newClass.roomCode, newSessionData);
    setIsScheduleDialogOpen(false);
    showToast('Live Class Scheduled & Activated!');
  };

  const getShareableLink = () => {
    return `${window.location.origin}/#onlinetraining?room=${currentRoomCode}`;
  };

  const handleShareWhatsApp = () => {
    const link = getShareableLink();
    const msg = `🔴 *Rakhi Coaching Classes - Live Class Alert!*\n\n*Topic:* ${stream.title}\n*Faculty:* ${stream.teacherName}\n*Scheduled:* ${stream.scheduledDate || 'Today'} at ${stream.scheduledTime || '05:00 PM'}\n\n👇 *Join Live Class Link:* \n${link}\n\n_Note: Enter your name on opening link to get admitted into class!_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const waitingCount = participants.filter(p => p.status === 'waiting').length;
  const admittedCount = participants.filter(p => p.status === 'admitted').length;

  // Determine if student should see waiting room or live content
  const shouldShowWaitingRoom = !isHostMode && admissionStatus !== 'admitted';

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-orange-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-black text-slate-900 dark:text-stone-100 transition-colors pb-16">
      
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-stone-800/90 text-white border border-orange-500/40 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Navigation & Quick Controls */}
      <div className="border-b border-orange-200/60 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Branding & Room Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('class12')}
              className="text-xs font-bold text-stone-500 hover:text-orange-500 transition-colors"
            >
              ← Back to Notes
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/20">
                🔴
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Rakhi Live Studio
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 dark:bg-stone-800 text-orange-700 dark:text-orange-300">
                    Room: {currentRoomCode}
                  </span>
                </h1>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  {isHostMode ? 'Faculty Broadcast Console (Arpit Nema)' : `Student View: ${studentName || 'Registering...'}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            
            {/* Student Name Pill with Change Button */}
            {!isHostMode && (
              <button
                onClick={() => setIsStudentNameModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 cursor-pointer transition-colors"
                title="Update your student name"
              >
                <span>👨‍🎓 {studentName || 'Enter Name'}</span>
              </button>
            )}

            {/* Copy Class Link Button */}
            <button
              onClick={() => copyLinkToClipboard(getShareableLink())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
              title="Copy Unique Student Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>

            {/* Share on WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
              title="Share Link on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Schedule Class Modal Trigger (Host Only) */}
            {isHostMode && (
              <button
                onClick={() => setIsScheduleDialogOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule Class</span>
              </button>
            )}

            {/* Admin Security Switcher */}
            {!isAdminAuthenticated ? (
              <button
                onClick={() => setIsAdminAuthDialogOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 cursor-pointer shadow-sm transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                <span>Admin Login</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsHostMode(!isHostMode)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-orange-100 dark:bg-stone-800 text-orange-700 dark:text-orange-300 hover:bg-orange-200 cursor-pointer"
                >
                  <span>{isHostMode ? 'Switch: Student View' : 'Switch: Host Studio'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    setIsHostMode(false);
                    sessionStorage.removeItem('rakhi_admin_live_auth');
                    stopCamera();
                    stopScreenShare();
                    showToast('Admin logged out.');
                  }}
                  className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Main Studio & Classroom Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols on Large Screen): Video / Screen / Whiteboard / Waiting Screen */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* High Visibility Instant Admission Request Banner for Admin */}
            {isHostMode && waitingCount > 0 && (
              <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-2xl border-2 border-amber-300 backdrop-blur-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-base shadow-md animate-bounce">
                      🔔
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-tight text-slate-950 flex items-center gap-2">
                        Student Admission Request ({waitingCount} Pending)
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-900/80">
                        Admin Approval Required: Allow or Disallow student entry into live class
                      </p>
                    </div>
                  </div>

                  {waitingCount > 1 && (
                    <button
                      onClick={handleAllowAllWaiting}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-black shadow-lg cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Allow All ({waitingCount})</span>
                    </button>
                  )}
                </div>

                {/* Waiting student cards */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {participants.filter(p => p.status === 'waiting').map(st => (
                    <div 
                      key={st.id}
                      className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2.5 sm:p-3 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-amber-300 dark:border-stone-700 shadow-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                          👨‍🎓
                        </span>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate block">
                            {st.name}
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                            <span>{st.grade || 'Class 12th Commerce'}</span>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold">Waiting for your approval</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <button
                          onClick={() => handleAllowStudent(st.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          title="Allow student to enter live class"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Allow (प्रवेश दें)</span>
                        </button>
                        <button
                          onClick={() => handleDisallowStudent(st.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          title="Disallow student admission"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Disallow (मना करें)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Media Stage Container */}
            <div className={`relative w-full aspect-video bg-black rounded-3xl shadow-2xl border border-stone-800/80 transition-all ${isWhiteboardFullscreen ? 'overflow-visible' : 'overflow-hidden'}`}>
              
              {/* Overlay Indicators (Live Badge, Viewer Counter, Lobby Notification) */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  stream.isLive 
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'bg-black/70 text-stone-300 border border-white/20'
                }`}>
                  <Radio className="w-3 h-3" />
                  {stream.isLive ? 'LIVE' : 'OFFLINE'}
                </span>

                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  <span>{stream.isLive ? (admittedCount || stream.viewerCount || 28) : 0} Admitted</span>
                </span>

                {isHostMode && waitingCount > 0 && (
                  <button
                    onClick={() => setActiveSubTab('lobby')}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-900 animate-bounce cursor-pointer shadow-lg"
                  >
                    🔔 {waitingCount} Waiting to Join
                  </button>
                )}
              </div>

              {/* Mode A: Student Waiting Room / Countdown Screen (If student is not admitted yet) */}
              {shouldShowWaitingRoom ? (
                <StudentWaitingRoom
                  stream={stream}
                  studentName={studentName}
                  admissionStatus={admissionStatus}
                  countdownText={countdownText}
                  isClassTimeReached={isClassTimeReached}
                  onOpenNameModal={() => setIsStudentNameModalOpen(true)}
                  onRetryAdmission={() => setIsStudentNameModalOpen(true)}
                  onExit={() => setActiveTab('class12')}
                />
              ) : (
                /* Mode B: Live Classroom Stage (Camera, Screen Share, or Whiteboard) */
                <>
                  {/* Host Camera or Screen Share Video Stream */}
                  {isHostMode && (
                    <video
                      ref={videoPreviewRef}
                      className={`w-full h-full object-contain ${
                        ((activeDisplayMode === 'camera' && cameraActive) || (activeDisplayMode === 'screen' && screenSharing)) && !isWhiteboardOpen
                          ? 'block'
                          : 'hidden'
                      }`}
                      playsInline
                      autoPlay
                      muted
                    />
                  )}

                  {/* Student Live Screen Mirror Presentation (Google Meet Style) */}
                  {!isHostMode && (stream.activeMode === 'screen' || activeDisplayMode === 'screen') && !isWhiteboardOpen && (
                    <div className="w-full h-full relative flex flex-col items-center justify-center bg-black overflow-hidden">
                      {(localScreenFrame || stream.whiteboardData) ? (
                        <img
                          src={localScreenFrame || stream.whiteboardData}
                          alt="Faculty Screen Share Presentation"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-6 space-y-3">
                          <Monitor className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
                          <h4 className="text-base font-black text-white">Faculty Arpit Nema is Presenting Screen</h4>
                          <p className="text-xs text-stone-300">Live PPT / Study Material Mirroring (Google Meet Style)</p>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-blue-300">
                        <Monitor className="w-3.5 h-3.5 text-blue-400" />
                        <span>🔴 Live Screen Mirror (Google Meet Style)</span>
                      </div>
                    </div>
                  )}

                  {/* Interactive Digital Whiteboard */}
                  <WhiteboardModule
                    isHostMode={isHostMode}
                    isOpen={isWhiteboardOpen || (!isHostMode && stream.activeMode === 'whiteboard' && Boolean(stream.isWhiteboardActive))}
                    whiteboardData={stream.whiteboardData}
                    onSyncWhiteboard={handleSyncWhiteboard}
                    onToggleFullscreen={() => setIsWhiteboardFullscreen(!isWhiteboardFullscreen)}
                    isFullscreen={isWhiteboardFullscreen}
                  />

                  {/* Offline Poster (When live has not started or presenter is preparing) */}
                  {((isHostMode && !cameraActive && !screenSharing && !isWhiteboardOpen) || 
                    (!isHostMode && stream.activeMode !== 'screen' && activeDisplayMode !== 'screen' && !isWhiteboardOpen && !stream.isWhiteboardActive && !stream.isLive)) && (
                    <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white">
                      <div 
                        className="absolute inset-0 bg-cover bg-center filter blur-sm brightness-[0.35]"
                        style={{ backgroundImage: `url(${stream.thumbnailUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'})` }}
                      />
                      <div className="relative z-10 space-y-3 bg-black/60 p-6 rounded-3xl backdrop-blur-md border border-white/10 max-w-md">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center shadow-xl">
                          <Tv className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-black text-white">{stream.title}</h3>
                        <p className="text-xs text-stone-300">Faculty: <strong>{stream.teacherName}</strong></p>
                        
                        {isHostMode ? (
                          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={handleToggleLiveSession}
                              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl cursor-pointer"
                            >
                              🔴 Turn On Cam & Go Live
                            </button>
                            <button
                              onClick={toggleWhiteboard}
                              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 cursor-pointer"
                            >
                              Open Whiteboard ✏️
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-200 text-xs">
                            🔴 Live class is in progress. Faculty will start presenting shortly!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Floating Reaction Emojis Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                <AnimatePresence>
                  {floatingReactions.map(reaction => (
                    <motion.div
                      key={reaction.id}
                      initial={{ opacity: 1, y: 160, scale: 0.8 }}
                      animate={{ opacity: 0, y: -120, scale: 1.5 }}
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

            {/* Teacher Studio Control Bar (Host Admin Only) */}
            {isHostMode && (
              <div className="p-3 sm:p-4 bg-white/80 dark:bg-stone-900/80 border border-orange-200/80 dark:border-orange-950/70 rounded-3xl shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  
                  {/* Media Hardware Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Camera ON/OFF */}
                    <button
                      onClick={cameraActive ? stopCamera : () => startCamera()}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        cameraActive 
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200'
                      }`}
                    >
                      {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-red-500" />}
                      <span>{cameraActive ? 'Camera ON' : 'Turn Cam ON'}</span>
                    </button>

                    {/* Switch Front / Back Camera */}
                    <button
                      onClick={switchCameraFacingMode}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200 transition-all cursor-pointer"
                      title={`Switch Camera (Currently: ${cameraFacingMode === 'user' ? 'Front' : 'Back'})`}
                    >
                      <Repeat className="w-4 h-4 text-orange-500" />
                      <span>{cameraFacingMode === 'user' ? 'Front Cam' : 'Back Cam'}</span>
                    </button>

                    {/* Mic ON/OFF */}
                    <button
                      onClick={toggleMic}
                      disabled={!cameraActive}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                        micActive ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      <span>{micActive ? 'Mic ON' : 'Muted'}</span>
                    </button>

                    {/* Screen Sharing (Google Meet Style) */}
                    <button
                      onClick={screenSharing ? stopScreenShare : startScreenShare}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        screenSharing 
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                          : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200'
                      }`}
                      title="Share full computer screen or Chrome tab (Google Meet style)"
                    >
                      <Monitor className="w-4 h-4 text-blue-500" />
                      <span>{screenSharing ? 'Stop Screen' : 'Share Screen'}</span>
                    </button>

                    {/* Present Slides / Notes Images (Mirror without display permission) */}
                    <input
                      type="file"
                      ref={slideUploadRef}
                      accept="image/*,.pdf"
                      onChange={handleSlideUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => slideUploadRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200 transition-all cursor-pointer"
                      title="Mirror PPT Slide, PDF Page or Photo to Students"
                    >
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span>Present Slides/PPT</span>
                    </button>

                    {/* Whiteboard ON/OFF Toggle */}
                    <button
                      onClick={toggleWhiteboard}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isWhiteboardOpen 
                          ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20' 
                          : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200'
                      }`}
                    >
                      <PenTool className="w-4 h-4 text-orange-500" />
                      <span>{isWhiteboardOpen ? 'Whiteboard ON' : 'Whiteboard OFF'}</span>
                    </button>

                    {/* Chat ON/OFF Toggle */}
                    <button
                      onClick={handleToggleChat}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        (stream.isChatEnabled ?? true)
                          ? 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300' 
                          : 'bg-red-500 text-white'
                      }`}
                      title="Toggle Chat for Students"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{(stream.isChatEnabled ?? true) ? 'Chat ON' : 'Chat OFF'}</span>
                    </button>

                  </div>

                  {/* Master Go Live Button */}
                  <button
                    onClick={handleToggleLiveSession}
                    className={`px-5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                      stream.isLive 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>{stream.isLive ? 'End Live Class' : '🔴 Go Live Now'}</span>
                  </button>

                </div>
              </div>
            )}

            {/* Quick Reactions Bar */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-stone-900/80 border border-orange-200/80 dark:border-orange-950/70 p-3 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Live Thumbs & Reactions:
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

            {/* Interactive Information Tabs & Lobby Queue */}
            <div className="bg-white/80 dark:bg-stone-900/80 border border-orange-200/80 dark:border-orange-950/70 rounded-3xl p-5 shadow-sm space-y-4">
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-orange-100 dark:border-stone-800 pb-3">
                {[
                  { id: 'overview', label: 'Class Overview', icon: Users },
                  ...(isHostMode ? [{ id: 'lobby', label: `Lobby & Students (${participants.length})`, icon: ShieldCheck }] : []),
                  { id: 'notes', label: 'Download Notes (PDF)', icon: FileText },
                  { id: 'schedule', label: 'Timetable', icon: Calendar }
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

              {/* Tab 1: Overview */}
              {activeSubTab === 'overview' && (
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-stone-300 leading-relaxed">
                  <p>{stream.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                      <span className="text-[10px] font-bold text-orange-600 uppercase block">Mode</span>
                      <span className="font-bold text-slate-800 dark:text-stone-200">Chrome In-Browser</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                      <span className="text-[10px] font-bold text-orange-600 uppercase block">Camera Control</span>
                      <span className="font-bold text-slate-800 dark:text-stone-200">Front & Back Cam</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                      <span className="text-[10px] font-bold text-orange-600 uppercase block">Security</span>
                      <span className="font-bold text-slate-800 dark:text-stone-200">Admin Lobby (Allow/Kick)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-stone-800/60 border border-orange-200/50 dark:border-stone-700">
                      <span className="text-[10px] font-bold text-orange-600 uppercase block">Whiteboard</span>
                      <span className="font-bold text-slate-800 dark:text-stone-200">Colors, Ruler, Notes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Admin Lobby Manager (Allow, Disallow, Kickout) */}
              {activeSubTab === 'lobby' && isHostMode && (
                <AdminLobbyManager
                  participants={participants}
                  onAllowStudent={handleAllowStudent}
                  onDisallowStudent={handleDisallowStudent}
                  onKickoutStudent={handleKickoutStudent}
                  onAllowAllWaiting={handleAllowAllWaiting}
                />
              )}

              {/* Tab 3: Notes PDF */}
              {activeSubTab === 'notes' && (
                <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-stone-800/60 border border-orange-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {stream.notesTitle || 'Partnership Accounts Complete Formula Cheat-Sheet'}
                      </h4>
                      <span className="text-[11px] text-stone-500">Official Class 12th Commerce Study Material (PDF)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('class12')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Notes</span>
                  </button>
                </div>
              )}

              {/* Tab 4: Schedule Timetable */}
              {activeSubTab === 'schedule' && (
                <div className="space-y-2 text-xs text-slate-700 dark:text-stone-300">
                  <p>Faculty Schedule & Live Timetable:</p>
                  <div className="divide-y divide-orange-100 dark:divide-stone-800">
                    <div className="py-2 flex items-center justify-between">
                      <span className="font-bold">Partnership Accounts Masterclass</span>
                      <span className="text-orange-600 dark:text-orange-400 font-mono">05:00 PM IST (Daily)</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="font-bold">Business Studies Case Studies & Board Qs</span>
                      <span className="text-orange-600 dark:text-orange-400 font-mono">07:00 PM IST (Tue, Thu, Sat)</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Column (1 Col): Live Chat Module */}
          <div className="lg:col-span-1">
            <LiveChatModule
              messages={chatMessages}
              isHostMode={isHostMode}
              isChatEnabled={stream.isChatEnabled ?? true}
              currentUserName={isHostMode ? 'Arpit Nema (Faculty)' : (studentName || 'Student')}
              onSendMessage={handleSendChatMessage}
              onToggleChat={isHostMode ? handleToggleChat : undefined}
            />
          </div>

        </div>
      </div>

      {/* Student Name Modal (Prompting for Name upon sharing link) */}
      <StudentNameModal
        isOpen={isStudentNameModalOpen}
        currentName={studentName}
        currentGrade={studentGrade}
        onClose={() => setIsStudentNameModalOpen(false)}
        onSubmit={handleStudentNameSubmit}
        isSubmitting={isRegisteringStudent}
      />

      {/* Schedule Class Dialog Modal */}
      <ScheduleClassDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        onClassCreated={handleClassCreated}
      />

      {/* Admin Security Login Dialog */}
      <AdminAuthDialog
        isOpen={isAdminAuthDialogOpen}
        onClose={() => setIsAdminAuthDialogOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthenticated(true);
          setIsHostMode(true);
          showToast('🛡️ Admin Verified! Teacher Studio unlocked.');
        }}
      />

    </div>
  );
}
