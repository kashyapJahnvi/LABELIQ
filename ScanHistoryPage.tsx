import React, { useState } from 'react';
import {
  History,
  Trash2,
  Search,
  Filter,
  Eye,
  GitCompare,
  Calendar,
  Sparkles,
  ArrowUpDown,
  AlertCircle,
  Apple,
  Droplets,
  Camera,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { ProductData, ScanHistoryRecord } from '../types';
import { FullReportModal } from './FullReportModal';

interface ScanHistoryPageProps {
  historyRecords: ScanHistoryRecord[];
  currentUserId: string;
  onDeleteRecord: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
  onOpenScanner: () => void;
  onSelectForComparison: (product: ProductData) => void;
  onInspectProduct: (product: ProductData) => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  historyRecords,
  currentUserId,
  onDeleteRecord,
  onClearAll,
  onOpenScanner,
  onSelectForComparison,
  onInspectProduct,
}) => {
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<ProductData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'cosmetic'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Filter
  const filtered = historyRecords.filter((rec) => {
    if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.productName.toLowerCase().includes(q) ||
        rec.brand.toLowerCase().includes(q) ||
        (rec.barcode && rec.barcode.includes(q))
      );
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.scanDate).getTime() - new Date(b.scanDate).getTime();
    }
    if (sortBy === 'highest') {
      return b.score - a.score;
    }
    if (sortBy === 'lowest') {
      return a.score - b.score;
    }
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice((validPage - 1) * pageSize, validPage * pageSize);

  const foodCount = historyRecords.filter((r) => r.category === 'food').length;
  const cosmeticCount = historyRecords.filter((r) => r.category === 'cosmetic').length;

  return (
    <section className="py-10 bg-[#F8FAF3] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#244D2C]/15 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center">
                  <History className="w-4 h-4 text-[#F07853]" />
                </div>
                <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#244D2C]">
                  Product Scan History Library
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#244D2C]/75">
                Every scanned product is permanently archived. Inspect full original reports anytime with zero latency &amp; zero additional AI cost.
              </p>
            </div>

            {/* User Isolation & Firestore Database Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#EAF2D5] text-[#244D2C] border border-[#244D2C]/15 flex items-center space-x-1">
                <span>User:</span>
                <strong>{currentUserId}</strong>
              </span>

              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloud Firestore Synced</span>
              </span>

              {historyRecords.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={isClearing}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isClearing ? 'Clearing...' : 'Clear History'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-[#F8FAF3] border border-[#244D2C]/10">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Total Scans Saved</span>
              <span className="font-['Playfair_Display'] text-xl font-bold text-[#244D2C]">
                {historyRecords.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAF3] border border-[#244D2C]/10">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Food Audits</span>
              <span className="font-['Playfair_Display'] text-xl font-bold text-[#16A34A]">
                {foodCount}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8FAF3] border border-[#244D2C]/10">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Cosmetic Audits</span>
              <span className="font-['Playfair_Display'] text-xl font-bold text-[#F07853]">
                {cosmeticCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#244D2C]/15 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Category Filter */}
          <div className="flex items-center space-x-1 w-full md:w-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-[#244D2C] text-[#EAF2D5]'
                  : 'text-[#244D2C]/70 hover:bg-gray-100'
              }`}
            >
              All ({historyRecords.length})
            </button>
            <button
              onClick={() => setCategoryFilter('food')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                categoryFilter === 'food'
                  ? 'bg-[#244D2C] text-[#EAF2D5]'
                  : 'text-[#244D2C]/70 hover:bg-gray-100'
              }`}
            >
              <Apple className="w-3 h-3 text-[#16A34A]" />
              <span>Foods ({foodCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('cosmetic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                categoryFilter === 'cosmetic'
                  ? 'bg-[#244D2C] text-[#EAF2D5]'
                  : 'text-[#244D2C]/70 hover:bg-gray-100'
              }`}
            >
              <Droplets className="w-3 h-3 text-[#F07853]" />
              <span>Cosmetics ({cosmeticCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past scans by brand or name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAF3] border border-[#244D2C]/15 rounded-xl text-[#244D2C] focus:outline-hidden focus:ring-2 focus:ring-[#244D2C]/20"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#244D2C] w-full md:w-auto justify-end">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/15 text-xs text-[#244D2C] font-semibold"
            >
              <option value="newest">Newest Scanned</option>
              <option value="oldest">Oldest Scanned</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </div>

        {/* History Cards Grid */}
        {sorted.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#244D2C]/15 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF2D5] flex items-center justify-center text-[#244D2C]">
              <History className="w-8 h-8 text-[#244D2C]" />
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#244D2C]">
                {historyRecords.length === 0
                  ? 'No Saved Scans Yet'
                  : 'No Scans Match Filter'}
              </h3>
              <p className="text-xs text-[#244D2C]/70 max-w-md mx-auto mt-1">
                {historyRecords.length === 0
                  ? `User "${currentUserId}" hasn't scanned any products yet. Launch the live scanner or click any catalog demo benchmark to test persistence.`
                  : 'Try clearing your search query or switching category filters.'}
              </p>
            </div>
            <button
              onClick={onOpenScanner}
              className="px-5 py-2.5 bg-[#244D2C] text-[#EAF2D5] font-semibold text-xs rounded-xl shadow-md hover:bg-[#1A3620] inline-flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-[#F07853]" />
              <span>Launch Live Scanner</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((record) => {
                const scoreTen = (record.score / 10).toFixed(1);
                const isHigh = record.score >= 80;
                const isMid = record.score >= 60 && record.score < 80;
                const formattedDate = new Date(record.scanDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl p-5 border border-[#244D2C]/15 hover:border-[#244D2C]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Category and Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#244D2C]/10 text-[#244D2C]">
                          {record.category === 'food' ? '🥗 Food' : '🧴 Cosmetic'}
                        </span>
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                            isHigh
                              ? 'bg-[#16A34A]/10 text-[#16A34A]'
                              : isMid
                              ? 'bg-[#D97706]/10 text-[#D97706]'
                              : 'bg-[#DC2626]/10 text-[#DC2626]'
                          }`}
                        >
                          {scoreTen} / 10
                        </span>
                      </div>

                      {/* Brand & Name */}
                      <div>
                        <p className="text-xs font-semibold text-[#F07853]">{record.brand}</p>
                        <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C] line-clamp-1">
                          {record.productName}
                        </h4>
                        <p className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </p>
                      </div>

                      {/* Snippet */}
                      {record.whatsGood && record.whatsGood.length > 0 && (
                        <p className="text-[11px] text-[#244D2C]/80 line-clamp-2 bg-[#F8FAF3] p-2 rounded-lg border border-[#244D2C]/10">
                          {record.whatsGood[0]}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#244D2C]/10 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedRecordForModal(record.productData)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] font-semibold text-[11px] flex items-center space-x-1 transition-colors"
                          title="Replay full analysis report without AI cost"
                        >
                          <Eye className="w-3 h-3 text-[#F07853]" />
                          <span>View Report</span>
                        </button>

                        <button
                          onClick={() => onInspectProduct(record.productData)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px] transition-colors"
                          title="Open on main dashboard"
                        >
                          Dashboard
                        </button>

                        <button
                          onClick={() => onSelectForComparison(record.productData)}
                          className="p-1.5 rounded-lg text-[#244D2C]/70 hover:text-[#244D2C] hover:bg-gray-100"
                          title="Add to comparison"
                        >
                          <GitCompare className="w-3.5 h-3.5 text-[#F07853]" />
                        </button>
                      </div>

                      <button
                        onClick={async () => {
                          setDeletingId(record.id);
                          try {
                            await onDeleteRecord(record.id);
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        disabled={deletingId === record.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete this scan from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#244D2C]/15 bg-white p-4 rounded-2xl">
                <div className="text-xs text-gray-600">
                  Showing <strong>{(validPage - 1) * pageSize + 1}</strong> to{' '}
                  <strong>{Math.min(validPage * pageSize, sorted.length)}</strong> of{' '}
                  <strong>{sorted.length}</strong> items
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validPage <= 1}
                    className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center space-x-1 text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs font-semibold px-3 py-1.5 bg-[#244D2C]/10 text-[#244D2C] rounded-lg">
                    Page {validPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validPage >= totalPages}
                    className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center space-x-1 text-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-red-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#244D2C]">
                Clear All Scan History?
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                This will delete all saved scan records for user <strong>{currentUserId}</strong>. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Report Modal */}
      <FullReportModal
        product={selectedRecordForModal}
        onClose={() => setSelectedRecordForModal(null)}
        onSelectForComparison={onSelectForComparison}
      />
    </section>
  );
};
