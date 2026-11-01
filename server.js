// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
dotenv.config();
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "25mb" }));
var ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/barcode/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
      headers: {
        "User-Agent": "LABELIQ - Product Transparency App/1.0 (hackathon@cgc.edu)"
      }
    });
    if (offResponse.ok) {
      const offData = await offResponse.json();
      if (offData.status === 1 && offData.product) {
        return res.json({ found: true, source: "open_food_facts", product: offData.product });
      }
    }
  } catch (err) {
    console.warn("Open Food Facts API error:", err);
  }
  res.json({ found: false, message: "Barcode not found in Open Food Facts" });
});
var DATA_DIR = path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "scan_history.json");
var FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
var TUTORIAL_FILE = path.join(DATA_DIR, "tutorial_progress.json");
var UPLOADS_DIR = path.resolve(process.cwd(), "public/uploads/scans");
var FEEDBACK_UPLOADS_DIR = path.resolve(process.cwd(), "public/uploads/feedback");
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(FEEDBACK_UPLOADS_DIR)) {
    fs.mkdirSync(FEEDBACK_UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(TUTORIAL_FILE)) {
    fs.writeFileSync(TUTORIAL_FILE, JSON.stringify({}, null, 2), "utf-8");
  }
}
function getAllHistoryRecords() {
  ensureDirs();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading scan history database from disk:", err);
    return [];
  }
}
function saveAllHistoryRecords(records) {
  ensureDirs();
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error("Error writing scan history database to disk:", err);
    return false;
  }
}
function persistBase64Image(base64Data, scanId) {
  ensureDirs();
  try {
    if (!base64Data || !base64Data.startsWith("data:image")) {
      return base64Data;
    }
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }
    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const filename = `scan-${scanId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/scans/${filename}`;
  } catch (err) {
    console.warn("Could not persist base64 image to disk, keeping inline:", err);
    return base64Data;
  }
}
function getUserHistory(userId) {
  const all = getAllHistoryRecords();
  return all.filter((record) => record.userId === userId).sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime());
}
function getScanById(scanId, userId) {
  const all = getAllHistoryRecords();
  const found = all.find((r) => r.id === scanId && r.userId === userId);
  return found || null;
}
function addScanRecord(record) {
  const all = getAllHistoryRecords();
  if (record.imageUrl && record.imageUrl.startsWith("data:image")) {
    record.imageUrl = persistBase64Image(record.imageUrl, record.id);
    if (record.productData) {
      record.productData.image = record.imageUrl;
    }
  }
  const filtered = all.filter((r) => r.id !== record.id);
  filtered.unshift(record);
  saveAllHistoryRecords(filtered);
  return record;
}
function deleteScanRecord(scanId, userId) {
  const all = getAllHistoryRecords();
  const existing = all.find((r) => r.id === scanId);
  if (!existing) return false;
  if (existing.userId !== userId) {
    return false;
  }
  const updated = all.filter((r) => r.id !== scanId);
  return saveAllHistoryRecords(updated);
}
function clearUserHistory(userId) {
  const all = getAllHistoryRecords();
  const kept = all.filter((r) => r.userId !== userId);
  return saveAllHistoryRecords(kept);
}
app.use("/uploads", express.static(path.resolve(process.cwd(), "public/uploads")));
function getUserId(req) {
  const headerId = req.headers["x-user-id"];
  if (typeof headerId === "string" && headerId.trim()) {
    return headerId.trim();
  }
  return "user_cgc_mohali";
}
app.get("/api/history", (req, res) => {
  const userId = getUserId(req);
  try {
    const records = getUserHistory(userId);
    res.json({
      success: true,
      userId,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to retrieve scan history from database" });
  }
});
app.get("/api/history/:id", (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  try {
    const record = getScanById(id, userId);
    if (!record) {
      return res.status(404).json({ error: "Scan record not found or access denied" });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    console.error("Error fetching scan record:", err);
    res.status(500).json({ error: "Failed to fetch scan details" });
  }
});
app.post("/api/history", (req, res) => {
  const userId = req.body.userId || getUserId(req);
  const record = req.body;
  if (!record || !record.id || !record.productName) {
    return res.status(400).json({ error: "Invalid scan record data" });
  }
  record.userId = userId;
  if (!record.scanDate) {
    record.scanDate = (/* @__PURE__ */ new Date()).toISOString();
  }
  try {
    const saved = addScanRecord(record);
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error("Error saving scan record:", err);
    res.status(500).json({ error: "Failed to save scan record to database" });
  }
});
app.delete("/api/history/:id", (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  try {
    const deleted = deleteScanRecord(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Scan record not found or access denied" });
    }
    res.json({ success: true, message: "Scan record deleted successfully" });
  } catch (err) {
    console.error("Error deleting scan record:", err);
    res.status(500).json({ error: "Failed to delete scan record" });
  }
});
app.delete("/api/history", (req, res) => {
  const userId = getUserId(req);
  try {
    clearUserHistory(userId);
    res.json({ success: true, message: "All scan history cleared for current user" });
  } catch (err) {
    console.error("Error clearing scan history:", err);
    res.status(500).json({ error: "Failed to clear scan history" });
  }
});
function getAllFeedback() {
  ensureDirs();
  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading feedback file:", err);
    return [];
  }
}
function saveAllFeedback(items) {
  ensureDirs();
  try {
    const tempFile = `${FEEDBACK_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(items, null, 2), "utf-8");
    fs.renameSync(tempFile, FEEDBACK_FILE);
    return true;
  } catch (err) {
    console.error("Error saving feedback file:", err);
    return false;
  }
}
function persistFeedbackAttachment(base64Data, feedbackId) {
  ensureDirs();
  try {
    if (!base64Data || !base64Data.startsWith("data:image")) {
      return base64Data;
    }
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }
    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const filename = `feedback-${feedbackId}-${Date.now()}.${ext}`;
    const filePath = path.join(FEEDBACK_UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/feedback/${filename}`;
  } catch (err) {
    console.warn("Could not persist feedback attachment, keeping raw:", err);
    return base64Data;
  }
}
function getTutorialMap() {
  ensureDirs();
  try {
    const raw = fs.readFileSync(TUTORIAL_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}
function saveTutorialMap(map) {
  ensureDirs();
  try {
    const tempFile = `${TUTORIAL_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(map, null, 2), "utf-8");
    fs.renameSync(tempFile, TUTORIAL_FILE);
    return true;
  } catch (err) {
    return false;
  }
}
app.get("/api/feedback", (req, res) => {
  const userId = getUserId(req);
  const isAdmin = req.headers["x-admin"] === "true" || req.query.admin === "true";
  try {
    const all = getAllFeedback();
    if (isAdmin) {
      return res.json({
        success: true,
        count: all.length,
        isAdmin: true,
        data: all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      });
    }
    const userOnly = all.filter((item) => item.userId === userId).map(({ adminNotes, ...rest }) => rest).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({
      success: true,
      count: userOnly.length,
      isAdmin: false,
      data: userOnly
    });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Failed to retrieve feedback records" });
  }
});
app.post("/api/feedback", (req, res) => {
  const userId = req.body.userId || getUserId(req);
  const body = req.body;
  if (!body || !body.type) {
    return res.status(400).json({ error: "Feedback type is required" });
  }
  const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let attachmentUrl = body.attachmentUrl;
  if (attachmentUrl && attachmentUrl.startsWith("data:image")) {
    attachmentUrl = persistFeedbackAttachment(attachmentUrl, feedbackId);
  }
  const newSubmission = {
    ...body,
    id: feedbackId,
    userId,
    status: "Submitted",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    attachmentUrl
  };
  try {
    const all = getAllFeedback();
    all.unshift(newSubmission);
    saveAllFeedback(all);
    res.json({ success: true, data: newSubmission });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ error: "Failed to save feedback submission" });
  }
});
app.patch("/api/feedback/:id/status", (req, res) => {
  const isAdmin = req.headers["x-admin"] === "true" || req.query.admin === "true";
  if (!isAdmin) {
    return res.status(403).json({ error: "Access denied: Administrator authorization required" });
  }
  const { id } = req.params;
  const { status, adminNotes, assignedAdmin } = req.body;
  try {
    const all = getAllFeedback();
    const index = all.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Feedback submission not found" });
    }
    if (status) all[index].status = status;
    if (adminNotes !== void 0) all[index].adminNotes = adminNotes;
    if (assignedAdmin !== void 0) all[index].assignedAdmin = assignedAdmin;
    all[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveAllFeedback(all);
    res.json({ success: true, data: all[index] });
  } catch (err) {
    console.error("Error updating feedback status:", err);
    res.status(500).json({ error: "Failed to update feedback status" });
  }
});
app.get("/api/tutorial-progress", (req, res) => {
  const userId = getUserId(req);
  try {
    const map = getTutorialMap();
    const progress = map[userId] || { userId, completed: false };
    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ error: "Failed to get tutorial progress" });
  }
});
app.post("/api/tutorial-progress", (req, res) => {
  const userId = req.body.userId || getUserId(req);
  const { completed, lastStep, dismissed } = req.body;
  try {
    const map = getTutorialMap();
    map[userId] = {
      userId,
      completed: Boolean(completed),
      completedAt: completed ? (/* @__PURE__ */ new Date()).toISOString() : map[userId]?.completedAt,
      lastStep: lastStep !== void 0 ? lastStep : map[userId]?.lastStep,
      dismissed: dismissed !== void 0 ? dismissed : map[userId]?.dismissed
    };
    saveTutorialMap(map);
    res.json({ success: true, data: map[userId] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update tutorial progress" });
  }
});
app.post("/api/analyze-product", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg", rawText, categoryHint = "food" } = req.body;
  if (!ai) {
    return res.status(200).json({
      fallback: true,
      message: "AI key not detected in environment. Using intelligent demo analysis engine."
    });
  }
  try {
    const prompt = `
You are the core intelligence engine for LABELIQ, an AI-powered product transparency and ingredient awareness platform.
Analyze the provided product image or text input with extreme precision. Do not diagnose medical conditions.
Always return pure, valid JSON with no markdown backticks or commentary.

Return the following JSON structure:
{
  "productName": "string",
  "brand": "string",
  "category": "food" | "cosmetic",
  "detectedBarcode": "string or null",
  "identifiedIngredientsCount": number,
  "confidenceScore": number (0-100),
  "whatsGood": [
    "string: key positive attributes, wholesome ingredients, clean formulation"
  ],
  "whatToConsider": [
    "string: nutritional caution, additives, high sodium/sugar, potential irritants"
  ],
  "suitabilityScore": number (0 to 100),
  "scoreBreakdown": {
    "ingredientSafety": number (0-100),
    "nutritionalOrCosmeticQuality": number (0-100),
    "additivePurity": number (0-100),
    "transparency": number (0-100)
  },
  "scoreRationale": "string explaining how the score was calculated transparently",
  "ingredients": [
    {
      "name": "string",
      "purpose": "string (e.g. natural sweetener, emulsifier, preservative, active surfactant)",
      "whyUsed": "string explaining functionality in plain English",
      "safetyRating": "safe" | "caution" | "concern" | "insufficient",
      "safetyNote": "string explaining safety status or regulatory context",
      "potentialSideEffects": "string or null",
      "concentration": "string or null",
      "commonAllergen": boolean,
      "allergenType": "string or null (e.g. Gluten, Dairy, Soy, Peanuts, Fragrance, Sulfites)",
      "isNatural": boolean
    }
  ],
  "nutritionalAnalysis": {
    "servingSize": "string or 100g",
    "calories": number,
    "totalFat": number,
    "saturatedFat": number,
    "carbohydrates": number,
    "totalSugar": number,
    "addedSugar": number,
    "protein": number,
    "sodium": number,
    "fiber": number,
    "concerns": ["string"]
  },
  "cosmeticAnalysis": {
    "comedogenicRating": number (0-5 or null),
    "fragranceDetected": boolean,
    "parabenFree": boolean,
    "sulfateFree": boolean,
    "alcoholFree": boolean,
    "targetSkinTypes": ["string"],
    "potentialIrritants": ["string"],
    "keyActives": ["string"]
  },
  "expiryIntelligence": {
    "manufacturingDate": "string (YYYY-MM-DD) or null",
    "expiryDate": "string (YYYY-MM-DD) or null",
    "bestBefore": "string or null",
    "remainingShelfLife": "string (e.g. '8 months', 'Expired 2 weeks ago') or null",
    "status": "within_expiry" | "approaching_expiry" | "expired" | "unknown"
  },
  "testingAndCertifications": [
    {
      "name": "string (e.g. FSSAI, BIS, USDA Organic, Cruelty Free, FDA, Dermatologist Tested)",
      "issuingAuthority": "string",
      "licenseOrRegNumber": "string or null",
      "status": "verified" | "not_verified" | "expired" | "information_unavailable",
      "sourceNote": "string",
      "lastVerification": "string"
    }
  ],
  "extractedRawText": "string containing text detected via OCR"
}
`;
    let response;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: `${prompt}
Input hint category: ${categoryHint}. Extract all visible labels, ingredients, barcode, nutrition facts, and expiry details.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${prompt}
Text or product details provided: "${rawText}"
Category hint: ${categoryHint}`,
        config: {
          responseMimeType: "application/json"
        }
      });
    }
    const textOutput = response.text || "{}";
    const parsed = JSON.parse(textOutput);
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze product with AI",
      details: error.message || String(error)
    });
  }
});
async function setupApp() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LABELIQ full-stack server running on http://0.0.0.0:${PORT}`);
  });
}
setupApp();
