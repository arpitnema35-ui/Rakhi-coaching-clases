import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc,
  deleteDoc,
  collection, 
  query, 
  where, 
  orderBy,
  getDocFromServer,
  Firestore
} from "firebase/firestore";

// User's exact live Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDoR5C2tJDKgD2bj6vgrLJtFh_4L6GQDo",
  authDomain: "choching-clases.firebaseapp.com",
  databaseURL: "https://choching-clases-default-rtdb.firebaseio.com",
  projectId: "choching-clases",
  storageBucket: "choching-clases.firebasestorage.app",
  messagingSenderId: "318353922657",
  appId: "1:318353922657:web:ce52611447e8c53d832820",
  measurementId: "G-M66LECCG9M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

// Global hook to test Firebase connection on startup
export async function testConnection(): Promise<boolean> {
  try {
    // Try to connect and fetch a placeholder document
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
    return true;
  } catch (error) {
    console.warn("Firebase connection notice: operating in local fallback mode.", error);
    return false;
  }
}

// Structured error handler as mandated by guidelines
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Safely execute a Firestore GET/LIST or fall back to local mock data
export async function safeGetDoc<T>(collectionName: string, docId: string, fallback: T): Promise<T> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return fallback;
  } catch (error) {
    console.warn(`Firestore read failed for ${collectionName}/${docId}, returning fallback data:`, error);
    return fallback;
  }
}

export async function safeGetDocs<T>(collectionName: string, fallbackList: T[], queryConstraints?: any[]): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const q = queryConstraints ? query(colRef, ...queryConstraints) : colRef;
    const querySnapshot = await getDocs(q);
    
    // Always include fallbacks to preserve template data across live deployments
    const results: T[] = [...fallbackList];
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as T;
        // Check if item already exists in fallback (by id)
        const existsIndex = results.findIndex(item => (item as any).id === doc.id);
        if (existsIndex >= 0) {
          results[existsIndex] = data; // Override fallback with DB version
        } else {
          results.unshift(data); // Add new DB items at the top
        }
      });
    }
    return results;
  } catch (error) {
    console.warn(`Firestore list failed for ${collectionName}, returning fallback list:`, error);
    return fallbackList;
  }
}

export async function safeWriteDoc<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${data.id}`);
  }
}

export async function safeAddDoc<T>(collectionName: string, data: any): Promise<string> {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
    throw error;
  }
}

export async function safeDeleteDoc(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}
