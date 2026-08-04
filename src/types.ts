export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'admin' | 'teacher';
  phone?: string;
  grade?: string;
  enrolledCourses?: string[]; // Course IDs
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  fees: number;
  subject: string;
  grade: string;
  batchTiming: string;
  syllabus: string[];
  facultyId: string;
  image?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  image: string;
  bio?: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string; // e.g. "Class 10 Physics", "NEET Chemistry"
  subject: string;
  grade: string;
  pdfUrl: string; // Mock or real URL
  pagesCount: number;
  rating: number;
  downloadsCount: number;
  image?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  expiryDate: string;
  minOrderValue: number;
  active: boolean;
}

export interface CartItem {
  note: Note;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: {
    noteId: string;
    noteTitle: string;
    price: number;
  }[];
  totalAmount: number;
  couponApplied?: string;
  discountAmount: number;
  finalAmount: number;
  paymentId: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  explanation?: string;
}

export interface TestSeries {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  questions: Question[];
  totalMarks: number;
  createdAt: string;
}

export interface TestResult {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  testId: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpentSeconds: number;
  answers: { [questionId: string]: number }; // questionId -> selectedOptionIndex
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  image: string;
  likes: number;
  comments: {
    userName: string;
    comment: string;
    date: string;
  }[];
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkTo: string;
  active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface AdmissionApplication {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  courseId: string;
  previousMarks: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  videoUrl: string;
  duration: string;
  teacherName: string;
  thumbnail: string;
  chapter: string;
  isFree: boolean;
  viewsCount: number;
  pdfNotesId?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  studentName: string;
  email: string;
  grade?: string;
  rating: number;
  category: string;
  message: string;
  recommend: boolean;
  createdAt: string;
}

export interface AppSettings {
  websiteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsappNumber: string;
  razorpayKeyId: string;
}
