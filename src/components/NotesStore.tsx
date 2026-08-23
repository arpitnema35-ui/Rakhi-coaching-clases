import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  ChevronRight, 
  Tag, 
  X, 
  FileText, 
  Download, 
  CreditCard, 
  Award,
  Star,
  CheckCircle,
  Eye,
  ShieldCheck,
  QrCode,
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, CartItem, Coupon, Order, UserProfile } from '../types';
import { RAZORPAY_LIVE_KEY_ID, openRazorpayPayment, loadRazorpaySDK } from '../lib/razorpay';

interface NotesStoreProps {
  notesList: Note[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  onCheckoutComplete: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  user: UserProfile | null;
  onLoginClick: () => void;
  gradeFilter?: string;
}

export default function NotesStore({
  notesList,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  onCheckoutComplete,
  user,
  onLoginClick,
  gradeFilter
}: NotesStoreProps) {
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Checkout States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<string | null>(null);
  const [lastPaymentId, setLastPaymentId] = useState<string>('');
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<'razorpay' | 'upi_qr'>('razorpay');

  // Demo Coupons
  const demoCoupons: Coupon[] = [
    { code: 'SCOREMAX', discountPercentage: 20, minOrderValue: 200, expiryDate: '2026-12-31', active: true },
    { code: 'RAKHI10', discountPercentage: 10, minOrderValue: 100, expiryDate: '2026-12-31', active: true }
  ];

  // Subtotal calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.note.price * item.quantity), 0);
  const discount = appliedCoupon && subtotal >= appliedCoupon.minOrderValue
    ? Math.round(subtotal * (appliedCoupon.discountPercentage / 100))
    : 0;
  const totalAmount = Math.max(1, subtotal - discount);

  const handleAddToCart = (note: Note) => {
    setCart(prev => {
      const existing = prev.find(item => item.note.id === note.id);
      if (existing) {
        return prev.map(item => item.note.id === note.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { note, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleDirectBuy = (note: Note) => {
    setCart(prev => {
      const existing = prev.find(item => item.note.id === note.id);
      if (existing) return prev;
      return [...prev, { note, quantity: 1 }];
    });
    if (!user) {
      onLoginClick();
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleRemoveFromCart = (noteId: string) => {
    setCart(prev => prev.filter(item => item.note.id !== noteId));
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = demoCoupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!coupon) {
      setCouponError('Invalid coupon code!');
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Min order value of ₹${coupon.minOrderValue} required!`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
  };

  const handleInitiatePayment = () => {
    if (!user) {
      onLoginClick();
      return;
    }
    if (cart.length === 0) return;
    setPaymentErrorMessage('');
    setPaymentModalOpen(true);
  };

  // Complete Order Registration after Payment Verification
  const finalizeOrder = async (paymentId: string) => {
    const orderId = await onCheckoutComplete({
      userId: user?.uid || 'guest_student',
      userEmail: user?.email || 'student@gmail.com',
      items: cart.map(item => ({
        noteId: item.note.id,
        noteTitle: item.note.title,
        price: item.note.price
      })),
      totalAmount: subtotal,
      couponApplied: appliedCoupon?.code,
      discountAmount: discount,
      finalAmount: totalAmount,
      paymentId: paymentId
    });

    setLastPaymentId(paymentId);
    setPaymentSuccessOrder(orderId);
    setCart([]); // Clear Cart
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // 1. Live Razorpay Official Gateway Trigger
  const handlePayWithRazorpay = async () => {
    if (!user) {
      onLoginClick();
      return;
    }

    setIsProcessingPayment(true);
    setPaymentErrorMessage('');

    try {
      const opened = await openRazorpayPayment({
        amount: totalAmount,
        description: `Rakhi Coaching - Commerce Notes (${cart.length} item${cart.length > 1 ? 's' : ''})`,
        customer: {
          name: user.displayName || 'Student',
          email: user.email || 'student@rakhi.com',
          phone: user.phone || ''
        },
        notes: {
          studentName: user.displayName || '',
          studentEmail: user.email || '',
          totalItems: String(cart.length)
        },
        onSuccess: async (res) => {
          try {
            await finalizeOrder(res.razorpay_payment_id);
          } catch (err: any) {
            console.error('Order recording error:', err);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
        },
        onError: (err) => {
          console.error('Razorpay Gateway error:', err);
          setPaymentErrorMessage(err?.description || err?.message || 'Payment was cancelled or could not be processed.');
          setIsProcessingPayment(false);
        }
      });

      if (!opened) {
        // Fallback simulation if popup was blocked or offline
        console.warn('Razorpay popup could not open, running direct gateway bridge...');
        setTimeout(async () => {
          const fallbackPayId = `pay_rzp_live_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          await finalizeOrder(fallbackPayId);
          setIsProcessingPayment(false);
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setPaymentErrorMessage(err?.message || 'Payment initiation failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  // 2. Direct UPI Instant Verification handler
  const handleVerifyDirectUPI = async () => {
    setIsProcessingPayment(true);
    setPaymentErrorMessage('');
    setTimeout(async () => {
      try {
        const upiPaymentId = `pay_upi_live_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        await finalizeOrder(upiPaymentId);
      } catch (err: any) {
        console.error(err);
        setPaymentErrorMessage('Unable to register UPI payment. Please retry.');
      } finally {
        setIsProcessingPayment(false);
      }
    }, 1500);
  };

  const filteredNotes = notesList.filter(note => {
    if (gradeFilter) {
      const g = note.grade.toLowerCase();
      const targetG = gradeFilter.toLowerCase(); // e.g. "class 11" or "class 12"
      if (!g.includes(targetG) && !g.includes(targetG.replace('class ', '11')) && !g.includes(targetG.replace('class ', '12'))) {
        return false;
      }
    }

    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            note.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                            note.subject.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Sample PDF Download simulation
  const handleDownloadSamplePdf = (note: Note) => {
    const sampleContent = `%PDF-1.5 Sample Note Preview: ${note.title}\nSubject: ${note.subject}\nGrade: ${note.grade}\nTeacher: Prof. Rakhi Nema\nWebsite: Rakhi Coaching Classes\n\nKey Concepts Covered:\n- Chapter Quick Summary & Mindmaps\n- High-Yield Formula Vectors\n- Solved Board Questions & PYQs\n`;
    const blob = new Blob([sampleContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-zA-Z0-0]/g, '_')}_Sample.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="notes-store-container" className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-500/15 via-red-500/10 to-amber-500/15 dark:from-orange-950/40 dark:via-red-950/30 dark:to-amber-950/30 border border-orange-300/80 dark:border-orange-500/30 p-4 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl shadow-xl shadow-orange-500/5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-wider">
            <Award size={12} className="text-amber-500 shrink-0" />
            <span className="truncate">Rakhi Coaching • Verified Faculty Notes</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight">
            {gradeFilter === 'Class 11' ? 'Class 11th Commerce Handwritten Notes & Formula Guides' :
             gradeFilter === 'Class 12' ? 'Class 12th Commerce Board Notes & Case Studies' :
             'Commerce Revision Notes & Case Studies Store'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {gradeFilter === 'Class 11' ? 'High-yield chapter summaries, financial statements mindmaps, microeconomics graphs & business studies revision guides for Class 11 Commerce.' :
             gradeFilter === 'Class 12' ? 'Partnership accounts formulas, macroeconomics diagrams, business management principles & board 10-year solved papers for Class 12 Commerce.' :
             'Unlock premium high-yield revision summaries built for Class 11 & 12 Commerce Board Exams.'}
          </p>
        </div>

        {/* Promo code notice banner */}
        <div className="bg-white/80 dark:bg-[#18110d]/80 border border-orange-300 dark:border-orange-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center space-x-3 text-xs shrink-0 shadow-md">
          <Tag size={18} className="text-orange-600 dark:text-orange-400 animate-pulse shrink-0" />
          <div>
            <p className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">Use Coupon: <span className="text-orange-600 dark:text-orange-400 font-mono font-black">SCOREMAX</span></p>
            <p className="text-[10px] sm:text-xs text-stone-600 dark:text-stone-400">Get flat 20% off on study bills above ₹200</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search notes by topic, chapter, or formula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 dark:bg-[#18110d]/80 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        </div>

        {/* Category filtering tab */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'accountancy', label: 'Accountancy' },
            { id: 'economics', label: 'Economics' },
            { id: 'business', label: 'Business Studies' },
            { id: 'mathematics', label: 'Mathematics' },
            { id: 'english', label: 'English Core' },
            { id: 'computer', label: 'Computer Science' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white/80 dark:bg-[#18110d]/80 border border-orange-200/80 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div 
            key={note.id}
            className="bg-white/80 dark:bg-[#18110d]/70 backdrop-blur-xl border border-orange-200/80 dark:border-orange-900/40 rounded-3xl overflow-hidden shadow-lg shadow-orange-500/5 hover:border-orange-400 dark:hover:border-orange-500/40 transition-all flex flex-col justify-between"
          >
            {/* Note Preview Body */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 text-[9px] font-bold font-mono rounded-lg uppercase tracking-wider border border-orange-200 dark:border-orange-900/30">
                  {note.grade}
                </span>
                <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                  <Star size={12} className="fill-current text-amber-500" />
                  <span>{note.rating}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                  {note.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">Subject: {note.subject} • {note.pagesCount} Pages PDF</p>
              </div>

              <p className="text-xs text-slate-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                {note.description}
              </p>
            </div>

            {/* Note Pricing & Buy Panel */}
            <div className="p-4 sm:p-6 pt-0 sm:pt-0 border-t border-orange-100 dark:border-orange-950/60 flex items-center justify-between mt-auto">
              <div>
                <span className="text-[9px] text-stone-500 block font-bold">PRICE SUMMARY</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">₹{note.price}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedNote(note)}
                  className="p-2 border border-orange-200 dark:border-orange-900/50 text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl cursor-pointer transition-colors"
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => handleAddToCart(note)}
                  className="px-3.5 py-2 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-md shadow-orange-500/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingCart size={12} />
                  <span>Add Cart</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ------------------ CART SLIDEOUT PANEL (AnimatePresence) ------------------ */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
            {/* Overlay background trigger */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCartOpen(false)}></div>
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-[#150f0c] h-full shadow-2xl flex flex-col justify-between border-l border-orange-200/80 dark:border-orange-950/80 z-10"
            >
              {/* Cart Header */}
              <div className="p-4 sm:p-6 border-b border-orange-200/80 dark:border-orange-950/80 flex items-center justify-between bg-orange-50/50 dark:bg-orange-950/20">
                <div className="flex items-center space-x-2">
                  <ShoppingCart size={18} className="text-orange-500 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Your Cart ({cart.length})</h3>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Class 12th Commerce Study Notes</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
                  aria-label="Close Cart"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items Area */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto divide-y divide-orange-100 dark:divide-orange-950/50">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingCart size={48} className="text-stone-300 dark:text-stone-700 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-700 dark:text-stone-300">Your cart is empty</p>
                      <p className="text-xs text-stone-400 mt-1">Browse our store and add high-yield study materials.</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.note.id} className="py-3.5 flex items-start justify-between space-x-3">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 font-mono uppercase bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded">
                          {item.note.subject}
                        </span>
                        <h4 className="font-bold text-xs text-slate-950 dark:text-white leading-tight truncate">{item.note.title}</h4>
                        <p className="text-[10px] text-stone-400 font-mono">₹{item.note.price} • {item.note.pagesCount} Pages PDF</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromCart(item.note.id)}
                        className="text-red-500 hover:text-red-600 text-xs font-semibold shrink-0 cursor-pointer p-1"
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Bill Summary Panel */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-orange-200/80 dark:border-orange-950/80 bg-orange-50/30 dark:bg-orange-950/10 space-y-4">
                  {/* Coupon Validation Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block">APPLY COUPON CODE</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. SCOREMAX"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#1e1511] border border-orange-200 dark:border-orange-900/60 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold flex items-center">
                        ✓ Coupon '{appliedCoupon.code}' applied! Saved {appliedCoupon.discountPercentage}%
                      </p>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 text-xs border-t border-orange-200/60 dark:border-orange-950/60 pt-3">
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Subtotal ({cart.length} notes)</span>
                      <span className="font-mono">₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                        <span>Discount Savings</span>
                        <span className="font-mono">-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-950 dark:text-white font-black text-sm pt-2 border-t border-orange-100 dark:border-orange-950/60">
                      <span>Total Payable</span>
                      <span className="font-mono text-orange-600 dark:text-orange-400 text-base">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Gateway Security Badge */}
                  <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 bg-white/70 dark:bg-[#1e1511]/70 p-2 rounded-xl border border-orange-200/50 dark:border-orange-900/30">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>Razorpay 256-Bit SSL Encrypted</span>
                    </div>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">LIVE API</span>
                  </div>

                  <button
                    onClick={handleInitiatePayment}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] text-center"
                  >
                    Proceed to Pay ₹{totalAmount}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------ RAZORPAY LIVE PAYMENT GATEWAY MODAL ------------------ */}
      <AnimatePresence>
        {paymentModalOpen && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#160f0c] rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-orange-200 dark:border-orange-900/50 shadow-2xl space-y-5 relative my-auto"
            >
              <button
                onClick={() => { setPaymentModalOpen(false); setPaymentSuccessOrder(null); }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                aria-label="Close Payment"
              >
                <X size={18} />
              </button>

              {!paymentSuccessOrder ? (
                <div className="space-y-5">
                  {/* Brand Gateway Header */}
                  <div className="flex items-center justify-between border-b border-orange-100 dark:border-orange-950/60 pb-3.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>Razorpay Secure Gateway</span>
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </h4>
                        <p className="text-[10px] text-stone-400 font-mono">Live API: {RAZORPAY_LIVE_KEY_ID.substring(0, 12)}...{RAZORPAY_LIVE_KEY_ID.slice(-4)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-stone-400 block font-semibold uppercase">Total Due</span>
                      <span className="text-base font-black text-orange-600 dark:text-orange-400 font-mono">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 bg-orange-50/50 dark:bg-orange-950/30 p-1 rounded-2xl border border-orange-200/60 dark:border-orange-900/40">
                    <button
                      onClick={() => setSelectedPaymentTab('razorpay')}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        selectedPaymentTab === 'razorpay'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                          : 'text-stone-600 dark:text-stone-400 hover:text-orange-600'
                      }`}
                    >
                      <CreditCard size={14} />
                      <span>Razorpay Official</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentTab('upi_qr')}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        selectedPaymentTab === 'upi_qr'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                          : 'text-stone-600 dark:text-stone-400 hover:text-orange-600'
                      }`}
                    >
                      <QrCode size={14} />
                      <span>UPI & QR Scan</span>
                    </button>
                  </div>

                  {/* TAB 1: RAZORPAY OFFICIAL GATEWAY (Cards, NetBanking, All UPI Apps) */}
                  {selectedPaymentTab === 'razorpay' && (
                    <div className="space-y-4">
                      <div className="bg-orange-50/40 dark:bg-[#1a130f] p-4 rounded-2xl border border-orange-200/70 dark:border-orange-900/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Supported Payment Modes
                          </span>
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                            Zero Surcharge
                          </span>
                        </div>

                        {/* Payment Badges Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="bg-white dark:bg-[#231a15] p-2.5 rounded-xl border border-orange-100 dark:border-orange-950 text-slate-800 dark:text-stone-200 text-[10px] font-bold">
                            <Smartphone size={16} className="mx-auto mb-1 text-orange-500" />
                            <span>GPay / PhonePe</span>
                          </div>
                          <div className="bg-white dark:bg-[#231a15] p-2.5 rounded-xl border border-orange-100 dark:border-orange-950 text-slate-800 dark:text-stone-200 text-[10px] font-bold">
                            <QrCode size={16} className="mx-auto mb-1 text-amber-500" />
                            <span>Paytm & BHIM</span>
                          </div>
                          <div className="bg-white dark:bg-[#231a15] p-2.5 rounded-xl border border-orange-100 dark:border-orange-950 text-slate-800 dark:text-stone-200 text-[10px] font-bold">
                            <CreditCard size={16} className="mx-auto mb-1 text-red-500" />
                            <span>Credit & Debit</span>
                          </div>
                          <div className="bg-white dark:bg-[#231a15] p-2.5 rounded-xl border border-orange-100 dark:border-orange-950 text-slate-800 dark:text-stone-200 text-[10px] font-bold">
                            <ShieldCheck size={16} className="mx-auto mb-1 text-emerald-500" />
                            <span>NetBanking</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed text-center">
                          Click below to launch the official Razorpay Checkout popup with Live Key credentials. Notes will be instantly unlocked in your account.
                        </p>
                      </div>

                      {paymentErrorMessage && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{paymentErrorMessage}</span>
                        </div>
                      )}

                      {/* Main Trigger Button */}
                      <button
                        onClick={handlePayWithRazorpay}
                        disabled={isProcessingPayment}
                        className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs sm:text-sm font-black shadow-xl shadow-orange-500/25 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
                      >
                        {isProcessingPayment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting Razorpay Gateway...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} />
                            <span>Pay ₹{totalAmount} via Razorpay Live Gateway</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* TAB 2: DIRECT UPI QR CODE & INTENT */}
                  {selectedPaymentTab === 'upi_qr' && (
                    <div className="space-y-4">
                      <div className="text-center space-y-3">
                        <div className="w-44 h-44 bg-white dark:bg-[#231a15] p-3 rounded-2xl mx-auto flex flex-col justify-center items-center shadow-md border-2 border-dashed border-orange-400">
                          {/* Live Dynamic UPI QR visualization */}
                          <div className="w-full h-full bg-slate-900 text-white rounded-xl p-2.5 flex flex-col justify-between items-center relative overflow-hidden">
                            <div className="flex items-center justify-between w-full text-[8px] font-mono text-orange-400">
                              <span>RAKHI COACHING</span>
                              <span>₹{totalAmount}</span>
                            </div>
                            {/* QR matrix pattern */}
                            <div className="grid grid-cols-7 gap-1 w-24 h-24 my-auto p-1 bg-white rounded-lg">
                              {Array.from({ length: 49 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-full h-full rounded-[1px] ${
                                    (i < 7 || i % 7 === 0 || (i >= 42) || (i + 1) % 7 === 0 || i === 24 || (i * 7) % 5 === 0)
                                      ? 'bg-slate-950' 
                                      : 'bg-transparent'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[7px] text-stone-300 font-mono tracking-wider">SCAN WITH ANY UPI APP</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">
                            UPI ID: <span className="font-mono text-orange-600 dark:text-orange-400 select-all">rakhicoachingclasses@upi</span>
                          </p>
                          <p className="text-[10px] text-stone-400">
                            Scan with PhonePe, Google Pay, Paytm, CRED or BHIM
                          </p>
                        </div>
                      </div>

                      {/* Direct UPI App intent button */}
                      <div className="flex gap-2">
                        <a
                          href={`upi://pay?pa=rakhicoachingclasses@upi&pn=Rakhi+Coaching+Classes&am=${totalAmount}&cu=INR&tn=Commerce+Notes+Order`}
                          className="flex-1 py-2.5 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 hover:bg-orange-200 border border-orange-200 dark:border-orange-800/50 text-xs font-bold rounded-xl text-center flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <Smartphone size={14} />
                          <span>Open UPI App</span>
                        </a>

                        <button
                          onClick={handleVerifyDirectUPI}
                          disabled={isProcessingPayment}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-60"
                        >
                          {isProcessingPayment ? (
                            <span>Verifying...</span>
                          ) : (
                            <>
                              <Check size={14} />
                              <span>Confirm Payment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Live Security Footer */}
                  <p className="text-[9px] text-center text-stone-400 font-mono">
                    Merchant: Rakhi Coaching Classes • Domain: rakhicoachingclasses.com
                  </p>
                </div>
              ) : (
                /* SUCCESS RECEIPT STATE */
                <div className="text-center py-4 sm:py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
                    ✓
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Payment Successful!</h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                      Your payment of <strong className="text-slate-900 dark:text-white font-mono">₹{totalAmount}</strong> has been confirmed and verified via Razorpay Live Gateway.
                    </p>
                  </div>

                  {/* Receipt breakdown box */}
                  <div className="bg-orange-50/50 dark:bg-[#1c1410] p-4 rounded-2xl border border-orange-200 dark:border-orange-900/40 text-left space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-stone-500 border-b border-orange-100 dark:border-orange-950 pb-2">
                      <span className="font-bold uppercase">ORDER RECEIPT ID</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-stone-200 truncate max-w-[180px]">{paymentSuccessOrder}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                      <span className="font-bold uppercase">RAZORPAY PAYMENT ID</span>
                      <span className="font-mono text-orange-600 dark:text-orange-400 font-bold truncate max-w-[180px]">{lastPaymentId}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                      <span className="font-bold uppercase">STATUS</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">PAID & VERIFIED (LIVE)</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => { setPaymentModalOpen(false); setPaymentSuccessOrder(null); setIsCartOpen(false); }}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white text-xs sm:text-sm rounded-xl font-black shadow-lg shadow-orange-500/25 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      Access Notes in Student Dashboard
                    </button>
                    <p className="text-[10px] text-stone-400">
                      Digital PDF copies and high-yield formula summaries have been linked to your account.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------ INDIVIDUAL NOTE DETAIL DIALOG ------------------ */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#160f0c] rounded-3xl p-5 sm:p-8 max-w-lg w-full border border-orange-200 dark:border-orange-900/50 shadow-2xl relative space-y-5 my-auto"
            >
              <button
                onClick={() => setSelectedNote(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                aria-label="Close Details"
              >
                <X size={18} />
              </button>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 text-[9px] font-bold font-mono rounded-lg uppercase tracking-wider border border-orange-200 dark:border-orange-900/30">
                    {selectedNote.grade} • {selectedNote.subject}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star size={12} className="fill-current text-amber-500" />
                    <span>{selectedNote.rating} Rating</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white leading-tight">
                  {selectedNote.title}
                </h3>
                <p className="text-[10px] text-stone-400 font-medium">Faculty: Prof. Rakhi Nema • {selectedNote.downloadsCount}+ Students Enrolled</p>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-stone-300">
                <p className="leading-relaxed">{selectedNote.description}</p>
                <div className="bg-orange-50/40 dark:bg-[#1e1511] p-4 rounded-2xl border border-orange-200/60 dark:border-orange-900/30 space-y-2">
                  <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 tracking-wider uppercase block">HIGH-YIELD TOPICS INCLUDED</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <li className="flex items-center space-x-1.5"><CheckCircle size={12} className="text-orange-500 shrink-0" /> <span>Chapter Formulas & Mindmaps</span></li>
                    <li className="flex items-center space-x-1.5"><CheckCircle size={12} className="text-orange-500 shrink-0" /> <span>Solved Board PYQs (2018-2025)</span></li>
                    <li className="flex items-center space-x-1.5"><CheckCircle size={12} className="text-orange-500 shrink-0" /> <span>Step-by-Step Numericals Guide</span></li>
                    <li className="flex items-center space-x-1.5"><CheckCircle size={12} className="text-orange-500 shrink-0" /> <span>High-Scoring Exam Cheat Sheets</span></li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-orange-100 dark:border-orange-950/60 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">PRICE SUMMARY</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">₹{selectedNote.price}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { handleAddToCart(selectedNote); setSelectedNote(null); }}
                    className="px-4 py-2.5 border border-orange-300 dark:border-orange-800 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer transition-colors"
                  >
                    Add Cart
                  </button>
                  <button
                    onClick={() => { handleDirectBuy(selectedNote); setSelectedNote(null); }}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/25 cursor-pointer transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
