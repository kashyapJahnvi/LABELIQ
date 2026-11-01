import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { FeedbackSubmission, ProductData, ScanHistoryRecord, TutorialProgress } from '../types';

let activeGuestUserId = 'user_cgc_mohali';

export function getActiveUserId(): string {
  if (auth && auth.currentUser) {
    return auth.currentUser.uid;
  }
  return activeGuestUserId;
}

export function setActiveUserId(uid: string): void {
  activeGuestUserId = uid;
}

// Helper to attach verified Firebase ID token to request headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('[historyService] Failed to retrieve Firebase ID token:', err);
  }
  return headers;
}

// -----------------------------------------------------------------
// Resilient Image Upload Service (MIME & Size Validation)
// -----------------------------------------------------------------
export async function uploadImageResilient(
  base64Data: string,
  folder: 'scans' | 'feedback' = 'scans'
): Promise<string> {
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return base64Data;
  }

  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        imageBase64: base64Data,
        folder,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('[historyService] Image upload to server failed, preserving base64 fallback:', err);
  }

  return base64Data;
}

// -----------------------------------------------------------------
// Migration Helper: Sync legacy local JSON records to Firestore
// -----------------------------------------------------------------
let migrationAttempted = false;

export async function checkAndMigrateLegacyData(): Promise<void> {
  if (migrationAttempted || !auth.currentUser) return;
  migrationAttempted = true;

  try {
    const authHeaders = await getAuthHeaders();
    if (!authHeaders['Authorization']) return;

    const res = await fetch('/api/migration/legacy-data', {
      headers: { ...authHeaders },
    });

    if (!res.ok) return;
    const { scans, feedback, tutorial } = await res.json();
    const uid = auth.currentUser.uid;

    // Migrate scans to Firestore if any exist
    if (Array.isArray(scans) && scans.length > 0) {
      for (const item of scans) {
        try {
          const scanDocRef = doc(db, 'users', uid, 'scans', item.id);
          const existing = await getDoc(scanDocRef);
          if (!existing.exists()) {
            await setDoc(scanDocRef, {
              ...item,
              userId: uid,
            });
          }
        } catch (e) {
          // Continue migrating other records
        }
      }
    }

    // Migrate feedback
    if (Array.isArray(feedback) && feedback.length > 0) {
      for (const fb of feedback) {
        try {
          const fbDocRef = doc(db, 'feedback', fb.id);
          const existing = await getDoc(fbDocRef);
          if (!existing.exists()) {
            await setDoc(fbDocRef, {
              ...fb,
              userId: fb.userId || uid,
            });
          }
        } catch (e) {}
      }
    }

    // Migrate tutorial progress
    if (tutorial && tutorial.completed) {
      try {
        const tutRef = doc(db, 'users', uid, 'tutorial', 'progress');
        await setDoc(
          tutRef,
          {
            userId: uid,
            completed: Boolean(tutorial.completed),
            completedAt: tutorial.completedAt || new Date().toISOString(),
            lastStep: tutorial.lastStep || 0,
            dismissed: Boolean(tutorial.dismissed),
          },
          { merge: true }
        );
      } catch (e) {}
    }
  } catch (err) {
    console.warn('[historyService] Legacy data migration check failed:', err);
  }
}

