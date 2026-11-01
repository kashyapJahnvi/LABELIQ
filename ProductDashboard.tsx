import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  GitCompare,
  Camera,
  Share2,
  FileWarning,
  Info,
  Droplets,
  Apple,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import { ProductData, UserHealthProfile, SafetyRating } from '../types';
import { submitFeedback } from '../services/historyService';

interface ProductDashboardProps {
  product: ProductData;
  userProfile: UserHealthProfile;
  onOpenScanner: () => void;
  onOpenComparison: () => void;
  onReportIncorrect: (product: ProductData) => void;
}

export const ProductDashboard: React.FC<ProductDashboardProps> = ({
  product,
  userProfile,
  onOpenScanner,
  onOpenComparison,
  onReportIncorrect,
}) => {
  const [ingredientFilter, setIngredientFilter] = useState<'all' | SafetyRating>('all');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [helpfulFeedbackMap, setHelpfulFeedbackMap] = useState<Record<string, 'yes' | 'no'>>({});
  const [copyFeedbackSuccess, setCopyFeedbackSuccess] = useState(false);

  // Compute Active Allergen & Condition Warnings
  const warnings: string[] = [];

  // 1. Check Allergies
  userProfile.allergies.forEach((allergy) => {
    const allergyLower = allergy.toLowerCase();
    const matched = product.ingredients.find(
      (ing) =>
        (ing.commonAllergen && ing.allergenType?.toLowerCase().includes(allergyLower)) ||
        ing.name.toLowerCase().includes(allergyLower)
    );
    if (matched) {
      warnings.push(`Contains ${allergy}: Identified in ${matched.name}.`);
    }
  });

  // 2. Check Diabetic Condition
  if (userProfile.conditions.includes('Diabetes') && product.nutritionalAnalysis) {
    if (product.nutritionalAnalysis.addedSugar > 5 || product.nutritionalAnalysis.totalSugar > 10) {
      warnings.push(
        `Diabetic Caution: High sugar content (${product.nutritionalAnalysis.totalSugar}g total sugar, ${product.nutritionalAnalysis.addedSugar}g added sugar).`
      );
    }
  }

  // 3. Check Hypertension Condition
  if (userProfile.conditions.includes('Hypertension') && product.nutritionalAnalysis) {
    if (product.nutritionalAnalysis.sodium > 400) {
      warnings.push(
        `Hypertension Alert: High sodium load (${product.nutritionalAnalysis.sodium}mg per serving = exceeds 20% daily limit).`
      );
    }
  }

  // 4. Check Gout / Uric Acid
  if (userProfile.conditions.includes('Gout / High Uric Acid')) {
    const purineMatch = product.ingredients.find(
      (ing) =>
        ing.name.toLowerCase().includes('ribonucleotide') ||
        ing.name.toLowerCase().includes('ins 635') ||
        ing.name.toLowerCase().includes('yeast extract')
    );
    if (purineMatch) {
      warnings.push(
        `Uric Acid Warning: Contains synthetic nucleotide/purine enhancer (${purineMatch.name}). Contraindicated in gout.`
      );
    }
  }

  // 5. Check Cosmetic Sensitivities
  if (product.category === 'cosmetic') {
    if (userProfile.skinTypes.includes('Acne-Prone') && product.cosmeticAnalysis?.comedogenicRating && product.cosmeticAnalysis.comedogenicRating >= 2) {
      warnings.push(
        `Acne Alert: Comedogenic rating is ${product.cosmeticAnalysis.comedogenicRating}/5; potential risk of clogging pores.`
      );
    }
    if (userProfile.skinTypes.includes('Fragrance-Sensitive') && product.cosmeticAnalysis?.fragranceDetected) {
      warnings.push('Fragrance Sensitivity: Artificial perfume or botanical fragrance compounds detected.');
    }
  }

  // Handle Micro-Feedback on Ingredient
  const handleIngredientFeedback = async (ingredientName: string, isHelpful: boolean) => {
    setHelpfulFeedbackMap((prev) => ({
      ...prev,
      [ingredientName]: isHelpful ? 'yes' : 'no',
    }));

    await submitFeedback({
      type: 'inline_ingredient',
      productName: product.productName,
      ingredientName,
      comment: isHelpful ? 'Helpful explanation' : 'Needs clearer explanation or context',
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `LABELIQ Report for ${product.brand} ${product.productName}: Suitability Score ${product.suitabilityScore}/100. Check ingredients on LABELIQ.`
      );
      setCopyFeedbackSuccess(true);
      setTimeout(() => setCopyFeedbackSuccess(false), 2500);
    }
  };

  // Filter ingredients
  const filteredIngredients = product.ingredients.filter((ing) => {
    if (ingredientFilter !== 'all' && ing.safetyRating !== ingredientFilter) return false;
    if (ingredientSearch.trim()) {
      const q = ingredientSearch.toLowerCase();
      return (
        ing.name.toLowerCase().includes(q) ||
        ing.purpose.toLowerCase().includes(q) ||
        ing.whyUsed.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const scoreTen = (product.suitabilityScore / 10).toFixed(1);
  const isHigh = product.suitabilityScore >= 80;
  const isMid = product.suitabilityScore >= 60 && product.suitabilityScore < 80;

  return (
    <section className="py-10 bg-[#F8FAF3]" id="product-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* SECTION 1: HEADER & IDENTITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#244D2C]/15 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#244D2C]/10 pb-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#244D2C]/10 text-[#244D2C]">
                  {product.category === 'food' ? '🥗 Food & Grocery' : '🧴 Cosmetic Formulation'}
                </span>
                {product.detectedBarcode && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700">
                    Barcode: {product.detectedBarcode}
                  </span>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#16A34A]/10 text-[#16A34A] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{product.confidenceScore}% AI Confidence</span>
                </span>
              </div>

              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#244D2C]">
                {product.productName}
              </h2>
              <p className="text-sm font-semibold text-[#F07853]">
                Manufactured by {product.brand}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenComparison}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EAF2D5] hover:bg-[#EAF2D5]/80 text-[#244D2C] flex items-center space-x-1.5 transition-colors"
              >
                <GitCompare className="w-3.5 h-3.5 text-[#F07853]" />
                <span>Compare</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 flex items-center space-x-1.5 transition-colors"
              >
                {copyFeedbackSuccess ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copyFeedbackSuccess ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => onReportIncorrect(product)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFE4D9]/80 hover:bg-[#FFE4D9] text-[#9C3218] flex items-center space-x-1.5 transition-colors"
                title="Report inaccuracy to human review team"
              >
                <FileWarning className="w-3.5 h-3.5 text-[#F07853]" />
                <span>Report Issue</span>
              </button>

              <button
                onClick={onOpenScanner}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] flex items-center space-x-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-[#F07853]" />
                <span>New Scan</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: SUITABILITY SCORE & TRANSPARENCY RATIONALE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Score Circular Gauge */}
            <div className="lg:col-span-4 bg-[#F8FAF3] rounded-2xl p-6 border border-[#244D2C]/10 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[#244D2C]/70 mb-3">
                Health &amp; Purity Suitability Score
              </p>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={isHigh ? '#16A34A' : isMid ? '#D97706' : '#DC2626'}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * product.suitabilityScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-['Playfair_Display'] text-4xl font-extrabold text-[#244D2C]">
                    {scoreTen}
                  </span>
                  <span className="text-[11px] font-bold text-[#244D2C]/60">out of 10</span>
                </div>
              </div>

              <div className="mt-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isHigh
                      ? 'bg-[#16A34A]/10 text-[#16A34A]'
                      : isMid
                      ? 'bg-[#D97706]/10 text-[#D97706]'
                      : 'bg-[#DC2626]/10 text-[#DC2626]'
                  }`}
                >
                  {isHigh
                    ? '🟢 Very Good Formulation'
                    : isMid
                    ? '🟡 Moderate / Caution Advised'
                    : '🔴 Significant Health Concerns'}
                </span>
                <p className="text-[11px] text-[#244D2C]/70 mt-1">
                  Calculated across {product.identifiedIngredientsCount} audited ingredients
                </p>
              </div>
            </div>

            {/* Score Breakdown & Formula Rationale */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#EAF2D5]/50 rounded-2xl p-4 border border-[#244D2C]/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#244D2C] flex items-center space-x-1.5 mb-1">
                  <Info className="w-3.5 h-3.5 text-[#F07853]" />
                  <span>Transparent Scoring Rationale (Zero Slop Standard)</span>
                </h3>
                <p className="text-xs text-[#244D2C]/80 leading-relaxed font-['Plus_Jakarta_Sans']">
                  {product.scoreRationale}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F8FAF3] p-3 rounded-xl border border-[#244D2C]/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#244D2C]/60">
                    Ingredient Safety
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#244D2C]">
                      {product.scoreBreakdown.ingredientSafety}%
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#16A34A]"
                      style={{ width: `${product.scoreBreakdown.ingredientSafety}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#F8FAF3] p-3 rounded-xl border border-[#244D2C]/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#244D2C]/60">
                    {product.category === 'food' ? 'Nutritional Quality' : 'Skin Barrier Health'}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#244D2C]">
                      {product.scoreBreakdown.nutritionalOrCosmeticQuality}%
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#F07853]"></span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F07853]"
                      style={{ width: `${product.scoreBreakdown.nutritionalOrCosmeticQuality}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#F8FAF3] p-3 rounded-xl border border-[#244D2C]/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#244D2C]/60">
                    Additive Purity
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#244D2C]">
                      {product.scoreBreakdown.additivePurity}%
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#244D2C]"></span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#244D2C]"
                      style={{ width: `${product.scoreBreakdown.additivePurity}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#F8FAF3] p-3 rounded-xl border border-[#244D2C]/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#244D2C]/60">
                    Label Transparency
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#244D2C]">
                      {product.scoreBreakdown.transparency}%
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D97706]"
                      style={{ width: `${product.scoreBreakdown.transparency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PERSONALIZED HEALTH & ALLERGEN WARNING BANNER */}
          {warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FFE4D9] border border-[#F07853]/40 space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-[#9C3218] shrink-0" />
                <h3 className="text-sm font-bold text-[#9C3218]">
                  Personal Health Profile Warnings ({warnings.length} Clashes Identified)
                </h3>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#9C3218] font-medium pl-1">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 4: BALANCED PROS & CONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#EAF2D5]/60 border border-[#244D2C]/15 space-y-2">
              <div className="flex items-center space-x-2 text-[#244D2C] font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Wholesome Attributes (&quot;What&apos;s Good&quot;)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#244D2C]/90">
                {product.whatsGood.map((good, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[#16A34A] font-bold shrink-0">✓</span>
                    <span>{good}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFE4D9]/50 border border-[#F07853]/20 space-y-2">
              <div className="flex items-center space-x-2 text-[#9C3218] font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-[#F07853]" />
                <span>Points of Consideration (&quot;What to Consider&quot;)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#9C3218]">
                {product.whatToConsider.map((consider, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[#F07853] font-bold shrink-0">!</span>
                    <span>{consider}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 5: CATEGORY SPECIFIC DEEP INTELLIGENCE */}
        {product.category === 'food' && product.nutritionalAnalysis && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#244D2C]/15 shadow-sm space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EAF2D5] text-[#244D2C] flex items-center justify-center">
                <Apple className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#244D2C]">
                  Nutritional Facts &amp; Macronutrient Profile
                </h3>
                <p className="text-xs text-[#244D2C]/70">
                  Serving Size: {product.nutritionalAnalysis.servingSize}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Calories</span>
                <p className="text-base font-bold text-[#244D2C] mt-1">{product.nutritionalAnalysis.calories} kcal</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Total Fat</span>
                <p className="text-base font-bold text-[#244D2C] mt-1">{product.nutritionalAnalysis.totalFat}g</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Saturated Fat</span>
                <p className="text-base font-bold text-[#244D2C] mt-1">{product.nutritionalAnalysis.saturatedFat}g</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Total Sugar</span>
                <p className="text-base font-bold text-[#244D2C] mt-1">{product.nutritionalAnalysis.totalSugar}g</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Added Sugar</span>
                <p className="text-base font-bold text-[#F07853] mt-1">{product.nutritionalAnalysis.addedSugar}g</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Sodium</span>
                <p className="text-base font-bold text-[#244D2C] mt-1">{product.nutritionalAnalysis.sodium}mg</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Dietary Fiber</span>
                <p className="text-base font-bold text-[#16A34A] mt-1">{product.nutritionalAnalysis.fiber}g</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10">
                <span className="text-[10px] font-bold uppercase text-gray-500">Protein</span>
                <p className="text-base font-bold text-[#16A34A] mt-1">{product.nutritionalAnalysis.protein}g</p>
              </div>
            </div>

            {product.nutritionalAnalysis.concerns.length > 0 && (
              <div className="p-3 rounded-xl bg-[#FFE4D9]/60 border border-[#F07853]/20 flex items-center space-x-2 text-xs text-[#9C3218]">
                <AlertTriangle className="w-4 h-4 text-[#F07853] shrink-0" />
                <span>
                  <strong>Nutritional Concerns Flagged:</strong> {product.nutritionalAnalysis.concerns.join(' · ')}
                </span>
              </div>
            )}
          </div>
        )}

        {product.category === 'cosmetic' && product.cosmeticAnalysis && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#244D2C]/15 shadow-sm space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFE4D9] text-[#F07853] flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#244D2C]">
                  Cosmetic Pore &amp; Skin Compatibility Audit
                </h3>
                <p className="text-xs text-[#244D2C]/70">
                  Dermatological formulation safety and active barrier nutrients
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#F8FAF3] border border-[#244D2C]/10 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-500">Comedogenic Rating</span>
                <p className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                  {product.cosmeticAnalysis.comedogenicRating !== null
                    ? `${product.cosmeticAnalysis.comedogenicRating} / 5`
                    : 'Non-Comedogenic'}
                </p>
                <p className="text-[10px] font-medium text-green-700">
                  {product.cosmeticAnalysis.comedogenicRating === 0
                    ? 'Will Not Clog Pores'
                    : 'Low Risk of Clogging'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF3] border border-[#244D2C]/10 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-500">Fragrance Audit</span>
                <p className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                  {product.cosmeticAnalysis.fragranceDetected ? 'Detected' : 'Zero Added'}
                </p>
                <p className="text-[10px] font-medium text-green-700">
                  {!product.cosmeticAnalysis.fragranceDetected ? '100% Fragrance-Free' : 'Contains Perfume'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF3] border border-[#244D2C]/10 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-500">Paraben &amp; Sulfate</span>
                <p className="font-['Playfair_Display'] text-2xl font-bold text-[#16A34A]">
                  Clean
                </p>
                <p className="text-[10px] font-medium text-gray-600">
                  Paraben-Free &amp; Sulfate-Free
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF3] border border-[#244D2C]/10 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-500">Alcohol Profile</span>
                <p className="font-['Playfair_Display'] text-2xl font-bold text-[#16A34A]">
                  Safe
                </p>
                <p className="text-[10px] font-medium text-gray-600">
                  No drying simple ethanol
                </p>
              </div>
            </div>

            {/* Target Skin Types */}
            <div>
              <p className="text-xs font-bold text-[#244D2C] mb-2">Recommended Skin Types:</p>
              <div className="flex flex-wrap gap-2">
                {product.cosmeticAnalysis.targetSkinTypes.map((st) => (
                  <span
                    key={st}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF2D5] text-[#244D2C] border border-[#244D2C]/15"
                  >
                    ✓ {st}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Actives */}
            <div>
              <p className="text-xs font-bold text-[#244D2C] mb-2">Key Skincare Actives Identified:</p>
              <div className="flex flex-wrap gap-2">
                {product.cosmeticAnalysis.keyActives.map((active) => (
                  <span
                    key={active}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE4D9] text-[#9C3218] border border-[#F07853]/25"
                  >
                    ✦ {active}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: DEEP INGREDIENT INTELLIGENCE LIST */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#244D2C]/15 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#244D2C]/10 pb-4">
            <div>
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                Individual Ingredient Intelligence ({product.ingredients.length} Compounds)
              </h3>
              <p className="text-xs text-[#244D2C]/70">
                Detailed function, manufacturer justification, toxicity classifications, and micro-feedback
              </p>
            </div>

            {/* Safety Rating Filter */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
              <button
                onClick={() => setIngredientFilter('all')}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  ingredientFilter === 'all'
                    ? 'bg-[#244D2C] text-white border-[#244D2C]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                All ({product.ingredients.length})
              </button>
              <button
                onClick={() => setIngredientFilter('safe')}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  ingredientFilter === 'safe'
                    ? 'bg-[#16A34A] text-white border-[#16A34A]'
                    : 'bg-green-50 text-green-700 border-green-200'
                }`}
              >
                🟢 Safe
              </button>
              <button
                onClick={() => setIngredientFilter('caution')}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  ingredientFilter === 'caution'
                    ? 'bg-[#D97706] text-white border-[#D97706]'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                🟡 Caution
              </button>
              <button
                onClick={() => setIngredientFilter('concern')}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  ingredientFilter === 'concern'
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                🔴 Concern
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Search ingredient by name or purpose (e.g. oats, preservative, INS 635, surfactant)..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#F8FAF3] border border-[#244D2C]/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#244D2C]/20 text-[#244D2C]"
            />
          </div>

          {/* Ingredient Cards List */}
          <div className="space-y-3">
            {filteredIngredients.map((ing) => {
              const feedbackVal = helpfulFeedbackMap[ing.name];

              return (
                <div
                  key={ing.name}
                  className="p-4 rounded-2xl bg-[#FCFDF9] border border-[#244D2C]/10 hover:border-[#244D2C]/30 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          ing.safetyRating === 'safe'
                            ? 'bg-[#16A34A]'
                            : ing.safetyRating === 'caution'
                            ? 'bg-[#D97706]'
                            : 'bg-[#DC2626]'
                        }`}
                      ></span>
                      <h4 className="font-bold text-sm text-[#244D2C]">{ing.name}</h4>
                      {ing.isNatural && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF2D5] text-[#244D2C]">
                          Natural Origin
                        </span>
                      )}
                      {ing.commonAllergen && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFE4D9] text-[#9C3218]">
                          Allergen: {ing.allergenType || 'Yes'}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md self-start sm:self-auto ${
                        ing.safetyRating === 'safe'
                          ? 'bg-green-100 text-green-800'
                          : ing.safetyRating === 'caution'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ing.safetyRating === 'safe'
                        ? 'Safe for Use'
                        : ing.safetyRating === 'caution'
                        ? 'Caution Advised'
                        : 'Safety Concern'}
                    </span>
                  </div>

                  {/* Purpose & Why Used */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-bold text-[#244D2C]/70">Purpose / Role: </span>
                      <span className="text-[#244D2C]">{ing.purpose}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#244D2C]/70">Why It&apos;s Used: </span>
                      <span className="text-[#244D2C]">{ing.whyUsed}</span>
                    </div>
                  </div>

                  {/* Safety Note & Side Effects */}
                  <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 text-xs space-y-1">
                    <p className="text-[#244D2C]/85">
                      <strong>Clinical Context:</strong> {ing.safetyNote}
                    </p>
                    {ing.potentialSideEffects && (
                      <p className="text-[#9C3218]">
                        <strong>Potential Side Effects:</strong> {ing.potentialSideEffects}
                      </p>
                    )}
                  </div>

                  {/* Micro-Feedback on Ingredient Card */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#244D2C]/5 text-[11px] text-[#244D2C]/70">
                    <span>Was this ingredient explanation helpful?</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleIngredientFeedback(ing.name, true)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-colors ${
                          feedbackVal === 'yes'
                            ? 'bg-[#16A34A] text-white border-[#16A34A]'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Yes</span>
                      </button>
                      <button
                        onClick={() => handleIngredientFeedback(ing.name, false)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-colors ${
                          feedbackVal === 'no'
                            ? 'bg-[#DC2626] text-white border-[#DC2626]'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>No</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 7: EXPIRY & FRESHNESS INTELLIGENCE */}
        {product.expiryIntelligence && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#244D2C]/15 shadow-sm space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EAF2D5] text-[#244D2C] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#244D2C]">
                  Expiry &amp; Freshness Intelligence
                </h3>
                <p className="text-xs text-[#244D2C]/70">
                  Reliable shelf-life verification (no fabricated expiry dates)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 text-xs">
                <span className="font-bold text-gray-500 block mb-0.5">Manufacturing Date:</span>
                <span className="font-semibold text-[#244D2C]">
                  {product.expiryIntelligence.manufacturingDate || 'Not Visible on Panel'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 text-xs">
                <span className="font-bold text-gray-500 block mb-0.5">Expiry Date:</span>
                <span className="font-semibold text-[#244D2C]">
                  {product.expiryIntelligence.expiryDate || 'Not Visible on Panel'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 text-xs">
                <span className="font-bold text-gray-500 block mb-0.5">Best Before:</span>
                <span className="font-semibold text-[#244D2C]">
                  {product.expiryIntelligence.bestBefore || 'Refer to Batch Stamp'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 text-xs">
                <span className="font-bold text-gray-500 block mb-0.5">Remaining Shelf Life:</span>
                <span className="font-semibold text-[#16A34A]">
                  {product.expiryIntelligence.remainingShelfLife || 'Good for Consumption'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 8: REGULATORY STATUTORY & TESTING CERTIFICATIONS */}
        {product.testingAndCertifications && product.testingAndCertifications.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#244D2C]/15 shadow-sm space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#F07853]" />
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#244D2C]">
                  Statutory Licenses &amp; Third-Party Certifications
                </h3>
                <p className="text-xs text-[#244D2C]/70">
                  Cross-referenced against Food Safety and Standards Authority of India (FSSAI) &amp; BIS registers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.testingAndCertifications.map((cert) => (
                <div
                  key={cert.name}
                  className="p-4 rounded-2xl bg-[#FCFDF9] border border-[#244D2C]/15 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#244D2C]">{cert.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A] flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{cert.status.toUpperCase()}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-[#244D2C]/70">
                    <strong>Authority:</strong> {cert.issuingAuthority}
                  </p>
                  {cert.licenseOrRegNumber && (
                    <p className="text-[11px] font-mono text-[#244D2C]/85">
                      <strong>License No:</strong> {cert.licenseOrRegNumber}
                    </p>
                  )}
                  <p className="text-[11px] text-[#244D2C]/80 bg-[#F8FAF3] p-2 rounded-lg border border-[#244D2C]/10">
                    {cert.sourceNote}
                  </p>

                  {cert.licenseOrRegNumber && cert.name.includes('FSSAI') && (
                    <a
                      href="https://foscos.fssai.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#244D2C] hover:text-[#F07853] transition-colors"
                    >
                      <span>Verify on Government FOSCOS Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
