import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Compass, 
  BookOpen, 
  FileText, 
  Award, 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  GraduationCap, 
  PhoneCall,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';

interface NotFoundProps {
  setActiveTab: (tab: string) => void;
}

export default function NotFound({ setActiveTab }: NotFoundProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const popularRoutes = [
    { title: 'Class 11th Study Notes', tab: 'class11', icon: FileText, desc: 'Physics, Chemistry, Maths & Biology handwritten summaries' },
    { title: 'Class 12th Study Notes', tab: 'class12', icon: BookOpen, desc: 'Boards revision guides, organic reactions & calculus sheets' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('12')) {
      setActiveTab('class12');
    } else {
      setActiveTab('class11');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background 3D Ambient Glow Spheres */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/20 via-red-500/15 to-amber-400/20 dark:from-orange-600/30 dark:via-red-600/20 dark:to-amber-500/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>

      <div className="max-w-4xl w-full mx-auto space-y-10 text-center relative z-10">
        
        {/* 3D Animated Floating Visual Graphic */}
        <div className="relative flex justify-center items-center py-6">
          
          {/* Orbiting Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-dashed border-orange-400/40 dark:border-orange-500/30 pointer-events-none"
          ></motion.div>

          {/* Floating Orbit Node 1 */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 left-10 sm:left-24 bg-white/90 dark:bg-[#18110d]/90 backdrop-blur-md p-3 rounded-2xl border border-orange-200 dark:border-orange-800/50 shadow-xl hidden sm:flex items-center space-x-2 text-xs font-bold text-orange-600 dark:text-orange-400"
          >
            <GraduationCap size={18} />
            <span>Rakhi Coaching</span>
          </motion.div>

          {/* Floating Orbit Node 2 */}
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-2 right-10 sm:right-24 bg-white/90 dark:bg-[#18110d]/90 backdrop-blur-md p-3 rounded-2xl border border-red-200 dark:border-red-800/50 shadow-xl hidden sm:flex items-center space-x-2 text-xs font-bold text-red-600 dark:text-red-400"
          >
            <BookOpen size={18} />
            <span>Classroom Batches</span>
          </motion.div>

          {/* Center 3D Floating 404 Hero Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: [0, -12, 0] }}
            transition={{ 
              scale: { duration: 0.5 },
              opacity: { duration: 0.5 },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } 
            }}
            className="bg-gradient-to-b from-white/90 via-orange-50/80 to-amber-100/60 dark:from-[#1d1510]/90 dark:via-[#170e0a]/80 dark:to-[#22130b]/90 backdrop-blur-2xl border border-orange-300/80 dark:border-orange-500/30 p-8 sm:p-12 rounded-3xl shadow-2xl shadow-orange-500/20 max-w-lg w-full relative overflow-hidden group"
          >
            {/* Shimmer Light Reflection */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="space-y-4">
              {/* Floating Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full text-orange-600 dark:text-orange-400 text-xs font-mono font-extrabold tracking-wider uppercase">
                <Sparkles size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
                <span>Page Not Found • Error 404</span>
              </div>

              {/* Huge 3D Styled Text Number */}
              <h1 className="text-7xl sm:text-9xl font-black tracking-tight bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm font-mono">
                404
              </h1>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Rasta Bhatak Gaye? (Lost Your Way?)
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
                  The page or resource you are trying to access does not exist or has been moved to a new section.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Type what you were looking for (e.g. Notes, Test Series, Courses)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#18110d] border border-orange-200 dark:border-orange-900/50 rounded-2xl pl-11 pr-24 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg shadow-orange-500/5"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-500/20"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center justify-center space-x-2">
            <Compass size={14} className="text-orange-500" />
            <span>Recommended Quick Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {popularRoutes.map((route, i) => {
              const IconComp = route.icon;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(route.tab)}
                  className="p-4 bg-white/70 dark:bg-[#18110d]/70 backdrop-blur-md border border-orange-200/70 dark:border-orange-900/30 hover:border-orange-400 dark:hover:border-orange-500/50 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-start space-x-3 group shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-900/30 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <IconComp size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {route.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {route.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('class11')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          >
            <Home size={16} />
            <span>Class 11th Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('class12')}
            className="px-6 py-3 bg-white dark:bg-[#18110d] border border-orange-200 dark:border-orange-900/50 hover:border-orange-400 text-slate-800 dark:text-stone-200 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen size={16} className="text-orange-500" />
            <span>Class 12th Notes</span>
          </button>
        </div>

      </div>
    </div>
  );
}
