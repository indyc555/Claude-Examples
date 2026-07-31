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
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
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

export async function loadRemoteWorkouts() {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'ironlog', 'workouts'))
    return snap.exists() ? snap.data().list || [] : []
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
