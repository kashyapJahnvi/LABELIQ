import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Calendar, ShieldCheck, Apple, Droplets } from 'lucide-react';
import { ProductData } from '../types';

interface FullReportModalProps {
  product: ProductData | null;
  onClose: () => void;
  onSelectForComparison?: (product: ProductData) => void;
}

export const FullReportModal: React.FC<FullReportModalProps> = ({
  product,
  onClose,
  onSelectForComparison,
}) => {
  if (!product) return null;

  const scoreTen = (product.suitabilityScore / 10).toFixed(1);
  const isHigh = product.suitabilityScore >= 80;
  const isMid = product.suitabilityScore >= 60 && product.suitabilityScore < 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#FCFDF9] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-[#244D2C]/20 overflow-y-auto my-6 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#244D2C]/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-[#244D2C]/10 text-[#244D2C]">
                {product.category === 'food' ? '🥗 Food Audit' : '🧴 Cosmetic Audit'}
              </span>
              <span className="text-xs font-semibold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-lg">
                Original Full Report (0 Token Replay)
              </span>
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#244D2C] mt-1">
              {product.productName}
            </h2>
            <p className="text-xs font-semibold text-[#F07853]">by {product.brand}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Score & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-[#F8FAF3] p-5 rounded-2xl border border-[#244D2C]/10">
          <div className="text-center sm:border-r border-[#244D2C]/10 pr-4">
            <span className="text-[10px] font-bold uppercase text-gray-500">Suitability Score</span>
            <p className="font-['Playfair_Display'] text-4xl font-extrabold text-[#244D2C]">
              {scoreTen} <span className="text-sm font-normal text-gray-500">/ 10</span>
            </p>
            <span
              className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                isHigh ? 'bg-green-100 text-green-800' : isMid ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isHigh ? 'Very Good' : isMid ? 'Moderate' : 'Concerns'}
            </span>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <p className="text-xs text-[#244D2C]/80 font-medium leading-relaxed">
              <strong>Scoring Rationale:</strong> {product.scoreRationale}
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-white p-1.5 rounded-lg border">
                <span className="text-gray-500 block">Safety</span>
                <span className="font-bold text-[#16A34A]">{product.scoreBreakdown.ingredientSafety}%</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border">
                <span className="text-gray-500 block">Quality</span>
                <span className="font-bold text-[#F07853]">{product.scoreBreakdown.nutritionalOrCosmeticQuality}%</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border">
                <span className="text-gray-500 block">Purity</span>
                <span className="font-bold text-[#244D2C]">{product.scoreBreakdown.additivePurity}%</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border">
                <span className="text-gray-500 block">Transparency</span>
                <span className="font-bold text-[#D97706]">{product.scoreBreakdown.transparency}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#EAF2D5]/50 border border-[#244D2C]/10 text-xs space-y-1">
            <span className="font-bold text-[#244D2C] flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Key Wholesome Ingredients:</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[#244D2C]/80 pl-1">
              {product.whatsGood.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#FFE4D9]/60 border border-[#F07853]/20 text-xs space-y-1">
            <span className="font-bold text-[#9C3218] flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F07853]" />
              <span>Considerations &amp; Additives:</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[#9C3218] pl-1">
              {product.whatToConsider.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full Ingredient Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-[#244D2C]">
            Decoded Ingredients List ({product.ingredients.length} items)
          </h3>
          <div className="max-h-60 overflow-y-auto space-y-2 border border-[#244D2C]/10 rounded-xl p-3 bg-white">
            {product.ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#F8FAF3] border border-[#244D2C]/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#244D2C]">{ing.name}</span>
                    {ing.isNatural && (
                      <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.2 rounded">
                        Natural
                      </span>
                    )}
                    {ing.commonAllergen && (
                      <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                        Allergen: {ing.allergenType}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#244D2C]/70 mt-0.5">
                    <strong>Role:</strong> {ing.purpose} · <strong>Why used:</strong> {ing.whyUsed}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    ing.safetyRating === 'safe'
                      ? 'bg-green-100 text-green-800'
                      : ing.safetyRating === 'caution'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ing.safetyRating}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-[#244D2C]/10">
          {onSelectForComparison && (
            <button
              onClick={() => {
                onSelectForComparison(product);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#EAF2D5] text-[#244D2C] rounded-xl hover:bg-[#EAF2D5]/80"
            >
              Compare with Another
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#244D2C] text-[#EAF2D5] rounded-xl hover:bg-[#1A3620]"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
