import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategorySection } from './components/CategorySection';
import { ProductDashboard } from './components/ProductDashboard';
import { ScanHistoryPage } from './components/ScanHistoryPage';
import { ScannerModal } from './components/ScannerModal';
import { ProductComparison } from './components/ProductComparison';
import { HealthProfileModal } from './components/HealthProfileModal';
import { FeedbackModal } from './components/FeedbackModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { AuthModal } from './components/AuthModal';
import { InfoSections } from './components/InfoSections';
import { MOCK_PRODUCTS } from './data/mockProducts';
import {
  ProductCategory,
  ProductData,
  ScanHistoryRecord,
  UserHealthProfile,
} from './types';
import {
  fetchScanHistory,
  deleteScanRecord,
  clearAllHistory,
  getActiveUserId,
  setActiveUserId,
  getTutorialProgress,
} from './services/historyService';
import { testConnection } from './firebase/config';
import { AuthProvider, useAuth } from './context/AuthContext';

const DEFAULT_PROFILE: UserHealthProfile = {
  allergies: ['Gluten', 'Soy'],
  conditions: [],
  diets: ['Clean Label'],
  skinTypes: ['Sensitive Skin'],
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductData>(MOCK_PRODUCTS[0]);
  const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
  const [historyRecords, setHistoryRecords] = useState<ScanHistoryRecord[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>(() => user?.uid || getActiveUserId());
  const [userProfile, setUserProfile] = useState<UserHealthProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('labeliq_health_profile');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_PROFILE;
  });

  // Modal Controllers
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isHealthProfileOpen, setIsHealthProfileOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Comparison State
  const [comparisonProductA, setComparisonProductA] = useState<ProductData | null>(null);
  const [comparisonProductB, setComparisonProductB] = useState<ProductData | null>(null);

  // Feedback Context State
  const [feedbackPreselectedProduct, setFeedbackPreselectedProduct] = useState<ProductData | null>(null);

  // Sync user state with history service
  useEffect(() => {
    if (user) {
      setCurrentUserId(user.uid);
      setActiveUserId(user.uid);
    } else {
      const active = getActiveUserId();
      setCurrentUserId(active);
    }
  }, [user]);

  // Validate Firestore server connectivity on boot
  useEffect(() => {
    testConnection().catch(() => {});
  }, []);

  // Load Scan History on mount and when user changes
  useEffect(() => {
    loadHistory();
    checkTutorial();
  }, [currentUserId, user]);

  const loadHistory = async () => {
    const list = await fetchScanHistory();
    setHistoryRecords(list);
  };

  const checkTutorial = async () => {
    const progress = await getTutorialProgress();
    if (!progress.completed && !progress.dismissed) {
      // Auto-launch guide on very first visit
      setIsGuideOpen(true);
    }
  };

  // Update Health Profile
  const handleUpdateProfile = (updated: UserHealthProfile) => {
    setUserProfile(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('labeliq_health_profile', JSON.stringify(updated));
    }
  };

  // User Switcher Handler
  const handleUserChanged = (newUserId: string) => {
    setCurrentUserId(newUserId);
    setActiveUserId(newUserId);
    loadHistory();
  };

  // Product Selection
  const handleSelectProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setIsHistoryView(false);
    setTimeout(() => {
      const el = document.getElementById('product-dashboard');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle Scan Completed
  const handleScanComplete = (product: ProductData) => {
    setSelectedProduct(product);
    loadHistory();
    setIsHistoryView(false);
    setTimeout(() => {
      const el = document.getElementById('product-dashboard');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // History Actions
  const handleDeleteHistoryRecord = async (id: string) => {
    await deleteScanRecord(id);
    await loadHistory();
  };

  const handleClearAllHistory = async () => {
    await clearAllHistory();
    await loadHistory();
  };

  const handleOpenComparisonWithProduct = (product: ProductData) => {
    setComparisonProductA(selectedProduct);
    setComparisonProductB(product);
    setIsComparisonOpen(true);
  };

  const handleReportIncorrect = (product: ProductData) => {
    setFeedbackPreselectedProduct(product);
    setIsFeedbackOpen(true);
  };

  const foodCount = MOCK_PRODUCTS.filter((p) => p.category === 'food').length;
  const cosmeticCount = MOCK_PRODUCTS.filter((p) => p.category === 'cosmetic').length;

  return (
    <div className="min-h-screen bg-[#F8FAF3] text-[#243426] font-['Plus_Jakarta_Sans'] flex flex-col selection:bg-[#F07853]/20 selection:text-[#244D2C]">
      {/* Top Navigation */}
      <Navbar
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenHistory={() => setIsHistoryView(true)}
        onOpenComparison={() => {
          setComparisonProductA(selectedProduct);
          setComparisonProductB(
            MOCK_PRODUCTS.find((p) => p.productName !== selectedProduct.productName) || MOCK_PRODUCTS[1]
          );
          setIsComparisonOpen(true);
        }}
        onOpenFeedback={() => {
          setFeedbackPreselectedProduct(null);
          setIsFeedbackOpen(true);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenHealthProfile={() => setIsHealthProfileOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setIsHistoryView(false);
        }}
        historyCount={historyRecords.length}
        userProfile={userProfile}
        currentUserId={currentUserId}
        onUserChanged={handleUserChanged}
      />

      <main className="flex-1">
        {isHistoryView ? (
          /* DEDICATED SCAN HISTORY DASHBOARD */
          <ScanHistoryPage
            historyRecords={historyRecords}
            currentUserId={currentUserId}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearAll={handleClearAllHistory}
            onOpenScanner={() => setIsScannerOpen(true)}
            onSelectForComparison={handleOpenComparisonWithProduct}
            onInspectProduct={handleSelectProduct}
          />
        ) : (
          /* STANDARD HOMEPAGE & CLINICAL DASHBOARD */
          <>
            {/* Hero Section with Botanical Aesthetics & 1-Click Demo Benchmark Bar */}
            <Hero
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectProduct={handleSelectProduct}
              mockProducts={MOCK_PRODUCTS}
            />

            {/* Category Intelligence Hub */}
            <CategorySection
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                const matched = MOCK_PRODUCTS.find(
                  (p) => cat === 'all' || p.category === cat
                );
                if (matched) handleSelectProduct(matched);
              }}
              foodCount={foodCount}
              cosmeticCount={cosmeticCount}
            />

            {/* Primary Clinical & Transparency Audit Dashboard */}
            <ProductDashboard
              product={selectedProduct}
              userProfile={userProfile}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenComparison={() => {
                setComparisonProductA(selectedProduct);
                setComparisonProductB(
                  MOCK_PRODUCTS.find((p) => p.productName !== selectedProduct.productName) || MOCK_PRODUCTS[1]
                );
                setIsComparisonOpen(true);
              }}
              onReportIncorrect={handleReportIncorrect}
            />

            {/* Information Sections: How It Works & Hackathon Mission */}
            <InfoSections
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenHistory={() => setIsHistoryView(true)}
              onOpenComparison={() => setIsComparisonOpen(true)}
              onOpenFeedback={() => {
                setFeedbackPreselectedProduct(null);
                setIsFeedbackOpen(true);
              }}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenHealthProfile={() => setIsHealthProfileOpen(true)}
            />
          </>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Multi-modal Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
        catalogProducts={MOCK_PRODUCTS}
      />

      {/* 2. Side-by-Side Product Comparison Matrix */}
      <ProductComparison
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        availableProducts={
          historyRecords.length > 0
            ? [...MOCK_PRODUCTS, ...historyRecords.map((r) => r.productData)]
            : MOCK_PRODUCTS
        }
        initialProductA={comparisonProductA}
        initialProductB={comparisonProductB}
        userProfile={userProfile}
      />

      {/* 3. Personal Health & Allergy Profile */}
      <HealthProfileModal
        isOpen={isHealthProfileOpen}
        onClose={() => setIsHealthProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* 4. Feedback & Human Review Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        preselectedProduct={feedbackPreselectedProduct}
        onOpenAuth={() => {
          setIsFeedbackOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* 5. 10-Step Interactive Guided Tour */}
      <GuidedTourModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLaunchScanner={() => setIsScannerOpen(true)}
      />

      {/* 6. Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
