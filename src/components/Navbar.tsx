import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldAlert,
  Settings
} from 'lucide-react';
import { UserProfile, CartItem } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onLoginClick: () => void;
  onLogout: () => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onSimulateRole: (role: 'student' | 'teacher' | 'admin') => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onLoginClick,
  onLogout,
  cart,
  setIsCartOpen,
  darkMode,
  setDarkMode,
  onSimulateRole
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { id: 'class11', label: 'Class 11th Commerce' },
    { id: 'class12', label: 'Class 12th Commerce' }
  ];

  const handleLinkClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav id="main-navbar" className="sticky top-0 z-40 bg-white/80 dark:bg-[#120d09]/80 backdrop-blur-xl border-b border-orange-200/60 dark:border-orange-900/40 transition-all duration-300 shadow-sm shadow-orange-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => handleLinkClick('class11')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-stone-100 block">
                Rakhi Coaching
              </span>
              <span className="text-[10px] text-orange-600 dark:text-orange-400 block -mt-0.5 uppercase tracking-widest font-bold">
                Learn Smart, Score Better
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                  activeTab === link.id
                    ? 'text-orange-600 dark:text-orange-400 bg-gradient-to-r from-orange-500/15 via-red-500/10 to-amber-500/15 border border-orange-300/80 dark:border-orange-500/30 shadow-sm shadow-orange-500/10'
                    : 'text-slate-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-300 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 border border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Utilities (Cart, DarkMode, Profile, Sim Role) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            
            {/* Cart Widget */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-all cursor-pointer"
              title="View Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Quick Emulator Switcher for evaluation */}
            <div className="relative">
              <button
                onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-mono transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Simulate Role for Testing"
              >
                <Settings size={12} className="text-teal-500 animate-spin-slow" />
                <span>Test Role: {user?.role || 'Guest'}</span>
                <ChevronDown size={12} />
              </button>

              {isRoleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <div className="px-3 py-1 text-[10px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 mb-1">
                    DEVELOPER CONTROLS
                  </div>
                  <button
                    onClick={() => { onSimulateRole('student'); setIsRoleSwitcherOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Student Mock</span>
                    {user?.role === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>}
                  </button>
                  <button
                    onClick={() => { onSimulateRole('teacher'); setIsRoleSwitcherOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Teacher Mock</span>
                    {user?.role === 'teacher' && <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>}
                  </button>
                  <button
                    onClick={() => { onSimulateRole('admin'); setIsRoleSwitcherOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer text-indigo-600 dark:text-indigo-400 font-bold"
                  >
                    <span>Full Admin Mock</span>
                    {user?.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 hover:bg-orange-100/50 dark:hover:bg-orange-950/40 rounded-xl transition-all cursor-pointer"
                >
                  {user.photoURL ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="w-8 h-8 rounded-xl object-cover border border-orange-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/20">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={14} className="text-stone-500" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#1c1410]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-200/80 dark:border-orange-900/40 py-1.5 z-50 text-slate-700 dark:text-stone-300">
                    <div className="px-4 py-2 border-b border-orange-100 dark:border-orange-950">
                      <p className="font-semibold text-sm truncate text-slate-900 dark:text-stone-100">{user.displayName}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">{user.email}</p>
                      <span className="inline-block px-2 py-0.5 bg-orange-50 dark:bg-orange-950/50 text-[10px] text-orange-600 dark:text-orange-400 rounded mt-1 font-mono uppercase font-bold border border-orange-200/50 dark:border-orange-900/30">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => { setActiveTab('dashboard-overview'); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center space-x-2 cursor-pointer"
                    >
                      <User size={14} />
                      <span>Student Dashboard</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setActiveTab('admin-panel'); setIsProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center space-x-2 font-medium cursor-pointer border-t border-orange-100 dark:border-orange-950"
                      >
                        <ShieldAlert size={14} />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2 cursor-pointer border-t border-orange-100 dark:border-orange-950"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-5 py-2 text-sm font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:to-red-600 rounded-full shadow-lg shadow-orange-500/25 text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </button>
            )}

            {/* Hamburger (Mobile Menu Toggle) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-stone-300 hover:bg-orange-100/50 dark:hover:bg-orange-950/40 rounded-xl md:hidden transition-all cursor-pointer"
              title="Menu"
              aria-label="Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-orange-200/60 dark:border-orange-900/40 bg-white/95 dark:bg-[#140e0b]/95 backdrop-blur-xl transition-all">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer block ${
                  activeTab === link.id
                    ? 'text-orange-600 dark:text-orange-400 bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-300/50 dark:border-orange-500/30'
                    : 'text-slate-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Role switch in mobile for quick sandbox testing */}
            <div className="pt-2 border-t border-orange-100 dark:border-orange-950 px-4">
              <p className="text-[9px] font-mono text-orange-500 dark:text-orange-400 tracking-wider mb-2 font-bold">QUICK SANDBOX ROLES</p>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => onSimulateRole('student')}
                  className={`py-1 text-[10px] font-mono border rounded-lg text-center cursor-pointer ${user?.role === 'student' ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'border-orange-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'}`}
                >
                  Student
                </button>
                <button 
                  onClick={() => onSimulateRole('teacher')}
                  className={`py-1 text-[10px] font-mono border rounded-lg text-center cursor-pointer ${user?.role === 'teacher' ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'border-orange-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'}`}
                >
                  Teacher
                </button>
                <button 
                  onClick={() => onSimulateRole('admin')}
                  className={`py-1 text-[10px] font-mono border rounded-lg text-center cursor-pointer ${user?.role === 'admin' ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'border-orange-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'}`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
