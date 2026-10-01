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
  limit,
  onSnapshot,
  getDocFromServer,
  Firestore
} from "firebase/firestore";
import { LiveStreamSession, LiveChatMessage } from "./types";

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

// Default Live Stream session for initial display or offline fallback
export const defaultLiveSession: LiveStreamSession = {
  id: "current",
  roomCode: "live-commerce-12",
  title: "Class 12th Commerce: Partnership Accounts & Balance Sheet Live Masterclass",
  subject: "Accountancy & Business Studies",
  grade: "Class 12",
  teacherName: "Arpit Nema (Director & Faculty Head)",
  isLive: false,
  activeMode: 'camera',
  streamUrl: "",
  scheduledDate: new Date().toISOString().split('T')[0],
  scheduledTime: "05:00 PM IST",
  description: "Direct in-browser interactive live coaching. Partnership accounts, goodwill valuation numericals, and board question breakdown.",
  viewerCount: 0,
  likesCount: 142,
  thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
  notesTitle: "Partnership Accounts Complete Formula Cheat-Sheet (PDF)",
  notesUrl: "#",
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
};

// Initial sample messages for the live chat
export const defaultLiveChatMessages: LiveChatMessage[] = [
  {
    id: "msg_pin",
    senderName: "Arpit Nema (Faculty)",
    senderRole: "teacher",
    text: "Welcome to today's live class! We will solve 5 high-yield partnership numericals today. Post your doubts below! 📚",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    isPinned: true
  },
  {
    id: "msg_1",
    senderName: "Rohit Sharma",
    senderRole: "student",
    text: "Good evening Sir! Audio and video are crystal clear! 👍",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString()
  },
  {
    id: "msg_2",
    senderName: "Priya Patel",
    senderRole: "student",
    text: "Sir, will you explain Sacrificing Ratio calculation today as well?",
    createdAt: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: "msg_3",
    senderName: "Arpit Nema (Faculty)",
    senderRole: "teacher",
    text: "Yes Priya, Sacrificing and Gaining Ratio will be covered on the whiteboard! Stay tuned.",
    createdAt: new Date(Date.now() - 4 * 60000).toISOString()
  },
  {
    id: "msg_4",
    senderName: "Aman Gupta",
    senderRole: "student",
    text: "Notes downloaded Sir, ready for the questions! 🚀",
    createdAt: new Date(Date.now() - 1 * 60000).toISOString()
  }
];

// Helper to normalize roomId and callback
export function subscribeToLiveStream(
  arg1: string | ((stream: LiveStreamSession) => void),
  arg2?: (stream: LiveStreamSession) => void
): () => void {
  const roomId = typeof arg1 === 'string' ? arg1 : 'current';
  const callback = typeof arg1 === 'function' ? arg1 : arg2!;

  try {
    const docRef = doc(db, 'live_sessions', roomId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<LiveStreamSession>;
        callback({
          ...defaultLiveSession,
          ...data,
          id: docSnap.id,
          roomCode: data.roomCode || roomId
        });
      } else {
        callback({
          ...defaultLiveSession,
          id: roomId,
          roomCode: roomId
        });
      }
    }, (error) => {
      console.warn("Firestore live stream subscription notice:", error);
      callback({
        ...defaultLiveSession,
        id: roomId,
        roomCode: roomId
      });
    });
    return unsubscribe;
  } catch (error) {
    console.warn("Failed to subscribe to live stream:", error);
    callback(defaultLiveSession);
    return () => {};
  }
}

// Update live stream session in Firestore
export async function updateLiveSession(
  arg1: string | Partial<LiveStreamSession>,
  arg2?: Partial<LiveStreamSession>
): Promise<void> {
  const roomId = typeof arg1 === 'string' ? arg1 : 'current';
  const data = typeof arg1 === 'object' ? arg1 : arg2!;

  try {
    const docRef = doc(db, 'live_sessions', roomId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn("Firestore updateLiveSession notice:", error);
  }
}

// Real-time listener for live chat messages
export function subscribeToLiveChat(
  arg1: string | ((messages: LiveChatMessage[]) => void),
  arg2?: (messages: LiveChatMessage[]) => void
): () => void {
  const roomId = typeof arg1 === 'string' ? arg1 : 'current';
  const callback = typeof arg1 === 'function' ? arg1 : arg2!;

  try {
    const chatCol = collection(db, 'live_sessions', roomId, 'chat');
    const q = query(chatCol, orderBy('createdAt', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const msgs: LiveChatMessage[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as LiveChatMessage));
        callback(msgs);
      } else {
        callback(defaultLiveChatMessages);
      }
    }, (error) => {
      console.warn("Firestore live chat subscription notice:", error);
      callback(defaultLiveChatMessages);
    });
    return unsubscribe;
  } catch (error) {
    console.warn("Failed to subscribe to live chat:", error);
    callback(defaultLiveChatMessages);
    return () => {};
  }
}

// Send live chat message to Firestore
export async function sendLiveChatMessage(
  arg1: string | Omit<LiveChatMessage, 'id'>,
  arg2?: Omit<LiveChatMessage, 'id'>
): Promise<string> {
  const roomId = typeof arg1 === 'string' ? arg1 : 'current';
  const msg = typeof arg1 === 'object' ? arg1 : arg2!;

  try {
    const chatCol = collection(db, 'live_sessions', roomId, 'chat');
    const docRef = await addDoc(chatCol, {
      ...msg,
      createdAt: msg.createdAt || new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.warn("Firestore sendLiveChatMessage fallback:", error);
    return `local_${Date.now()}`;
  }
}
