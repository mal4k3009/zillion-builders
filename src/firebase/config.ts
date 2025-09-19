// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-SGV0tECuGP0I1axJ8szcITtDzKahAQs",
  authDomain: "zillion-builders-group.firebaseapp.com",
  projectId: "zillion-builders-group",
  storageBucket: "zillion-builders-group.firebasestorage.app",
  messagingSenderId: "981489360202",
  appId: "1:981489360202:web:43789b6525deaf4d1ab5b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set authentication persistence to local (persists until explicit logout)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export default app;
