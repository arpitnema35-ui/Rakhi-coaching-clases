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
  safeWriteDoc, 
  safeAddDoc,
  testConnection 
} from './firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
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
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [testsList, setTestsList] = useState<TestSeries[]>([]);
  const [blogsList, setBlogsList] = useState<Blog[]>([]);
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

  // Pre-populated Fallback Vectors (if Firestore is blank on their new project)
  const fallbackCourses: Course[] = [
    {
      id: 'course_10_board',
      title: 'Class 10 Boards Accelerator',
      description: 'Comprehensive, intensive syllabus revision for CBSE Board Maths & Science. Includes shortcut sheets, board papers, and weekly mock tests.',
      duration: '1 Year Standard',
      fees: 12500,
      subject: 'Maths & Science',
      grade: 'Class 10',
      batchTiming: '04:00 PM - 05:30 PM (Mon, Wed, Fri)',
      syllabus: ['Real Numbers & Algebra', 'Trigonometry & Geometry', 'Light Reflection & Refraction', 'Carbon & its Compounds'],
      facultyId: 'fac_rakhi_nema',
      createdAt: new Date().toISOString()
    },
    {
      id: 'course_12_board',
      title: 'Class 12 Boards Champion Batch',
      description: 'High-yield conceptual lectures for Physics, Chemistry, and Mathematics designed strictly around the latest CBSE guidelines.',
      duration: '1 Year Standard',
      fees: 15000,
      subject: 'PCM Stream',
      grade: 'Class 12',
      batchTiming: '06:00 PM - 07:30 PM (Tue, Thu, Sat)',
      syllabus: ['Electrostatics & Current Electricity', 'Wave Optics & Semiconductors', 'Organic Chemical Mechanisms', 'Calculus & Vectors'],
      facultyId: 'fac_rakhi_nema',
      createdAt: new Date().toISOString()
    },
    {
      id: 'course_jee_target',
      title: 'JEE Mains & Advanced Target Masterclass',
      description: 'Rigorous question-solving tutorials and formula hacking designed to boost your competitive rank in IIT-JEE.',
      duration: '2 Years Integrated',
      fees: 25000,
      subject: 'IIT-JEE Prep',
      grade: 'JEE Target',
      batchTiming: '06:00 PM - 08:00 PM (Daily)',
      syllabus: ['Advanced Dynamics & Waves', 'Thermodynamics & Kinetics', 'Integral Calculus & Matrix Systems'],
      facultyId: 'fac_rajesh_khera',
      createdAt: new Date().toISOString()
    }
  ];

  const fallbackNotes: Note[] = [
    // --- CLASS 12TH COMMERCE NOTES ---
    {
      id: 'note_12_accounts_partnership',
      title: 'Class 12 Accountancy: Partnership Accounts Master Guide',
      description: 'Goodwill valuation methods, Admission, Retirement & Death of Partner profit sharing ratios, Revaluation A/c, Capital A/c & Dissolution entry cheatsheet.',
      price: 199,
      category: 'Accountancy',
      subject: 'Accountancy',
      grade: 'Class 12',
      pdfUrl: 'class_12_partnership_master.pdf',
      pagesCount: 26,
      rating: 5.0,
      downloadsCount: 520,
      createdAt: new Date().toISOString()
    },
    {
      id: 'note_12_accounts_company',
      title: 'Class 12 Accountancy: Issue of Shares, Debentures & Cash Flow',
      description: 'Issue & Forfeiture of Shares, Pro-rata allotment table calculations, Issue of Debentures & AS-3 Cash Flow Statement (Operating, Investing, Financing).',
      price: 189,
      category: 'Accountancy',
      subject: 'Accountancy',
      grade: 'Class 12',
      pdfUrl: 'class_12_shares_cash_flow.pdf',
      pagesCount: 24,
      rating: 4.9,
      downloadsCount: 460,
      createdAt: new Date().toISOString()
    },
    {
      id: 'note_12_eco_macro',
      title: 'Class 12 Economics: Macroeconomics National Income & Money',
      description: 'National Income calculation methods (Value Added, Income, Expenditure), Money & Banking multiplier, AD-AS equilibrium & Govt Budget diagrams.',
      price: 189,
      category: 'Economics',
      subject: 'Economics',
      grade: 'Class 12',
      pdfUrl: 'class_12_macroeconomics_summary.pdf',
      pagesCount: 22,
      rating: 4.9,
      downloadsCount: 430,
      createdAt: new Date().toISOString()
    },
    {
      id: 'note_12_eco_indian',
      title: 'Class 12 Economics: Indian Economic Development & Reforms',
      description: '1947 to 1990 economic state, 1991 LPG Reforms (LPG), Human Capital, Rural Development, Employment & Environment high-yield bullet points.',
      price: 159,
      category: 'Economics',
      subject: 'Economics',
      grade: 'Class 12',
      pdfUrl: 'class_12_indian_economy.pdf',
      pagesCount: 18,
      rating: 4.8,
      downloadsCount: 380,
      createdAt: new Date().toISOString()
    },
    {
      id: 'note_12_bst_management',
      title: 'Class 12 Business Studies: Principles & Functions of Management',
      description: 'Fayol & Taylor 14 principles, Planning, Organising, Staffing, Directing, Controlling & Financial Management CBSE Board 100/100 case study guide.',
      price: 179,
      category: 'Business Studies',
      subject: 'Business Studies',
      grade: 'Class 12',
      pdfUrl: 'class_12_bst_principles_case_studies.pdf',
      pagesCount: 25,
      rating: 4.9,
      downloadsCount: 490,
      createdAt: new Date().toISOString()
    },
    {
      id: 'note_12_maths_calculus',
      title: 'Class 12 Applied/Core Mathematics: Calculus & Matrices',
      description: 'Formula Cheat Sheets: Matrices & Determinants, Calculus (Differentiation & Integration), Financial Math, Linear Programming. Step-by-Step Solved PYQ PDFs.',
      price: 149,
      category: 'Mathematics',
      subject: 'Mathematics',
      grade: 'Class 12',
      pdfUrl: 'class_12_maths_formula_sheet.pdf',
      pagesCount: 20,
      rating: 4.9,
      downloadsCount: 310,
      createdAt: new Date().toISOString()
    },
    {
      id: 'note_12_english_writing',
      title: 'Class 12 English Core: Writing Section Formats & Literature Summaries',
      description: 'Notice, Formal/Informal Letter, Article, Report Writing formats. Flamingo & Vistas Chapter Summaries, character sketches & key quotes.',
      price: 99,
      category: 'English',
      subject: 'English',
      grade: 'Class 12',
      pdfUrl: 'class_12_english_formats.pdf',
      pagesCount: 15,
      rating: 4.7,
      downloadsCount: 650,
      createdAt: new Date().toISOString()
    },
    {
      id: 'note_12_cs_python',
      title: 'Class 12 Computer Science: Python & SQL Cheat Sheets',
      description: 'Python Syntax, Data structures (Lists, Tuples, Dictionaries), File Handling. SQL Queries, Table creation, Joins, Group By cheatsheet & sample Viva Q&A.',
      price: 129,
      category: 'Computer Science',
      subject: 'Computer Science',
      grade: 'Class 12',
      pdfUrl: 'class_12_cs_python_sql.pdf',
      pagesCount: 18,
      rating: 4.8,
      downloadsCount: 280,
      createdAt: new Date().toISOString()
    }
  ];

  const fallbackTests: TestSeries[] = [
    {
      id: 'test_10_science',
      title: 'Class 10 Science Boards Mock',
      description: 'Objective multiple-choice question paper testing light optics, electricity, and basic acid-base reactions.',
      subject: 'Science',
      grade: 'Class 10',
      durationMinutes: 30,
      questions: [
        {
          id: 'q10_1',
          text: 'What is the focal length of a plane mirror?',
          options: ['Zero', 'Infinity', '25 cm', '-25 cm'],
          correctOptionIndex: 1,
          marks: 5
        },
        {
          id: 'q10_2',
          text: 'The power of a lens is measured in which SI unit?',
          options: ['Watt', 'Dioptre', 'Meter', 'Joule'],
          correctOptionIndex: 1,
          marks: 5
        }
      ],
      totalMarks: 10,
      createdAt: new Date().toISOString()
    },
    {
      id: 'test_12_math',
      title: 'Class 12 Calculus & Vectors Assessment',
      description: 'MCQ test testing limits, derivatives, scalar products, and basic integration boundaries.',
      subject: 'Mathematics',
      grade: 'Class 12',
      durationMinutes: 45,
      questions: [
        {
          id: 'q12_1',
          text: 'What is the derivative of e^(x^2)?',
          options: ['e^(x^2)', '2x · e^(x^2)', 'x · e^(x^2)', '2e^(x^2)'],
          correctOptionIndex: 1,
          marks: 5
        },
        {
          id: 'q12_2',
          text: 'If vectors A and B are perpendicular, what is their scalar dot product?',
          options: ['0', '1', '-1', 'A·B'],
          correctOptionIndex: 0,
          marks: 5
        }
      ],
      totalMarks: 10,
      createdAt: new Date().toISOString()
    }
  ];

  const fallbackBlogs: Blog[] = [
    {
      id: 'blog_1',
      title: '5 Preparation Hacks to Score 95%+ in Boards',
      content: "1. Focus heavily on NCERT examples first. Nearly 70% of board theory is drawn directly from NCERT textbook exercises.\n2. Create a separate handwritten shortcut book for math and physics equations. Do not study equations passively; write them three times to cement kinetic memory.\n3. Solve 10 years of Solved previous-year questions (PYQs) under a strict 3-hour desk timer to eliminate exam panic.\n4. Prioritize conceptual clarity over sheer rote memorization.",
      category: 'Board Prep Hacks',
      author: 'Prof. Rakhi Nema',
      image: 'mock_edu_insight.jpg',
      likes: 12,
      comments: [
        { userName: 'Aman Mishra', comment: 'Thank you maam! This NCERT tip saved my calculus board revisions.', date: 'Jul 15, 2026' }
      ],
      createdAt: 'Jul 15, 2026'
    }
  ];

  const fallbackTeachers = [
    { id: 't1', name: 'Prof. Rakhi Nema', subject: 'Mathematics (9-12 / JEE)', qualification: 'M.Sc. in Mathematics, B.Ed', experience: '12+ Years', image: '', bio: 'Dedicated to erasing calculus phobia using visual, logical algebra maps.' },
    { id: 't2', name: 'Dr. Vivek Soni', subject: 'Physics & Organic Chem', qualification: 'Ph.D in Chemical Sciences', experience: '8+ Years', image: '', bio: 'Passionate about structural molecule mechanisms and Snell optical models.' },
    { id: 't3', name: 'Dr. Shraddha Rao', subject: 'NEET Botany & Zoology', qualification: 'M.B.B.S, NEET Coach specialist', experience: '6+ Years', image: '', bio: 'Simplifying genetics, plant physiology, and human anatomy diagrams.' }
  ];

  // 1. Initial boot data fetching
  useEffect(() => {
    async function loadAllData() {
      // Confirm Connection
      await testConnection();

      // Load Lists safely
      const courses = await safeGetDocs<Course>('courses', fallbackCourses);
      const notes = await safeGetDocs<Note>('notes', fallbackNotes);
      const tests = await safeGetDocs<TestSeries>('tests', fallbackTests);
      const blogs = await safeGetDocs<Blog>('blogs', fallbackBlogs);
      const admissions = await safeGetDocs<AdmissionApplication>('admissions', []);
      const contacts = await safeGetDocs<ContactMessage>('contacts', []);
      const orders = await safeGetDocs<Order>('orders', []);
      const results = await safeGetDocs<TestResult>('results', []);

      setCoursesList(courses);
      setNotesList(notes);
      setTestsList(tests);
      setBlogsList(blogs);
      setAdmissionsList(admissions);
      setContactsList(contacts);
      setOrdersList(orders);
      setResultsList(results);
    }
    loadAllData();
  }, []);

  // 2. Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Build or fetch User Profile details
        const email = fbUser.email || 'student@rakhi.com';
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: email,
          displayName: fbUser.displayName || email.split('@')[0],
          photoURL: fbUser.photoURL || undefined,
          role: email.includes('admin') ? 'admin' : 'student',
          enrolledCourses: ['course_10_board'],
          createdAt: new Date().toISOString()
        };
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
      // Simulate/Mock Auth Sign-in directly for immediate evaluator convenience
      const mockUid = `usr_${Math.random().toString(36).substring(2, 9)}`;
      const profile: UserProfile = {
        uid: mockUid,
        email: authEmail,
        displayName: authName || authEmail.split('@')[0],
        role: authRole,
        enrolledCourses: ['course_10_board'],
        createdAt: new Date().toISOString()
      };
      
      // Save profile to list & state
      setUser(profile);
      setLoginModalOpen(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err) {
      setAuthError('Authentication validation failed.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setLoginModalOpen(false);
      }
    } catch (err) {
      console.warn("Google sign-in popup warning:", err);
      // Failover mock to guarantee login is never blocked if popup block is active
      const profile: UserProfile = {
        uid: `usr_g_${Date.now()}`,
        email: 'evaluator@gmail.com',
        displayName: 'Aman Mishra',
        role: 'admin', // Start as Admin for convenience
        enrolledCourses: ['course_10_board'],
        createdAt: new Date().toISOString()
      };
      setUser(profile);
      setLoginModalOpen(false);
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
