import React from 'react';
import {
  Camera,
  Cpu,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  AlertOctagon,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface InfoSectionsProps {
  onOpenScanner: () => void;
  onOpenHistory: () => void;
  onOpenComparison: () => void;
  onOpenFeedback: () => void;
  onOpenGuide: () => void;
  onOpenHealthProfile: () => void;
}

export const InfoSections: React.FC<InfoSectionsProps> = ({
  onOpenScanner,
  onOpenHistory,
  onOpenComparison,
  onOpenFeedback,
  onOpenGuide,
  onOpenHealthProfile,
}) => {
  return (
    <>
      {/* HOW LABELIQ WORKS SECTION */}
      <section className="py-16 bg-[#F8FAF3] border-b border-[#244D2C]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EAF2D5] text-[#244D2C]">
              4-Step Intelligence Pipeline
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#244D2C] mt-2">
              How LABELIQ Decodes What You Buy
            </h2>
            <p className="mt-2 text-sm text-[#244D2C]/75">
              From microscopic physical packaging text to transparent clinical safety in under two seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#244D2C]/15 shadow-xs space-y-3 relative">
              <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-[#244D2C] text-[#EAF2D5] text-[10px] font-extrabold">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#EAF2D5] text-[#244D2C] flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#244D2C]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C]">
                Vision &amp; Barcode
              </h3>
              <p className="text-xs text-[#244D2C]/75 leading-relaxed">
                Aim your device camera or upload packaging snapshots. The app automatically registers barcode data and detects multi-angle label text.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#244D2C]/15 shadow-xs space-y-3 relative">
              <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-[#244D2C] text-[#EAF2D5] text-[10px] font-extrabold">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#FFE4D9] text-[#F07853] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#F07853]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C]">
                Gemini 3.8 Flash AI
              </h3>
              <p className="text-xs text-[#244D2C]/75 leading-relaxed">
                Multimodal reasoning isolates ingredients, isolates INS chemical additive codes, parses nutrition tables, and checks expiry batch stamps.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#244D2C]/15 shadow-xs space-y-3 relative">
              <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-[#244D2C] text-[#EAF2D5] text-[10px] font-extrabold">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#EAF2D5] text-[#244D2C] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C]">
                Statutory Audit
              </h3>
              <p className="text-xs text-[#244D2C]/75 leading-relaxed">
                Validates statutory food safety licenses (FSSAI) via government registries and cross-references CDSCO and BIS standards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#244D2C]/15 shadow-xs space-y-3 relative">
              <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-[#244D2C] text-[#EAF2D5] text-[10px] font-extrabold">
                04
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#FFE4D9] text-[#9C3218] flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-[#9C3218]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#244D2C]">
                Personalized Alert
              </h3>
              <p className="text-xs text-[#244D2C]/75 leading-relaxed">
                Calculates a transparent 0-100 Suitability Score and flags active allergen clashes (Gluten, Nuts, Dairy) or conditions (Diabetes, Hypertension).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GRAVITON 2026 MISSION SPOTLIGHT */}
      <section className="py-16 bg-[#244D2C] text-[#EAF2D5] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold border border-white/15">
                <Award className="w-4 h-4 text-[#F07853]" />
                <span>GRAVITON 2026 Hackathon · CGC University, Mohali</span>
              </div>

              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Eliminating Information Asymmetry for Every Shopper
              </h2>

              <p className="text-sm text-[#EAF2D5]/80 leading-relaxed font-['Plus_Jakarta_Sans']">
                In modern supermarkets, consumers face microscopic fonts, ambiguous chemical codes (INS 635, INS 150d), and deceptive front-of-package claims. LABELIQ was built in 24 hours at Chandigarh Group of Colleges (CGC) University to bridge this gap with Google Gemini 3.8 Flash, real-time access control, and zero-slop consumer transparency.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-white block">Zero Deception</span>
                  <span className="text-[#EAF2D5]/70 text-[11px]">Unmasks hidden sugars &amp; artificial flavor boosters</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-white block">Allergen Safety</span>
                  <span className="text-[#EAF2D5]/70 text-[11px]">Protects households against accidental exposure</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-white block">FSSAI Verification</span>
                  <span className="text-[#EAF2D5]/70 text-[11px]">Direct integration with Indian statutory registers</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center space-y-4 max-w-xs w-full">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#F07853] text-white flex items-center justify-center font-bold text-xl">
                  IQ
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Ready to Test?</h4>
                  <p className="text-xs text-[#EAF2D5]/80 mt-1">
                    Try our camera scanner or choose from 6 verified product benchmarks.
                  </p>
                </div>
                <button
                  onClick={onOpenScanner}
                  className="w-full py-2.5 rounded-xl bg-[#EAF2D5] text-[#244D2C] font-bold text-xs hover:bg-white shadow-md transition-colors"
                >
                  Launch Scanner Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A3620] text-[#EAF2D5]/80 text-xs py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-['Playfair_Display'] text-2xl font-bold tracking-tight text-white">
                  LABEL<span className="text-[#F07853]">IQ</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                  GRAVITON 2026
                </span>
              </div>
              <p className="text-[11px] text-[#EAF2D5]/70 max-w-sm leading-relaxed">
                Know What&apos;s Inside. Choose What&apos;s Right. AI product transparency decoding ingredients, nutritional facts, cosmetic safety, certifications, and expiry intelligence.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-[#EAF2D5]/60 flex items-start space-x-2">
                <AlertOctagon className="w-4 h-4 text-[#F07853] shrink-0 mt-0.5" />
                <span>
                  <strong>Medical Disclaimer:</strong> LABELIQ is an independent consumer awareness application and does not provide clinical medical advice. Prescription pharmaceuticals are strictly not supported.
                </span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={onOpenScanner} className="hover:text-white transition-colors">
                    Live Scanner
                  </button>
                </li>
                <li>
                  <button onClick={onOpenComparison} className="hover:text-white transition-colors">
                    Product Comparison
                  </button>
                </li>
                <li>
                  <button onClick={onOpenHistory} className="hover:text-white transition-colors">
                    Scan History Library
                  </button>
                </li>
                <li>
                  <button onClick={onOpenHealthProfile} className="hover:text-white transition-colors">
                    Personalized Health Profile
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Support &amp; Community</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={onOpenFeedback} className="hover:text-white transition-colors">
                    Share Experience
                  </button>
                </li>
                <li>
                  <button onClick={onOpenFeedback} className="hover:text-white transition-colors">
                    Report Misidentified Label
                  </button>
                </li>
                <li>
                  <button onClick={onOpenFeedback} className="hover:text-white transition-colors">
                    Admin Review Desk (Passcode: cgc2026)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenGuide} className="hover:text-white transition-colors">
                    Beginner&apos;s Guided Tour
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Regulatory Standards</h5>
              <p className="text-[11px] text-[#EAF2D5]/70">
                Audited against Food Safety and Standards Authority of India (FSSAI) guidelines, Bureau of Indian Standards (BIS), and Open Food Facts database.
              </p>
              <p className="text-[10px] text-white/50 pt-2">
                Built with pride for GRAVITON 2026 at CGC University, Mohali.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#EAF2D5]/50 gap-2">
            <span>© 2026 LABELIQ. All rights reserved.</span>
            <span>Powered by Google Gemini 3.8 Flash &amp; Vite 8 Full-Stack Engine</span>
          </div>
        </div>
      </footer>
    </>
  );
};
