import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  deleteUser
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

import { auth, db } from 'https://samkarya.github.io/bcaexamprep/Rewamp/scripts/firebase.js';

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (username, email, password) => {
  try {
    // 1. First check if the username is already taken before creating the user
    const usernameDocRef = doc(db, 'usernames', username);
    
    const usernameSnapshot = await getDoc(usernameDocRef);
    
    if (usernameSnapshot.exists()) {
      return { success: false, error: 'Username already taken. Please try a different one.' };
    }
    
    // 2. Create user auth account only after username check passes
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    try {
      // 3. Create Firestore records within a try block to handle any DB errors
      // Save username to usernames collection
      await setDoc(usernameDocRef, {
        uid: user.uid
      });

      // Save user profile data
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      // Save initial user progress
      await setDoc(doc(db, 'userProgress', user.uid), {
        completedResources: [],
        quizScores: {},
        lastActivity: serverTimestamp()
      });

      return { success: true, user };
    } catch (dbError) {
      await deleteUser(user);
      return { success: false, error: 'Error creating user profile. Please try again.' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore data functions
export const updateUserLastLogin = async (userId) => {
  try {
    // First get the current user data to preserve all fields
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User document not found' };
    }
    
    const userData = userDoc.data();
    
    // Update only the lastLogin field while preserving all other fields
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      lastLogin: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProgress = async (userId, progressData) => {
  try {
    await setDoc(doc(db, 'userProgress', userId), {
      ...progressData,
      lastActivity: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProgress = async (userId) => {
  try {
    const progressDoc = await getDoc(doc(db, 'userProgress', userId));
    if (progressDoc.exists()) {
      return { success: true, data: progressDoc.data() };
    } else {
      return { success: false, error: 'User progress not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};