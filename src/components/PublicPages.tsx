import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Award, 
  Users, 
  HelpCircle, 
  ArrowRight, 
  Plus, 
  Send, 
  Heart, 
  MessageSquare, 
  ChevronDown, 
  FileText,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { Course, Teacher, Blog, ContactMessage, AdmissionApplication, FAQItem } from '../types';
import { safeGetDocs, safeAddDoc } from '../firebase';

interface PublicPagesProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  coursesList: Course[];
  setCoursesList: (courses: Course[]) => void;
  teachersList: Teacher[];
  blogsList: Blog[];
  setBlogsList: React.Dispatch<React.SetStateAction<Blog[]>>;
  onSubmitAdmission: (app: Omit<AdmissionApplication, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  onSubmitContact: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  userEmail?: string;
}

export default function PublicPages({
  activeTab,
  setActiveTab,
  coursesList,
  setCoursesList,
  teachersList,
  blogsList,
  setBlogsList,
  onSubmitAdmission,
  onSubmitContact,
  userEmail
}: PublicPagesProps) {
  
  // States
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [selectedCourseForAdmission, setSelectedCourseForAdmission] = useState<Course | null>(null);
  
  // Admission Form Fields
  const [admStudentName, setAdmStudentName] = useState('');
  const [admParentName, setAdmParentName] = useState('');
  const [admEmail, setAdmEmail] = useState(userEmail || '');
  const [admPhone, setAdmPhone] = useState('');
  const [admAddress, setAdmAddress] = useState('');
  const [admGrade, setAdmGrade] = useState('Class 10');
  const [admPrevMarks, setAdmPrevMarks] = useState('');
  const [admSuccess, setAdmSuccess] = useState(false);
  const [admLoading, setAdmLoading] = useState(false);

  // Contact Form Fields
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState(userEmail || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Blog Comment State
  const [activeBlogCommentId, setActiveBlogCommentId] = useState<string | null>(null);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // FAQ Accordion
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "What grades and streams does Rakhi Coaching Classes support?",
      answer: "We support Class 8 to Class 12 for CBSE and State Boards, along with intensive foundational and target batches for competitive exams like JEE (Mains & Advanced) and NEET."
    },
    {
      question: "How do I purchase online study notes?",
      answer: "Simply visit our Notes Store page, select your desired grade or subject, add to cart, and proceed to checkout. You can complete payment using our simulated Razorpay secure gateway and download files instantly."
    },
    {
      question: "Are the Online Test Series papers based on the latest board patterns?",
      answer: "Yes, our academic panel drafts online mock tests exactly in line with current boards (CBSE/NCERT) and competitive patterns, featuring a precise live timer and auto-submit features."
    },
    {
      question: "Can I apply for admissions offline directly?",
      answer: "Absolutely! You can submit the online Admission Form on our Courses page. Our administrators will contact you within 24 hours to schedule an interaction, confirm a batch timing, and process your physical entry."
    },
    {
      question: "Who do I contact in case of technical issues with notes downloads?",
      answer: "You can write to us via our 'Contact Us' page, send an email to contact@rakhicoaching.com, or use the floating green WhatsApp chat widget in the lower right for immediate assistance."
    }
  ];

  const classTimetable = [
    { batch: 'Class 10 Board Accelerator', subject: 'Mathematics', days: 'Mon, Wed, Fri', time: '04:00 PM - 05:30 PM', teacher: 'Prof. Rakhi Nema' },
    { batch: 'Class 10 Board Accelerator', subject: 'Science (Physics/Chem)', days: 'Tue, Thu, Sat', time: '04:00 PM - 05:30 PM', teacher: 'Dr. Vivek Soni' },
    { batch: 'JEE Target Masterclass', subject: 'Advanced Physics', days: 'Mon to Sat', time: '06:00 PM - 08:00 PM', teacher: 'Er. Rajesh Khera' },
    { batch: 'NEET Target Bootcamp', subject: 'Organic Chemistry', days: 'Mon, Wed, Fri', time: '02:00 PM - 04:00 PM', teacher: 'Dr. Vivek Soni' },
    { batch: 'NEET Target Bootcamp', subject: 'Anatomy & Genetics', days: 'Tue, Thu, Sat', time: '02:00 PM - 04:00 PM', teacher: 'Dr. Shraddha Rao' },
    { batch: 'Class 12 Boards Champion', subject: 'Mathematics', days: 'Tue, Thu, Sat', time: '06:00 PM - 07:30 PM', teacher: 'Prof. Rakhi Nema' },
  ];

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admStudentName || !admEmail || !admPhone || !selectedCourseForAdmission) return;
    
    setAdmLoading(true);
    try {
      await onSubmitAdmission({
        studentName: admStudentName,
        parentName: admParentName,
        email: admEmail,
        phone: admPhone,
        address: admAddress,
        grade: admGrade,
        courseId: selectedCourseForAdmission.id,
        previousMarks: admPrevMarks
      });
      setAdmSuccess(true);
      setAdmStudentName('');
      setAdmParentName('');
      setAdmPhone('');
      setAdmAddress('');
      setAdmPrevMarks('');
    } catch (err) {
      console.error(err);
    } finally {
      setAdmLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactSubject || !contactMsg) return;

    setContactLoading(true);
    try {
      await onSubmitContact({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        subject: contactSubject,
        message: contactMsg
      });
      setContactSuccess(true);
      setContactName('');
      setContactPhone('');
      setContactSubject('');
      setContactMsg('');
    } catch (err) {
      console.error(err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleAddBlogComment = (blogId: string) => {
    if (!newCommentName || !newCommentText) return;
    const newComment = {
      userName: newCommentName,
      comment: newCommentText,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setBlogsList(prev => prev.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          comments: [...(blog.comments || []), newComment]
        };
      }
      return blog;
    }));

    setNewCommentName('');
    setNewCommentText('');
    setActiveBlogCommentId(null);
  };

  const handleLikeBlog = (blogId: string) => {
    setBlogsList(prev => prev.map(blog => {
      if (blog.id === blogId) {
        return { ...blog, likes: blog.likes + 1 };
      }
      return blog;
    }));
  };

  const filteredCourses = selectedGradeFilter === 'all'
    ? coursesList
    : coursesList.filter(c => c.grade.toLowerCase().includes(selectedGradeFilter.toLowerCase()));

  return (
    <div id="public-views-container" className="py-2">
      
      {/* ------------------ HOME PAGE VIEW ------------------ */}
      {activeTab === 'home' && (
        <div id="home-view" className="space-y-6">
          {/* Hero Slider */}
          <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-8 sm:p-16 text-center mt-6 relative group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto space-y-6 relative z-10"
            >
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-500/30 tracking-wider uppercase mb-2 inline-block">
                New Batch: Admissions Open
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white max-w-3xl mx-auto">
                Master Your Exams with Expert Guidance.
              </h1>
              <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Personalized learning paths for NEET, JEE, and Board exams. Join 5000+ successful students today. Learn Smart, Score Better.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('courses')}
                  className="bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center space-x-2"
                >
                  <span>Apply Online</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setActiveTab('notes-store')}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  View Notes Store
                </button>
              </div>
            </motion.div>
          </section>

          {/* Statistics Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { count: '5,000+', label: 'Successful Students', desc: 'Over past 8 years' },
                { count: '98%', label: 'Top Score Average', desc: 'CBSE & Boards standard' },
                { count: '15+', label: 'Educators & PhDs', desc: 'Expert subject masters' },
                { count: '120+', label: 'PDF Study Notes', desc: 'Syllabus structured' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl text-center shadow-md relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-sans tracking-tight">{stat.count}</p>
                  <p className="text-xs font-bold text-slate-200 mt-2">{stat.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{stat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Three core pillars */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Comprehensive Learning Ecosystem
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Everything you need to boost your scores under a single roof, powered by digital convenience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admissions Pillar */}
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Classroom Coaching</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      Interactive physical and digital classroom setups for grades 8-12, JEE and NEET targets. Consistent progress tracking and regular test validations.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('courses')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer mt-auto">
                    <span>Apply for coaching</span> <ArrowRight size={12} />
                  </button>
                </div>

                {/* Notes Pillar */}
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Digital Study Notes</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      Expertly prepared chapter PDFs containing shortcut formula vectors, solved previous-year boards, and summary sheets for swift revision.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('notes-store')} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer mt-auto">
                    <span>Browse PDF Notes Store</span> <ArrowRight size={12} />
                  </button>
                </div>

                {/* Test Series Pillar */}
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                      <Award size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Online Test Series</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      Real-time mock MCQ test simulations equipped with precise timing, prompt score analyses, correct-answer feedback, and verifiable digital score certificates.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('test-series')} className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center space-x-1 cursor-pointer mt-auto">
                    <span>Practice mock tests</span> <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/40 rounded-3xl p-8 sm:p-12 border border-slate-800">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1 space-y-3">
                  <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">TESTIMONIALS</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Hear from Our Board Toppers</h3>
                  <p className="text-sm text-slate-450 text-slate-400">
                    Rakhi Coaching Classes has consistent track records of generating district ranks and medical/engineering entries.
                  </p>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60">
                    <p className="text-xs text-slate-400 italic">
                      "I bought the Class 12 Physics & Chemistry notes package. The shortcuts were unbelievably helpful during my board preparations! The formula list became my instant reference. Scored 96.5% overall!"
                    </p>
                    <div className="flex items-center space-x-3 mt-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                        AM
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">Aman Mishra</h4>
                        <p className="text-[10px] text-slate-500">Class 12 Boards Topper (96.5%)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60">
                    <p className="text-xs text-slate-400 italic">
                      "The MCQ mock series for JEE Math helped me manage my timing significantly. The detailed analytics broke down where I was wasting cycles. Highly recommend Rakhi Coaching Classes!"
                    </p>
                    <div className="flex items-center space-x-3 mt-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                        SP
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">Sneha Patel</h4>
                        <p className="text-[10px] text-slate-500">JEE Mains (99.2 Percentile)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}


      {/* ------------------ ABOUT US VIEW ------------------ */}
      {activeTab === 'about' && (
        <div id="about-view" className="max-w-5xl mx-auto px-4 py-8 space-y-12">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">About Our Institution</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Learn the history, vision, and principles that have guided Rakhi Coaching Classes to become a respected name in educational success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We believe that education is not merely about rote memorization; it is about building deep, conceptual visualization of subjects. At Rakhi Coaching Classes, our goal is to eliminate textbook anxiety and install high-yield shortcuts and analytical skills that allow our students to "Learn Smart, Score Better."
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white pt-2">Why Choose Rakhi?</h2>
              <ul className="space-y-2.5">
                {[
                  "Personalized attention with highly bounded batch sizes.",
                  "Structured study note PDFs covering the absolute core formulas.",
                  "Rigorous standard board revision and competitive mock systems.",
                  "24/7 technical support and real-time parent interaction tracking."
                ].map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle size={14} className="text-teal-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-tr from-teal-500/10 to-indigo-600/10 dark:from-slate-850 dark:to-slate-800 p-8 rounded-3xl border border-teal-100/30 dark:border-teal-900/40 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">R</div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Rakhi Nema</h4>
                  <p className="text-[10px] text-slate-400">Founder & Managing Director</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. At Rakhi Coaching, we make sure that passport is stamped with excellence, clarity, and success."
              </p>
              <div className="border-t border-slate-200 dark:border-slate-700/60 pt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-teal-600 dark:text-teal-400 font-mono">8+</p>
                  <p className="text-[9px] text-slate-400">Years of History</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">100%</p>
                  <p className="text-[9px] text-slate-400">Syllabus Covered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-pink-600 dark:text-pink-400 font-mono">20+</p>
                  <p className="text-[9px] text-slate-400">District Ranks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ------------------ COURSES VIEW (with Admission Modal) ------------------ */}
      {activeTab === 'courses' && (
        <div id="courses-view" className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">Our Elite Batches</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              Admissions are actively open. Select a batch below to apply online or view syllabus requirements.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Courses' },
              { id: '10', label: 'Class 10' },
              { id: '12', label: 'Class 12' },
              { id: 'jee', label: 'JEE Prep' },
              { id: 'neet', label: 'NEET Prep' },
            ].map((filt) => (
              <button
                key={filt.id}
                onClick={() => setSelectedGradeFilter(filt.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  selectedGradeFilter === filt.id
                    ? 'bg-teal-500 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {filt.label}
              </button>
            ))}
          </div>

          {/* Course list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all"
              >
                <div className="h-44 bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 flex flex-col justify-between text-white relative">
                  <div className="absolute inset-0 bg-teal-500/10 pointer-events-none"></div>
                  <span className="px-2.5 py-0.5 bg-teal-500 text-white font-mono text-[9px] font-bold rounded uppercase tracking-wider self-start">
                    {course.grade}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg tracking-tight leading-tight">{course.title}</h3>
                    <p className="text-[10px] text-teal-300 font-mono flex items-center">
                      <Clock size={10} className="mr-1" /> {course.batchTiming}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{course.description}</p>
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-1">CORE MODULES COVERED</span>
                      <div className="flex flex-wrap gap-1">
                        {course.syllabus.slice(0, 3).map((mod, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-medium border border-slate-100 dark:border-slate-850">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">TOTAL COURSE FEES</span>
                      <span className="text-lg font-black text-slate-950 dark:text-white font-mono">₹{course.fees.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => setSelectedCourseForAdmission(course)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-500/10 cursor-pointer transition-all"
                    >
                      Apply Admission
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admission Application Dialog Modal */}
          {selectedCourseForAdmission && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative"
              >
                <button
                  onClick={() => { setSelectedCourseForAdmission(null); setAdmSuccess(false); }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                {!admSuccess ? (
                  <form onSubmit={handleAdmissionSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-teal-500 font-mono font-bold tracking-wider uppercase block">ADMISSIONS 2026</span>
                      <h3 className="text-xl font-bold text-slate-950 dark:text-white">Apply for {selectedCourseForAdmission.title}</h3>
                      <p className="text-xs text-slate-400">Complete the form below. Our academic counselors will get back to you immediately.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">STUDENT FULL NAME</label>
                        <input
                          type="text"
                          required
                          value={admStudentName}
                          onChange={(e) => setAdmStudentName(e.target.value)}
                          placeholder="Aman Mishra"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">PARENT'S / GUARDIAN NAME</label>
                        <input
                          type="text"
                          value={admParentName}
                          onChange={(e) => setAdmParentName(e.target.value)}
                          placeholder="Mr. Suresh Mishra"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          required
                          value={admEmail}
                          onChange={(e) => setAdmEmail(e.target.value)}
                          placeholder="student@gmail.com"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">WHATSAPP / PHONE NUMBER</label>
                        <input
                          type="tel"
                          required
                          value={admPhone}
                          onChange={(e) => setAdmPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">ACADEMIC GRADE</label>
                        <select
                          value={admGrade}
                          onChange={(e) => setAdmGrade(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                        >
                          <option>Class 9</option>
                          <option>Class 10</option>
                          <option>Class 11</option>
                          <option>Class 12</option>
                          <option>JEE Target</option>
                          <option>NEET Target</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">PREVIOUS CLASS SCORE (%)</label>
                        <input
                          type="text"
                          value={admPrevMarks}
                          onChange={(e) => setAdmPrevMarks(e.target.value)}
                          placeholder="e.g. 92% or 9.4 CGPA"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">RESIDENTIAL ADDRESS</label>
                      <textarea
                        rows={2}
                        value={admAddress}
                        onChange={(e) => setAdmAddress(e.target.value)}
                        placeholder="Flat 104, Royal Apartments, Near City Park"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={admLoading}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/10 cursor-pointer transition-colors"
                    >
                      {admLoading ? 'Registering Application...' : 'Submit Admission Application'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                      ✓
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Application Received!</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Thank you for applying to Rakhi Coaching Classes. Your application reference code has been recorded. Our counselor will contact you shortly on your registered phone and email.
                      </p>
                    </div>
                    <button
                      onClick={() => { setSelectedCourseForAdmission(null); setAdmSuccess(false); }}
                      className="px-6 py-2 bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 text-white text-xs rounded-xl font-medium cursor-pointer"
                    >
                      Return to Courses
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      )}


      {/* ------------------ FACULTY VIEW ------------------ */}
      {activeTab === 'faculty' && (
        <div id="faculty-view" className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">Meet Our Expert Faculty</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              Highly credentialed educators, authors, and board examiners dedicated to simplifying your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachersList.map((faculty) => (
              <div key={faculty.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md mx-auto">
                  {faculty.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-950 dark:text-white">{faculty.name}</h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold font-mono">{faculty.subject}</p>
                  <p className="text-[10px] text-slate-400">{faculty.qualification} ({faculty.experience} exp)</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  "{faculty.bio || 'Passionately breaking down hard theories into logical bite-sized formulas.'}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ------------------ TIMETABLE VIEW ------------------ */}
      {activeTab === 'timetable' && (
        <div id="timetable-view" className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">Batch Timetable</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              Weekly class schedule for both target coaching streams and board preps.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <th className="p-4">BATCH NAME</th>
                    <th className="p-4">SUBJECT / CLASS</th>
                    <th className="p-4">WEEKLY DAYS</th>
                    <th className="p-4">TIMING (IST)</th>
                    <th className="p-4">FACULTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classTimetable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 text-slate-700 dark:text-slate-300">
                      <td className="p-4 font-bold text-slate-950 dark:text-white">{row.batch}</td>
                      <td className="p-4"><span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded font-mono text-[10px]">{row.subject}</span></td>
                      <td className="p-4">{row.days}</td>
                      <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{row.time}</td>
                      <td className="p-4 font-medium">{row.teacher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ------------------ BLOG VIEW ------------------ */}
      {activeTab === 'blog' && (
        <div id="blog-view" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">Educational Insight Blog</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              Latest preparation hacks, exam blueprint trends, and concept summary lists direct from Rakhi Coaching instructors.
            </p>
          </div>

          <div className="space-y-8">
            {blogsList.map((blog) => (
              <div 
                key={blog.id} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-[9px] font-bold rounded uppercase">
                      {blog.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{blog.createdAt}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white leading-tight">
                    {blog.title}
                  </h2>
                  <p className="text-xs text-slate-400">Published by: <span className="font-bold text-slate-600 dark:text-slate-300">{blog.author}</span></p>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-sans font-normal">
                  {blog.content}
                </p>

                {/* Like & Comment controls */}
                <div className="border-t border-b border-slate-100 dark:border-slate-800/85 py-3 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => handleLikeBlog(blog.id)}
                      className="flex items-center space-x-1.5 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Heart size={16} className="text-red-500 fill-current" />
                      <span>{blog.likes} Likes</span>
                    </button>
                    <button 
                      onClick={() => setActiveBlogCommentId(activeBlogCommentId === blog.id ? null : blog.id)}
                      className="flex items-center space-x-1.5 hover:text-teal-500 transition-colors cursor-pointer"
                    >
                      <MessageSquare size={16} />
                      <span>{(blog.comments || []).length} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Comment Section Panel */}
                {activeBlogCommentId === blog.id && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-3 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {(blog.comments || []).map((comm, cidx) => (
                        <div key={cidx} className="pt-3 text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                            <span>{comm.userName}</span>
                            <span className="text-[9px] text-slate-400 font-mono font-normal">{comm.date}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400">{comm.comment}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">YOUR NAME</label>
                        <input
                          type="text"
                          value={newCommentName}
                          onChange={(e) => setNewCommentName(e.target.value)}
                          placeholder="Aman Mishra"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2 flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">YOUR COMMENT</label>
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Add a constructive insight..."
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handleAddBlogComment(blog.id)}
                          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}


      {/* ------------------ CONTACT US VIEW ------------------ */}
      {activeTab === 'contact' && (
        <div id="contact-view" className="max-w-6xl mx-auto px-4 py-8 space-y-12">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">Contact Us</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              We would love to welcome you to our local campus. Send us an enquiry or review our answers below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Quick message form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">Send Instant Message</h2>
                <p className="text-xs text-slate-400">We respond to all direct inquiries within 1 business day.</p>
              </div>

              {!contactSuccess ? (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">YOUR FULL NAME</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Aman Mishra"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="aman@gmail.com"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">WHATSAPP / PHONE</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 78289 08559"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">SUBJECT</label>
                      <input
                        type="text"
                        required
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Enquiry on fee structures"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">MESSAGE DETAILS</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="Hi Rakhi Nema, I would like to get more information on your target JEE batches starting next Monday..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/10 cursor-pointer transition-colors"
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-950/40 text-green-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Message Dispatched!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your query has been securely submitted to our student support system. We will contact you soon.
                    </p>
                  </div>
                  <button
                    onClick={() => setContactSuccess(false)}
                    className="px-4 py-1.5 bg-slate-900 text-white text-xs rounded-lg cursor-pointer"
                  >
                    Write another query
                  </button>
                </div>
              )}
            </div>

            {/* Address cards & quick FAQ */}
            <div className="space-y-6">
              
              {/* Quick Details card */}
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-400">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-white font-bold">
                    <MapPin size={14} className="text-indigo-400" />
                    <span>OUR OFFICE</span>
                  </div>
                  <p>102, Shanti Vihar, Sector 4, Near City Plaza, India</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-white font-bold">
                    <Phone size={14} className="text-indigo-400" />
                    <span>PHONE / HELPLINE</span>
                  </div>
                  <p className="text-slate-200 font-bold font-mono">+91 78289 08559</p>
                  <p className="text-[10px] text-slate-500">Available Mon-Sat (9 AM - 8 PM)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-950 dark:text-white font-bold">
                    <Mail size={14} className="text-indigo-500" />
                    <span>EMAIL SUPPORT</span>
                  </div>
                  <p>contact@rakhicoaching.com</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-950 dark:text-white font-bold">
                    <Calendar size={14} className="text-indigo-500" />
                    <span>VISITING HOURS</span>
                  </div>
                  <p>Monday - Saturday: 11:00 AM - 07:00 PM</p>
                </div>
              </div>

              {/* FAQ Accordion snippet */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  {faqItems.slice(0, 3).map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFAQIndex(openFAQIndex === idx ? null : idx)}
                        className="w-full text-left p-4 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <span>{item.question}</span>
                        <ChevronDown size={14} className={`text-slate-450 transition-transform ${openFAQIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFAQIndex === idx && (
                        <div className="px-4 pb-4 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-850 pt-2.5">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}


      {/* ------------------ PRIVACY POLICY & TERMS ------------------ */}
      {(activeTab === 'privacy' || activeTab === 'terms') && (
        <div className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-12 space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
            {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
          </h1>
          
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              <p>Last updated: July 19, 2026</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">1. Information Collection</p>
              <p>We collect essential personal credentials such as your name, contact phone, educational grade, and payment receipt data when you subscribe for academic coaching batches, buy lecture materials, or initiate competitive mock series assessments.</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">2. Use of Your Personal Data</p>
              <p>Your details are strictly used to fulfill PDF download deliveries, configure test result certificates, track student dashboard attendance, and dispatch transaction logs via our Razorpay integration.</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">3. Security Enforcements</p>
              <p>We maintain high safety standards in line with our secure database rules to prevent unauthorized credentials leaks or unapproved downloads.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Last updated: July 19, 2026</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">1. Terms of Usage</p>
              <p>By entering Rakhi Coaching Classes, you represent that you are accessing studying resources strictly for private, non-commercial education. Shared use of PDF documents or redistribution of question sets is strictly prohibited.</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">2. Financial Policies & Refunds</p>
              <p>Purchase of digital lecture notes remains absolute and non-refundable. Mock test payments are processed securely under sandbox testings and must not be used for fraudulent transactions.</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">3. Academic Performance</p>
              <p>While our educational materials are built to help you score better, we provide no explicit guarantee of specific board or competitive examination results.</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------ FAQS FULL TAB ------------------ */}
      {activeTab === 'faq' && (
        <div id="faq-view" className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">Help Center & FAQs</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Quick answers about admissions, our online note store, payment safety, and interactive MCQ mock series.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFAQIndex(openFAQIndex === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <span>{item.question}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFAQIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFAQIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-850 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
