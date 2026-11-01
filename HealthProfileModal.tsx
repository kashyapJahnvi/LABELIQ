import React from 'react';
import { X, ShieldCheck, Check, AlertTriangle, Sparkles, HeartPulse } from 'lucide-react';
import { UserHealthProfile } from '../types';

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserHealthProfile;
  onUpdateProfile: (updated: UserHealthProfile) => void;
}

const ALLERGY_OPTIONS = [
  'Gluten',
  'Peanuts',
  'Tree Nuts',
  'Lactose/Dairy',
  'Soy',
  'Eggs',
  'Shellfish',
  'Sulfites',
  'Fragrance',
];

const CONDITION_OPTIONS = [
  'Diabetes',
  'Hypertension',
  'Celiac Disease',
  'Gout / High Uric Acid',
];

const DIET_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Keto',
  'Low Sugar',
  'Dairy-Free',
  'Clean Label',
];

const SKIN_TYPE_OPTIONS = [
  'Sensitive Skin',
  'Acne-Prone',
  'Fragrance-Sensitive',
  'Dry & Eczema-Prone',
];

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const toggleAllergy = (item: string) => {
    const exists = userProfile.allergies.includes(item);
    const updated = exists
      ? userProfile.allergies.filter((a) => a !== item)
      : [...userProfile.allergies, item];
    onUpdateProfile({ ...userProfile, allergies: updated });
  };

  const toggleCondition = (item: string) => {
    const exists = userProfile.conditions.includes(item);
    const updated = exists
      ? userProfile.conditions.filter((c) => c !== item)
      : [...userProfile.conditions, item];
    onUpdateProfile({ ...userProfile, conditions: updated });
  };

  const toggleDiet = (item: string) => {
    const exists = userProfile.diets.includes(item);
    const updated = exists
      ? userProfile.diets.filter((d) => d !== item)
      : [...userProfile.diets, item];
    onUpdateProfile({ ...userProfile, diets: updated });
  };

  const toggleSkinType = (item: string) => {
    const exists = userProfile.skinTypes.includes(item);
    const updated = exists
      ? userProfile.skinTypes.filter((s) => s !== item)
      : [...userProfile.skinTypes, item];
    onUpdateProfile({ ...userProfile, skinTypes: updated });
  };

  const applyPreset = (preset: 'diabetic' | 'allergies' | 'sensitive') => {
    if (preset === 'diabetic') {
      onUpdateProfile({
        allergies: [],
        conditions: ['Diabetes', 'Hypertension'],
        diets: ['Low Sugar'],
        skinTypes: [],
      });
    } else if (preset === 'allergies') {
      onUpdateProfile({
        allergies: ['Gluten', 'Peanuts', 'Soy'],
        conditions: ['Celiac Disease'],
        diets: [],
        skinTypes: [],
      });
    } else if (preset === 'sensitive') {
      onUpdateProfile({
        allergies: ['Fragrance'],
        conditions: [],
        diets: ['Clean Label'],
        skinTypes: ['Sensitive Skin', 'Acne-Prone', 'Fragrance-Sensitive'],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#FCFDF9] rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-[#244D2C]/20 overflow-y-auto my-6 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#244D2C]/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#244D2C] text-[#EAF2D5] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#F07853]" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#244D2C]">
                Personalized Health &amp; Allergy Profile
              </h2>
              <p className="text-xs text-[#244D2C]/70">
                LABELIQ dynamically cross-references packaging ingredients with your active profile
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

        {/* Quick Presets */}
        <div className="bg-[#EAF2D5]/60 p-3 rounded-2xl border border-[#244D2C]/10 space-y-2">
          <span className="text-[11px] font-bold text-[#244D2C] block">
            Quick Demographic Test Presets:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => applyPreset('diabetic')}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#244D2C] hover:text-white border border-[#244D2C]/15 font-semibold text-[#244D2C] transition-colors"
            >
              🩺 Diabetic &amp; Hypertension Profile
            </button>
            <button
              onClick={() => applyPreset('allergies')}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#244D2C] hover:text-white border border-[#244D2C]/15 font-semibold text-[#244D2C] transition-colors"
            >
              ⚠️ Celiac &amp; Nut Allergy Profile
            </button>
            <button
              onClick={() => applyPreset('sensitive')}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#244D2C] hover:text-white border border-[#244D2C]/15 font-semibold text-[#244D2C] transition-colors"
            >
              🧴 Sensitive &amp; Acne-Prone Skin
            </button>
          </div>
        </div>

        {/* Allergies Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9C3218] flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F07853]" />
            <span>Severe Food &amp; Compound Allergies:</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map((item) => {
              const selected = userProfile.allergies.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleAllergy(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    selected
                      ? 'bg-[#FFE4D9] text-[#9C3218] border-[#F07853] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-[#9C3218]" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Health / Metabolic Conditions Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#244D2C] flex items-center space-x-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Metabolic &amp; Chronic Health Conditions:</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((item) => {
              const selected = userProfile.conditions.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleCondition(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    selected
                      ? 'bg-[#244D2C] text-[#EAF2D5] border-[#244D2C] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-[#EAF2D5]" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary Lifestyles */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#244D2C]">
            Dietary Lifestyles:
          </h3>
          <div className="flex flex-wrap gap-2">
            {DIET_OPTIONS.map((item) => {
              const selected = userProfile.diets.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleDiet(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    selected
                      ? 'bg-[#EAF2D5] text-[#244D2C] border-[#244D2C]/40 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-[#244D2C]" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cosmetic Sensitivities */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#244D2C]">
            Cosmetic &amp; Dermatological Needs:
          </h3>
          <div className="flex flex-wrap gap-2">
            {SKIN_TYPE_OPTIONS.map((item) => {
              const selected = userProfile.skinTypes.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleSkinType(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    selected
                      ? 'bg-[#FFE4D9] text-[#9C3218] border-[#F07853]/40 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-[#9C3218]" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-[#244D2C]/10">
          <button
            onClick={() =>
              onUpdateProfile({
                allergies: [],
                conditions: [],
                diets: [],
                skinTypes: [],
              })
            }
            className="text-xs text-gray-500 hover:text-red-600 font-semibold"
          >
            Reset All Preferences
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold bg-[#244D2C] text-[#EAF2D5] rounded-xl hover:bg-[#1A3620]"
          >
            Save &amp; Apply to Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
