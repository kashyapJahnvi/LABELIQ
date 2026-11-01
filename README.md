# LABELIQ 🌿🔍
### *Know What's Inside. Choose What's Right.*
> **Scan Smart. Understand Better.**

[![Built for GRAVITON 2026](https://img.shields.io/badge/GRAVITON%202026-CGC%20University%2C%20Mohali-244D2C?style=for-the-badge&logo=target)](https://cgc.ac.in)
[![Technology Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20Tailwind%20v4%20%7C%20Vite%208%20%7C%20Firebase-F07853?style=for-the-badge)](https://react.dev)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%203.8%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

---

## 🌟 Project Overview

**LABELIQ** is a modern, responsive, and functional AI-powered product transparency, ingredient intelligence, and consumer awareness platform developed for **GRAVITON 2026**, a 24-hour innovation hackathon at **Chandigarh Group of Colleges (CGC) University, Mohali**.

In modern supermarkets and e-commerce stores, everyday consumers are inundated with complicated ingredient names, deceptive front-of-package marketing ("100% Natural", "Zero Added Sugar"), unreadable chemical additives (E-numbers / INS codes), hidden allergens, and obscured expiry dates. 

**LABELIQ solves this by transforming fine-print product labels into instant, clear, and actionable health intelligence with a single scan.**

The application marries two distinct design aesthetics:
1. **Nature-Inspired Wellness Aesthetic:** Soft pastel green backgrounds (`#EAF2D5`), peach/coral glows (`#FFE4D9`, `#F07853`), floating botanical vectors (sliced grapefruits, avocados, strawberries, leaves), and editorial serif typography.
2. **Clinical Consumer Dashboard:** Circular animated suitability score gauges ($0$ to $100$ / $0$ to $10.0$), real-time allergen warning banners, ingredient-by-ingredient safety cards, macronutrient breakdowns, Indian FSSAI/BIS regulatory verifications, and side-by-side product comparisons.

---

## 🎓 GRAVITON 2026 Hackathon Purpose & Mission — CGC University, Mohali

### 📍 The Challenge at CGC University
During the 24-hour **GRAVITON 2026** hackathon at CGC University, Mohali, our team set out to tackle one of the most pervasive yet overlooked challenges in public health and consumer rights: **The Information Asymmetry of Packaged Goods**.

### 🎯 Core Problem Statement
- **Fine-Print Deception:** Manufacturers often use microscopic fonts and technical jargon (e.g., *INS 635*, *Disodium 5'-ribonucleotides*, *Maltodextrin*) to conceal excessive sodium, chemical flavor enhancers, and high glycemic sugars.
- **Critical Allergen Blind Spots:** Over 15% of Indian and global households suffer from food allergies, lactose intolerance, celiac gluten sensitivity, or contact dermatitis. Accidental ingestion or application leads to severe medical emergencies.
- **Regulatory Confusion:** Most consumers do not know how to verify whether a package's FSSAI license or BIS mark is genuine or expired.
- **Cosmetic Toxins:** Personal-care products frequently conceal endocrine disruptors, comedogenic oils, and sensitizing perfumes under vague "Fragrance / Parfum" labels.

### 💡 The LABELIQ Solution
LABELIQ bridges this gap by acting as a pocket AI health advocate. Powered by **Google Gemini 3.8 Flash**, **Open Food Facts API**, and Indian regulatory databases, it delivers:
- **Instant Ingredient Decoding:** What every compound does and why it was added.
- **Dynamic Personalized Scoring:** Adjusts safety ratings based on your active health conditions (Diabetes, Hypertension, Celiac) and allergies (Nuts, Gluten, Dairy, Fragrance).
- **Zero-Slop Standard:** Real working optical character recognition (OCR), camera-driven barcode scanning, and transparent scoring formulas.

---

## 🚀 Key Features & Modules

### 1. 📷 Multi-Modal AI Product Scanner
- **Live Barcode Lookup:** Queries Open Food Facts and pre-loaded Indian/international consumer databases.
- **Live Camera Scanner:** In-browser video viewfinder with guide frames, animated laser sweep, and snapshot capture.
- **Multi-Angle Image Upload:** Analyze front packaging, back ingredient lists, nutrition fact tables, or expiry panels.
- **OCR Text Correction:** View raw extracted OCR text and manually edit or paste custom ingredient lists before analysis.

### 2. 🧪 Deep Ingredient Intelligence
- Evaluates each identified ingredient individually:
  - **Function & Purpose:** (e.g., Emulsifier, humectant, antioxidant active, leavening agent).
  - **Why It Is Used:** Plain-language explanation of manufacturer utility.
  - **Safety Classification:** Color-coded status:
    - 🟢 *Generally safe for intended use*
    - 🟡 *Use with caution*
    - 🔴 *Potential concern for certain users*
    - ⚪ *Insufficient information*
  - **Clinical Safety Notes:** Research context, permissible limits, and potential side effects.

### 3. 🎯 Transparent Health Suitability Score (0–100 / 0–10)
- Distinct from arbitrary health percentages; driven by a category-specific transparent formula:
  $$\text{Suitability Score} = w_1(\text{Safety}) + w_2(\text{Nutritional/Skin Quality}) + w_3(\text{Purity}) + w_4(\text{Transparency})$$
- Scoring Tiers:
  - `80–100` (8.0–10.0): 🟢 **Very Good** — Clean formulation, minimal processing.
  - `60–79` (6.0–7.9): 🟡 **Good / Moderate** — Some sodium, sugar, or minor additives.
  - `40–59` (4.0–5.9): 🟠 **Multiple Concerns** — High processing or potential irritants.
  - `0–39` (0–3.9): 🔴 **Significant Concerns** — High risk, allergen clash, or toxic flags.

### 4. ⚠️ Personalised Health Profile & Allergen Warning Banner
- Real-time profile engine supporting:
  - **Allergies:** Gluten, Peanuts, Tree Nuts, Lactose/Dairy, Soy, Eggs, Shellfish, Sulfites, Fragrance.
  - **Metabolic Conditions:** Diabetes (warns on free sugars), Hypertension (warns on $>400\text{mg}$ sodium), Celiac Disease, Gout/Uric Acid.
  - **Dietary Lifestyles:** Vegan, Vegetarian, Keto, Low Sugar, Dairy-Free, Clean Label.
  - **Cosmetic Sensitivities:** Sensitive Skin, Acne-prone (comedogenic alerts), Fragrance Sensitive.
- Prominently displays an **Allergen Warning Alert** matching the active profile.

### 5. 🥗 Dual Category Intelligence
- **Food Intelligence:** Full macro/micro analysis (Calories, Total Sugar, Added Sugar, Carbs, Protein, Total Fat, Saturated Fat, Sodium, Fiber).
- **Cosmetic Intelligence:** Comedogenic rating ($0$–$5$), fragrance screening, paraben/sulfate-free audits, and skin-type compatibility.
- *Safety Boundary:* Does not support prescription pharmaceuticals or medicines.

### 6. 📅 Expiry Date & Freshness Intelligence
- Detects Manufacturing Date, Expiry Date, Best-Before dates, and remaining shelf life.
- Clear status pills: `Within Expiry`, `Approaching Expiry`, `Product Expired`, or `Date Not Readable` (never hallucinates unreadable dates).

### 7. 🏛️ Regulatory & Laboratory Verification
- Cross-references regulatory credentials:
  - **FSSAI** Central Food Licenses with direct links to FOSCOS.
  - **BIS** compliance marks.
  - **CDSCO** Cosmetic Registrations.
  - **NABL** Accredited Laboratory heavy-metal/lead testing reports.
  - **MadeSafe & Cruelty-Free** certifications.

### 8. ⚖️ Smart Product Comparison Matrix
- Compare any two products side-by-side with metric tables (score, ingredients, sugar/sodium, allergens, shelf life, certifications).
- Generates an AI recommendation verdict explaining which product is better suited for your personal health profile.

### 9. 📚 Product Scan History & Previously Scanned Reports
- **Automatic Scan Persistence:** Every successful scan automatically creates a structured, permanent database record with the full original analysis.
- **Dedicated Dashboard:** Filter by category (Foods vs. Cosmetics), search by product name/brand, and sort by newest/oldest or score.
- **Original Full Report Modal:** Re-open any past analysis organized across 8 comprehensive sections without triggering additional AI API calls or incurring extra latency.
- **User-Level Access Control:** Scans are isolated per user account (`x-user-id`). Includes an interactive user switcher to test multi-user isolation.
- **Manage & Delete:** Delete individual scans or clear all records with a confirmation safety modal.

### 10. 💬 Feedback & Support Portal
- **Community Voice Dashboard:** Dedicated portal accessible from the top navigation and footer with four distinct channels:
  1. **Share Your Experience:** Multi-dimensional feedback ratings (Overall experience, Ease of navigation, Analysis accuracy, Explanation usefulness) and qualitative written feedback.
  2. **Report an Incorrect Analysis:** Human-in-the-loop review mechanism for ingredient misidentifications, nutritional discrepancies, claim verification errors, or expired packaging flags. Automatically links scan ID and product name from Scan History and supports screenshot attachments.
  3. **Suggest a Feature:** Crowdsource user demand across categories (e.g. household cleaners, baby products), Indian regional languages, or accessibility tools.
  4. **Technical Support & Contact:** Rapid help desk for upload errors, camera permissions, or general platform inquiries.
- **Micro-Feedback on Ingredient Cards:** Embedded *"Was this explanation helpful? (Yes / No)"* thumbs-up/down widget inside every expanded ingredient modal with optional comment submission.
- **"My Feedback" Status Tracker:** Consumers can review their submitted tickets with real-time status badges (`Submitted`, `Under Review`, `In Progress`, `Resolved`).
- **Admin Review Panel:** Protected administrative view (Demo passcodes: `cgc2026` or `admin`) to inspect tickets, filter by category/status, adjust workflow stages, and document internal investigation notes.

### 11. 🧭 Interactive Beginner's Guide & Guided Tour
- **10-Step Guided Walkthrough:** Step-by-step contextual onboarding introducing first-time users to LABELIQ:
  - Step 1: Welcome & Mission
  - Step 2: Choose Product Category (Food vs. Cosmetics)
  - Step 3: Scanning Options (Barcode, Camera Viewfinder, OCR Upload)
  - Step 4: Multimodal Gemini AI Pipeline
  - Step 5: Ingredient Safety Color Codes (🟢 Safe, 🟡 Caution, 🔴 Concern, ⚪ Insufficient Info)
  - Step 6: Marketing Claims vs. FSSAI/BIS Statutory Licenses
  - Step 7: Personalised Allergy & Health Profile
  - Step 8: Scan History Library & Instant Replay
  - Step 9: Feedback & Support Portal
  - Step 10: Ready to Scan Launchpad
- **Spotlight Highlights:** Dynamic element highlighting with darkened background overlay and responsive position adjustments.
- **Keyboard Navigation & Server Persistence:** Supports Arrow keys (`Next`/`Prev`) and `Esc` to close. Progress and completion status are permanently saved via `/api/tutorial-progress`.

---

## 🛠️ Technology Stack

```
┌──────────────────────────────────────────────────────────────┐
│                    LABELIQ APPLICATION                       │
├──────────────────────────────┬───────────────────────────────┤
│ Frontend (UI/UX)             │ Backend & Database            │
│ • React 19 (Hooks, Context)  │ • Node.js & Express           │
│ • Tailwind CSS v4 (@theme)   │ • Firebase (Firestore & Auth) │
│ • Vite 8 (Modern Bundler)    │ • tsx & esbuild               │
│ • Motion & Lucide Icons      │ • Server-Side Gemini 3.8 Flash│
│ • Google Fonts (Playfair)    │ • Open Food Facts REST API    │
└──────────────────────────────┴───────────────────────────────┘
```

| Technology | Role in LABELIQ |
|---|---|
| **React 19** | Component-driven architecture, reactive profile state, dynamic dashboard rendering, and modals. |
| **Tailwind CSS v4** | Modern CSS engine utilizing custom theme tokens (`--color-brand-forest`, `--color-brand-pastel`, `--color-brand-coral`), and floating animation keyframes. |
| **Vite 8** | Ultra-fast client build environment with middleware mode integration. |
| **Firebase** | Scalable NoSQL persistence (**Firestore**) for saving user scan histories, custom allergy profiles, and bookmarked favorites, paired with **Firebase Authentication** for consumer profiles. |
| **Google Gemini 3.8 Flash** | Server-side multimodal AI engine (`@google/genai`) for OCR text extraction, ingredient classification, safety profiling, and expiry detection. |
| **Open Food Facts API** | Crowdsourced barcode lookup for packaged grocery and food products. |
| **Express & Node.js** | Secure server proxy ensuring API keys and cloud secrets are never exposed to the client browser. |

---

## 📂 Project Directory Structure

```
├── .env.example              # Environment variables template
├── index.html                # Entry HTML with meta tags, SEO, & Playfair Display fonts
├── metadata.json             # AI Studio metadata & server capabilities
├── package.json              # Full-stack dependencies & scripts
├── data/                     # Persistent disk database storage (scan_history.json)
├── public/uploads/scans/     # Persisted uploaded scan images
├── server/
│   └── db.ts                 # Disk database manager with atomic writes & access control
├── server.ts                 # Express backend with Gemini 3.8 Flash, History API & Vite
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite & Tailwind CSS plugins
├── README.md                 # Complete project documentation
└── src/
    ├── main.tsx              # React mounting entry point
    ├── App.tsx               # Primary application state, router, and modal controller
    ├── index.css             # Tailwind v4 theme tokens and floating animations
    ├── types.ts              # Strict TypeScript interfaces (ProductData, Ingredients, ScanHistoryRecord)
    ├── services/
    │   └── historyService.ts # Client API helper for scan persistence & user session
    ├── data/
    │   └── mockProducts.ts   # Verified catalog products (Nature Valley, Cetaphil, Maggi, Amul, Mamaearth, RXBAR)
    └── components/
        ├── Navbar.tsx        # Brand logo, Scan History link, and health profile pill
        ├── Hero.tsx          # Pastel green hero with floating fruits & phone scanner mockup
        ├── FloatingBotanicals.tsx # Vector SVG illustrations (grapefruit, strawberry, avocado, leaves)
        ├── CategorySection.tsx    # Food Intelligence & Cosmetic Intelligence selection cards
        ├── ScannerModal.tsx       # Live camera viewfinder, barcode lookup, image upload & OCR
        ├── ProductDashboard.tsx   # Dashboard layout with score gauge, allergens, and tabs
        ├── ScanHistoryPage.tsx    # Dedicated Scan History dashboard with search, filter & sort
        ├── FullReportModal.tsx    # 8-section original analysis report viewer (zero AI cost)
        ├── ProductComparison.tsx  # Side-by-side matrix with AI recommendation verdict
        ├── HealthProfileModal.tsx # Personal health preferences, allergy, and condition switcher
        └── InfoSections.tsx       # How It Works, Features, About Graviton 2026, and Footer
```

---

## ⚡ Setup & Development Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- Modern Web Browser (Chrome, Firefox, Safari, or Edge) with webcam permissions enabled for live scanning.

### 2. Environment Configuration
Clone the repository and create your `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables:
```env
# GEMINI_API_KEY: Required for live Gemini AI multimodal analysis.
# AI Studio automatically injects this at runtime from user secrets.
GEMINI_API_KEY="your-gemini-api-key-here"

# APP_URL: The hosted URL of the application
APP_URL="http://localhost:3000"

# FIREBASE CONFIGURATION (Optional for cloud sync)
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
```
*(Note: If no Gemini API key is present, LABELIQ automatically falls back to an intelligent demo engine featuring verified datasets).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The full-stack development server will boot at `http://localhost:3000`.

### 5. Production Build & Execution
```bash
# Compile client bundle and package backend server
npm run build

# Start production server
npm start
```

### 6. Linting & Type Validation
```bash
npm run lint
```

---

## 🏆 Hackathon Presentation Guide (Tested Products)

Judges and reviewers can immediately test the dashboard using the **1-Click Quick Demo** buttons in the Hero section or Scanner Modal:

1. **Nature Valley Crunchy Granola Bars – Oats & Honey** *(Packaged Snack)*
   - **Score:** `9.8 / 10 · Very Good`
   - **Highlights:** High whole-grain oats (>60%), unrefined honey, zero artificial preservatives.
   - **Allergen Alert:** Contains Gluten & Soy Lecithin. Caution on 11g added sugar.
2. **Cetaphil Gentle Skin Cleanser** *(Dermatological Skincare)*
   - **Score:** `9.4 / 10 · Clean & Hypoallergenic`
   - **Highlights:** Niacinamide 2%, Panthenol (Pro-Vitamin B5), Glycerin. 0 comedogenic rating, fragrance-free, soap-free.
3. **Nestlé Maggi 2-Minute Masala Noodles** *(Indian Grocery Staple)*
   - **Score:** `5.6 / 10 · Multiple Considerations`
   - **Highlights:** FSSAI License #10012011000168 verified. Flags high sodium (950mg = 48% daily limit), refined palm oil, and INS 635 umami flavor enhancers.
4. **Amul Pasteurised Salted Butter** *(Indian Dairy Staple)*
   - **Score:** `7.8 / 10 · Good Dairy Staple`
   - **Highlights:** 4 pure ingredients (milk fat, moisture, salt, natural annatto color). High saturated fat.
5. **Mamaearth Vitamin C Daily Glow Sunscreen SPF 50** *(Sun Protection)*
   - **Score:** `8.6 / 10 · Mineral-Hybrid Protection`
   - **Highlights:** Zinc oxide, titanium dioxide, turmeric root extract. MadeSafe certified.
6. **RXBAR Chocolate Sea Salt Protein Bar** *(Clean Label Comparison)*
   - **Score:** `9.5 / 10 · Whole-Food Protein`
   - **Highlights:** 6 whole culinary ingredients: Dates, Egg Whites, Almonds, Cashews, Cocoa, Sea Salt. 12g protein, 0 added sugars.

---

## ⚖️ Consumer Policy & Medical Disclaimer

LABELIQ is an independent product transparency and consumer awareness platform. It is designed to assist consumers in understanding package labels, nutrition facts, and cosmetic formulations. 

- **Not Medical Advice:** LABELIQ does not provide medical diagnoses, treatment advice, or clinical evaluations.
- **No Pharmaceuticals:** LABELIQ strictly does not analyze or support prescription medicines or pharmaceuticals.
- **Consult Specialists:** Consumers with severe allergies, metabolic diseases, or dermatological conditions should consult their licensed healthcare specialist.

---

<div align="center">
  <sub>Built with pride for <strong>GRAVITON 2026</strong> at <strong>Chandigarh Group of Colleges (CGC) University, Mohali</strong>.</sub>
</div>
