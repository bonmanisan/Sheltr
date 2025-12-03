// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "sheltr-91b0e.firebaseapp.com",
  projectId: "sheltr-91b0e",
  storageBucket: "sheltr-91b0e.firebasestorage.app",
  messagingSenderId: "579755377951",
  appId: "1:579755377951:web:c1185fafd29ed1c02e1c2a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)
export const storage=getStorage(app)