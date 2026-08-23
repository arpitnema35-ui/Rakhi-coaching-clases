import { Course, Note, TestSeries, Blog } from './types';

export const fallbackCourses: Course[] = [
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

export const fallbackNotes: Note[] = [
  {
    id: 'note_12_accounts_partnership',
    title: 'Class 12 Accountancy: Partnership Accounts Master Guide',
    description: 'Goodwill valuation methods, Admission, Retirement & Death of Partner profit sharing ratios, Revaluation A/c, Capital A/c & Dissolution entry cheatsheet.',
    price: 199,
    category: 'Accountancy',
    subject: 'Accountancy',
    grade: 'Class 12',
    pdfUrl: 'class_12_accounts_partnership.pdf',
    pagesCount: 25,
    rating: 4.9,
    downloadsCount: 1205,
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
    pdfUrl: 'class_12_accounts_company.pdf',
    pagesCount: 30,
    rating: 4.8,
    downloadsCount: 950,
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
    pdfUrl: 'class_12_eco_macro.pdf',
    pagesCount: 22,
    rating: 4.9,
    downloadsCount: 880,
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
    pdfUrl: 'class_12_eco_indian.pdf',
    pagesCount: 18,
    rating: 4.7,
    downloadsCount: 710,
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
    pdfUrl: 'class_12_bst_management.pdf',
    pagesCount: 35,
    rating: 4.9,
    downloadsCount: 1100,
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

export const fallbackTests: TestSeries[] = [
  {
    id: 'test_12_boards_full',
    title: 'Class 12 CBSE Board Predictor Mock Test',
    description: '3-Hour Full Syllabus CBT. Strictly based on latest CBSE sample paper pattern. Includes instant detailed analytical report.',
    price: 49,
    subject: 'All Subjects',
    grade: 'Class 12',
    durationMinutes: 180,
    totalQuestions: 100,
    participantsCount: 4500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'test_10_science_mcq',
    title: 'Class 10 Science MCQ Sprint',
    description: 'Quick 30-minute revision covering highly repeated MCQs from Chemistry & Physics.',
    price: 0,
    subject: 'Science',
    grade: 'Class 10',
    durationMinutes: 30,
    totalQuestions: 40,
    participantsCount: 8200,
    createdAt: new Date().toISOString()
  }
];

export const fallbackBlogs: Blog[] = [
  {
    id: 'blog_1',
    title: 'How to score 95%+ in Class 12 Boards (Last 3 Months Strategy)',
    excerpt: 'Detailed week-by-week planner for CBSE board aspirants focusing on high-weightage chapters.',
    content: 'Long form content here...',
    author: 'Rakhi Nema',
    date: 'Oct 15, 2023',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'blog_2',
    title: 'JEE Mains vs Advanced: Understanding the difference in preparation',
    excerpt: 'Stop preparing for both the same way. Understand the conceptual depth vs speed tradeoff.',
    content: 'Long form content here...',
    author: 'Rajesh Khera',
    date: 'Oct 10, 2023',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

export const fallbackTeachers = [
  { id: 't1', name: 'Rakhi Nema', subject: 'Maths & Commerce', qualification: 'M.Com, B.Ed, 10+ Years Exp.', experience: '10+ Years', image: '', bio: 'Expert in bridging concepts with real-world applications.' },
  { id: 't2', name: 'Rajesh Khera', subject: 'Physics & JEE Advanced', qualification: 'B.Tech IIT Delhi, Ex-FIITJEE', experience: '8+ Years', image: '', bio: 'Specialist in advanced mechanics and competitive problem solving.' },
  { id: 't3', name: 'Dr. Shraddha Rao', subject: 'NEET Botany & Zoology', qualification: 'M.B.B.S, NEET Coach specialist', experience: '6+ Years', image: '', bio: 'Simplifying genetics, plant physiology, and human anatomy diagrams.' }
];
