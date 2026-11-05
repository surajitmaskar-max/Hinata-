import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { JarvisLanguage } from '../types/jarvis';

export interface UserProfileData {
  displayName: string;
  email: string;
  photoURL?: string;
  preferredLanguage: JarvisLanguage;
  preferredVoice?: string;
  createdAt: string;
}

export interface ChatSessionData {
  id: string;
  title?: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    language?: JarvisLanguage;
    functionCalls?: any[];
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface PersonalMemoryData {
  id: string;
  approvedMemory: string;
  category?: string;
  createdAt: string;
}

export interface UserTaskData {
  id: string;
  taskName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  createdAt: string;
}

export interface UserAutomationData {
  id: string;
  automationName: string;
  configuration?: string;
  enabled: boolean;
  createdAt?: string;
}

// 1. User Profile Management (/users/{uid})
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function setUserProfile(uid: string, data: UserProfileData): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 2. Chat Sessions Management (/users/{uid}/chats/{chatId})
export function subscribeToUserChats(
  uid: string,
  onUpdate: (chats: ChatSessionData[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${uid}/chats`;
  return onSnapshot(
    collection(db, 'users', uid, 'chats'),
    (snapshot) => {
      const chats: ChatSessionData[] = [];
      snapshot.forEach((docSnap) => {
        chats.push({ id: docSnap.id, ...(docSnap.data() as Omit<ChatSessionData, 'id'>) });
      });
      chats.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
      onUpdate(chats);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveUserChatSession(uid: string, chatId: string, chat: Omit<ChatSessionData, 'id'>): Promise<void> {
  const path = `users/${uid}/chats/${chatId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'chats', chatId), chat, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserChatSession(uid: string, chatId: string): Promise<void> {
  const path = `users/${uid}/chats/${chatId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'chats', chatId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Personal Memory Management (/users/{uid}/memory/{memoryId})
export function subscribeToUserMemories(
  uid: string,
  onUpdate: (memories: PersonalMemoryData[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${uid}/memory`;
  return onSnapshot(
    collection(db, 'users', uid, 'memory'),
    (snapshot) => {
      const list: PersonalMemoryData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<PersonalMemoryData, 'id'>) });
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveUserMemory(
  uid: string,
  memoryId: string,
  memory: Omit<PersonalMemoryData, 'id'>
): Promise<void> {
  const path = `users/${uid}/memory/${memoryId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'memory', memoryId), memory);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserMemory(
  uid: string,
  memoryId: string,
  updates: Partial<Omit<PersonalMemoryData, 'id'>>
): Promise<void> {
  const path = `users/${uid}/memory/${memoryId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'memory', memoryId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserMemory(uid: string, memoryId: string): Promise<void> {
  const path = `users/${uid}/memory/${memoryId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'memory', memoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Tasks Management (/users/{uid}/tasks/{taskId})
export function subscribeToUserTasks(
  uid: string,
  onUpdate: (tasks: UserTaskData[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${uid}/tasks`;
  return onSnapshot(
    collection(db, 'users', uid, 'tasks'),
    (snapshot) => {
      const list: UserTaskData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<UserTaskData, 'id'>) });
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveUserTask(uid: string, taskId: string, task: Omit<UserTaskData, 'id'>): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'tasks', taskId), task);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 5. Automations Management (/users/{uid}/automations/{automationId})
export function subscribeToUserAutomations(
  uid: string,
  onUpdate: (automations: UserAutomationData[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${uid}/automations`;
  return onSnapshot(
    collection(db, 'users', uid, 'automations'),
    (snapshot) => {
      const list: UserAutomationData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<UserAutomationData, 'id'>) });
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveUserAutomation(
  uid: string,
  automationId: string,
  automation: Omit<UserAutomationData, 'id'>
): Promise<void> {
  const path = `users/${uid}/automations/${automationId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'automations', automationId), automation, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Complete Data Deletion for user
export async function deleteAllUserData(uid: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete chats
    const chatsSnap = await getDocs(collection(db, 'users', uid, 'chats'));
    chatsSnap.forEach((d) => batch.delete(d.ref));

    // Delete memory
    const memSnap = await getDocs(collection(db, 'users', uid, 'memory'));
    memSnap.forEach((d) => batch.delete(d.ref));

    // Delete tasks
    const tasksSnap = await getDocs(collection(db, 'users', uid, 'tasks'));
    tasksSnap.forEach((d) => batch.delete(d.ref));

    // Delete automations
    const autoSnap = await getDocs(collection(db, 'users', uid, 'automations'));
    autoSnap.forEach((d) => batch.delete(d.ref));

    // Delete user profile doc
    batch.delete(doc(db, 'users', uid));

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
  }
}

// 7. Security Isolation Test Helper
// Directly attempts to read or write to a target UID that is DIFFERENT from current user
// Verifies that Firestore Security Rules block cross-user snooping!
export async function testCrossUserIsolation(
  foreignUid: string
): Promise<{ readBlocked: boolean; writeBlocked: boolean; details: string }> {
  let readBlocked = false;
  let writeBlocked = false;
  let details = '';

  // Attempt Read on foreign user's memory
  try {
    await getDoc(doc(db, 'users', foreignUid, 'memory', 'secret_test_memory'));
    readBlocked = false;
    details += 'WARNING: Read was not blocked. ';
  } catch (error: any) {
    readBlocked = true;
    details += `Read blocked by security rules: ${error.code || error.message}. `;
  }

  // Attempt Write on foreign user's memory
  try {
    await setDoc(doc(db, 'users', foreignUid, 'memory', 'malicious_write_test'), {
      approvedMemory: 'Hacked memory attempt',
      createdAt: new Date().toISOString(),
    });
    writeBlocked = false;
    details += 'WARNING: Cross-user write was not blocked! ';
  } catch (error: any) {
    writeBlocked = true;
    details += `Write blocked by security rules: ${error.code || error.message}. `;
  }

  return { readBlocked, writeBlocked, details };
}
