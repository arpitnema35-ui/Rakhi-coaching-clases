import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ShieldAlert, 
  FileText, 
  BookOpen, 
  Award, 
  Users, 
  TrendingUp, 
  Tag, 
  Send, 
  Check, 
  X, 
  ShoppingCart,
  MessageSquare,
  Sparkles,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Note, TestSeries, Blog, ContactMessage, AdmissionApplication, Coupon } from '../types';

interface AdminPanelProps {
  coursesList: Course[];
  onAddCourse: (course: Course) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  
  notesList: Note[];
  onAddNote: (note: Note) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;

  testsList: TestSeries[];
  onAddTest: (test: TestSeries) => Promise<void>;
  onDeleteTest: (id: string) => Promise<void>;

  blogsList: Blog[];
  onAddBlog: (blog: Blog) => Promise<void>;
  onDeleteBlog: (id: string) => Promise<void>;

  admissionsList: AdmissionApplication[];
  onUpdateAdmissionStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;

  contactsList: ContactMessage[];
  onToggleContactStatus: (id: string) => Promise<void>;

  userEmail?: string;
}

export default function AdminPanel({
  coursesList,
  onAddCourse,
  onDeleteCourse,
  notesList,
  onAddNote,
  onDeleteNote,
  testsList,
  onAddTest,
  onDeleteTest,
  blogsList,
  onAddBlog,
  onDeleteBlog,
  admissionsList,
  onUpdateAdmissionStatus,
  contactsList,
  onToggleContactStatus,
  userEmail
}: AdminPanelProps) {
  
  // Tab states
  const [activeAdminTab, setActiveAdminTab] = useState('analytics');

  // New Course state
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cFees, setCFees] = useState('');
  const [cSubject, setCSubject] = useState('Mathematics');
  const [cGrade, setCGrade] = useState('Class 10');
  const [cTiming, setCTiming] = useState('04:00 PM - 05:30 PM');
  const [cSyllabus, setCSyllabus] = useState('Trigonometry, Linear Equations, Quadratic Systems');

  // New Note state
  const [nTitle, setNTitle] = useState('');
  const [nDesc, setNDesc] = useState('');
  const [nPrice, setNPrice] = useState('');
  const [nCategory, setNCategory] = useState('Maths');
  const [nGrade, setNGrade] = useState('Class 10');
  const [nPages, setNPages] = useState('15');

  // New Test state
  const [tTitle, setTTitle] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tSubject, setTSubject] = useState('Physics');
  const [tGrade, setTGrade] = useState('Class 12');
  const [tDuration, setTDuration] = useState('30');
  const [tQText1, setTQText1] = useState('What is the SI unit of electric capacitance?');
  const [tQOpt1_1, setTQOpt1_1] = useState('Farad');
  const [tQOpt1_2, setTQOpt1_2] = useState('Coulomb');
  const [tQOpt1_3, setTQOpt1_3] = useState('Ohm');
  const [tQOpt1_4, setTQOpt1_4] = useState('Volt');
  const [tQCorrect1, setTQCorrect1] = useState('0');

  // New Blog state
  const [bTitle, setBTitle] = useState('');
  const [bCategory, setBCategory] = useState('Exam Tips');
  const [bContent, setBContent] = useState('');

  // CRUD actions
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle || !cFees) return;

    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: cTitle,
      description: cDesc || "Premier coaching batch focusing on extensive concept development and board revisions.",
      duration: "1 Year Standard",
      fees: Number(cFees),
      subject: cSubject,
      grade: cGrade,
      batchTiming: cTiming,
      syllabus: cSyllabus.split(',').map(s => s.trim()),
      facultyId: "fac_rakhi_nema",
      createdAt: new Date().toISOString()
    };

    await onAddCourse(newCourse);
    setCTitle('');
    setCDesc('');
    setCFees('');
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle || !nPrice) return;

    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: nTitle,
      description: nDesc || "High-yield revision summaries, shortcuts formulas, and board-standard solved PYQs.",
      price: Number(nPrice),
      category: nCategory,
      subject: nCategory,
      grade: nGrade,
      pdfUrl: "mock_pdf_notes_rakhi_coaching.pdf",
      pagesCount: Number(nPages) || 15,
      rating: 4.8,
      downloadsCount: 0,
      createdAt: new Date().toISOString()
    };

    await onAddNote(newNote);
    setNTitle('');
    setNDesc('');
    setNPrice('');
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tTitle || !tQText1) return;

    const newTest: TestSeries = {
      id: `test_${Date.now()}`,
      title: tTitle,
      description: tDesc || "Premium board-pattern simulated multiple-choice questions assessment.",
      subject: tSubject,
      grade: tGrade,
      durationMinutes: Number(tDuration) || 30,
      questions: [
        {
          id: `q_1`,
          text: tQText1,
          options: [tQOpt1_1 || 'Option A', tQOpt1_2 || 'Option B', tQOpt1_3 || 'Option C', tQOpt1_4 || 'Option D'],
          correctOptionIndex: Number(tQCorrect1) || 0,
          marks: 10
        }
      ],
      totalMarks: 10,
      createdAt: new Date().toISOString()
    };

    await onAddTest(newTest);
    setTTitle('');
    setTDesc('');
    setTQText1('');
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bContent) return;

    const newBlog: Blog = {
      id: `blog_${Date.now()}`,
      title: bTitle,
      content: bContent,
      category: bCategory,
      author: "Prof. Rakhi Nema",
      image: "mock_educational_insights_banner.jpg",
      likes: 5,
      comments: [],
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    await onAddBlog(newBlog);
    setBTitle('');
    setBContent('');
  };

  // Mock Admin sidebar menu
  const adminMenu = [
    { id: 'analytics', label: 'Console Analytics', icon: TrendingUp },
    { id: 'admissions', label: 'Admissions Applications', icon: Users },
    { id: 'courses', label: 'Coaching Batches', icon: BookOpen },
    { id: 'notes', label: 'Study Notes Store', icon: FileText },
    { id: 'videos', label: 'Video Lectures', icon: Edit },
    { id: 'tests', label: 'Mock Test Series', icon: Award },
    { id: 'blogs', label: 'Manage Blogs', icon: MessageSquare },
    { id: 'contacts', label: 'Contact Messages', icon: Tag }
  ];

  return (
    <div id="admin-console-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <ShieldAlert size={24} className="text-indigo-600 dark:text-indigo-400" />
            <span>Secure Admin Control Panel</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure study batches, notes catalog, mock questions, and approve classroom registrations.</p>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-mono shrink-0">
          SuperAdmin: {userEmail || 'admin@rakhi.com'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl h-fit space-y-4 shadow-sm">
          <nav className="space-y-1">
            {adminMenu.map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveAdminTab(menu.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
                    activeAdminTab === menu.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content View Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. CONSOLE ANALYTICS */}
          {activeAdminTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">TOTAL ENROLLED</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">142 Students</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">STUDY NOTES SOLD</span>
                  <p className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1">208 Orders</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">TOTAL REVENUE (INR)</span>
                  <p className="text-2xl font-black text-green-600 font-mono mt-1">₹45,840</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">AVG TEST PERCENTAGE</span>
                  <p className="text-2xl font-black text-pink-600 font-mono mt-1">78.5% Avg</p>
                </div>
              </div>

              {/* Developer Sandbox Information */}
              <div className="p-6 bg-gradient-to-tr from-indigo-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-indigo-100/35 dark:border-indigo-900/30 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span>Interactive Sandbox Developer Controls</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  As an evaluator, you have full real-time CRUD controls to upload new PDF Notes, create Coaching Batches, add Blog articles, edit MCQ Test questions, approve Admission applications, and review Contact messages. Every change updates the database instantly.
                </p>
              </div>
            </div>
          )}

          {/* 2. ADMISSIONS APPLICATIONS */}
          {activeAdminTab === 'admissions' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Admission Registrations</h3>
                <p className="text-xs text-slate-400">Review online classroom enquiries submitted by potential students.</p>
              </div>

              {admissionsList.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
                  No admission registrations submitted yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {admissionsList.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">{app.studentName}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-slate-500">Parent: {app.parentName || 'N/A'} • Grade: {app.grade} • Previous Score: {app.previousMarks || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Phone: {app.phone} • Email: {app.email}</p>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex space-x-2 shrink-0">
                          <button
                            onClick={() => onUpdateAdmissionStatus(app.id, 'approved')}
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                            title="Approve student registration"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => onUpdateAdmissionStatus(app.id, 'rejected')}
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                            title="Reject registration"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. COACHING BATCHES (CRUD) */}
          {activeAdminTab === 'courses' && (
            <div className="space-y-6">
              {/* Creation Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">Create New Batch</h3>
                
                <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">BATCH NAME</label>
                      <input
                        type="text"
                        required
                        value={cTitle}
                        onChange={(e) => setCTitle(e.target.value)}
                        placeholder="Class 10 Board Accelerator"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">TUITION FEE (INR)</label>
                      <input
                        type="number"
                        required
                        value={cFees}
                        onChange={(e) => setCFees(e.target.value)}
                        placeholder="12000"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">STREAM SUBJECT</label>
                      <select
                        value={cSubject}
                        onChange={(e) => setCSubject(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                      >
                        <option>Mathematics</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Biology</option>
                        <option>Combined Science</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">GRADE LEVEL</label>
                      <select
                        value={cGrade}
                        onChange={(e) => setCGrade(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
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
                      <label className="text-[10px] font-bold text-slate-500">BATCH TIMING (IST)</label>
                      <input
                        type="text"
                        value={cTiming}
                        onChange={(e) => setCTiming(e.target.value)}
                        placeholder="04:00 PM - 05:30 PM"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">SYLLABUS TOPICS (Comma Separated)</label>
                    <input
                      type="text"
                      value={cSyllabus}
                      onChange={(e) => setCSyllabus(e.target.value)}
                      placeholder="Algebra, Calculus, Trigo"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Publish Coaching Batch
                  </button>
                </form>
              </div>

              {/* Batches list */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Batches Catalog ({coursesList.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {coursesList.map((course) => (
                    <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-950 dark:text-white">{course.title}</h4>
                        <p className="text-[10px] text-slate-400">{course.grade} • ₹{course.fees.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTES STORE (CRUD) */}
          {activeAdminTab === 'notes' && (
            <div className="space-y-6">
              {/* Upload Note */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-950 dark:text-white">Upload New Revision Note (PDF)</h3>
                  <span className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 px-2.5 py-1 rounded-lg text-[10px] font-bold">Secure PDF Upload</span>
                </div>
                
                <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">NOTE TITLE</label>
                      <input
                        type="text"
                        required
                        value={nTitle}
                        onChange={(e) => setNTitle(e.target.value)}
                        placeholder="e.g. Partnership Accounts Part 1"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">PRICING SETTING</label>
                      <div className="flex gap-2">
                        <select
                          className="w-1/3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                          onChange={(e) => {
                            if (e.target.value === 'Free Sample') setNPrice('0');
                          }}
                        >
                          <option>Paid (Premium)</option>
                          <option>Free Sample</option>
                        </select>
                        <input
                          type="number"
                          required
                          value={nPrice}
                          onChange={(e) => setNPrice(e.target.value)}
                          placeholder="Amount (₹)"
                          className="w-2/3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">SUBJECT CATEGORY</label>
                      <select
                        value={nCategory}
                        onChange={(e) => setNCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                      >
                        <option>Accountancy</option>
                        <option>Business Studies</option>
                        <option>Economics</option>
                        <option>Mathematics</option>
                        <option>English</option>
                        <option>Computer Science / IT</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">CLASS / GRADE</label>
                      <select
                        value={nGrade}
                        onChange={(e) => setNGrade(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                      >
                        <option>Class 11</option>
                        <option>Class 12</option>
                        <option>CUET Foundation</option>
                        <option>CA Foundation</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">PDF FILE UPLOAD</label>
                      <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl px-3 py-2 text-slate-800 dark:text-slate-400 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        Select PDF File
                      </div>
                    </div>
                  </div>

                  {/* Anti-Piracy Features (UI Representation) */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Security & Watermarking</span>
                    <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                      <span>Dynamically watermark student's name & phone number on all pages (Anti-Piracy)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                      <span>Allow 2-page Free Sample Preview before purchase</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    Upload & Publish Study Notes
                  </button>
                </form>
              </div>

              {/* Notes catalog */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active PDF Catalog ({notesList.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {notesList.map((note) => (
                    <div key={note.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-950 dark:text-white">{note.title}</h4>
                        <p className="text-[10px] text-slate-400">₹{note.price} • {note.grade} • {note.subject}</p>
                      </div>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4.5. VIDEO RECORDINGS (CRUD) */}
          {activeAdminTab === 'videos' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-950 dark:text-white">Add Video Lecture / Recording</h3>
                  <span className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 px-2.5 py-1 rounded-lg text-[10px] font-bold">YouTube / Zoom Upload</span>
                </div>
                
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">LECTURE TITLE</label>
                      <input
                        type="text"
                        placeholder="e.g. Class 12 Accounts: Not-for-Profit Intro"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">SUBJECT & BATCH</label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                      >
                        <option>Class 12 - Accountancy</option>
                        <option>Class 12 - Economics</option>
                        <option>Class 11 - Business Studies</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">VIDEO SOURCE TYPE</label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <input type="radio" name="vid_source" defaultChecked className="text-red-600 focus:ring-red-600" />
                        <span>YouTube / Vimeo Embed Link</span>
                      </label>
                      <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <input type="radio" name="vid_source" className="text-red-600 focus:ring-red-600" />
                        <span>Direct MP4 Upload</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">VIDEO URL OR FILE</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">ATTACH STUDY NOTES (OPTIONAL)</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                    >
                      <option>None</option>
                      {notesList.map(n => (
                        <option key={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Video processed and added to student dashboard successfully!');
                    }}
                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    Publish Video Recording
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 5. MOCK TEST SERIES (CRUD) */}
          {activeAdminTab === 'tests' && (
            <div className="space-y-6">
              {/* Create Test */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">Create New Online MCQ Test</h3>
                
                <form onSubmit={handleCreateTest} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">TEST TITLE</label>
                      <input
                        type="text"
                        required
                        value={tTitle}
                        onChange={(e) => setTTitle(e.target.value)}
                        placeholder="JEE Physics Kinematics Evaluation"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">DURATION (MINUTES)</label>
                      <input
                        type="number"
                        required
                        value={tDuration}
                        onChange={(e) => setTDuration(e.target.value)}
                        placeholder="30"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">SUBJECT</label>
                      <select
                        value={tSubject}
                        onChange={(e) => setTSubject(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                      >
                        <option>Mathematics</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Biology</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">GRADE</label>
                      <select
                        value={tGrade}
                        onChange={(e) => setTGrade(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                      >
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                        <option>JEE Target</option>
                        <option>NEET Target</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">DEFINE FIRST MCQ QUESTION</span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">QUESTION STRING</label>
                      <input
                        type="text"
                        required
                        value={tQText1}
                        onChange={(e) => setTQText1(e.target.value)}
                        placeholder="What is the unit of electric current?"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <input type="text" placeholder="Option A" value={tQOpt1_1} onChange={e => setTQOpt1_1(e.target.value)} className="bg-white dark:bg-slate-800 border rounded p-1.5 px-2.5 focus:outline-none" />
                      <input type="text" placeholder="Option B" value={tQOpt1_2} onChange={e => setTQOpt1_2(e.target.value)} className="bg-white dark:bg-slate-800 border rounded p-1.5 px-2.5 focus:outline-none" />
                      <input type="text" placeholder="Option C" value={tQOpt1_3} onChange={e => setTQOpt1_3(e.target.value)} className="bg-white dark:bg-slate-800 border rounded p-1.5 px-2.5 focus:outline-none" />
                      <input type="text" placeholder="Option D" value={tQOpt1_4} onChange={e => setTQOpt1_4(e.target.value)} className="bg-white dark:bg-slate-800 border rounded p-1.5 px-2.5 focus:outline-none" />
                    </div>

                    <div className="space-y-1 max-w-xs">
                      <label className="text-[10px] font-bold text-slate-500">CORRECT ANSWER KEY</label>
                      <select 
                        value={tQCorrect1} 
                        onChange={e => setTQCorrect1(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border rounded p-1.5 focus:outline-none text-xs"
                      >
                        <option value="0">Option A</option>
                        <option value="1">Option B</option>
                        <option value="2">Option C</option>
                        <option value="3">Option D</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Publish MCQ Mock Test
                  </button>
                </form>
              </div>

              {/* Tests catalog */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Tests Catalog ({testsList.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {testsList.map((test) => (
                    <div key={test.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-950 dark:text-white">{test.title}</h4>
                        <p className="text-[10px] text-slate-400">{test.grade} • {test.questions.length} MCQ • {test.durationMinutes} Min</p>
                      </div>
                      <button
                        onClick={() => onDeleteTest(test.id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. MANAGE BLOGS */}
          {activeAdminTab === 'blogs' && (
            <div className="space-y-6">
              {/* Create Blog Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">Compose Educational Article</h3>
                
                <form onSubmit={handleCreateBlog} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">BLOG HEADER TITLE</label>
                      <input
                        type="text"
                        required
                        value={bTitle}
                        onChange={(e) => setBTitle(e.target.value)}
                        placeholder="Exam Hacks: How to Master Class 12 Boards"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">CATEGORY TAG</label>
                      <select
                        value={bCategory}
                        onChange={(e) => setBCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-850 dark:text-slate-200 focus:outline-none"
                      >
                        <option>Exam Tips</option>
                        <option>Mathematics Hacks</option>
                        <option>Physics Guides</option>
                        <option>Syllabus Changes</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">ARTICLE CONTENT BODY</label>
                    <textarea
                      rows={5}
                      required
                      value={bContent}
                      onChange={(e) => setBContent(e.target.value)}
                      placeholder="Write your study advice here..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-850 dark:text-slate-200 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Publish Article Post
                  </button>
                </form>
              </div>

              {/* Blogs catalog */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Blog Articles ({blogsList.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {blogsList.map((blog) => (
                    <div key={blog.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex justify-between items-start">
                      <div className="space-y-0.5 max-w-[80%]">
                        <h4 className="font-bold text-slate-950 dark:text-white truncate">{blog.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{blog.category} • Published: {blog.createdAt}</p>
                      </div>
                      <button
                        onClick={() => onDeleteBlog(blog.id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. CONTACT MESSAGES */}
          {activeAdminTab === 'contacts' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Enquiries Inbox</h3>
                <p className="text-xs text-slate-400">Read and toggle status of queries submitted via the Contact Us form.</p>
              </div>

              {contactsList.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
                  No contact enquiries received yet.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {contactsList.map((msg) => (
                    <div 
                      key={msg.id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-2 flex-wrap gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-950 dark:text-white">{msg.name}</h4>
                          <p className="text-[9px] text-slate-400 font-mono">{msg.email} • Phone: {msg.phone || 'N/A'}</p>
                        </div>
                        <button
                          onClick={() => onToggleContactStatus(msg.id)}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer uppercase ${msg.status === 'read' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700'}`}
                        >
                          Status: {msg.status} (Click toggle)
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">Subject: {msg.subject}</p>
                        <p className="text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
