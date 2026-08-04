import React, { useState } from 'react';
import { 
  Play, 
  Search, 
  Video, 
  Clock, 
  User, 
  BookOpen, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Send, 
  X, 
  CheckCircle2, 
  Eye, 
  ThumbsUp, 
  Share2, 
  Download,
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lecture } from '../types';

interface LecturesPageProps {
  setActiveTab: (tab: string) => void;
  userEmail?: string;
}

export default function LecturesPage({ setActiveTab, userEmail }: LecturesPageProps) {
  
  // Sample High Quality Recorded & Live Lectures
  const defaultLectures: Lecture[] = [
    {
      id: 'lec_1',
      title: 'Class 10 Physics: Electricity & Ohm\'s Law Mastery',
      description: 'Complete breakdown of Electric Current, Potential Difference, Ohm\'s Law numericals, and Circuit Diagrams with previous year board questions solved.',
      subject: 'Physics',
      grade: 'Class 10',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Standard embed
      duration: '52 min',
      teacherName: 'Arpit Nema (Director)',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      chapter: 'Chapter 12: Electricity',
      isFree: true,
      viewsCount: 4820,
      createdAt: '2026-07-20'
    },
    {
      id: 'lec_2',
      title: 'Class 12 Chemistry: Organic Reaction Mechanisms & Named Reactions',
      description: 'Master Sn1, Sn2, Aldol condensation, Cannizzaro, and Reimer-Tiemann reactions with memory tricks for Board exams and JEE Mains.',
      subject: 'Chemistry',
      grade: 'Class 12',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '1 hr 15 min',
      teacherName: 'Er. Rahul Verma',
      thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
      chapter: 'Chapter 10: Haloalkanes & Organic Mechanisms',
      isFree: true,
      viewsCount: 6150,
      createdAt: '2026-07-18'
    },
    {
      id: 'lec_3',
      title: 'JEE Mains & Advanced: Integration Shortcuts & Definite Integrals',
      description: 'Superfast integration tricks, King\'s Property applications, and 15 high-yield JEE Mains past 5-year questions solved live.',
      subject: 'Mathematics',
      grade: 'JEE/NEET',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '1 hr 05 min',
      teacherName: 'Arpit Nema (Director)',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      chapter: 'Calculus: Definite Integration',
      isFree: false,
      viewsCount: 8900,
      createdAt: '2026-07-22'
    },
    {
      id: 'lec_4',
      title: 'Class 10 Mathematics: Trigonometry Identities & Height & Distance',
      description: 'Step-by-step proofs for sin²θ + cos²θ = 1 and 3D diagram visualization for height and distance problems.',
      subject: 'Mathematics',
      grade: 'Class 10',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '48 min',
      teacherName: 'Arpit Nema (Director)',
      thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
      chapter: 'Chapter 8: Introduction to Trigonometry',
      isFree: true,
      viewsCount: 5210,
      createdAt: '2026-07-15'
    },
    {
      id: 'lec_5',
      title: 'Class 11 Physics: Newton\'s Laws of Motion & Free Body Diagrams (FBD)',
      description: 'Master FBD drawing on inclined planes, pulley systems, and friction equations for CBSE and Foundation exams.',
      subject: 'Physics',
      grade: 'Class 11',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '58 min',
      teacherName: 'Prof. S. K. Sharma',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      chapter: 'Chapter 5: Laws of Motion',
      isFree: true,
      viewsCount: 3940,
      createdAt: '2026-07-10'
    },
    {
      id: 'lec_6',
      title: 'NEET Special Biology: Human Physiology & Blood Circulation',
      description: 'Detailed NCERT line-by-line breakdown of Cardiac Cycle, ECG interpretation, and Blood Vessel anatomy with NEET diagrams.',
      subject: 'Biology',
      grade: 'JEE/NEET',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '1 hr 20 min',
      teacherName: 'Dr. Neha Patel',
      thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
      chapter: 'Body Fluids & Circulation',
      isFree: false,
      viewsCount: 7420,
      createdAt: '2026-07-21'
    }
  ];

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(defaultLectures[0]);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  // Doubt Modal State
  const [doubtModalOpen, setDoubtModalOpen] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtSubmitted, setDoubtSubmitted] = useState(false);

  // Request Topic Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestTopic, setRequestTopic] = useState('');
  const [requestSubject, setRequestSubject] = useState('Physics');
  const [requestGrade, setRequestGrade] = useState('Class 10');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Filter Logic
  const filteredLectures = defaultLectures.filter(lec => {
    const matchesSearch = lec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lec.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lec.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || lec.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesGrade = selectedGrade === 'all' || lec.grade.toLowerCase() === selectedGrade.toLowerCase();

    return matchesSearch && matchesSubject && matchesGrade;
  });

  const handlePlayLecture = (lec: Lecture) => {
    setActiveLecture(lec);
    setIsPlayerOpen(true);
  };

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;
    setDoubtSubmitted(true);
    setTimeout(() => {
      setDoubtSubmitted(false);
      setDoubtQuestion('');
      setDoubtModalOpen(false);
    }, 2200);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTopic.trim()) return;
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setRequestTopic('');
      setRequestModalOpen(false);
    }, 2200);
  };

  return (
    <div id="lectures-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header Hero */}
      <div className="bg-gradient-to-r from-orange-500/15 via-red-500/10 to-amber-500/15 dark:from-orange-950/50 dark:via-red-950/40 dark:to-amber-950/40 border border-orange-300/80 dark:border-orange-500/30 p-8 rounded-3xl backdrop-blur-xl shadow-xl shadow-orange-500/10 relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 text-xs font-mono font-extrabold uppercase tracking-wider">
              <Video size={14} className="animate-pulse text-red-500" />
              <span>Rakhi Coaching Masterclasses</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Video Lectures & Recorded Batch Classes
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Watch step-by-step concept explanations, numerical solving strategies, NCERT derivations, and exam revision lectures recorded by expert faculty Arpit Nema & team.
            </p>
          </div>

          {/* Quick Request Topic CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setRequestModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Request a Lecture Topic</span>
            </button>
            
            <button
              onClick={() => setActiveTab('notes')}
              className="px-5 py-3 bg-white/80 dark:bg-[#18110d]/80 border border-orange-200 dark:border-orange-900/50 hover:border-orange-400 text-slate-800 dark:text-stone-200 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
            >
              <FileText size={16} className="text-orange-500" />
              <span>View Class Notes</span>
            </button>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-orange-200/60 dark:border-orange-900/40 text-xs">
          <div className="bg-white/60 dark:bg-[#18110d]/80 p-3 rounded-2xl border border-orange-200/50 dark:border-orange-900/30 space-y-0.5">
            <span className="text-[10px] text-stone-500 block font-bold uppercase">AVAILABLE LECTURES</span>
            <span className="text-base font-extrabold text-orange-600 dark:text-orange-400 font-mono">150+ Hours HD</span>
          </div>
          <div className="bg-white/60 dark:bg-[#18110d]/80 p-3 rounded-2xl border border-orange-200/50 dark:border-orange-900/30 space-y-0.5">
            <span className="text-[10px] text-stone-500 block font-bold uppercase">FREE DEMO CLASSES</span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">100% Free Access</span>
          </div>
          <div className="bg-white/60 dark:bg-[#18110d]/80 p-3 rounded-2xl border border-orange-200/50 dark:border-orange-900/30 space-y-0.5">
            <span className="text-[10px] text-stone-500 block font-bold uppercase">FACULTY FACILITATOR</span>
            <span className="text-base font-extrabold text-red-600 dark:text-red-400 font-mono">Arpit Nema & Team</span>
          </div>
          <div className="bg-white/60 dark:bg-[#18110d]/80 p-3 rounded-2xl border border-orange-200/50 dark:border-orange-900/30 space-y-0.5">
            <span className="text-[10px] text-stone-500 block font-bold uppercase">DOUBT RESOLUTION</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">Instant Q&A Ask</span>
          </div>
        </div>
      </div>

      {/* Featured Video Player Bar (If Active Lecture Selected) */}
      {activeLecture && (
        <div className="bg-white/90 dark:bg-[#18110d]/90 backdrop-blur-xl border border-orange-300 dark:border-orange-500/40 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Video Player Display Container */}
            <div className="w-full lg:w-2/3 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group border border-orange-900/40">
              <iframe
                src={`${activeLecture.videoUrl}?autoplay=0`}
                title={activeLecture.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Info & Controls Side Panel */}
            <div className="w-full lg:w-1/3 space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-mono font-extrabold rounded-lg uppercase border border-orange-500/20">
                    {activeLecture.subject}
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-mono font-bold rounded-md">
                    {activeLecture.grade}
                  </span>
                  {activeLecture.isFree && (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-black rounded-md border border-emerald-500/20">
                      Free Watch
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {activeLecture.title}
                </h2>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {activeLecture.description}
                </p>

                <div className="pt-2 space-y-2 text-xs border-t border-orange-100 dark:border-orange-950/60">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                    <span className="flex items-center space-x-1">
                      <User size={13} className="text-orange-500" />
                      <span>Instructor: <strong>{activeLecture.teacherName}</strong></span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={13} />
                      <span>{activeLecture.duration}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                    <span className="flex items-center space-x-1">
                      <BookOpen size={13} className="text-amber-500" />
                      <span>{activeLecture.chapter}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye size={13} />
                      <span>{activeLecture.viewsCount.toLocaleString()} views</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setDoubtModalOpen(true)}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-orange-500/20 cursor-pointer transition-all"
                >
                  <MessageSquare size={14} />
                  <span>Ask Doubt on this Lecture</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className="py-2.5 px-4 bg-white/80 dark:bg-stone-800 border border-orange-200 dark:border-orange-900/50 hover:border-orange-400 text-slate-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <FileText size={14} className="text-orange-500" />
                  <span>Get Class Notes</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search lectures by topic, chapter, subject, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#18110d] border border-orange-200 dark:border-orange-900/50 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
          </div>

          {/* Subject Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {['all', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize cursor-pointer transition-all shrink-0 ${
                  selectedSubject === subj
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-[#18110d] border border-orange-200 dark:border-orange-900/40 text-stone-600 dark:text-stone-300 hover:border-orange-400'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

        </div>

        {/* Grade Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mr-1 shrink-0">Filter Grade:</span>
          {['all', 'Class 10', 'Class 11', 'Class 12', 'JEE/NEET'].map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all shrink-0 ${
                selectedGrade === grade
                  ? 'bg-orange-600 text-white font-black'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-orange-100'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLectures.map(lecture => (
          <div
            key={lecture.id}
            className={`bg-white/80 dark:bg-[#18110d]/70 backdrop-blur-xl border p-5 rounded-3xl shadow-lg transition-all flex flex-col justify-between space-y-4 group ${
              activeLecture?.id === lecture.id
                ? 'border-orange-500 shadow-orange-500/15'
                : 'border-orange-200/80 dark:border-orange-900/40 hover:border-orange-400 dark:hover:border-orange-500/40'
            }`}
          >
            <div className="space-y-3">
              {/* Thumbnail Container */}
              <div 
                onClick={() => handlePlayLecture(lecture)}
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group-hover:scale-[1.01] transition-transform"
              >
                <img 
                  src={lecture.thumbnail} 
                  alt={lecture.title} 
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform">
                    <Play size={20} className="ml-1 fill-white" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono font-bold rounded-md flex items-center space-x-1 backdrop-blur-sm">
                  <Clock size={10} />
                  <span>{lecture.duration}</span>
                </div>

                {/* Free Badge */}
                {lecture.isFree && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-mono font-black rounded-md shadow-md">
                    FREE
                  </div>
                )}
              </div>

              {/* Title & Subject */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                  <span className="text-orange-600 dark:text-orange-400 font-extrabold uppercase">{lecture.subject}</span>
                  <span>{lecture.grade}</span>
                </div>

                <h3 
                  onClick={() => handlePlayLecture(lecture)}
                  className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2"
                >
                  {lecture.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {lecture.description}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-orange-100 dark:border-orange-950/60 flex items-center justify-between text-xs">
              <span className="text-stone-500 text-[11px] flex items-center space-x-1">
                <User size={12} className="text-orange-500" />
                <span>{lecture.teacherName}</span>
              </span>

              <button
                onClick={() => handlePlayLecture(lecture)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-sm cursor-pointer transition-all"
              >
                <Play size={12} className="fill-white" />
                <span>Watch Class</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Doubt Modal */}
      <AnimatePresence>
        {doubtModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#18110d] border border-orange-300 dark:border-orange-800/50 p-6 rounded-3xl max-w-lg w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setDoubtModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-mono font-bold rounded-md">
                  <MessageSquare size={12} />
                  <span>Doubt Assistant</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Ask Your Question on this Lecture
                </h3>
                <p className="text-xs text-stone-500">
                  Our expert faculty team will review and reply with step-by-step guidance.
                </p>
              </div>

              {doubtSubmitted ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    Question Submitted Successfully!
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Faculty Arpit Nema will respond shortly to your email / dashboard notification.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDoubtSubmit} className="space-y-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                      Your Doubt / Query Details:
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type the exact equation, time timestamp or concept where you feel stuck..."
                      value={doubtQuestion}
                      onChange={(e) => setDoubtQuestion(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900/80 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Submit Doubt Question</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Lecture Modal */}
      <AnimatePresence>
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#18110d] border border-orange-300 dark:border-orange-800/50 p-6 rounded-3xl max-w-lg w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setRequestModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-mono font-bold rounded-md">
                  <Sparkles size={12} />
                  <span>Topic Request</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Request a New Lecture Video
                </h3>
                <p className="text-xs text-stone-500">
                  Tell us which topic or chapter you want Arpit Nema sir to record next!
                </p>
              </div>

              {requestSubmitted ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                  <h4 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    Topic Request Received!
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Thank you! We will record and upload this lecture topic soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">Subject</label>
                      <select
                        value={requestSubject}
                        onChange={(e) => setRequestSubject(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-900/50 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Biology">Biology</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">Class / Grade</label>
                      <select
                        value={requestGrade}
                        onChange={(e) => setRequestGrade(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-900/50 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                        <option value="JEE/NEET">JEE/NEET</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                      Topic Name / Chapter Details:
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Wave Optics Double Slit Experiment or Thermodynamics Carnot Engine..."
                      value={requestTopic}
                      onChange={(e) => setRequestTopic(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900/80 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send Request to Arpit Nema Sir</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
