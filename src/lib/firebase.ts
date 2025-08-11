import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3E-CRhF973pIiJ3dIx7RFBeGHRHET67I",
  authDomain: "ppg-samarinda.firebaseapp.com",
  projectId: "ppg-samarinda",
  storageBucket: "ppg-samarinda.appspot.com",
  messagingSenderId: "935384769767",
  appId: "1:935384769767:web:056c746c3dc19223742e42",
  measurementId: "G-W1V594C6EN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };