import React from 'react';
import { Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { FloatingBotanicals } from './FloatingBotanicals';
import { ProductData } from '../types';

interface HeroProps {
  onOpenScanner: () => void;
  onSelectProduct: (product: ProductData) => void;
  mockProducts: ProductData[];
}

export const Hero: React.FC<HeroProps> = ({
  onOpenScanner,
  onSelectProduct,
  mockProducts,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EAF2D5]/80 via-[#F8FAF3] to-[#F8FAF3] pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-[#244D2C]/10">
      <FloatingBotanicals />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission, Headlines, and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#244D2C]/20 shadow-xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#244D2C]">
                GRAVITON 2026 Innovation Hackathon · CGC University, Mohali
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#244D2C] leading-[1.12]">
              Know What&apos;s Inside.{' '}
              <span className="italic text-[#F07853] block sm:inline font-['Newsreader']">
                Choose What&apos;s Right.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#244D2C]/80 max-w-2xl font-['Plus_Jakarta_Sans'] leading-relaxed">
              Transform confusing fine-print product labels into instant, transparent health intelligence. 
              Decodes microscopic chemical additives (INS codes), hidden allergens, glycemic sugars, cosmetic comedogenicity, and verifies Indian statutory licenses (FSSAI/BIS) with Google Gemini 3.8 Flash.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onOpenScanner}
                className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-[#244D2C] hover:bg-[#1A3620] text-[#EAF2D5] font-semibold text-sm sm:text-base shadow-lg shadow-[#244D2C]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Camera className="w-5 h-5 text-[#F07853]" />
                <span>Launch Live Scanner</span>
              </button>

              <button
                onClick={onOpenScanner}
                className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-[#EAF2D5]/40 text-[#244D2C] font-semibold text-sm sm:text-base border border-[#244D2C]/20 shadow-xs transition-all"
              >
                <Upload className="w-4 h-4 text-[#244D2C]" />
                <span>Upload Product Image</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-[#244D2C]/80">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Camera & Barcode OCR</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>FSSAI & BIS License Check</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Personalized Allergen Warnings</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Dual Food & Cosmetic Engine</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Phone Mockup Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Soft glow background */}
              <div className="absolute inset-0 bg-[#FFE4D9]/60 rounded-3xl blur-2xl transform rotate-3"></div>

              {/* Phone card frame */}
              <div className="relative bg-[#FCFDF9] rounded-3xl p-5 shadow-2xl border border-[#244D2C]/15 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#244D2C]/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#F07853]"></span>
                    <span className="text-xs font-bold text-[#244D2C] tracking-wide uppercase">
                      Instant Label Audit
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">
                    Live Gemini 3.8
                  </span>
                </div>

                {/* Score Widget Preview */}
                <div className="bg-[#EAF2D5]/70 rounded-2xl p-4 flex items-center justify-between border border-[#244D2C]/10">
                  <div>
                    <p className="text-[11px] font-semibold text-[#244D2C]/70 uppercase">
                      Suitability Score
                    </p>
                    <p className="font-['Playfair_Display'] text-3xl font-extrabold text-[#244D2C]">
                      9.8 <span className="text-sm font-normal text-[#244D2C]/70">/ 10</span>
                    </p>
                    <p className="text-xs font-bold text-[#16A34A]">Very Good Formulation</p>
                  </div>
                  <div className="w-14 h-14 rounded-full border-4 border-[#16A34A] flex items-center justify-center font-bold text-sm text-[#244D2C] bg-white">
                    98%
                  </div>
                </div>

                {/* Allergen & Clean Label Snippets */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#244D2C]/10 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#244D2C]">Pure Whole Grain Rolled Oats (&gt;60%)</p>
                      <p className="text-[11px] text-[#244D2C]/70">No high fructose corn syrup or artificial colors</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFE4D9]/80 border border-[#F07853]/25 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#F07853] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#9C3218]">Allergen Notice: Soy &amp; Gluten</p>
                      <p className="text-[11px] text-[#9C3218]/80">Contains Soy Lecithin and Whole Oats</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#244D2C]/10 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#244D2C] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#244D2C]">FSSAI License #10014022002652</p>
                      <p className="text-[11px] text-[#244D2C]/70">Statutory FOSCOS Central License Verified</p>
                    </div>
                  </div>
                </div>

                {/* Mini CTA inside phone */}
                <button
                  onClick={onOpenScanner}
                  className="w-full py-2.5 text-xs font-semibold text-center rounded-xl bg-[#244D2C] text-[#EAF2D5] hover:bg-[#1A3620] transition-colors"
                >
                  Scan Your Own Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Demo Strip: 6 Verified Products from GRAVITON 2026 Test Suite */}
        <div className="mt-14 pt-8 border-t border-[#244D2C]/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#244D2C] uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#F07853]" />
                <span>1-Click Hackathon Demo Showcase (6 Verified Benchmarks)</span>
              </h2>
              <p className="text-xs text-[#244D2C]/70">
                Instantly audit audited food and skincare formulations with full ingredient breakdowns
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#244D2C]/60">
              Click any product to load full report
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {mockProducts.map((p) => {
              const scoreTen = (p.suitabilityScore / 10).toFixed(1);
              const isHigh = p.suitabilityScore >= 80;
              const isMid = p.suitabilityScore >= 60 && p.suitabilityScore < 80;

              return (
                <div
                  key={p.productName}
                  onClick={() => onSelectProduct(p)}
                  className="group cursor-pointer bg-white/90 hover:bg-white p-3 rounded-2xl border border-[#244D2C]/15 hover:border-[#244D2C]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#244D2C]/60">
                        {p.category}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isHigh
                            ? 'bg-[#16A34A]/10 text-[#16A34A]'
                            : isMid
                            ? 'bg-[#D97706]/10 text-[#D97706]'
                            : 'bg-[#DC2626]/10 text-[#DC2626]'
                        }`}
                      >
                        {scoreTen}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#244D2C] line-clamp-1 group-hover:text-[#F07853] transition-colors">
                      {p.brand}
                    </p>
                    <p className="text-[11px] text-[#244D2C]/75 line-clamp-2 leading-tight mt-0.5">
                      {p.productName}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#244D2C]/10 flex items-center justify-between text-[10px] font-semibold text-[#244D2C]/70">
                    <span>{p.identifiedIngredientsCount} items</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
