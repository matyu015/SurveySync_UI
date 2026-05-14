import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyDErZDJyft_Ro5qhSGTM7UggAlgVTc51rg",
  authDomain: "surveysync-live.firebaseapp.com",
  projectId: "surveysync-live",
  storageBucket: "surveysync-live.firebasestorage.app",
  messagingSenderId: "465197588737",
  appId: "1:465197588737:web:b9e671b45cfa9d0f93bb00"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);

// Force standard HTTP requests to completely bypass strict network firewalls
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});