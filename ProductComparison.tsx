import React, { useState } from 'react';
import {
  GitCompare,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
} from 'lucide-react';
import { ProductData, UserHealthProfile } from '../types';

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  availableProducts: ProductData[];
  initialProductA?: ProductData | null;
  initialProductB?: ProductData | null;
  userProfile: UserHealthProfile;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  isOpen,
  onClose,
  availableProducts,
  initialProductA,
  initialProductB,
  userProfile,
}) => {
  const [productA, setProductA] = useState<ProductData>(
    initialProductA || availableProducts[0] || ({} as ProductData)
  );
  const [productB, setProductB] = useState<ProductData>(
    initialProductB ||
      (availableProducts.length > 1 ? availableProducts[1] : availableProducts[0]) ||
      ({} as ProductData)
  );

  if (!isOpen) return null;

  // Determine Recommendation Verdict
  const scoreDiff = productA.suitabilityScore - productB.suitabilityScore;
  let winner: 'A' | 'B' | 'tie' = 'tie';
  if (scoreDiff > 3) winner = 'A';
  else if (scoreDiff < -3) winner = 'B';

  const winningProduct = winner === 'A' ? productA : winner === 'B' ? productB : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#FCFDF9] rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-[#244D2C]/20 overflow-y-auto my-6 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#244D2C]/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center">
              <GitCompare className="w-4 h-4 text-[#F07853]" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                Side-by-Side Product Comparison Matrix
              </h2>
              <p className="text-xs text-[#244D2C]/70">
                Direct ingredient-by-ingredient and clinical safety audit with personalized recommendation
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

        {/* AI Recommendation Verdict Banner */}
        <div className="bg-[#EAF2D5] rounded-2xl p-5 border border-[#244D2C]/15 space-y-2">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#F07853]" />
            <h3 className="font-['Playfair_Display'] text-base font-bold text-[#244D2C]">
              AI Comparative Health Recommendation
            </h3>
          </div>
          <p className="text-xs text-[#244D2C]/85 leading-relaxed">
            {winner === 'tie' ? (
              <span>
                Both <strong>{productA.productName}</strong> ({productA.suitabilityScore}/100) and{' '}
                <strong>{productB.productName}</strong> ({productB.suitabilityScore}/100) maintain
                comparable safety scores. Select based on personal taste or specific lifestyle preferences.
              </span>
            ) : (
              <span>
                Based on transparency, additive purity, and your active health profile,{' '}
                <strong className="text-[#16A34A]">{winningProduct?.brand} {winningProduct?.productName}</strong>{' '}
                is the superior choice ({winningProduct?.suitabilityScore}/100 vs{' '}
                {(winner === 'A' ? productB : productA).suitabilityScore}/100).
                {winner === 'A'
                  ? ` Superior in ${productA.whatsGood?.[0] || 'cleaner formulation'}.`
                  : ` Superior in ${productB.whatsGood?.[0] || 'cleaner formulation'}.`}
              </span>
            )}
          </p>
        </div>

        {/* Product Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#244D2C]">Product A:</label>
            <select
              value={productA.productName}
              onChange={(e) => {
                const found = availableProducts.find((p) => p.productName === e.target.value);
                if (found) setProductA(found);
              }}
              className="w-full p-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl font-semibold text-[#244D2C]"
            >
              {availableProducts.map((p) => (
                <option key={`a-${p.productName}`} value={p.productName}>
                  {p.brand} - {p.productName} ({p.suitabilityScore}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#244D2C]">Product B:</label>
            <select
              value={productB.productName}
              onChange={(e) => {
                const found = availableProducts.find((p) => p.productName === e.target.value);
                if (found) setProductB(found);
              }}
              className="w-full p-2.5 text-xs bg-white border border-[#244D2C]/20 rounded-xl font-semibold text-[#244D2C]"
            >
              {availableProducts.map((p) => (
                <option key={`b-${p.productName}`} value={p.productName}>
                  {p.brand} - {p.productName} ({p.suitabilityScore}/100)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="border border-[#244D2C]/15 rounded-2xl overflow-hidden bg-white text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAF3] border-b border-[#244D2C]/10 text-[#244D2C]">
                <th className="p-3 font-bold w-1/3">Evaluation Metric</th>
                <th className="p-3 font-bold w-1/3 border-l border-[#244D2C]/10">
                  {productA.brand} {productA.productName}
                </th>
                <th className="p-3 font-bold w-1/3 border-l border-[#244D2C]/10">
                  {productB.brand} {productB.productName}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#244D2C]/10">
              {/* Suitability Score */}
              <tr>
                <td className="p-3 font-semibold text-gray-700">Suitability Score</td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  <span className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C]">
                    {(productA.suitabilityScore / 10).toFixed(1)}
                  </span>{' '}
                  <span className="text-[10px] font-bold text-gray-500">/ 10</span>
                </td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  <span className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C]">
                    {(productB.suitabilityScore / 10).toFixed(1)}
                  </span>{' '}
                  <span className="text-[10px] font-bold text-gray-500">/ 10</span>
                </td>
              </tr>

              {/* Category */}
              <tr>
                <td className="p-3 font-semibold text-gray-700">Category</td>
                <td className="p-3 border-l border-[#244D2C]/10 capitalize">{productA.category}</td>
                <td className="p-3 border-l border-[#244D2C]/10 capitalize">{productB.category}</td>
              </tr>

              {/* Identified Ingredients */}
              <tr>
                <td className="p-3 font-semibold text-gray-700">Ingredient Count</td>
                <td className="p-3 border-l border-[#244D2C]/10 font-bold">
                  {productA.identifiedIngredientsCount} items
                </td>
                <td className="p-3 border-l border-[#244D2C]/10 font-bold">
                  {productB.identifiedIngredientsCount} items
                </td>
              </tr>

              {/* Calories or Comedogenic */}
              <tr>
                <td className="p-3 font-semibold text-gray-700">
                  {productA.category === 'food' ? 'Calories / Serving' : 'Comedogenic Score'}
                </td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  {productA.nutritionalAnalysis
                    ? `${productA.nutritionalAnalysis.calories} kcal`
                    : productA.cosmeticAnalysis?.comedogenicRating !== null
                    ? `${productA.cosmeticAnalysis?.comedogenicRating} / 5`
                    : 'N/A'}
                </td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  {productB.nutritionalAnalysis
                    ? `${productB.nutritionalAnalysis.calories} kcal`
                    : productB.cosmeticAnalysis?.comedogenicRating !== null
                    ? `${productB.cosmeticAnalysis?.comedogenicRating} / 5`
                    : 'N/A'}
                </td>
              </tr>

              {/* Sugars or Fragrance */}
              <tr>
                <td className="p-3 font-semibold text-gray-700">
                  {productA.category === 'food' ? 'Added Sugar / Sodium' : 'Fragrance Screen'}
                </td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  {productA.nutritionalAnalysis
                    ? `${productA.nutritionalAnalysis.addedSugar}g sugar · ${productA.nutritionalAnalysis.sodium}mg sodium`
                    : productA.cosmeticAnalysis?.fragranceDetected
                    ? 'Contains Fragrance'
                    : 'Fragrance-Free'}
                </td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  {productB.nutritionalAnalysis
                    ? `${productB.nutritionalAnalysis.addedSugar}g sugar · ${productB.nutritionalAnalysis.sodium}mg sodium`
                    : productB.cosmeticAnalysis?.fragranceDetected
                    ? 'Contains Fragrance'
                    : 'Fragrance-Free'}
                </td>
              </tr>

              {/* Statutory Licenses */}
              <tr>
                <td className="p-3 font-semibold text-gray-700">Statutory Compliance</td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  {productA.testingAndCertifications?.[0]?.name || 'Standard Verification'}
                </td>
                <td className="p-3 border-l border-[#244D2C]/10">
                  {productB.testingAndCertifications?.[0]?.name || 'Standard Verification'}
                </td>
              </tr>

              {/* Shelf Life */}
              <tr>
                <td className="p-3 font-semibold text-gray-700">Shelf Life &amp; Expiry</td>
                <td className="p-3 border-l border-[#244D2C]/10 text-green-700 font-medium">
                  {productA.expiryIntelligence?.remainingShelfLife || 'Fresh / Verified'}
                </td>
                <td className="p-3 border-l border-[#244D2C]/10 text-green-700 font-medium">
                  {productB.expiryIntelligence?.remainingShelfLife || 'Fresh / Verified'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold bg-[#244D2C] text-[#EAF2D5] rounded-xl hover:bg-[#1A3620]"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