// -----------------------------------------------------------------
// Cloud Firestore Scan History Services
// -----------------------------------------------------------------
export async function fetchScanHistory(pageSize = 50): Promise<ScanHistoryRecord[]> {
  const user = auth.currentUser;

  // Unauthenticated guest user fallback (localStorage)
  if (!user) {
    try {
      const local = localStorage.getItem('labeliq_guest_history');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  }

  // Attempt legacy migration once per session
  checkAndMigrateLegacyData().catch(() => {});

  const scansPath = `users/${user.uid}/scans`;
  try {
    const scansCol = collection(db, 'users', user.uid, 'scans');
    const q = query(scansCol, orderBy('scanDate', 'desc'), limit(pageSize));
    const snap = await getDocs(q);

    const records: ScanHistoryRecord[] = [];
    snap.forEach((docSnap) => {
      records.push(docSnap.data() as ScanHistoryRecord);
    });

    // If Firestore is empty, try backend API sync
    if (records.length === 0) {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/history', { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    }

    return records;
  } catch (err) {
    console.warn('[historyService] Firestore fetchScanHistory error, falling back to API:', err);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/history', { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      }
    } catch {}
    handleFirestoreError(err, OperationType.LIST, scansPath);
  }
}

export async function saveScanHistory(product: ProductData, barcode?: string): Promise<ScanHistoryRecord> {
  const user = auth.currentUser;
  const id = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Optimize and persist image if provided
  let imageUrl = product.image;
  if (imageUrl && imageUrl.startsWith('data:image')) {
    imageUrl = await uploadImageResilient(imageUrl, 'scans');
  }

  const record: ScanHistoryRecord = {
    id,
    userId: user ? user.uid : 'guest',
    productName: product.productName,
    brand: product.brand,
    category: product.category,
    score: product.suitabilityScore,
    scanDate: new Date().toISOString(),
    imageUrl,
    barcode: barcode || product.detectedBarcode || null,
    whatsGood: product.whatsGood || [],
    whatToConsider: product.whatToConsider || [],
    productData: {
      ...product,
      image: imageUrl,
    },
  };

  // If guest, keep in local storage
  if (!user) {
    try {
      const local = localStorage.getItem('labeliq_guest_history');
      const items: ScanHistoryRecord[] = local ? JSON.parse(local) : [];
      // Prevent duplicate scan saves
      const isDuplicate = items.some(
        (i) => i.productName.toLowerCase() === record.productName.toLowerCase() &&
               new Date(i.scanDate).getTime() > Date.now() - 30000
      );
      if (!isDuplicate) {
        items.unshift(record);
        localStorage.setItem('labeliq_guest_history', JSON.stringify(items.slice(0, 30)));
      }
    } catch {}
    return record;
  }

  // Persist directly to Cloud Firestore
  const scanDocPath = `users/${user.uid}/scans/${record.id}`;
  try {
    const scanRef = doc(db, 'users', user.uid, 'scans', record.id);
    await setDoc(scanRef, record);

    // Also notify server backend asynchronously
    getAuthHeaders().then((headers) => {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(record),
      }).catch(() => {});
    });

    return record;
  } catch (err) {
    console.warn('[historyService] Firestore saveScanHistory failed, using server fallback:', err);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(record),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || record;
      }
    } catch {}
    handleFirestoreError(err, OperationType.CREATE, scanDocPath);
  }
}

export async function deleteScanRecord(scanId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    try {
      const local = localStorage.getItem('labeliq_guest_history');
      if (local) {
        const items: ScanHistoryRecord[] = JSON.parse(local);
        const updated = items.filter((i) => i.id !== scanId);
        localStorage.setItem('labeliq_guest_history', JSON.stringify(updated));
        return true;
      }
    } catch {}
    return false;
  }

  const scanDocPath = `users/${user.uid}/scans/${scanId}`;
  try {
    const scanRef = doc(db, 'users', user.uid, 'scans', scanId);
    await deleteDoc(scanRef);

    // Also sync deletion with server backend
    getAuthHeaders().then((headers) => {
      fetch(`/api/history/${encodeURIComponent(scanId)}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {});
    });

    return true;
  } catch (err) {
    console.warn('[historyService] Firestore deleteScanRecord failed, attempting server fallback:', err);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/history/${encodeURIComponent(scanId)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      return res.ok;
    } catch {}
    handleFirestoreError(err, OperationType.DELETE, scanDocPath);
  }
}

export async function clearAllHistory(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    localStorage.removeItem('labeliq_guest_history');
    return true;
  }

  const scansPath = `users/${user.uid}/scans`;
  try {
    const scansCol = collection(db, 'users', user.uid, 'scans');
    const snap = await getDocs(scansCol);
    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();

    // Sync clear with server backend
    getAuthHeaders().then((headers) => {
      fetch('/api/history', { method: 'DELETE', headers }).catch(() => {});
    });

    return true;
  } catch (err) {
    console.warn('[historyService] Firestore clearAllHistory failed, attempting server fallback:', err);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/history', { method: 'DELETE', headers: authHeaders });
      return res.ok;
    } catch {}
    handleFirestoreError(err, OperationType.DELETE, scansPath);
  }
}

// -----------------------------------------------------------------
// Cloud Firestore Feedback & Support Services
// -----------------------------------------------------------------
export async function fetchFeedback(asAdmin = false): Promise<{
  success: boolean;
  isAdmin: boolean;
  data: FeedbackSubmission[];
  error?: string;
}> {
  const user = auth.currentUser;
  if (!user) {
    return {
      success: false,
      isAdmin: false,
      data: [],
      error: 'Please sign in to view your submitted feedback',
    };
  }

  const feedbackPath = 'feedback';
  try {
    const feedbackCol = collection(db, 'feedback');
    let q;
    if (asAdmin) {
      q = query(feedbackCol, orderBy('createdAt', 'desc'), limit(100));
    } else {
      q = query(
        feedbackCol,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    const snap = await getDocs(q);
    const items: FeedbackSubmission[] = [];
    snap.forEach((docSnap) => {
      items.push(docSnap.data() as FeedbackSubmission);
    });

    return {
      success: true,
      isAdmin: asAdmin,
      data: items,
    };
  } catch (err) {
    console.warn('[historyService] Firestore fetchFeedback error, trying API fallback:', err);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/feedback${asAdmin ? '?adminView=true' : ''}`, {
        headers: authHeaders,
      });
      const json = await res.json();
      if (res.ok) {
        return {
          success: true,
          isAdmin: Boolean(json.isAdmin),
          data: Array.isArray(json.data) ? json.data : [],
        };
      }
    } catch {}
    handleFirestoreError(err, OperationType.LIST, feedbackPath);
  }
}

