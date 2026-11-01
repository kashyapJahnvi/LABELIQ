export type ProductCategory = 'food' | 'cosmetic';

export type SafetyRating = 'safe' | 'caution' | 'concern' | 'insufficient';

export interface IngredientDetail {
  name: string;
  purpose: string;
  whyUsed: string;
  safetyRating: SafetyRating;
  safetyNote: string;
  potentialSideEffects?: string | null;
  concentration?: string | null;
  commonAllergen: boolean;
  allergenType?: string | null;
  isNatural: boolean;
}

export interface NutritionalAnalysis {
  servingSize: string;
  calories: number;
  totalFat: number;
  saturatedFat: number;
  carbohydrates: number;
  totalSugar: number;
  addedSugar: number;
  protein: number;
  sodium: number;
  fiber: number;
  concerns: string[];
}

export interface CosmeticAnalysis {
  comedogenicRating: number | null;
  fragranceDetected: boolean;
  parabenFree: boolean;
  sulfateFree: boolean;
  alcoholFree: boolean;
  targetSkinTypes: string[];
  potentialIrritants: string[];
  keyActives: string[];
}

export interface ExpiryIntelligence {
  manufacturingDate: string | null;
  expiryDate: string | null;
  bestBefore: string | null;
  remainingShelfLife: string | null;
  status: 'within_expiry' | 'approaching_expiry' | 'expired' | 'unknown';
}

export interface TestingCertification {
  name: string;
  issuingAuthority: string;
  licenseOrRegNumber?: string | null;
  status: 'verified' | 'not_verified' | 'expired' | 'information_unavailable';
  sourceNote: string;
  lastVerification: string;
}

export interface ProductData {
  productName: string;
  brand: string;
  category: ProductCategory;
  detectedBarcode?: string | null;
  identifiedIngredientsCount: number;
  confidenceScore: number;
  whatsGood: string[];
  whatToConsider: string[];
  suitabilityScore: number; // 0 to 100
  scoreBreakdown: {
    ingredientSafety: number;
    nutritionalOrCosmeticQuality: number;
    additivePurity: number;
    transparency: number;
  };
  scoreRationale: string;
  ingredients: IngredientDetail[];
  nutritionalAnalysis?: NutritionalAnalysis;
  cosmeticAnalysis?: CosmeticAnalysis;
  expiryIntelligence?: ExpiryIntelligence;
  testingAndCertifications?: TestingCertification[];
  extractedRawText?: string;
  image?: string;
}

export interface ScanHistoryRecord {
  id: string;
  userId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  score: number;
  scanDate: string;
  imageUrl?: string;
  barcode?: string | null;
  whatsGood?: string[];
  whatToConsider?: string[];
  productData: ProductData;
}

export interface FeedbackSubmission {
  id: string;
  userId: string;
  type: 'experience' | 'incorrect_analysis' | 'feature' | 'support' | 'inline_ingredient';
  productName?: string;
  scanId?: string;
  ingredientName?: string;
  ratings?: {
    overall?: number;
    navigation?: number;
    accuracy?: number;
    explanations?: number;
  };
  comment: string;
  attachmentUrl?: string;
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
  assignedAdmin?: string;
}

export interface TutorialProgress {
  userId: string;
  completed: boolean;
  completedAt?: string;
  lastStep?: number;
  dismissed?: boolean;
}

export interface UserHealthProfile {
  allergies: string[];
  conditions: string[];
  diets: string[];
  skinTypes: string[];
}
