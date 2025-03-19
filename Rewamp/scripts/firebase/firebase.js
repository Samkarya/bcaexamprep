// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH5mDzI1ASaWjM9R8b4cXWSbOQHR5iSmI",
    authDomain: "bcaexamprep.firebaseapp.com",
    projectId: "bcaexamprep",
    storageBucket: "bcaexamprep.firebasestorage.app",
    messagingSenderId: "332685820521",
    appId: "1:332685820521:web:7e92dba0457f73e27058f8",
    measurementId: "G-EFTNK4374V"
  };

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export initialized services
export { app, auth, db, analytics };