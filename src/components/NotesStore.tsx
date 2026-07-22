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
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, CartItem, Coupon, Order, UserProfile } from '../types';

interface NotesStoreProps {
  notesList: Note[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  onCheckoutComplete: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  user: UserProfile | null;
  onLoginClick: () => void;
}

export default function NotesStore({
  notesList,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  onCheckoutComplete,
  user,
  onLoginClick
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
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<string | null>(null);

  // Demo Coupons
  const demoCoupons: Coupon[] = [
    { code: 'SCOREMAX', discountPercentage: 20, minOrderValue: 200, expiryDate: '2026-12-31', active: true },
    { code: 'RAKHI10', discountPercentage: 10, minOrderValue: 100, expiryDate: '2026-12-31', active: true }
  ];

  // PDF Preview State
  const [previewPdfNote, setPreviewPdfNote] = useState<Note | null>(null);

  // Subtotal calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.note.price * item.quantity), 0);
  const discount = appliedCoupon && subtotal >= appliedCoupon.minOrderValue
    ? Math.round(subtotal * (appliedCoupon.discountPercentage / 100))
    : 0;
  const totalAmount = subtotal - discount;

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
    setPaymentModalOpen(true);
  };

  const handleSimulateRazorpay = async () => {
    setIsProcessingPayment(true);
    
    // Simulate Razorpay Secure processing (1.5s delay)
    setTimeout(async () => {
      try {
        const orderId = await onCheckoutComplete({
          userId: user?.uid || 'guest_user',
          userEmail: user?.email || 'guest@gmail.com',
          items: cart.map(item => ({
            noteId: item.note.id,
            noteTitle: item.note.title,
            price: item.note.price
          })),
          totalAmount: subtotal,
          couponApplied: appliedCoupon?.code,
          discountAmount: discount,
          finalAmount: totalAmount,
          paymentId: `pay_rzp_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
        });

        setPaymentSuccessOrder(orderId);
        setCart([]); // Clear Cart
        setAppliedCoupon(null);
        setCouponCode('');
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessingPayment(false);
      }
    }, 1500);
  };

  const filteredNotes = notesList.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="notes-store-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Revision Notes Store</h1>
          <p className="text-sm text-slate-400 mt-1">
            Unlock premium high-yield revision summaries built for Class 9-12 Boards, JEE & NEET.
          </p>
        </div>

        {/* Promo code notice banner */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center space-x-3 text-xs shrink-0">
          <Tag size={16} className="text-indigo-400 animate-pulse" />
          <div>
            <p className="font-bold text-white">Use Coupon: <span className="text-indigo-400 font-mono font-black">SCOREMAX</span></p>
            <p className="text-[10px] text-slate-500">Get flat 20% off on study bills above ₹200</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes by topic, chapter, or formula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category filtering tab */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'math', label: 'Mathematics' },
            { id: 'physics', label: 'Physics' },
            { id: 'chemistry', label: 'Chemistry' },
            { id: 'biology', label: 'Biology' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
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
            className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            {/* Note Preview Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[9px] font-bold font-mono rounded uppercase tracking-wider border border-indigo-500/20">
                  {note.grade}
                </span>
                <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                  <Star size={12} className="fill-current" />
                  <span>{note.rating}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white leading-tight">
                  {note.title}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Subject: {note.subject} • {note.pagesCount} Pages PDF</p>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">
                {note.description}
              </p>
            </div>

            {/* Note Pricing & Buy Panel */}
            <div className="p-6 pt-0 border-t border-slate-800/60 flex items-center justify-between mt-auto">
              <div>
                <span className="text-[9px] text-slate-500 block font-bold">PRICE SUMMARY</span>
                <span className="text-base font-black text-white font-mono">₹{note.price}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedNote(note)}
                  className="p-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => handleAddToCart(note)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
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
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-100 dark:border-slate-800 z-10"
            >
              {/* Cart Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
                <div className="flex items-center space-x-2">
                  <ShoppingCart size={18} className="text-teal-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Your Cart ({cart.length})</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close Cart"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items Area */}
              <div className="p-6 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingCart size={48} className="text-slate-300 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Your cart is empty</p>
                      <p className="text-xs text-slate-400 mt-1">Browse our store and add high-yield study materials.</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.note.id} className="py-4 flex items-start justify-between space-x-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-slate-950 dark:text-white leading-tight">{item.note.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">₹{item.note.price} • {item.note.grade}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromCart(item.note.id)}
                        className="text-red-500 hover:text-red-600 text-xs font-semibold shrink-0 cursor-pointer"
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
                <div className="p-6 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/20 space-y-4">
                  {/* Coupon Validation Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 block">APPLY COUPON CODE</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. SCOREMAX"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-1.5 bg-slate-900 dark:bg-teal-500 text-white rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer"
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
                  <div className="space-y-2 text-xs border-t border-slate-200/50 dark:border-slate-800/60 pt-3">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                        <span>Discount Savings</span>
                        <span className="font-mono">-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-950 dark:text-white font-black text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Total Amount</span>
                      <span className="font-mono text-teal-600 dark:text-teal-400">₹{totalAmount}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleInitiatePayment}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/10 cursor-pointer transition-colors text-center"
                  >
                    Proceed to Razorpay Sandbox
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------ RAZORPAY PAYMENT SIMULATION MODAL ------------------ */}
      <AnimatePresence>
        {paymentModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => { setPaymentModalOpen(false); setPaymentSuccessOrder(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                aria-label="Close Payment"
              >
                <X size={18} />
              </button>

              {!paymentSuccessOrder ? (
                <div className="space-y-6">
                  {/* Brand Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard size={18} className="text-teal-500" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Razorpay Secure</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Sandbox Payment Gateway</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono rounded font-bold">
                      ₹{totalAmount}
                    </span>
                  </div>

                  {/* Payment Simulator QR Code */}
                  <div className="text-center space-y-4">
                    <div className="w-40 h-40 bg-slate-50 dark:bg-white p-2 rounded-2xl mx-auto flex flex-col justify-between items-center shadow-inner">
                      {/* Generates standard payment simulator graphic */}
                      <div className="w-full h-full border-4 border-dashed border-teal-500/25 rounded-xl flex flex-col justify-center items-center relative">
                        <span className="text-[8px] font-bold text-indigo-600 tracking-wider block font-mono">SCAN TO PAY</span>
                        <div className="grid grid-cols-5 gap-1.5 w-24 h-24 mt-2 p-1 border border-slate-250 bg-white">
                          {/* Simulated QR blocks */}
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 ${((i + 3) % 4 === 0 || i % 6 === 0) ? 'bg-slate-950' : 'bg-transparent'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                      Scan the Sandbox QR with any UPI app, or trigger the instant payment below. 
                    </p>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handleSimulateRazorpay}
                    disabled={isProcessingPayment}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/10 cursor-pointer transition-colors"
                  >
                    {isProcessingPayment ? 'Authorizing Payment via Bank Gateway...' : `Authorize & Pay ₹${totalAmount}`}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transaction Success!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Payment of ₹{totalAmount} processed successfully. Your order receipt code has been registered in the student ledger.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-1 mt-3">
                      <p className="text-[9px] font-bold text-slate-400">ORDER RECEIPT ID</p>
                      <p className="text-[11px] font-mono text-slate-800 dark:text-slate-200 truncate">{paymentSuccessOrder}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => { setPaymentModalOpen(false); setPaymentSuccessOrder(null); setIsCartOpen(false); }}
                      className="w-full py-2.5 bg-slate-900 text-white text-xs rounded-xl font-semibold cursor-pointer"
                    >
                      Return to Store
                    </button>
                    <p className="text-[9px] text-slate-400">
                      Notes are now available under the "Purchased Notes" tab on your student dashboard.
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
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setSelectedNote(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                aria-label="Close Details"
              >
                <X size={18} />
              </button>

              <div className="space-y-3">
                <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[9px] font-bold font-mono rounded uppercase">
                  {selectedNote.grade} • {selectedNote.subject}
                </span>
                <h3 className="text-xl font-extrabold text-slate-950 dark:text-white leading-tight">
                  {selectedNote.title}
                </h3>
                <p className="text-[10px] text-slate-400">Compiled by: Prof. Rakhi Nema • {selectedNote.downloadsCount}+ Downloads</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed">{selectedNote.description}</p>
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">HIGH-YIELD TOPICS INCLUDED</span>
                  <ul className="grid grid-cols-2 gap-2 text-[10px]">
                    <li className="flex items-center space-x-1.5"><CheckCircle size={10} className="text-teal-500" /> <span>Formula Sheet Summary</span></li>
                    <li className="flex items-center space-x-1.5"><CheckCircle size={10} className="text-teal-500" /> <span>Solved PYQ Boards (2018-2025)</span></li>
                    <li className="flex items-center space-x-1.5"><CheckCircle size={10} className="text-teal-500" /> <span>Visual reactions diagrams</span></li>
                    <li className="flex items-center space-x-1.5"><CheckCircle size={10} className="text-teal-500" /> <span>Cheat sheets for revision</span></li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block font-medium">PRICE</span>
                  <span className="text-xl font-black text-slate-950 dark:text-white font-mono">₹{selectedNote.price}</span>
                </div>
                <button
                  onClick={() => { handleAddToCart(selectedNote); setSelectedNote(null); }}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-teal-500/10 cursor-pointer transition-all"
                >
                  Buy Study Notes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
