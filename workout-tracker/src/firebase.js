import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

// Suggested Firestore rules (set in Firebase console):
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read, write: if true;
//     }
//   }
// }
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD0htBJPB0avTwHRuLt56JX4xbjBmqI37o',
  authDomain: 'personal-apps-19a32.firebaseapp.com',
  projectId: 'personal-apps-19a32',
  storageBucket: 'personal-apps-19a32.firebasestorage.app',
  messagingSenderId: '187610351019',
  appId: '1:187610351019:web:1e22ba5f13b50cf324beee',
}

export const isFirebaseConfigured = () => !FIREBASE_CONFIG.apiKey.includes('REPLACE')

let db = null
if (isFirebaseConfigured()) {
  try {
    const app = initializeApp(FIREBASE_CONFIG)
    db = getFirestore(app)
  } catch (e) {
    console.error('Firebase init failed, falling back to localStorage:', e)
  }
}

// Returns null if the shared doc doesn't exist yet (or on error) — callers
// must treat that as "unknown", not "empty", so they don't overwrite it.
export async function loadRemoteWorkouts() {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'ironlog', 'workouts'))
    return snap.exists() ? snap.data().list || [] : null
  } catch (e) {
    console.error('Firestore load failed, falling back to localStorage:', e)
    return null
  }
}

export async function saveRemoteWorkouts(list) {
  if (!db) return
  try {
    await setDoc(doc(db, 'ironlog', 'workouts'), { list })
  } catch (e) {
    console.error('Firestore write error:', e)
  }
}
