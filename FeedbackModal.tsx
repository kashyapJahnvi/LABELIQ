import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Star,
  FileWarning,
  Lightbulb,
  Headphones,
  Send,
  Lock,
  CheckCircle2,
  Clock,
  Shield,
  Upload,
  LogIn,
  ShieldAlert,
} from 'lucide-react';
import { FeedbackSubmission, ProductData } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchFeedback,
  submitFeedback,
  updateFeedbackStatus,
  getActiveUserId,
} from '../services/historyService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: ProductData | null;
  onOpenAuth?: () => void;
}

type FeedbackTab = 'experience' | 'incorrect' | 'feature' | 'support' | 'my_tickets' | 'admin';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
  onOpenAuth,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedbackTab>(
    preselectedProduct ? 'incorrect' : 'experience'
  );
  const [ratings, setRatings] = useState({
    overall: 5,
    navigation: 5,
    accuracy: 5,
    explanations: 5,
  });
  const [comment, setComment] = useState('');
  const [productNameInput, setProductNameInput] = useState(
    preselectedProduct ? `${preselectedProduct.brand} ${preselectedProduct.productName}` : ''
  );
  const [discrepancyType, setDiscrepancyType] = useState('ingredient_misidentified');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Tickets & Admin State
  const [tickets, setTickets] = useState<FeedbackSubmission[]>([]);
  const [adminError, setAdminError] = useState('');
  const [selectedAdminStatus, setSelectedAdminStatus] = useState<Record<string, string>>({});
  const [adminNotesInput, setAdminNotesInput] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen, activeTab, user, isAdmin]);

  const loadTickets = async () => {
    setAdminError('');
    const res = await fetchFeedback(activeTab === 'admin' && isAdmin);
    if (res.success) {
      setTickets(res.data);
    } else if (activeTab === 'admin' && !isAdmin) {
      setAdminError(res.error || 'Administrator access required');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate clicks
    if (!comment.trim()) return;

    setIsSubmitting(true);
    let type: any = 'experience';
    if (activeTab === 'incorrect') type = 'incorrect_analysis';
    if (activeTab === 'feature') type = 'feature';
    if (activeTab === 'support') type = 'support';

    const payload: Partial<FeedbackSubmission> = {
      type,
      productName: productNameInput || undefined,
      comment: activeTab === 'incorrect' ? `[${discrepancyType}] ${comment}` : comment,
      ratings: activeTab === 'experience' ? ratings : undefined,
    };

    try {
      const saved = await submitFeedback(payload);
      if (saved) {
        setSubmitSuccess(true);
        setComment('');
        loadTickets();
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('my_tickets');
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminUpdate = async (id: string) => {
    if (updatingId === id) return; // Prevent duplicate clicks
    setUpdatingId(id);
    const status = selectedAdminStatus[id];
    const notes = adminNotesInput[id];
    try {
      const res = await updateFeedbackStatus(id, {
        status,
        adminNotes: notes,
        assignedAdmin: user?.email || 'Administrator',
      });
      if (res.success) {
        loadTickets();
      } else {
        setAdminError(res.error || 'Failed to update ticket status on server');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#FCFDF9] rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-[#244D2C]/20 overflow-y-auto my-6 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#244D2C]/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#F07853]" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                Feedback &amp; Support Portal
              </h2>
              <p className="text-xs text-[#244D2C]/70">
                Community Voice &amp; Human-in-the-Loop Verification Desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 border-b border-[#244D2C]/10 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'experience'
                ? 'bg-[#244D2C] text-[#EAF2D5]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Experience
          </button>
          <button
            onClick={() => setActiveTab('incorrect')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 ${
              activeTab === 'incorrect'
                ? 'bg-[#244D2C] text-[#EAF2D5]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileWarning className="w-3 h-3 text-[#F07853]" />
            <span>Report Error</span>
          </button>
          <button
            onClick={() => setActiveTab('feature')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'feature'
                ? 'bg-[#244D2C] text-[#EAF2D5]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Feature Request
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'support'
                ? 'bg-[#244D2C] text-[#EAF2D5]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Support
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'my_tickets'
                ? 'bg-[#244D2C] text-[#EAF2D5]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Feedback ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 ${
              activeTab === 'admin'
                ? 'bg-[#9C3218] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-3 h-3 text-[#F07853]" />
            <span>Admin Review</span>
          </button>
        </div>

        {submitSuccess && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Thank you! Your feedback has been safely recorded and logged on the server.</span>
          </div>
        )}

        {/* TAB 1: EXPERIENCE RATINGS */}
        {activeTab === 'experience' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAF3] p-4 rounded-2xl border border-[#244D2C]/10 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#244D2C]">Overall Experience:</span>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatings({ ...ratings, overall: star })}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          ratings.overall >= star ? 'fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#244D2C]">Navigation Ease:</span>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatings({ ...ratings, navigation: star })}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          ratings.navigation >= star ? 'fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#244D2C]">Analysis Accuracy:</span>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatings({ ...ratings, accuracy: star })}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          ratings.accuracy >= star ? 'fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#244D2C]">Ingredient Explanations:</span>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatings({ ...ratings, explanations: star })}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          ratings.explanations >= star ? 'fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Your Thoughts &amp; Review:</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like about LABELIQ? How clear were the ingredient analyses and health scores?"
                className="w-full p-3 text-xs bg-white border border-[#244D2C]/20 rounded-xl text-[#244D2C]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#F07853]" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Experience Feedback'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: REPORT AN INCORRECT ANALYSIS */}
        {activeTab === 'incorrect' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-[#FFE4D9]/80 rounded-2xl border border-[#F07853]/30 text-xs text-[#9C3218] space-y-1">
              <p className="font-bold">Human-in-the-Loop Quality Assurance</p>
              <p>
                Spotted a misidentified additive, inaccurate FSSAI license status, or nutritional discrepancy? File a review ticket below.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Product Under Review:</label>
              <input
                type="text"
                value={productNameInput}
                onChange={(e) => setProductNameInput(e.target.value)}
                placeholder="Product name or brand..."
                className="w-full p-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl text-[#244D2C]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Discrepancy Category:</label>
              <select
                value={discrepancyType}
                onChange={(e) => setDiscrepancyType(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl text-[#244D2C] font-semibold"
              >
                <option value="ingredient_misidentified">Ingredient Misidentified by OCR/Vision</option>
                <option value="nutrition_facts_error">Nutrition Facts Mismatch (Sugar/Fat/Sodium)</option>
                <option value="allergen_missed">Allergen Notice Missed or Incorrect</option>
                <option value="fssai_bis_license">FSSAI / BIS License Verification Issue</option>
                <option value="expiry_date_reading">Expiry / Shelf-Life Date Reading Error</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Describe the Inaccuracy:</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please explain what the package label actually states vs what the AI detected..."
                className="w-full p-3 text-xs bg-white border border-[#244D2C]/20 rounded-xl text-[#244D2C]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#9C3218] hover:bg-[#782612] text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
            >
              <FileWarning className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging...' : 'File Correction Ticket'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: FEATURE REQUEST */}
        {activeTab === 'feature' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Feature Category or Title:</label>
              <input
                type="text"
                value={productNameInput}
                onChange={(e) => setProductNameInput(e.target.value)}
                placeholder="e.g. Household Cleaners Category, Hindi OCR Support, Vegan Grocery Filter..."
                className="w-full p-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl text-[#244D2C]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Feature Description:</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe how this feature would help consumers make smarter choices..."
                className="w-full p-3 text-xs bg-white border border-[#244D2C]/20 rounded-xl text-[#244D2C]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#F07853]" />
              <span>{isSubmitting ? 'Submitting...' : 'Suggest Feature'}</span>
            </button>
          </form>
        )}

        {/* TAB 4: SUPPORT */}
        {activeTab === 'support' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#244D2C]">Describe Technical Issue:</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Camera permissions issues, image upload errors, or general inquiries..."
                className="w-full p-3 text-xs bg-white border border-[#244D2C]/20 rounded-xl text-[#244D2C]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
            >
              <Headphones className="w-3.5 h-3.5 text-[#F07853]" />
              <span>{isSubmitting ? 'Sending...' : 'Contact Support'}</span>
            </button>
          </form>
        )}

        {/* TAB 5: MY TICKETS STATUS TRACKER */}
        {activeTab === 'my_tickets' && (
          <div className="space-y-3">
            <p className="text-xs text-[#244D2C]/70">
              Showing tickets associated with your active user ID ({getActiveUserId()}):
            </p>

            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 bg-[#F8FAF3] rounded-2xl border">
                No submissions logged yet. Share your experience or report an error above!
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-white border border-[#244D2C]/15 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#244D2C] uppercase tracking-wide">
                      {t.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-green-100 text-green-800'
                          : t.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {t.productName && (
                    <p className="font-semibold text-[#F07853]">Product: {t.productName}</p>
                  )}
                  <p className="text-[#244D2C]/80">{t.comment}</p>

                  <div className="pt-1 text-[10px] text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 6: PROTECTED ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            {!user ? (
              <div className="bg-[#F8FAF3] p-6 rounded-2xl border border-[#244D2C]/15 space-y-3 text-center sm:text-left">
                <div className="flex items-center space-x-2 text-[#9C3218]">
                  <Lock className="w-5 h-5" />
                  <span className="font-bold text-sm">Administrator Sign In Required</span>
                </div>
                <p className="text-xs text-[#244D2C]/80 leading-relaxed">
                  The Human-in-the-Loop review desk and ticket status manager is strictly restricted to verified platform administrators. Please sign in with an authorized administrator account (e.g. <code>jahnvith80@gmail.com</code>).
                </p>
                {onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#9C3218] text-white rounded-xl text-xs font-semibold hover:bg-[#782612] transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In as Admin</span>
                  </button>
                )}
              </div>
            ) : !isAdmin ? (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-200 space-y-3">
                <div className="flex items-center space-x-2 text-red-800">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-sm">Access Denied: Admin Privileges Required</span>
                </div>
                <p className="text-xs text-red-800/90 leading-relaxed">
                  You are signed in as <strong>{user.email}</strong> (UID: <code>{user.uid}</code>), but this account is not authorized with administrator privileges.
                </p>
                <p className="text-[11px] text-red-700 bg-red-100/60 p-2.5 rounded-xl">
                  Administrator access is validated server-side against Firebase Custom Claims (<code>admin: true</code>) or the server allowlist (<code>ADMIN_EMAILS</code> in <code>.env</code>).
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-200 text-xs">
                  <span className="text-green-800 font-bold">
                    Admin Session Active ({user.email}) · {tickets.length} Total Submissions on Database
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9C3218] text-white">
                    VERIFIED ADMIN
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-white border border-[#244D2C]/15 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#244D2C]">
                          User: {t.userId} · {t.type}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {t.productName && <p className="text-[#F07853] font-bold">{t.productName}</p>}
                      <p className="text-gray-800">{t.comment}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500">Update Status:</label>
                          <select
                            defaultValue={t.status}
                            onChange={(e) =>
                              setSelectedAdminStatus({
                                ...selectedAdminStatus,
                                [t.id]: e.target.value,
                              })
                            }
                            className="w-full p-1.5 text-xs border rounded-lg"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500">Admin Notes:</label>
                          <input
                            type="text"
                            defaultValue={t.adminNotes || ''}
                            placeholder="Internal findings..."
                            onChange={(e) =>
                              setAdminNotesInput({
                                ...adminNotesInput,
                                [t.id]: e.target.value,
                              })
                            }
                            className="w-full p-1.5 text-xs border rounded-lg"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdminUpdate(t.id)}
                        className="mt-1 px-3 py-1 bg-[#244D2C] text-white text-[10px] font-bold rounded-lg hover:bg-[#1A3620]"
                      >
                        Save Status &amp; Notes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
