import React from 'react';
import { Apple, Sparkles, AlertCircle, Droplets, ShieldCheck, HeartPulse, Sparkle } from 'lucide-react';
import { ProductCategory } from '../types';

interface CategorySectionProps {
  activeCategory: 'all' | ProductCategory;
  onSelectCategory: (cat: 'all' | ProductCategory) => void;
  foodCount: number;
  cosmeticCount: number;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  activeCategory,
  onSelectCategory,
  foodCount,
  cosmeticCount,
}) => {
  return (
    <section className="py-12 bg-[#F8FAF3] border-b border-[#244D2C]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EAF2D5] text-[#244D2C] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkle className="w-3.5 h-3.5 text-[#F07853]" />
            <span>Dual Category Intelligence Engines</span>
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#244D2C] tracking-tight">
            Tailored Decoding for What You Eat &amp; What You Apply
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#244D2C]/75">
            Different package types require distinct safety frameworks. LABELIQ routes products into specialized chemical evaluation pipelines.
          </p>

          {/* Category Tabs */}
          <div className="mt-6 inline-flex p-1 rounded-2xl bg-white border border-[#244D2C]/15 shadow-xs">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#244D2C] text-[#EAF2D5] shadow-xs'
                  : 'text-[#244D2C]/70 hover:text-[#244D2C]'
              }`}
            >
              All Benchmarks ({foodCount + cosmeticCount})
            </button>
            <button
              onClick={() => onSelectCategory('food')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeCategory === 'food'
                  ? 'bg-[#244D2C] text-[#EAF2D5] shadow-xs'
                  : 'text-[#244D2C]/70 hover:text-[#244D2C]'
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Food Intelligence ({foodCount})</span>
            </button>
            <button
              onClick={() => onSelectCategory('cosmetic')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                activeCategory === 'cosmetic'
                  ? 'bg-[#244D2C] text-[#EAF2D5] shadow-xs'
                  : 'text-[#244D2C]/70 hover:text-[#244D2C]'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-[#F07853]" />
              <span>Cosmetics &amp; Skincare ({cosmeticCount})</span>
            </button>
          </div>
        </div>

        {/* Two Detailed Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Food Card */}
          <div
            onClick={() => onSelectCategory('food')}
            className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all border ${
              activeCategory === 'food'
                ? 'bg-white border-[#244D2C] shadow-lg ring-2 ring-[#244D2C]/20'
                : 'bg-white/70 hover:bg-white border-[#244D2C]/15 hover:shadow-md'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF2D5] text-[#244D2C] flex items-center justify-center mb-5">
              <Apple className="w-6 h-6 text-[#244D2C]" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                Food &amp; Nutrition Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">
                FSSAI Audited
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#244D2C]/75 leading-relaxed mb-6">
              Translates technical food jargon, hidden maltodextrin/corn syrups, high sodium content, artificial food colors, and ultra-processed food indices.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 space-y-1">
                <p className="font-bold text-[#244D2C] flex items-center space-x-1">
                  <HeartPulse className="w-3.5 h-3.5 text-[#F07853]" />
                  <span>Macronutrient Breakdown</span>
                </p>
                <p className="text-[#244D2C]/70 text-[11px]">
                  Calories, Total Sugars vs Added Sugars, Saturated Fats, Sodium, Fiber &amp; Protein.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 space-y-1">
                <p className="font-bold text-[#244D2C] flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>INS Additives &amp; Allergens</span>
                </p>
                <p className="text-[#244D2C]/70 text-[11px]">
                  Decodes preservative E-numbers, artificial sweeteners, purines, and gluten/dairy.
                </p>
              </div>
            </div>
          </div>

          {/* Cosmetic Card */}
          <div
            onClick={() => onSelectCategory('cosmetic')}
            className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all border ${
              activeCategory === 'cosmetic'
                ? 'bg-white border-[#244D2C] shadow-lg ring-2 ring-[#244D2C]/20'
                : 'bg-white/70 hover:bg-white border-[#244D2C]/15 hover:shadow-md'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFE4D9] text-[#F07853] flex items-center justify-center mb-5">
              <Droplets className="w-6 h-6 text-[#F07853]" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                Cosmetics &amp; Skincare Safety
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F07853]/15 text-[#F07853]">
                Derm Tested
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#244D2C]/75 leading-relaxed mb-6">
              Analyzes pore-clogging comedogenic potential, synthetic sensitizing fragrances, endocrine disruptors, drying alcohols, and active skin barrier nutrients.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 space-y-1">
                <p className="font-bold text-[#244D2C] flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F07853]" />
                  <span>Pore &amp; Barrier Profile</span>
                </p>
                <p className="text-[#244D2C]/70 text-[11px]">
                  0-5 Comedogenic score, fragrance detection, sulfate-free and paraben-free audits.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF3] border border-[#244D2C]/10 space-y-1">
                <p className="font-bold text-[#244D2C] flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Skin Type Compatibility</span>
                </p>
                <p className="text-[#244D2C]/70 text-[11px]">
                  Matches formulations against sensitive, acne-prone, dry, and eczema barrier needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
