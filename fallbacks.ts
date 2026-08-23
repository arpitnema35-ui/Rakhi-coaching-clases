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