export async function submitFeedback(payload: Partial<FeedbackSubmission>): Promise<FeedbackSubmission | null> {
  const user = auth.currentUser;
  if (!user) {
    console.warn('[historyService] User must be signed in to submit feedback');
    return null;
  }

  const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let attachmentUrl = payload.attachmentUrl;
  if (attachmentUrl && attachmentUrl.startsWith('data:image')) {
    attachmentUrl = await uploadImageResilient(attachmentUrl, 'feedback');
  }

  const submission: FeedbackSubmission = {
    ...payload,
    id,
    userId: user.uid,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    attachmentUrl,
    type: payload.type || 'experience',
    comment: payload.comment || '',
  };

  const feedbackPath = `feedback/${id}`;
  try {
    const fbRef = doc(db, 'feedback', id);
    await setDoc(fbRef, submission);

    // Sync to server backend
    getAuthHeaders().then((headers) => {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(submission),
      }).catch(() => {});
    });

    return submission;
  } catch (err) {
    console.warn('[historyService] Firestore submitFeedback failed, attempting server fallback:', err);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(submission),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    handleFirestoreError(err, OperationType.CREATE, feedbackPath);
  }
}

export async function updateFeedbackStatus(
  id: string,
  updates: { status?: string; adminNotes?: string; assignedAdmin?: string }
): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'Administrator authentication required' };
  }

  const feedbackPath = `feedback/${id}`;
  const payload: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const fbRef = doc(db, 'feedback', id);
    await updateDoc(fbRef, payload);

    // Sync to server backend
    getAuthHeaders().then((headers) => {
      fetch(`/api/feedback/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(updates),
      }).catch(() => {});
    });

    return { success: true };
  } catch (err) {
    console.warn('[historyService] Firestore updateFeedbackStatus failed, attempting server fallback:', err);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/feedback/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: json.error || `HTTP ${res.status}` };
    } catch {}
    handleFirestoreError(err, OperationType.UPDATE, feedbackPath);
  }
}

// -----------------------------------------------------------------
// Cloud Firestore Tutorial Progress Services
// -----------------------------------------------------------------
export async function getTutorialProgress(): Promise<TutorialProgress> {
  const user = auth.currentUser;
  if (!user) {
    return { userId: 'guest', completed: false };
  }

  const progressPath = `users/${user.uid}/tutorial/progress`;
  try {
    const tutRef = doc(db, 'users', user.uid, 'tutorial', 'progress');
    const snap = await getDoc(tutRef);
    if (snap.exists()) {
      return snap.data() as TutorialProgress;
    }

    // Try server API fallback
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/tutorial-progress', { headers: authHeaders });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[historyService] Firestore getTutorialProgress error:', err);
  }

  return { userId: user.uid, completed: false };
}

export async function saveTutorialProgress(
  completed: boolean,
  lastStep?: number,
  dismissed?: boolean
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const data: TutorialProgress = {
    userId: user.uid,
    completed: Boolean(completed),
    completedAt: completed ? new Date().toISOString() : undefined,
    lastStep: lastStep !== undefined ? Number(lastStep) : undefined,
    dismissed: dismissed !== undefined ? Boolean(dismissed) : undefined,
  };

  const progressPath = `users/${user.uid}/tutorial/progress`;
  try {
    const tutRef = doc(db, 'users', user.uid, 'tutorial', 'progress');
    await setDoc(tutRef, data, { merge: true });

    // Sync to server backend
    getAuthHeaders().then((headers) => {
      fetch('/api/tutorial-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(data),
      }).catch(() => {});
    });
  } catch (err) {
    console.warn('[historyService] Firestore saveTutorialProgress error:', err);
    try {
      const authHeaders = await getAuthHeaders();
      await fetch('/api/tutorial-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(data),
      });
    } catch {}
  }
}

// -----------------------------------------------------------------
// Barcode Lookup API (Public)
// -----------------------------------------------------------------
export async function lookupBarcode(code: string): Promise<{ found: boolean; product?: any }> {
  try {
    const res = await fetch(`/api/barcode/${encodeURIComponent(code)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[historyService] Barcode lookup failed:', err);
  }
  return { found: false };
}

// -----------------------------------------------------------------
// AI Product Analysis API (Public & Authenticated)
// -----------------------------------------------------------------
export async function analyzeProductWithAI(params: {
  imageBase64?: string;
  mimeType?: string;
  rawText?: string;
  categoryHint?: 'food' | 'cosmetic';
}): Promise<{ success: boolean; data?: ProductData; fallback?: boolean; error?: string }> {
  const authHeaders = await getAuthHeaders();

  try {
    const res = await fetch('/api/analyze-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(params),
    });
    const result = await res.json();
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error analyzing product' };
  }
}
