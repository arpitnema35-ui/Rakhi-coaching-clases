import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Award, 
  ShoppingCart, 
  User, 
  ChevronRight, 
  Download, 
  Eye, 
  Clock, 
  Settings, 
  Heart,
  TrendingUp,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Order, TestResult, Note, Course, CartItem } from '../types';

interface StudentDashboardProps {
  user: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  orders: Order[];
  results: TestResult[];
  notesList: Note[];
  coursesList: Course[];
  activeDashboardTab: string;
  setActiveDashboardTab: (tab: string) => void;
  wishlist: Note[];
  onRemoveWishlist: (noteId: string) => void;
}

export default function StudentDashboard({
  user,
  onUpdateProfile,
  orders,
  results,
  notesList,
  coursesList,
  activeDashboardTab,
  setActiveDashboardTab,
  wishlist,
  onRemoveWishlist
}: StudentDashboardProps) {
  
  // Edit Profile States
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileGrade, setProfileGrade] = useState(user?.grade || 'Class 10');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Selected note for PDF reader modal
  const [readingNote, setReadingNote] = useState<Note | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <User size={48} className="text-slate-300 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-1">Please sign in to view your customized Student Dashboard.</p>
        </div>
      </div>
    );
  }

  // Get notes that have been successfully ordered by the user
  const successOrderIds = orders
    .filter(o => o.status === 'success')
    .flatMap(o => o.items.map(i => i.noteId));

  const purchasedNotes = notesList.filter(note => successOrderIds.includes(note.id));

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');
    try {
      await onUpdateProfile({
        displayName: profileName,
        phone: profilePhone,
        grade: profileGrade
      });
      setProfileSuccessMsg('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Mock high-yield content for notes reader
  const getNoteRevisionContent = (noteSubject: string) => {
    const subject = noteSubject.toLowerCase();
    if (subject.includes('math')) {
      return {
        title: "Algebra & Trigonometry Quick Sheet",
        formulas: [
          { equation: "Quadratic Formula: x = [-b ± √(b² - 4ac)] / 2a", desc: "Finds roots of ax² + bx + c = 0" },
          { equation: "Trigonometric Identity: sin²θ + cos²θ = 1", desc: "Pythagorean identity" },
          { equation: "Sum Formula: sin(A+B) = sinA·cosB + cosA·sinB", desc: "Angle addition rule" },
          { equation: "Arithmetic Progression: Tn = a + (n-1)d", desc: "n-th term of an AP sequence" }
        ]
      };
    } else if (subject.includes('physic')) {
      return {
        title: "Electromagnetism & Optics Quick Sheet",
        formulas: [
          { equation: "Coulomb's Law: F = k · (q₁·q₂) / r²", desc: "Electrostatic attraction between charges" },
          { equation: "Snell's Law: n₁ · sin(θ₁) = n₂ · sin(θ₂)", desc: "Refraction of light through media" },
          { equation: "Lens Maker's Formula: 1/f = (n - 1) · (1/R₁ - 1/R₂)", desc: "Relates focal length to curvature" },
          { equation: "Ohm's Law: V = I · R", desc: "Voltage drops across electric resistance" }
        ]
      };
    } else if (subject.includes('chem')) {
      return {
        title: "Organic Reaction Summary Sheets",
        formulas: [
          { equation: "Nucleophilic Substitution: R-X + Nu⁻ → R-Nu + X⁻", desc: "SN2 (bimolecular) / SN1 (unimolecular)" },
          { equation: "Grignard Reaction: R-Mg-X + R'-CHO → Secondary Alcohol", desc: "Highly powerful C-C coupling mechanism" },
          { equation: "Ideal Gas Law: P·V = n·R·T", desc: "Relates state variables of gases" }
        ]
      };
    } else {
      return {
        title: "Biology Cell Division Summary Sheets",
        formulas: [
          { equation: "Mitosis Phase Flow: Prophase → Metaphase → Anaphase → Telophase", desc: "Equational cell division steps" },
          { equation: "Meiosis Invariant: 2n Diploid Cell → 4x Haploid Gametes", desc: "Reductional cell division steps" }
        ]
      };
    }
  };

  // Sidebar Menu Tabs
  const dashboardTabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'notes', label: 'Purchased Notes', icon: FileText },
    { id: 'courses', label: 'Enrolled Classes', icon: BookOpen },
    { id: 'results', label: 'Test Results', icon: Award },
    { id: 'orders', label: 'Orders & Receipts', icon: ShoppingCart },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'settings', label: 'Profile Settings', icon: Settings }
  ];

  return (
    <div id="student-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Tab Navigator Panel */}
        <div className="lg:col-span-1 bg-white/80 dark:bg-[#18110d]/70 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 p-6 rounded-3xl shadow-lg shadow-orange-500/5 space-y-6 h-fit">
          <div className="flex items-center space-x-3 pb-4 border-b border-orange-100 dark:border-orange-950/60">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/20">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5 truncate">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{user.displayName}</h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
              <span className="inline-block px-2 py-0.5 bg-orange-50 dark:bg-orange-950/50 text-[9px] text-orange-700 dark:text-orange-300 font-mono font-bold rounded-lg uppercase border border-orange-200 dark:border-orange-900/30">
                {user.role} Profile
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {dashboardTabs.map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDashboardTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    activeDashboardTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  <IconComp size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side Views Panel */}
        <div className="lg:col-span-3">
          
          {/* 1. OVERVIEW VIEW */}
          {activeDashboardTab === 'overview' && (
            <div className="space-y-6">
              {/* Greetings */}
              <div className="p-6 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 border border-orange-400/30 rounded-3xl text-white space-y-2 relative overflow-hidden shadow-xl shadow-orange-500/15">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <h2 className="text-xl sm:text-2xl font-extrabold relative z-10">Welcome back, {user.displayName}! 👋</h2>
                <p className="text-xs text-orange-100 relative z-10">
                  Track your coaching progress, read revision notes, and take mock assessments to score better.
                </p>
              </div>

              {/* Quick stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white/80 dark:bg-[#18110d]/70 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 p-6 rounded-3xl shadow-lg shadow-orange-500/5 space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold uppercase">PURCHASED NOTES</span>
                  <p className="text-3xl font-black text-orange-600 dark:text-orange-400 font-sans tracking-tight">{purchasedNotes.length}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">Available for PDF download</p>
                </div>
                <div className="bg-white/80 dark:bg-[#18110d]/70 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 p-6 rounded-3xl shadow-lg shadow-orange-500/5 space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold uppercase">MOCK TESTS ATTEMPTED</span>
                  <p className="text-3xl font-black text-red-600 dark:text-red-400 font-sans tracking-tight">{results.length}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">Completed MCQ sessions</p>
                </div>
                <div className="bg-white/80 dark:bg-[#18110d]/70 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 p-6 rounded-3xl shadow-lg shadow-orange-500/5 space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold uppercase">COURSES ENROLLED</span>
                  <p className="text-3xl font-black text-amber-600 dark:text-amber-400 font-sans tracking-tight">{(user.enrolledCourses || []).length || 1}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">Classroom batches active</p>
                </div>
              </div>

              {/* Short guidelines for the sandbox */}
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 p-4 rounded-2xl text-xs text-indigo-800 dark:text-indigo-300 space-y-1">
                <p className="font-bold">📚 Quick Sandbox Guide:</p>
                <p>1. Go to the **Notes Store**, select a note, click "Add Cart", and trigger checkout using our secure simulated QR Razorpay sandbox. Once completed, your note will appear under the **Purchased Notes** tab.</p>
                <p>2. Go to the **Test Series** tab, attempt any mock exam, submit your scores, and immediately retrieve your verifiable digital award certificate!</p>
              </div>
            </div>
          )}

          {/* 2. PURCHASED NOTES VIEW */}
          {activeDashboardTab === 'notes' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Your Notes Library</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Read summaries online or trigger offline mock PDF downloads.</p>
              </div>

              {purchasedNotes.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <FileText size={44} className="text-slate-400 mx-auto" />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">No notes purchased yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Notes you secure from our Revision Store will instantly activate here.</p>
                  </div>
                  <button 
                    onClick={() => setActiveDashboardTab('notes-store')}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Browse Revision Notes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {purchasedNotes.map((note) => (
                    <div 
                      key={note.id}
                      className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-md flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-3">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold font-mono rounded uppercase border border-indigo-200 dark:border-indigo-500/20">
                          {note.subject} • {note.grade}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{note.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{note.description}</p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex gap-2 mt-6">
                        <button
                          onClick={() => setReadingNote(note)}
                          className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Open PDF Reader</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
                          title="Download offline"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. ENROLLED CLASSES VIEW */}
          {activeDashboardTab === 'courses' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Classroom Batches</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">You are registered to the following physical / digital classroom stream.</p>
              </div>

              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-md space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Class 10 Board Accelerator Batch</h4>
                    <p className="text-xs text-slate-500">Classroom Block B • Faculty: Prof. Rakhi Nema</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">Batch Timetable Days</p>
                    <p>Mon, Wed, Fri (Mathematics) • Tue, Thu, Sat (Physics/Science)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">Daily Lecture Timings</p>
                    <p className="font-mono">04:00 PM - 05:30 PM (IST)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. TEST RESULTS VIEW */}
          {activeDashboardTab === 'results' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Submitted Test Records</h3>
                <p className="text-xs text-slate-400">Review your historic scorecards and retrieve digital excellence diplomas.</p>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <Award size={44} className="text-slate-350 mx-auto" />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">No mock tests submitted yet</p>
                    <p className="text-xs text-slate-400 mt-1">Submit quiz answers in our Online Test System and retrieve results here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((res) => (
                    <div 
                      key={res.id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400">{new Date(res.createdAt).toLocaleDateString()}</span>
                        <h4 className="font-bold text-xs text-slate-950 dark:text-white">{res.testTitle}</h4>
                        <p className="text-[10px] text-slate-500">Correct: {res.correctAnswers} • Wrong/Skipped: {res.wrongAnswers}</p>
                      </div>

                      <div className="flex items-center space-x-6 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-medium">SCORE</span>
                          <span className="font-mono font-black text-sm text-teal-600 dark:text-teal-400">{res.score}/{res.totalMarks} ({res.percentage}%)</span>
                        </div>
                        {res.percentage >= 60 && (
                          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Award size={12} />
                            <span>Excelled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. ORDERS & RECEIPTS */}
          {activeDashboardTab === 'orders' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Transaction Logs</h3>
                <p className="text-xs text-slate-400">Verifiable tax invoices for payments processed on our note platform.</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
                  No purchases found.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-2.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-950 dark:text-white">Invoice ID: {order.id.substring(0, 10).toUpperCase()}</p>
                          <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 text-[10px] font-bold rounded uppercase">
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-500">{item.noteTitle}</span>
                            <span className="font-mono">₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between font-bold text-slate-950 dark:text-white">
                        <span>Total Paid</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400">₹{order.finalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. WISHLIST VIEW */}
          {activeDashboardTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Saved Revision Items</h3>
                <p className="text-xs text-slate-400">Quick shortcuts to notes you wish to review later.</p>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
                  Your wishlist is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map((note) => (
                    <div 
                      key={note.id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{note.title}</h4>
                        <p className="text-[10px] text-slate-400">₹{note.price} • {note.grade}</p>
                      </div>
                      <button
                        onClick={() => onRemoveWishlist(note.id)}
                        className="text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. PROFILE SETTINGS */}
          {activeDashboardTab === 'settings' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-slate-50 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">Edit Student Credentials</h3>
                <p className="text-xs text-slate-450">Maintain active communication details for batch notifications.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                {profileSuccessMsg && <p className="p-3 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-bold rounded-lg">{profileSuccessMsg}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">DISPLAY NAME</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Display Name"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">PHONE / WHATSAPP</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 max-w-sm">
                  <label className="text-[10px] font-bold text-slate-500 block">STUDYING GRADE</label>
                  <select
                    value={profileGrade}
                    onChange={(e) => setProfileGrade(e.target.value)}
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

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ------------------ INTUITIVE PDF READER DIALOG MODAL ------------------ */}
      <AnimatePresence>
        {readingNote && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setReadingNote(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close PDF Reader"
              >
                <X size={20} />
              </button>

              {/* Reader panel */}
              <div className="space-y-2">
                <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[9px] font-bold font-mono rounded uppercase">
                  PDF ONLINE READER
                </span>
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white leading-tight">
                  {readingNote.title}
                </h3>
                <p className="text-[10px] text-slate-400">Verifying signature license key • Approved for: {user.displayName}</p>
              </div>

              {/* Rendered formulas */}
              <div className="bg-slate-950 text-slate-350 p-6 rounded-2xl font-mono text-xs overflow-y-auto max-h-[300px] border border-slate-850 space-y-4 shadow-inner">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between text-teal-400 text-[10px] font-bold">
                  <span>{getNoteRevisionContent(readingNote.subject).title}</span>
                  <span>LICENSE: RAK-OK</span>
                </div>

                <div className="space-y-4">
                  {getNoteRevisionContent(readingNote.subject).formulas.map((frm, fIdx) => (
                    <div key={fIdx} className="space-y-1">
                      <p className="text-teal-400 font-bold">{frm.equation}</p>
                      <p className="text-[10px] text-slate-500">// {frm.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Full PDF Offline</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
