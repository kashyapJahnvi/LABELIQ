import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Configuration loaded from provisioned firebase-applet-config.json with env fallback
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseAppletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseAppletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId || '(default)',
  storageBucket: firebaseAppletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: firebaseAppletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseAppletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

// Initialize Firebase App singleton
export const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore with the provisioned Enterprise database ID
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Cloud Storage
export const storage: FirebaseStorage = getStorage(app);

// Ensure session persistence across page refreshes
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Persistence configuration error:', err);
  });
}

// -------------------------------------------------------------
// Structured Firestore Error Diagnostic Handler (Skill Requirement)
// -------------------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error Details]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system_health', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline or network unreachable.');
      return false;
    }
    // Any permission error still proves server connectivity to database
    return true;
  }
}
