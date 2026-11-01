const { initializeApp } = require('firebase/app');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require('firebase/auth');
const {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
} = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function runTestSuite() {
  console.log('================================================================');
  console.log('LABELIQ PROMPT 3 — CLOUD FIRESTORE INTEGRATION VERIFICATION TEST');
  console.log('================================================================');
  console.log('Database ID:', config.firestoreDatabaseId);
  console.log('Project ID:', config.projectId);
  console.log('');

  const timestamp = Date.now();
  const userAEmail = `audit_user_a_${timestamp}@example.com`;
  const userBEmail = `audit_user_b_${timestamp}@example.com`;
  const password = 'TestUser123!';

  // -------------------------------------------------------------
  // Test 1: User Registration & Session Initialization
  // -------------------------------------------------------------
  console.log('--- TEST 1: User A & User B Account Provisioning ---');
  const credA = await createUserWithEmailAndPassword(auth, userAEmail, password);
  const uidA = credA.user.uid;
  console.log(`[PASS] User A authenticated (UID: ${uidA})`);

  // -------------------------------------------------------------
  // Test 2: Save Scan History in Firestore (/users/{uidA}/scans/{scanId})
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Save Scan Record in Cloud Firestore ---');
  const scanId = `scan_${timestamp}_test`;
  const scanDocRef = doc(db, 'users', uidA, 'scans', scanId);
  const scanData = {
    id: scanId,
    userId: uidA,
    productName: 'Epigamia Greek Yogurt Natural',
    brand: 'Epigamia',
    category: 'food',
    score: 87,
    scanDate: new Date().toISOString(),
    imageUrl: '/uploads/scans/sample.jpg',
    barcode: '8906074123456',
    whatsGood: ['High protein (8g per 100g)', 'No added refined sugars'],
    whatToConsider: ['Contains dairy lactose'],
    productData: {
      productName: 'Epigamia Greek Yogurt Natural',
      brand: 'Epigamia',
      category: 'food',
      suitabilityScore: 87,
      scoreBreakdown: {
        ingredientSafety: 90,
        nutritionalOrCosmeticQuality: 88,
        additivePurity: 85,
        transparency: 85,
      },
      scoreRationale: 'Clean formulation with pasteurized cow milk and active live cultures.',
      ingredients: [
        {
          name: 'Pasteurized Double Toned Milk',
          purpose: 'Dairy base',
          whyUsed: 'Nutritional core and protein delivery',
          safetyRating: 'safe',
          safetyNote: 'Wholesome dairy protein',
          commonAllergen: true,
          allergenType: 'Milk/Dairy',
          isNatural: true,
        },
        {
          name: 'Active Live Cultures',
          purpose: 'Fermentation',
          whyUsed: 'Provides beneficial probiotics for gut health',
          safetyRating: 'safe',
          safetyNote: 'S. thermophilus and L. bulgaricus probiotics',
          commonAllergen: false,
          isNatural: true,
        },
      ],
    },
  };

  await setDoc(scanDocRef, scanData);
  console.log(`[PASS] Scan written to Firestore path: users/${uidA}/scans/${scanId}`);

  // -------------------------------------------------------------
  // Test 3: Retrieve Scan Record from Firestore & Verify Attributes
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Retrieve and Validate Persisted Scan Record ---');
  const readSnap = await getDoc(scanDocRef);
  if (!readSnap.exists()) {
    throw new Error('FAILED: Saved scan record could not be found in Firestore');
  }
  const retrieved = readSnap.data();
  if (retrieved.productName !== 'Epigamia Greek Yogurt Natural' || retrieved.score !== 87) {
    throw new Error(`FAILED: Retrieved data mismatch: ${JSON.stringify(retrieved)}`);
  }
  console.log(`[PASS] Document retrieved successfully with matching clinical fields:`);
  console.log(`       - Product: ${retrieved.productName}`);
  console.log(`       - Score: ${retrieved.score}/100`);
  console.log(`       - Ingredients Count: ${retrieved.productData.ingredients.length}`);

  // -------------------------------------------------------------
  // Test 4: Query Scan Collection with Ordering & Pagination
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Collection List Query with Ordering ---');
  const userScansCol = collection(db, 'users', uidA, 'scans');
  const scansQuery = query(userScansCol, orderBy('scanDate', 'desc'));
  const querySnap = await getDocs(scansQuery);
  console.log(`[PASS] Query returned ${querySnap.size} document(s) for User A`);
  if (querySnap.size === 0) throw new Error('FAILED: Query returned 0 scans');

  // -------------------------------------------------------------
  // Test 5: Tutorial Progress Storage (/users/{uidA}/tutorial/progress)
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Tutorial Progress Firestore Storage ---');
  const tutRef = doc(db, 'users', uidA, 'tutorial', 'progress');
  await setDoc(tutRef, {
    userId: uidA,
    completed: true,
    completedAt: new Date().toISOString(),
    lastStep: 4,
    dismissed: false,
  });
  const tutSnap = await getDoc(tutRef);
  if (!tutSnap.exists() || !tutSnap.data().completed) {
    throw new Error('FAILED: Tutorial progress not saved correctly');
  }
  console.log(`[PASS] Tutorial progress verified in Firestore (completed: ${tutSnap.data().completed}, lastStep: 4)`);

  // -------------------------------------------------------------
  // Test 6: Feedback Submission (/feedback/{feedbackId})
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Feedback Submission to Cloud Firestore ---');
  const feedbackId = `fb_${timestamp}_audit`;
  const fbRef = doc(db, 'feedback', feedbackId);
  const fbData = {
    id: feedbackId,
    userId: uidA,
    type: 'experience',
    comment: 'Firestore migration audit test: excellent data persistence and subcollection isolation!',
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    ratings: { overall: 5, accuracy: 5, navigation: 5 },
  };
  await setDoc(fbRef, fbData);
  const fbSnap = await getDoc(fbRef);
  if (!fbSnap.exists()) throw new Error('FAILED: Feedback document not persisted');
  console.log(`[PASS] Feedback submission saved (ID: ${feedbackId}, Status: ${fbSnap.data().status})`);

  // -------------------------------------------------------------
  // Test 7: Multi-User Isolation & IDOR Protection (User B vs User A)
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Multi-User Isolation & Zero-Trust IDOR Protection ---');
  // Log out User A and create User B
  const credB = await createUserWithEmailAndPassword(auth, userBEmail, password);
  const uidB = credB.user.uid;
  console.log(`[PASS] User B authenticated (UID: ${uidB})`);

  // User B tries to read User A's scan directly
  let readUserAFromBBlocked = false;
  try {
    const maliciousDocRef = doc(db, 'users', uidA, 'scans', scanId);
    await getDoc(maliciousDocRef);
  } catch (err) {
    readUserAFromBBlocked = true;
    console.log(`[PASS] User B blocked from reading User A scan: ${err.code || err.message}`);
  }
  if (!readUserAFromBBlocked) {
    throw new Error('CRITICAL SECURITY VULNERABILITY: User B was able to read User A scan record!');
  }

  // User B tries to list User A's scans
  let listUserAFromBBlocked = false;
  try {
    const maliciousListCol = collection(db, 'users', uidA, 'scans');
    await getDocs(maliciousListCol);
  } catch (err) {
    listUserAFromBBlocked = true;
    console.log(`[PASS] User B blocked from querying User A scans: ${err.code || err.message}`);
  }
  if (!listUserAFromBBlocked) {
    throw new Error('CRITICAL SECURITY VULNERABILITY: User B was able to query User A scan collection!');
  }

  // User B tries to read User A's tutorial progress
  let tutorialUserAFromBBlocked = false;
  try {
    const maliciousTutRef = doc(db, 'users', uidA, 'tutorial', 'progress');
    await getDoc(maliciousTutRef);
  } catch (err) {
    tutorialUserAFromBBlocked = true;
    console.log(`[PASS] User B blocked from reading User A tutorial progress: ${err.code || err.message}`);
  }
  if (!tutorialUserAFromBBlocked) {
    throw new Error('CRITICAL SECURITY VULNERABILITY: User B was able to read User A tutorial progress!');
  }

  // User B tries to delete User A's scan
  let deleteUserAFromBBlocked = false;
  try {
    const maliciousDelRef = doc(db, 'users', uidA, 'scans', scanId);
    await deleteDoc(maliciousDelRef);
  } catch (err) {
    deleteUserAFromBBlocked = true;
    console.log(`[PASS] User B blocked from deleting User A scan: ${err.code || err.message}`);
  }
  if (!deleteUserAFromBBlocked) {
    throw new Error('CRITICAL SECURITY VULNERABILITY: User B was able to delete User A scan!');
  }

  // -------------------------------------------------------------
  // Test 8: Record Deletion & Verification of Permanent Removal
  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Record Deletion by Owner (User A) ---');
  await signInWithEmailAndPassword(auth, userAEmail, password);
  console.log('[PASS] Signed back in as User A');

  await deleteDoc(scanDocRef);
  console.log(`[PASS] Delete command executed for users/${uidA}/scans/${scanId}`);

  const postDeleteSnap = await getDoc(scanDocRef);
  if (postDeleteSnap.exists()) {
    throw new Error('FAILED: Document still exists in Firestore after deletion!');
  }
  console.log('[PASS] Verified: Scan document permanently removed from Cloud Firestore (exists = false)');

  console.log('\n================================================================');
  console.log('ALL PROMPT 3 FIRESTORE INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n[FATAL TEST FAILURE]:', err.message);
  process.exit(1);
});
