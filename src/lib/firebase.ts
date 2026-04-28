import { initializeApp } from "firebase/app";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3E-CRhF973pIiJ3dIx7RFBeGHRHET67I",
  authDomain: "ppg-samarinda.firebaseapp.com",
  projectId: "ppg-samarinda",
  storageBucket: "ppg-samarinda.appspot.com",
  messagingSenderId: "935384769767",
  appId: "1:935384769767:web:056c746c3dc19223742e42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Use memory-only cache so all writes (including deletes) require server confirmation
// This prevents phantom deletes where data appears deleted locally but still exists in Firebase
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});
const auth = getAuth(app);

// Analytics disabled to prevent blocking by ad blockers
// Uncomment if needed and accept that it may be blocked
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);

export { db, auth };