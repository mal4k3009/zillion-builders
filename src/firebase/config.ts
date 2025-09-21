// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

export default app;
