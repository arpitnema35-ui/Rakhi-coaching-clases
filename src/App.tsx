import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types & Configs
import { 
  UserProfile, 
  Course, 
  Note, 
  TestSeries, 
  Blog, 
  ContactMessage, 
  AdmissionApplication, 
  Order, 
  TestResult, 
  CartItem 
} from './types';
import { 
  auth, 
  db, 
  googleProvider, 
  safeGetDocs,
  safeGetDoc,
  safeWriteDoc, 
  safeAddDoc,
  testConnection 
} from './firebase';
import {
  fallbackCourses,
  fallbackNotes,
  fallbackTests,
  fallbackBlogs,
  fallbackTeachers
} from './data';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';


// Custom Modules
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import PublicPages from './components/PublicPages';
import NotesStore from './components/NotesStore';
import LecturesPage from './components/LecturesPage';
import FeedbackPage from './components/FeedbackPage';
import OnlineTestSeries from './components/OnlineTestSeries';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';
import NotFound from './components/NotFound';

export default function App() {
  
  // App States
  const [activeTab, setActiveTab] = useState<string>('class12');
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('overview');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // Database State Lists
  const [user, setUser] = useState<UserProfile | null>(null);
  const [coursesList, setCoursesList] = useState<Course[]>(fallbackCourses);
  const [notesList, setNotesList] = useState<Note[]>(fallbackNotes);
  const [testsList, setTestsList] = useState<TestSeries[]>(fallbackTests);
  const [blogsList, setBlogsList] = useState<Blog[]>(fallbackBlogs);
  const [admissionsList, setAdmissionsList] = useState<AdmissionApplication[]>([]);
  const [contactsList, setContactsList] = useState<ContactMessage[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [resultsList, setResultsList] = useState<TestResult[]>([]);
  
  // Local volatile states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Note[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // Auth Form Input States
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [authError, setAuthError] = useState('');


  // 1. Initial boot data fetching
  useEffect(() => {
    async function loadAllData() {
      // Skipped testConnection to avoid Firestore connection warnings

      // We load only user-specific or dynamic lists from Firebase. 
      // Courses, notes, tests, and blogs are loaded directly from data.ts as requested.
      // We will also skip pre-loading admissions/contacts/orders globally on boot 
      // to avoid triggering Firestore offline connection errors if the DB isn't set up yet.
      
      // setAdmissionsList(admissions);
      // setContactsList(contacts);
      // setOrdersList(orders);
      // setResultsList(results);
    }
    loadAllData();
  }, []);

  // 2. Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Build or fetch User Profile details
        const email = fbUser.email || 'student@rakhi.com';
        
        let profile: UserProfile = {
          uid: fbUser.uid,
          email: email,
          displayName: fbUser.displayName || email.split('@')[0],
          photoURL: fbUser.photoURL || undefined,
          role: email.includes('admin') ? 'admin' : 'student',
          enrolledCourses: [],
          createdAt: new Date().toISOString()
        };

        try {
          const dbProfile = await safeGetDoc<UserProfile>('users', fbUser.uid, profile);
          if (dbProfile) {
            profile = { ...profile, ...dbProfile };
          }
        } catch (e) {
          console.warn("Failed to fetch user profile from DB", e);
        }

        setUser(profile);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Sync theme class on HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 4. Route Hash & Path Synchronization with 404 Fallback
  useEffect(() => {
    const validTabs = [
      'class11', 'class12', 'notes', 'notes-store',
      'privacy', 'terms', 'faq', 'admin-panel'
    ];

    const syncRouteWithTab = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const path = window.location.pathname.replace('/', '').trim();
      const route = hash || path;

      if (!route) {
        return;
      }

      if (validTabs.includes(route) || route.startsWith('dashboard-')) {
        setActiveTab(route);
      } else {
        setActiveTab('404');
      }
    };

    syncRouteWithTab();
    window.addEventListener('hashchange', syncRouteWithTab);
    return () => window.removeEventListener('hashchange', syncRouteWithTab);
  }, []);

  // Auth Submit Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!authEmail || !authPassword) {
      setAuthError('Please complete all form credentials.');
      return;
    }

    try {
      if (isSignUp) {
        if (!authName) {
          setAuthError('Name is required for sign up.');
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(userCredential.user, { displayName: authName });
        // After this, onAuthStateChanged will fire and catch the updated displayName
        
        // Ensure the profile is written to Firestore users collection if you want persistence
        await safeWriteDoc('users', {
          id: userCredential.user.uid,
          email: authEmail,
          displayName: authName,
          role: authRole,
          enrolledCourses: [],
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
      
      // onAuthStateChanged will handle setting the user profile
      setLoginModalOpen(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      console.error("Auth error:", err);
      // Format common firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Email is already registered. Please login instead.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err.message || 'Authentication validation failed.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setLoginModalOpen(false);
      }
    } catch (err: any) {
      console.error("Google sign-in popup error:", err);
      setAuthError('Google Sign-In failed. Please try again or use email.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setActiveTab('home');
  };

  // Switch role simulator (For swift visual sandbox testings)
  const handleSimulateRole = (role: 'student' | 'teacher' | 'admin') => {
    if (!user) {
      setUser({
        uid: 'simulated_user_id',
        email: `${role}@rakhi.com`,
        displayName: `Sandbox ${role.toUpperCase()}`,
        role: role,
        enrolledCourses: ['course_10_board'],
        createdAt: new Date().toISOString()
      });
    } else {
      setUser({
        ...user,
        role: role,
        displayName: `Sandbox ${role.toUpperCase()}`,
        email: `${role}@rakhi.com`
      });
    }
  };

  // Form write-backs to Firestore
  const handleSubmitAdmission = async (appData: Omit<AdmissionApplication, 'id' | 'createdAt' | 'status'>) => {
    const newApp: AdmissionApplication = {
      id: `app_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...appData
    };
    await safeWriteDoc<AdmissionApplication>('admissions', newApp);
    setAdmissionsList(prev => [newApp, ...prev]);
  };

  const handleSubmitContact = async (msgData: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
    const newMsg: ContactMessage = {
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'unread',
      ...msgData
    };
    await safeWriteDoc<ContactMessage>('contacts', newMsg);
    setContactsList(prev => [newMsg, ...prev]);
  };

  const handleCheckoutComplete = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'success',
      ...orderData
    };
    await safeWriteDoc<Order>('orders', newOrder);
    setOrdersList(prev => [newOrder, ...prev]);
    return newOrder.id;
  };

  const handleSaveResult = async (resData: Omit<TestResult, 'id' | 'createdAt'>): Promise<string> => {
    const newResult: TestResult = {
      id: `res_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...resData
    };
    await safeWriteDoc<TestResult>('results', newResult);
    setResultsList(prev => [newResult, ...prev]);
    return newResult.id;
  };

  // Profile update
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await safeWriteDoc<any>('users', { id: updated.uid, ...updated });
  };

  // Admin CRUD hooks
  const handleAddCourse = async (course: Course) => {
    await safeWriteDoc<Course>('courses', course);
    setCoursesList(prev => [course, ...prev]);
  };

  const handleDeleteCourse = async (id: string) => {
    await safeWriteDoc('courses', { id, active: false }); // Soft or hard delete
    setCoursesList(prev => prev.filter(c => c.id !== id));
  };

  const handleAddNote = async (note: Note) => {
    await safeWriteDoc<Note>('notes', note);
    setNotesList(prev => [note, ...prev]);
  };

  const handleDeleteNote = async (id: string) => {
    setNotesList(prev => prev.filter(n => n.id !== id));
  };

  const handleAddTest = async (test: TestSeries) => {
    await safeWriteDoc<TestSeries>('tests', test);
    setTestsList(prev => [test, ...prev]);
  };

  const handleDeleteTest = async (id: string) => {
    setTestsList(prev => prev.filter(t => t.id !== id));
  };

  const handleAddBlog = async (blog: Blog) => {
    await safeWriteDoc<Blog>('blogs', blog);
    setBlogsList(prev => [blog, ...prev]);
  };

  const handleDeleteBlog = async (id: string) => {
    setBlogsList(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateAdmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    setAdmissionsList(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    const target = admissionsList.find(app => app.id === id);
    if (target) {
      await safeWriteDoc('admissions', { ...target, status });
    }
  };

  const handleToggleContactStatus = async (id: string) => {
    setContactsList(prev => prev.map(msg => msg.id === id ? { ...msg, status: msg.status === 'read' ? 'unread' : 'read' } : msg));
    const target = contactsList.find(msg => msg.id === id);
    if (target) {
      await safeWriteDoc('contacts', { ...target, status: target.status === 'read' ? 'unread' : 'read' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-red-50/40 dark:from-[#0d0907] dark:via-[#140f0b] dark:to-[#1a100b] text-slate-900 dark:text-stone-100 font-sans flex flex-col justify-between transition-colors duration-300 relative selection:bg-orange-500 selection:text-white">
      {/* 3D Liquid Ambient Glow Background Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/15 via-red-500/10 to-amber-300/10 dark:from-orange-600/20 dark:via-red-600/15 dark:to-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-10 right-10 w-[600px] h-[600px] bg-gradient-to-tr from-red-500/15 via-amber-400/10 to-orange-500/15 dark:from-red-600/15 dark:via-orange-600/20 dark:to-amber-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }}></div>
      
      {/* 1. Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSimulateRole={handleSimulateRole}
      />

      {/* 2. Main Tab View Dispatcher */}
      <main className="flex-1 pb-16">
        
        {/* Class 12th Commerce Notes Page View */}
        {(activeTab === 'class12' || activeTab === 'class11' || activeTab === 'notes' || activeTab === 'notes-store') && (
          <NotesStore
            notesList={notesList}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            onCheckoutComplete={handleCheckoutComplete}
            user={user}
            onLoginClick={() => setLoginModalOpen(true)}
            gradeFilter="Class 12"
          />
        )}

        {/* Legal & Static Public Views if requested from footer */}
        {['privacy', 'terms', 'faq'].includes(activeTab) && (
          <PublicPages
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            coursesList={coursesList}
            setCoursesList={setCoursesList}
            teachersList={fallbackTeachers}
            blogsList={blogsList}
            setBlogsList={setBlogsList}
            onSubmitAdmission={handleSubmitAdmission}
            onSubmitContact={handleSubmitContact}
            userEmail={user?.email}
          />
        )}

        {/* Student Dashboard Views */}
        {activeTab.startsWith('dashboard-') && (
          <StudentDashboard
            user={user}
            onUpdateProfile={handleUpdateProfile}
            orders={ordersList}
            results={resultsList}
            notesList={notesList}
            coursesList={coursesList}
            activeDashboardTab={activeDashboardTab}
            setActiveDashboardTab={setActiveDashboardTab}
            wishlist={wishlist}
            onRemoveWishlist={(id) => setWishlist(prev => prev.filter(n => n.id !== id))}
          />
        )}

        {/* Admin Console View */}
        {activeTab === 'admin-panel' && (
          <AdminPanel
            coursesList={coursesList}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
            notesList={notesList}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            testsList={testsList}
            onAddTest={handleAddTest}
            onDeleteTest={handleDeleteTest}
            blogsList={blogsList}
            onAddBlog={handleAddBlog}
            onDeleteBlog={handleDeleteBlog}
            admissionsList={admissionsList}
            onUpdateAdmissionStatus={handleUpdateAdmissionStatus}
            contactsList={contactsList}
            onToggleContactStatus={handleToggleContactStatus}
            userEmail={user?.email}
          />
        )}

        {/* 404 Custom Interactive Page for Non-existent Routes */}
        {(activeTab === '404' || (
          !['class11', 'class12', 'notes', 'notes-store', 'privacy', 'terms', 'faq', 'admin-panel'].includes(activeTab) && 
          !activeTab.startsWith('dashboard-')
        )) && (
          <NotFound setActiveTab={setActiveTab} />
        )}

      </main>

      {/* 3. Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* 4. WhatsApp Floating Widget */}
      <WhatsAppButton />

      {/* ------------------ AUTHENTICATION LOGIN / SIGNUP MODAL ------------------ */}
      <AnimatePresence>
        {loginModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setLoginModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close Auth"
              >
                <X size={18} />
              </button>

              {/* Title brand */}
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                  R
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-2">
                  {isSignUp ? 'Create Student Profile' : 'Sign In to Rakhi Coaching'}
                </h3>
                <p className="text-[10px] text-slate-400">Unlock online mock tests, note stores, and progress histories.</p>
              </div>

              {/* Form submit */}
              <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
                {authError && (
                  <div className="p-2.5 bg-red-50 text-red-500 font-semibold rounded-lg flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{authError}</span>
                  </div>
                )}

                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">STUDENT FULL NAME</label>
                    <div className="relative">
                      <User size={12} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Aman Mishra"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="student@gmail.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">SECRET PASSWORD</label>
                  <div className="relative">
                    <Lock size={12} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">SELECT ROLE</label>
                    <select
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="student">Student Account</option>
                      <option value="admin">Full Institutional Admin</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-95 transition-opacity"
                >
                  {isSignUp ? 'Generate Profile' : 'Authorize Sign In'}
                </button>
              </form>

              {/* OAuth Google popup trigger */}
              <div className="space-y-3 pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase font-mono">OR SIGN IN WITH</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                >
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Google Account Single Sign-on</span>
                </button>
              </div>

              {/* Alternate toggle */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
                >
                  {isSignUp ? 'Already registered? Sign In' : 'New student? Register Profile'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
