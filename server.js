// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
dotenv.config();
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "25mb" }));
var firebaseProjectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "labeliq-app";
var firebaseAdminInitialized = false;
try {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || firebaseProjectId
        });
        firebaseAdminInitialized = true;
      } catch (keyErr) {
        console.warn("[Firebase Admin] Service account JSON parse error, falling back to project credentials:", keyErr.message);
      }
    }
    if (!firebaseAdminInitialized) {
      initializeApp({
        projectId: firebaseProjectId
      });
      firebaseAdminInitialized = true;
    }
  } else {
    firebaseAdminInitialized = true;
  }
} catch (err) {
  console.warn("[Firebase Admin Initialization]:", err.message);
}
var ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
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
function safeAtomicWrite(targetPath, content) {
  ensureDirs();
  const dir = path.dirname(targetPath);
  const tempFile = path.join(
    dir,
    `.${path.basename(targetPath)}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  );
  try {
    fs.writeFileSync(tempFile, content, "utf-8");
    try {
      fs.renameSync(tempFile, targetPath);
    } catch {
      fs.copyFileSync(tempFile, targetPath);
      try {
        fs.unlinkSync(tempFile);
      } catch {
      }
    }
    return true;
  } catch (err) {
    console.error(`[SafeAtomicWrite Error] Failed to write to ${targetPath}:`, err.message);
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch {
    }
    return false;
  }
}
function getAllHistoryRecords() {
  ensureDirs();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[Storage Error] Reading scan history from disk:", err.message);
    return [];
  }
}
function saveAllHistoryRecords(records) {
  return safeAtomicWrite(DB_FILE, JSON.stringify(records, null, 2));
}
function extractBase64ImageData(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return { valid: false, mimeType: "", data: "", error: "Missing or invalid image data string" };
  }
  const dataUriRegex = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/i;
  const match = imageBase64.match(dataUriRegex);
  if (match && match[1] && match[2]) {
    const rawMime = match[1].toLowerCase();
    const cleanData = match[2].trim();
    if (cleanData.length < 20) {
      return { valid: false, mimeType: rawMime, data: "", error: "Image data payload too small to be valid" };
    }
    return { valid: true, mimeType: rawMime, data: cleanData };
  }
  const trimmed = imageBase64.trim();
  if (!trimmed.startsWith("data:") && trimmed.length > 50) {
    return { valid: true, mimeType: "image/jpeg", data: trimmed };
  }
  return { valid: false, mimeType: "", data: "", error: "Invalid data URI image format" };
}
function persistBase64Image(base64Data, scanId) {
  ensureDirs();
  try {
    const extracted = extractBase64ImageData(base64Data);
    if (!extracted.valid) {
      return base64Data;
    }
    let ext = "jpg";
    if (extracted.mimeType.includes("png")) ext = "png";
    else if (extracted.mimeType.includes("webp")) ext = "webp";
    const buffer = Buffer.from(extracted.data, "base64");
    const filename = `scan-${scanId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/scans/${filename}`;
  } catch (err) {
    console.warn("[Upload Warning] Could not persist base64 image to disk:", err.message);
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
  if (!existing || existing.userId !== userId) {
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
var ADMIN_ALLOWLIST = (process.env.ADMIN_EMAILS || "jahnvith80@gmail.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
function isUserAdmin(decodedToken) {
  if (!decodedToken) return false;
  if (decodedToken.admin === true || decodedToken.role === "admin") {
    return true;
  }
  if (decodedToken.email && ADMIN_ALLOWLIST.includes(decodedToken.email.toLowerCase())) {
    return true;
  }
  return false;
}
async function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized: Missing or invalid Authorization Bearer token. Please sign in."
    });
  }
  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    return res.status(401).json({
      error: "Unauthorized: Empty authentication token provided."
    });
  }
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.warn("[Auth Middleware] Invalid token presented:", err.message);
    return res.status(401).json({
      error: "Unauthorized: Invalid, expired, or revoked Firebase authentication token."
    });
  }
}
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.user || !isUserAdmin(req.user)) {
      return res.status(403).json({
        error: "Forbidden: Access restricted to verified administrators only."
      });
    }
    next();
  });
}
async function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.slice(7).trim();
    if (idToken) {
      try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        req.user = decodedToken;
      } catch {
      }
    }
  }
  next();
}
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    uid: req.user.uid,
    email: req.user.email || null,
    displayName: req.user.name || null,
    isAdmin: isUserAdmin(req.user)
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    firebaseAdminReady: firebaseAdminInitialized,
    firebaseProjectId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/barcode/:code", async (req, res) => {
  const { code } = req.params;
  if (!code || typeof code !== "string" || !/^[0-9a-zA-Z_-]+$/.test(code)) {
    return res.status(400).json({ found: false, error: "Invalid barcode format" });
  }
  try {
    const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, {
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
    console.warn("[Open Food Facts Proxy Warning]:", err.message);
  }
  res.json({ found: false, message: "Barcode not found in Open Food Facts" });
});
app.post("/api/upload-image", optionalAuth, (req, res) => {
  const { imageBase64, folder = "scans" } = req.body;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return res.status(400).json({ success: false, error: "Missing image data payload" });
  }
  const extracted = extractBase64ImageData(imageBase64);
  if (!extracted.valid) {
    return res.status(400).json({ success: false, error: extracted.error || "Invalid image payload" });
  }
  const approximateSizeBytes = extracted.data.length * 3 / 4;
  if (approximateSizeBytes > 10 * 1024 * 1024) {
    return res.status(400).json({ success: false, error: "Image exceeds maximum allowed size of 10MB" });
  }
  const validFolders = ["scans", "feedback"];
  const targetFolder = validFolders.includes(folder) ? folder : "scans";
  const targetDir = targetFolder === "feedback" ? FEEDBACK_UPLOADS_DIR : UPLOADS_DIR;
  try {
    let ext = "jpg";
    if (extracted.mimeType.includes("png")) ext = "png";
    else if (extracted.mimeType.includes("webp")) ext = "webp";
    const filename = `${targetFolder}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(targetDir, filename);
    const buffer = Buffer.from(extracted.data, "base64");
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${targetFolder}/${filename}`;
    res.json({ success: true, url: publicUrl, mimeType: extracted.mimeType, sizeBytes: approximateSizeBytes });
  } catch (err) {
    console.error("[Upload API Error]:", err.message);
    res.status(500).json({ success: false, error: "Failed to persist uploaded image" });
  }
});
app.get("/api/migration/legacy-data", requireAuth, (req, res) => {
  const uid = req.user.uid;
  const userIsAdmin = isUserAdmin(req.user);
  try {
    const allScans = getAllHistoryRecords();
    const allFeedback = getAllFeedback();
    const tutorialMap = getTutorialMap();
    const userScans = allScans.filter((s) => s.userId === uid || s.userId === "user_cgc_mohali");
    const userFeedback = allFeedback.filter((f) => f.userId === uid || userIsAdmin && f.userId === "user_cgc_mohali");
    const userTutorial = tutorialMap[uid] || tutorialMap["user_cgc_mohali"] || null;
    res.json({
      success: true,
      scans: userScans,
      feedback: userFeedback,
      tutorial: userTutorial
    });
  } catch (err) {
    console.error("[Migration API Error]:", err.message);
    res.status(500).json({ success: false, error: "Failed to read legacy records for migration" });
  }
});
app.get("/api/history", requireAuth, (req, res) => {
  const uid = req.user.uid;
  try {
    const records = getUserHistory(uid);
    res.json({
      success: true,
      userId: uid,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error("[History API Error] Get all:", err.message);
    res.status(500).json({ error: "Failed to retrieve scan history from database" });
  }
});
app.get("/api/history/:id", requireAuth, (req, res) => {
  const uid = req.user.uid;
  const { id } = req.params;
  try {
    const record = getScanById(id, uid);
    if (!record) {
      return res.status(404).json({ error: "Scan record not found or access denied" });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    console.error("[History API Error] Get by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch scan details" });
  }
});
app.post("/api/history", requireAuth, (req, res) => {
  const uid = req.user.uid;
  const record = req.body;
  if (!record || typeof record !== "object" || !record.id || !record.productName) {
    return res.status(400).json({ error: "Invalid scan record: id and productName are required" });
  }
  record.userId = uid;
  if (!record.scanDate) {
    record.scanDate = (/* @__PURE__ */ new Date()).toISOString();
  }
  try {
    const saved = addScanRecord(record);
    res.json({ success: true, data: saved });
  } catch (err) {
    console.error("[History API Error] Save record:", err.message);
    res.status(500).json({ error: "Failed to save scan record to database" });
  }
});
app.delete("/api/history/:id", requireAuth, (req, res) => {
  const uid = req.user.uid;
  const { id } = req.params;
  try {
    const deleted = deleteScanRecord(id, uid);
    if (!deleted) {
      return res.status(404).json({ error: "Scan record not found or access denied" });
    }
    res.json({ success: true, message: "Scan record deleted successfully" });
  } catch (err) {
    console.error("[History API Error] Delete record:", err.message);
    res.status(500).json({ error: "Failed to delete scan record" });
  }
});
app.delete("/api/history", requireAuth, (req, res) => {
  const uid = req.user.uid;
  try {
    clearUserHistory(uid);
    res.json({ success: true, message: "All scan history cleared for current user" });
  } catch (err) {
    console.error("[History API Error] Clear history:", err.message);
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
    console.error("[Feedback Storage Error] Reading from disk:", err.message);
    return [];
  }
}
function saveAllFeedback(items) {
  return safeAtomicWrite(FEEDBACK_FILE, JSON.stringify(items, null, 2));
}
function persistFeedbackAttachment(base64Data, feedbackId) {
  ensureDirs();
  try {
    const extracted = extractBase64ImageData(base64Data);
    if (!extracted.valid) return base64Data;
    let ext = "jpg";
    if (extracted.mimeType.includes("png")) ext = "png";
    else if (extracted.mimeType.includes("webp")) ext = "webp";
    const buffer = Buffer.from(extracted.data, "base64");
    const filename = `feedback-${feedbackId}-${Date.now()}.${ext}`;
    const filePath = path.join(FEEDBACK_UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/feedback/${filename}`;
  } catch (err) {
    console.warn("[Feedback Upload Warning] Could not persist attachment:", err.message);
    return base64Data;
  }
}
app.get("/api/feedback", requireAuth, (req, res) => {
  const uid = req.user.uid;
  const userIsAdmin = isUserAdmin(req.user);
  const wantsAdminView = req.query.adminView === "true";
  try {
    const all = getAllFeedback();
    if (wantsAdminView) {
      if (!userIsAdmin) {
        return res.status(403).json({
          error: "Forbidden: Administrator privileges required to access full feedback registry",
          isAdmin: false,
          data: []
        });
      }
      return res.json({
        success: true,
        count: all.length,
        isAdmin: true,
        data: all.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      });
    }
    const userOnly = all.filter((item) => item.userId === uid).map(({ adminNotes, ...rest }) => rest).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({
      success: true,
      count: userOnly.length,
      isAdmin: userIsAdmin,
      data: userOnly
    });
  } catch (err) {
    console.error("[Feedback API Error] Get list:", err.message);
    res.status(500).json({ error: "Failed to retrieve feedback records" });
  }
});
app.post("/api/feedback", requireAuth, (req, res) => {
  const uid = req.user.uid;
  const body = req.body;
  const validTypes = ["experience", "incorrect_analysis", "feature", "support", "inline_ingredient"];
  if (!body || !body.type || !validTypes.includes(body.type)) {
    return res.status(400).json({
      error: `Invalid feedback type. Must be one of: ${validTypes.join(", ")}`
    });
  }
  if (!body.comment || typeof body.comment !== "string" || !body.comment.trim()) {
    return res.status(400).json({ error: "Feedback comment is required" });
  }
  const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let attachmentUrl = body.attachmentUrl;
  if (attachmentUrl && attachmentUrl.startsWith("data:image")) {
    attachmentUrl = persistFeedbackAttachment(attachmentUrl, feedbackId);
  }
  const newSubmission = {
    ...body,
    id: feedbackId,
    userId: uid,
    // Derived from verified token
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
    console.error("[Feedback API Error] Save submission:", err.message);
    res.status(500).json({ error: "Failed to save feedback submission" });
  }
});
app.patch("/api/feedback/:id/status", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, assignedAdmin } = req.body;
  const validStatuses = ["Submitted", "Under Review", "In Progress", "Resolved"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    });
  }
  try {
    const all = getAllFeedback();
    const index = all.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Feedback submission not found" });
    }
    if (status) all[index].status = status;
    if (adminNotes !== void 0) all[index].adminNotes = String(adminNotes).slice(0, 2e3);
    if (assignedAdmin !== void 0) all[index].assignedAdmin = String(assignedAdmin).slice(0, 200);
    all[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveAllFeedback(all);
    res.json({ success: true, data: all[index] });
  } catch (err) {
    console.error("[Feedback API Error] Update status:", err.message);
    res.status(500).json({ error: "Failed to update feedback status" });
  }
});
function getTutorialMap() {
  ensureDirs();
  try {
    const raw = fs.readFileSync(TUTORIAL_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("[Tutorial Storage Error] Reading from disk:", err.message);
    return {};
  }
}
function saveTutorialMap(map) {
  return safeAtomicWrite(TUTORIAL_FILE, JSON.stringify(map, null, 2));
}
app.get("/api/tutorial-progress", requireAuth, (req, res) => {
  const uid = req.user.uid;
  try {
    const map = getTutorialMap();
    const progress = map[uid] || { userId: uid, completed: false };
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error("[Tutorial API Error] Get progress:", err.message);
    res.status(500).json({ error: "Failed to get tutorial progress" });
  }
});
app.post("/api/tutorial-progress", requireAuth, (req, res) => {
  const uid = req.user.uid;
  const { completed, lastStep, dismissed } = req.body;
  try {
    const map = getTutorialMap();
    map[uid] = {
      userId: uid,
      completed: Boolean(completed),
      completedAt: completed ? (/* @__PURE__ */ new Date()).toISOString() : map[uid]?.completedAt,
      lastStep: lastStep !== void 0 ? Number(lastStep) : map[uid]?.lastStep,
      dismissed: dismissed !== void 0 ? Boolean(dismissed) : map[uid]?.dismissed
    };
    saveTutorialMap(map);
    res.json({ success: true, data: map[uid] });
  } catch (err) {
    console.error("[Tutorial API Error] Update progress:", err.message);
    res.status(500).json({ error: "Failed to update tutorial progress" });
  }
});
function cleanAndParseGeminiJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return { success: false, error: "Empty or invalid response from AI model" };
  }
  let text = rawText.trim();
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") {
      return { success: false, error: "Model did not return a structured JSON object" };
    }
    parsed.productName = typeof parsed.productName === "string" && parsed.productName.trim() ? parsed.productName.trim() : "Scanned Product";
    parsed.brand = typeof parsed.brand === "string" && parsed.brand.trim() ? parsed.brand.trim() : "Identified Brand";
    parsed.category = parsed.category === "cosmetic" ? "cosmetic" : "food";
    const rawScore = Number(parsed.suitabilityScore);
    parsed.suitabilityScore = !isNaN(rawScore) && rawScore >= 0 && rawScore <= 100 ? Math.round(rawScore) : 75;
    parsed.ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    parsed.whatsGood = Array.isArray(parsed.whatsGood) ? parsed.whatsGood : [];
    parsed.whatToConsider = Array.isArray(parsed.whatToConsider) ? parsed.whatToConsider : [];
    parsed.identifiedIngredientsCount = parsed.ingredients.length || Number(parsed.identifiedIngredientsCount) || 0;
    parsed.confidenceScore = typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 90;
    if (!parsed.scoreBreakdown || typeof parsed.scoreBreakdown !== "object") {
      parsed.scoreBreakdown = {
        ingredientSafety: parsed.suitabilityScore,
        nutritionalOrCosmeticQuality: parsed.suitabilityScore,
        additivePurity: parsed.suitabilityScore,
        transparency: parsed.suitabilityScore
      };
    }
    if (!parsed.scoreRationale || typeof parsed.scoreRationale !== "string") {
      parsed.scoreRationale = `Formulation evaluated across ${parsed.identifiedIngredientsCount} identified ingredients with a transparent health suitability score of ${parsed.suitabilityScore}/100.`;
    }
    return { success: true, data: parsed };
  } catch (err) {
    console.error("[Gemini JSON Parse Error]:", err.message);
    return {
      success: false,
      error: "Failed to parse AI response into structured label intelligence"
    };
  }
}
app.post("/api/analyze-product", optionalAuth, async (req, res) => {
  const { imageBase64, rawText, categoryHint = "food" } = req.body;
  const safeCategory = categoryHint === "cosmetic" ? "cosmetic" : "food";
  if (!imageBase64 && (!rawText || typeof rawText !== "string" || !rawText.trim())) {
    return res.status(400).json({
      error: "Missing input: Please provide either a packaging image or label text to analyze."
    });
  }
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
      const extracted = extractBase64ImageData(imageBase64);
      if (!extracted.valid) {
        return res.status(400).json({
          error: `Invalid image payload: ${extracted.error || "Failed to process base64 image data"}`
        });
      }
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: extracted.mimeType,
                data: extracted.data
              }
            },
            {
              text: `${prompt}
Input hint category: ${safeCategory}. Extract all visible labels, ingredients, barcode, nutrition facts, and expiry details.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });
    } else {
      const safeRawText = String(rawText).slice(0, 1e4);
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${prompt}
Text or product details provided: "${safeRawText}"
Category hint: ${safeCategory}`,
        config: {
          responseMimeType: "application/json"
        }
      });
    }
    const textOutput = response.text || "";
    const parsedResult = cleanAndParseGeminiJson(textOutput);
    if (!parsedResult.success) {
      return res.status(422).json({
        error: parsedResult.error || "Failed to parse AI product analysis"
      });
    }
    res.json({ success: true, data: parsedResult.data });
  } catch (error) {
    console.error("[Gemini API Exception]:", error.message || error);
    res.status(500).json({
      error: "Failed to analyze product with AI. Please check label clarity or try again."
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
export {
  extractBase64ImageData,
  isUserAdmin
};
