import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  History,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  User,
  GitCompare,
  Check,
  Edit2,
  LogIn,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { UserHealthProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { getActiveUserId, setActiveUserId } from '../services/historyService';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenHistory: () => void;
  onOpenComparison: () => void;
  onOpenFeedback: () => void;
  onOpenGuide: () => void;
  onOpenHealthProfile: () => void;
  onOpenAuth: () => void;
  onSelectCategory: (cat: 'all' | 'food' | 'cosmetic') => void;
  historyCount: number;
  userProfile: UserHealthProfile;
  currentUserId: string;
  onUserChanged: (newUserId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenScanner,
  onOpenHistory,
  onOpenComparison,
  onOpenFeedback,
  onOpenGuide,
  onOpenHealthProfile,
  onOpenAuth,
  onSelectCategory,
  historyCount,
  userProfile,
  currentUserId,
  onUserChanged,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserIdInput, setNewUserIdInput] = useState(currentUserId);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const activeAllergensCount =
    userProfile.allergies.length + userProfile.conditions.length;

  const handleSaveUserId = (id: string) => {
    const clean = id.trim() || 'user_cgc_mohali';
    setActiveUserId(clean);
    onUserChanged(clean);
    setShowUserModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F8FAF3]/95 backdrop-blur-md border-b border-[#244D2C]/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand Logo & Hackathon Ribbon */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-[#244D2C] flex items-center justify-center text-[#EAF2D5] shadow-sm shadow-[#244D2C]/20">
                <Sparkles className="w-5 h-5 text-[#EAF2D5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-['Playfair_Display'] text-2xl font-bold tracking-tight text-[#244D2C]">
                    LABEL<span className="text-[#F07853]">IQ</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#244D2C]/10 text-[#244D2C] border border-[#244D2C]/15">
                    GRAVITON 2026
                  </span>
                </div>
                <p className="text-[10px] font-medium text-[#244D2C]/70 tracking-wide uppercase hidden md:block">
                  AI Product Transparency & Ingredient Intelligence
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => onSelectCategory('all')}
                className="px-3 py-1.5 text-xs font-semibold text-[#244D2C] hover:bg-[#EAF2D5]/70 rounded-lg transition-colors"
              >
                Catalog
              </button>
              <button
                onClick={() => onSelectCategory('food')}
                className="px-3 py-1.5 text-xs font-semibold text-[#244D2C]/80 hover:text-[#244D2C] hover:bg-[#EAF2D5]/70 rounded-lg transition-colors"
              >
                Food Intelligence
              </button>
              <button
                onClick={() => onSelectCategory('cosmetic')}
                className="px-3 py-1.5 text-xs font-semibold text-[#244D2C]/80 hover:text-[#244D2C] hover:bg-[#EAF2D5]/70 rounded-lg transition-colors"
              >
                Cosmetics
              </button>
              <button
                onClick={onOpenComparison}
                className="px-3 py-1.5 text-xs font-semibold text-[#244D2C]/80 hover:text-[#244D2C] hover:bg-[#EAF2D5]/70 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <GitCompare className="w-3.5 h-3.5 text-[#F07853]" />
                <span>Compare</span>
              </button>
              <button
                onClick={onOpenHistory}
                className="px-3 py-1.5 text-xs font-semibold text-[#244D2C]/80 hover:text-[#244D2C] hover:bg-[#EAF2D5]/70 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <History className="w-3.5 h-3.5 text-[#244D2C]" />
                <span>History</span>
                {historyCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#244D2C] text-[#EAF2D5] font-bold">
                    {historyCount}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenFeedback}
                className="px-3 py-1.5 text-xs font-semibold text-[#244D2C]/80 hover:text-[#244D2C] hover:bg-[#EAF2D5]/70 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#244D2C]" />
                <span>Feedback</span>
              </button>
              <button
                onClick={onOpenGuide}
                className="px-3 py-1.5 text-xs font-semibold text-[#244D2C]/80 hover:text-[#244D2C] hover:bg-[#EAF2D5]/70 rounded-lg transition-colors flex items-center space-x-1"
                title="Beginner's Guided Tour"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#244D2C]" />
                <span>Guide</span>
              </button>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Firebase Authentication Status & Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EAF2D5] hover:bg-[#dfe9c3] text-[#244D2C] border border-[#244D2C]/20 transition-all shadow-xs"
                    title={`Signed in as ${user.email}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center font-bold text-[10px]">
                      {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="max-w-[110px] sm:max-w-[130px] truncate font-semibold">
                      {user.displayName || user.email}
                    </span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#9C3218] text-white tracking-wider">
                        ADMIN
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#244D2C]/15 py-3 px-4 z-50 text-xs space-y-3">
                      <div className="border-b border-[#244D2C]/10 pb-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#244D2C] truncate">{user.displayName || 'User'}</p>
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#9C3218] text-white">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">UID: {user.uid}</p>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenFeedback();
                          }}
                          className="w-full text-left py-1 text-[#244D2C] hover:text-[#F07853] font-semibold"
                        >
                          View Feedback &amp; Tickets
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setNewUserIdInput(currentUserId);
                            setShowUserModal(true);
                          }}
                          className="w-full text-left py-1 text-gray-500 hover:text-[#244D2C] text-[11px]"
                        >
                          Legacy Testing User ID...
                        </button>
                      </div>

                      <div className="border-t border-[#244D2C]/10 pt-2">
                        <button
                          onClick={async () => {
                            setShowUserDropdown(false);
                            await logout();
                          }}
                          className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-[#EAF2D5]/70 text-[#244D2C] border border-[#244D2C]/20 transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#244D2C]" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Health Profile Pill */}
              <button
                onClick={onOpenHealthProfile}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeAllergensCount > 0
                    ? 'bg-[#FFE4D9] text-[#9C3218] border-[#F07853]/30 shadow-xs'
                    : 'bg-white text-[#244D2C] border-[#244D2C]/15 hover:bg-[#EAF2D5]/50'
                }`}
                title="Personalized Health & Allergy Profile"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#F07853]" />
                <span className="hidden md:inline">Health Profile</span>
                {activeAllergensCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#F07853] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeAllergensCount}
                  </span>
                )}
              </button>

              {/* Primary Launch Scanner Button */}
              <button
                onClick={onOpenScanner}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] shadow-sm shadow-[#244D2C]/25 transition-all transform active:scale-95"
              >
                <Camera className="w-4 h-4 text-[#F07853]" />
                <span className="font-medium">Scan Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-[#244D2C]/10 bg-[#F8FAF3] px-2 py-2 text-xs font-medium text-[#244D2C]/80">
          <button onClick={() => onSelectCategory('all')} className="px-2 py-1 hover:text-[#244D2C]">
            Catalog
          </button>
          <button onClick={onOpenComparison} className="px-2 py-1 flex items-center space-x-1">
            <GitCompare className="w-3 h-3 text-[#F07853]" />
            <span>Compare</span>
          </button>
          <button onClick={onOpenHistory} className="px-2 py-1 flex items-center space-x-1">
            <History className="w-3 h-3" />
            <span>History ({historyCount})</span>
          </button>
          <button onClick={onOpenFeedback} className="px-2 py-1 flex items-center space-x-1">
            <MessageSquare className="w-3 h-3" />
            <span>Feedback</span>
          </button>
          <button onClick={onOpenGuide} className="px-2 py-1 flex items-center space-x-1">
            <HelpCircle className="w-3 h-3" />
            <span>Tour</span>
          </button>
        </div>
      </header>

      {/* User Switcher Modal for Access Control Verification */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FCFDF9] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#244D2C]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#244D2C]/10 flex items-center justify-center text-[#244D2C]">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C]">
                  User Profile Switcher
                </h3>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#244D2C]/80 mb-4 leading-relaxed">
              LABELIQ enforces strict <strong>User-Level Access Control</strong> on both scan history and submitted feedback. Switch between user sessions below to verify multi-user isolation on the database.
            </p>

            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-[#244D2C]">Active User ID</label>
              <input
                type="text"
                value={newUserIdInput}
                onChange={(e) => setNewUserIdInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#244D2C]/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#244D2C]/30 text-[#244D2C]"
                placeholder="e.g. user_cgc_mohali"
              />
            </div>

            <div className="mb-5">
              <p className="text-[11px] font-semibold text-[#244D2C]/70 mb-2">Preset Test Users:</p>
              <div className="flex flex-wrap gap-2">
                {['user_cgc_mohali', 'jahnvi_kashyap', 'judge_graviton', 'guest_shopper'].map((uid) => (
                  <button
                    key={uid}
                    onClick={() => setNewUserIdInput(uid)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      newUserIdInput === uid
                        ? 'bg-[#244D2C] text-[#EAF2D5] border-[#244D2C]'
                        : 'bg-[#EAF2D5]/50 text-[#244D2C] border-[#244D2C]/15 hover:bg-[#EAF2D5]'
                    }`}
                  >
                    {uid}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#244D2C]/70 hover:text-[#244D2C]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveUserId(newUserIdInput)}
                className="px-4 py-2 text-xs font-semibold bg-[#244D2C] text-[#EAF2D5] rounded-xl hover:bg-[#1A3620] flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Switch User & Reload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
