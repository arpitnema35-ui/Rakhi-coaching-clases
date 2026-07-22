import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  User, 
  Trophy, 
  Printer, 
  FileCheck,
  X,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TestSeries, Question, TestResult, UserProfile } from '../types';

interface OnlineTestSeriesProps {
  testsList: TestSeries[];
  user: UserProfile | null;
  onSaveResult: (result: Omit<TestResult, 'id' | 'createdAt'>) => Promise<string>;
  onLoginClick: () => void;
  resultsList: TestResult[];
}

export default function OnlineTestSeries({
  testsList,
  user,
  onSaveResult,
  onLoginClick,
  resultsList
}: OnlineTestSeriesProps) {
  
  // States
  const [activeTest, setActiveTest] = useState<TestSeries | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [activeTestResult, setActiveTestResult] = useState<TestResult | null>(null);
  const [isTestSubmitting, setIsTestSubmitting] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeTest || activeTestResult) return;

    if (timeLeftSeconds <= 0) {
      handleAutoSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTest, timeLeftSeconds, activeTestResult]);

  const handleStartTest = (test: TestSeries) => {
    if (!user) {
      onLoginClick();
      return;
    }
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeftSeconds(test.durationMinutes * 60);
    setActiveTestResult(null);
  };

  const handleOptionSelect = (questionId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleAutoSubmit = () => {
    if (activeTestResult) return;
    handleSubmitTest(true);
  };

  const handleSubmitTest = async (isAuto = false) => {
    if (!activeTest || !user) return;
    setIsTestSubmitting(true);

    let score = 0;
    let correct = 0;
    let wrong = 0;

    activeTest.questions.forEach(q => {
      const selected = selectedAnswers[q.id];
      if (selected === q.correctOptionIndex) {
        score += q.marks;
        correct += 1;
      } else if (selected !== undefined) {
        wrong += 1;
      }
    });

    const totalMarks = activeTest.totalMarks;
    const percentage = Math.round((score / totalMarks) * 100);

    const resultData: Omit<TestResult, 'id' | 'createdAt'> = {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      testId: activeTest.id,
      testTitle: activeTest.title,
      score,
      totalMarks,
      percentage,
      correctAnswers: correct,
      wrongAnswers: wrong,
      timeSpentSeconds: (activeTest.durationMinutes * 60) - timeLeftSeconds,
      answers: selectedAnswers
    };

    try {
      const resultId = await onSaveResult(resultData);
      setActiveTestResult({
        id: resultId,
        createdAt: new Date().toISOString(),
        ...resultData
      });
    } catch (err) {
      console.error("Test submission failed:", err);
    } finally {
      setIsTestSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pre-configured dynamic leaderboard based on mock + real results
  const mockLeaderboard = [
    { name: 'Aman Mishra', score: '95/100', rank: 1, grade: 'Class 12' },
    { name: 'Sneha Patel', score: '92/100', rank: 2, grade: 'JEE Prep' },
    { name: 'Rajesh Khera', score: '88/100', rank: 3, grade: 'Class 10' },
    { name: 'Shruti Sen', score: '85/100', rank: 4, grade: 'NEET Prep' },
  ];

  return (
    <div id="test-series-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ------------------ ACTIVE MCQ TEST SCREEN ------------------ */}
      {activeTest && !activeTestResult && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
          
          {/* Active Test Header */}
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-teal-500 text-white font-mono text-[9px] font-bold rounded uppercase tracking-wider">
                {activeTest.subject} • {activeTest.grade}
              </span>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-none">{activeTest.title}</h3>
            </div>

            {/* Countdown timer */}
            <div className={`px-4 py-2 rounded-xl flex items-center space-x-2 border font-mono font-black text-sm shrink-0 ${timeLeftSeconds < 60 ? 'bg-red-500/10 text-red-500 border-red-500/35 animate-pulse' : 'bg-teal-500/10 text-teal-400 border-teal-500/30'}`}>
              <Clock size={16} />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Test Questions Area & Navigator Split */}
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
            
            {/* Question Card Content */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
              {activeTest.questions.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">QUESTION {currentQuestionIndex + 1} OF {activeTest.questions.length}</span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {activeTest.questions[currentQuestionIndex].text}
                    </h4>
                  </div>

                  {/* MCQ Options list */}
                  <div className="space-y-2.5 pt-2">
                    {activeTest.questions[currentQuestionIndex].options.map((option, oIdx) => {
                      const isSelected = selectedAnswers[activeTest.questions[currentQuestionIndex].id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionSelect(activeTest.questions[currentQuestionIndex].id, oIdx)}
                          className={`w-full text-left p-4 rounded-xl text-xs font-semibold flex items-center space-x-3 border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-400' 
                              : 'bg-slate-50/50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono shrink-0 font-black">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Hop Navigator Sidebar */}
            <div className="w-full md:w-64 p-6 overflow-y-auto space-y-6 bg-slate-50/40 dark:bg-slate-950/20 shrink-0">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider block">QUESTION NAVIGATOR</span>
                <div className="grid grid-cols-5 gap-2">
                  {activeTest.questions.map((q, idx) => {
                    const isSelected = currentQuestionIndex === idx;
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center font-mono cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isAnswered
                              ? 'bg-teal-500/10 border border-teal-500 text-teal-600 dark:text-teal-400'
                              : 'bg-slate-200/55 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-transparent'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
                <div className="flex gap-2">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer text-center"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentQuestionIndex === activeTest.questions.length - 1}
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer text-center"
                  >
                    Next
                  </button>
                </div>

                <button
                  onClick={() => handleSubmitTest(false)}
                  disabled={isTestSubmitting}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors text-center"
                >
                  {isTestSubmitting ? 'Submitting Test...' : 'Finish & Submit Test'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------ TEST COMPLETED RESULTS SCREEN ------------------ */}
      {activeTestResult && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/40 text-teal-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Mock Test Completed!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your answers have been processed. Verifiable excellence credentials have been recorded to your Student profile.
              </p>
            </div>
          </div>

          {/* Performance stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950/35 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">YOUR SCORE</span>
              <p className="text-xl font-mono font-black text-slate-950 dark:text-white mt-1">
                {activeTestResult.score} / {activeTestResult.totalMarks}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">PERCENTAGE</span>
              <p className="text-xl font-mono font-black text-teal-600 dark:text-teal-400 mt-1">
                {activeTestResult.percentage}%
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">CORRECT ANSWERS</span>
              <p className="text-xl font-mono font-black text-green-600 mt-1">
                {activeTestResult.correctAnswers}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">WRONG / SKIPPED</span>
              <p className="text-xl font-mono font-black text-red-500 mt-1">
                {activeTestResult.wrongAnswers}
              </p>
            </div>
          </div>

          {/* Award digital certificate generation trigger */}
          {activeTestResult.percentage >= 60 && (
            <div className="p-6 bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-slate-950/40 dark:to-slate-850 p-6 rounded-2xl border border-teal-100/30 dark:border-teal-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-950 dark:text-white flex items-center gap-1.5">
                  <Award size={14} className="text-teal-500" />
                  <span>Excellence Certificate Unlocked!</span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  You secured above 60% which qualifies you for the official Rakhi Coaching verifiable diploma.
                </p>
              </div>
              <button
                onClick={() => setIsCertificateModalOpen(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors"
              >
                Generate Award Diploma
              </button>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <button
              onClick={() => setActiveTest(null)}
              className="px-6 py-2 bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 text-white text-xs font-medium rounded-xl cursor-pointer"
            >
              Back to Test Series Listing
            </button>
          </div>

        </div>
      )}

      {/* ------------------ STANDARD TEST SERIES LIST VIEW ------------------ */}
      {!activeTest && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Listings Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Active Assessments</h2>
              <p className="text-xs text-slate-400">Select any board-standard or competitive assessment below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testsList.map((test) => (
                <div 
                  key={test.id}
                  className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[9px] font-mono font-bold rounded uppercase border border-indigo-500/25">
                        {test.subject}
                      </span>
                      <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-mono">
                        <Clock size={11} />
                        <span>{test.durationMinutes} Min</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm text-white leading-tight">{test.title}</h3>
                      <p className="text-[10px] text-slate-500">{test.grade} • {test.questions.length} Objective MCQs</p>
                    </div>

                    <p className="text-xs text-slate-400">{test.description}</p>
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex items-center justify-between mt-6">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold">TOTAL MARKS</span>
                      <span className="text-xs font-extrabold text-white font-mono">{test.totalMarks} Marks</span>
                    </div>
                    <button
                      onClick={() => handleStartTest(test)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      Start Mock Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Leaderboard Panel */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-md space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center space-x-2">
                <Trophy size={16} className="text-amber-500" />
                <h3 className="font-bold text-sm text-white">Active Leaderboard</h3>
              </div>

              <div className="space-y-3">
                {mockLeaderboard.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center space-x-3">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] ${idx === 0 ? 'bg-amber-500/20 text-amber-300' : idx === 1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                        {student.rank}
                      </span>
                      <div>
                        <h4 className="font-bold text-white">{student.name}</h4>
                        <p className="text-[9px] text-slate-500">{student.grade}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-indigo-400">{student.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ------------------ VERIFIABLE EXCELLENCE DIPLOMA MODAL ------------------ */}
      <AnimatePresence>
        {isCertificateModalOpen && activeTestResult && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close Diploma"
              >
                <X size={20} />
              </button>

              {/* Certificate Canvas Mock */}
              <div id="certificate-print-area" className="border-8 border-double border-teal-500/20 bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 rounded-2xl text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                  <Award size={200} className="text-teal-500" />
                </div>

                <div className="space-y-1">
                  <GraduationCap size={44} className="text-teal-500 mx-auto" />
                  <p className="font-mono text-[9px] font-bold text-teal-600 dark:text-teal-400 tracking-widest uppercase">RAKHI COACHING CLASSES</p>
                  <p className="text-[7px] text-slate-400 font-mono -mt-1">ESTD 2018 • DELHI NCR • LEARN SMART, SCORE BETTER</p>
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif italic text-2xl sm:text-3xl text-slate-850 dark:text-slate-100">Certificate of Excellence</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">THIS DIPLOMA IS PROUDLY GRANTED TO</p>
                </div>

                <div className="border-b-2 border-dashed border-slate-300 dark:border-slate-700/60 w-3/4 mx-auto py-1">
                  <p className="font-sans font-black text-lg sm:text-2xl text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    {activeTestResult.userName}
                  </p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  for successfully scoring an outstanding score of <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{activeTestResult.score}/{activeTestResult.totalMarks} ({activeTestResult.percentage}%)</span> in the official board preparation evaluation <span className="font-bold text-slate-800 dark:text-slate-200">"{activeTestResult.testTitle}"</span>.
                </p>

                {/* Footers of certificate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-[10px] text-slate-400 items-end">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="font-bold text-slate-650 dark:text-slate-300 font-mono">CODE: RAK-{activeTestResult.id.substring(0, 8).toUpperCase()}</p>
                    <p className="text-[8px]">Verifiable Ledger ID</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center">
                      {/* Mock verifiable QR code */}
                      <div className="grid grid-cols-4 gap-0.5 w-10 h-10">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 ${(i % 3 === 0 || i % 5 === 0) ? 'bg-slate-950' : 'bg-transparent'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-center sm:text-right">
                    <p className="font-serif italic font-bold text-slate-700 dark:text-slate-300 text-xs">Prof. Rakhi Nema</p>
                    <p className="text-[8px] border-t border-slate-200 dark:border-slate-800 pt-1">Institutional Chairperson</p>
                  </div>
                </div>
              </div>

              {/* Action utilities */}
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Close Window</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
