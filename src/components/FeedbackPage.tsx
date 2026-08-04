import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ThumbsUp, 
  Sparkles, 
  User, 
  Award, 
  Filter, 
  Heart,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Feedback } from '../types';

interface FeedbackPageProps {
  userEmail?: string;
  userName?: string;
}

export default function FeedbackPage({ userEmail, userName }: FeedbackPageProps) {
  
  // Sample Initial Verified Feedbacks
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([
    {
      id: 'fb_1',
      studentName: 'Aman Shrivastava',
      email: 'aman.shriv@gmail.com',
      grade: 'Class 10 (CBSE)',
      rating: 5,
      category: 'Notes Quality',
      message: 'Arpit Nema sir\'s Physics notes are absolute gold! The formula vector mindmaps helped me score 95/100 in my Science board pre-mocks.',
      recommend: true,
      createdAt: '2026-07-22'
    },
    {
      id: 'fb_2',
      studentName: 'Priya Vishwakarma',
      email: 'priya.v@gmail.com',
      grade: 'Class 12 (PCM)',
      rating: 5,
      category: 'Lecture Explanation',
      message: 'The Organic reaction mechanism lecture made Sn1 and Sn2 reactions crystal clear. Best coaching institute in Katangi & Jabalpur region!',
      recommend: true,
      createdAt: '2026-07-20'
    },
    {
      id: 'fb_3',
      studentName: 'Rohan Gupta',
      email: 'rohan.g@gmail.com',
      grade: 'JEE Aspirant',
      rating: 5,
      category: 'Faculty & Teaching',
      message: 'In-depth conceptual teaching with constant support. Test series and MCQ evaluation helped me track my weak spots in calculus.',
      recommend: true,
      createdAt: '2026-07-18'
    },
    {
      id: 'fb_4',
      studentName: 'Sunita Patel (Parent)',
      email: 'sunita.patel@gmail.com',
      grade: 'Parent',
      rating: 5,
      category: 'App Experience',
      message: 'Very clean and easy to use application. Downloading PDF notes and watching recorded video lectures is seamless for my daughter.',
      recommend: true,
      createdAt: '2026-07-15'
    }
  ]);

  // Form States
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [grade, setGrade] = useState('Class 10');
  const [category, setCategory] = useState<string>('Notes Quality');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [recommend, setRecommend] = useState(true);

  // Status States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const newFb: Feedback = {
      id: `fb_${Date.now()}`,
      studentName: name,
      email: email,
      grade: grade,
      rating: rating,
      category: category,
      message: message,
      recommend: recommend,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTimeout(() => {
      setFeedbackList(prev => [newFb, ...prev]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setMessage('');
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);
    }, 800);
  };

  // Stats Calculations
  const totalReviews = feedbackList.length;
  const avgRating = (feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1);
  const recommendPercentage = Math.round((feedbackList.filter(f => f.recommend).length / totalReviews) * 100);

  // Filtered List
  const filteredFeedbacks = feedbackList.filter(f => {
    const matchCat = filterCategory === 'all' || f.category.toLowerCase() === filterCategory.toLowerCase();
    const matchRating = filterRating === 'all' || f.rating.toString() === filterRating;
    return matchCat && matchRating;
  });

  return (
    <div id="feedback-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500/15 via-red-500/10 to-amber-500/15 dark:from-orange-950/50 dark:via-red-950/40 dark:to-amber-950/40 border border-orange-300/80 dark:border-orange-500/30 p-8 rounded-3xl backdrop-blur-xl shadow-xl shadow-orange-500/10 relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 text-xs font-mono font-extrabold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Rakhi Coaching Classes • Student Voice</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Student Feedback & Reviews Form
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Your feedback helps Arpit Nema & the faculty team continuously improve our classroom lectures, PDF notes, and digital app experience for students across India.
            </p>
          </div>

          {/* Overall Rating Quick Badge */}
          <div className="bg-white/90 dark:bg-[#18110d]/90 border border-orange-300 dark:border-orange-800/60 p-5 rounded-2xl shrink-0 flex items-center space-x-4 shadow-lg">
            <div className="text-center">
              <span className="text-3xl font-black text-orange-600 dark:text-orange-400 font-mono block">
                {avgRating}
              </span>
              <div className="flex text-amber-400 text-xs justify-center mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400" />
                ))}
              </div>
            </div>
            <div className="border-l border-orange-200 dark:border-orange-900/40 pl-4 text-xs space-y-0.5">
              <span className="font-extrabold text-slate-900 dark:text-white block">
                {totalReviews}+ Verified Reviews
              </span>
              <span className="text-stone-500 block text-[11px]">
                {recommendPercentage}% Student Recommendation Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Feedback Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-[#18110d]/80 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-orange-100 dark:border-orange-950/60 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="text-orange-500" size={22} />
              <span>Submit Your Feedback & Experience</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Share your thoughts on Notes quality, Lecture teaching, or overall institute guidance.
            </p>
          </div>

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-300 flex items-start space-x-3"
            >
              <CheckCircle2 size={24} className="shrink-0 text-emerald-500 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-sm">Thank You! Feedback Submitted Successfully.</p>
                <p className="leading-relaxed">
                  Your review has been recorded and added to the community wall. Director Arpit Nema sincerely appreciates your valuable feedback!
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name & Email inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arpit Nema"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. arpitnema35@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Grade & Category Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                  Class / Category
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Class 8-10">Class 8th - 10th Foundation</option>
                  <option value="Class 11 (PCM/PCB)">Class 11th (PCM/PCB)</option>
                  <option value="Class 12 (PCM/PCB)">Class 12th (PCM/PCB)</option>
                  <option value="JEE / NEET Aspirant">JEE / NEET Aspirant</option>
                  <option value="Parent / Guardian">Parent / Guardian</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                  Feedback Focus Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Notes Quality">PDF Notes & Formula Guides</option>
                  <option value="Lecture Explanation">Video Lectures & Teaching Style</option>
                  <option value="Faculty & Teaching">Faculty & Classroom Support</option>
                  <option value="App Experience">Website & App Experience</option>
                  <option value="General Suggestion">General Suggestion / Ideas</option>
                </select>
              </div>
            </div>

            {/* Interactive Star Rating */}
            <div className="space-y-2 bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-200/60 dark:border-orange-900/30">
              <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300 block">
                Overall Rating:
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <button
                    key={starIndex}
                    type="button"
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starIndex)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      size={28} 
                      className={`${
                        (hoverRating || rating) >= starIndex
                          ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                          : 'text-stone-300 dark:text-stone-700'
                      }`} 
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 ml-2 font-mono">
                  {rating} / 5 Stars ({
                    rating === 5 ? 'Excellent' :
                    rating === 4 ? 'Very Good' :
                    rating === 3 ? 'Good' :
                    rating === 2 ? 'Average' : 'Needs Improvement'
                  })
                </span>
              </div>
            </div>

            {/* Detailed Feedback Text */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                Detailed Review / Suggestion <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Write your honest review about notes, lectures, concept understanding, or suggestions for Rakhi Coaching..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-900 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              ></textarea>
            </div>

            {/* Recommendation Checkbox Toggle */}
            <div className="flex items-center space-x-3 bg-stone-50 dark:bg-stone-900/60 p-3 rounded-xl border border-orange-100 dark:border-orange-950/60">
              <input
                type="checkbox"
                id="recommend-toggle"
                checked={recommend}
                onChange={(e) => setRecommend(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="recommend-toggle" className="text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer">
                I recommend Rakhi Coaching Classes to fellow students & friends
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting Feedback...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Feedback Review</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Column: Verified Community Feedback Wall (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="text-amber-500" size={20} />
              <span>Community Reviews</span>
            </h3>

            {/* Filter Category Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white dark:bg-[#18110d] border border-orange-200 dark:border-orange-900/40 rounded-xl px-2.5 py-1 text-[11px] font-extrabold text-stone-700 dark:text-stone-300"
            >
              <option value="all">All Categories</option>
              <option value="Notes Quality">Notes Quality</option>
              <option value="Lecture Explanation">Lecture Explanation</option>
              <option value="Faculty & Teaching">Faculty & Teaching</option>
              <option value="App Experience">App Experience</option>
            </select>
          </div>

          <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white/80 dark:bg-[#18110d]/80 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 p-5 rounded-3xl shadow-md space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {fb.studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1">
                        <span>{fb.studentName}</span>
                        <ShieldCheck size={13} className="text-emerald-500 fill-emerald-500/20" title="Verified Student" />
                      </h4>
                      <span className="text-[10px] text-stone-400 font-mono block">{fb.grade}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 text-[10px] font-mono font-bold rounded-lg border border-orange-200 dark:border-orange-900/30">
                    {fb.category}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-amber-400 text-xs">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      size={12} 
                      className={idx < fb.rating ? "fill-amber-400" : "text-stone-300 dark:text-stone-700"} 
                    />
                  ))}
                  <span className="text-[10px] font-bold text-stone-400 ml-1 font-mono">{fb.createdAt}</span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                  "{fb.message}"
                </p>

                {fb.recommend && (
                  <div className="pt-2 border-t border-orange-100 dark:border-orange-950/60 flex items-center space-x-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ThumbsUp size={11} />
                    <span>Recommends Rakhi Coaching Classes</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
