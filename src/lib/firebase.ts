import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- Added Storage import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzUipopHKH65hPw6GEFB4fJXug6zpkM3A",
  authDomain: "surveysync-972c1.firebaseapp.com",
  projectId: "surveysync-972c1",
  storageBucket: "surveysync-972c1.firebasestorage.app",
  messagingSenderId: "1045530050984",
  appId: "1:1045530050984:web:deab0d51727dbcb3ab9d9d",
  measurementId: "G-YBFVDR30LN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
setLogLevel("error");

// Export the services you want to use
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const storage = getStorage(app);
