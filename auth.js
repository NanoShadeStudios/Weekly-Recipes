// Authentication module with proper error handling
import { getFirebaseInstance } from './firebase.js';

// Dynamic imports to handle potential loading issues
let authFunctions = null;

async function loadAuthFunctions() {
  if (!authFunctions) {
    try {
      authFunctions = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      console.log('Firebase Auth functions loaded successfully');
    } catch (error) {
      console.error('Failed to load Firebase Auth functions:', error);
      throw new Error('Firebase Authentication is not available');
    }
  }
  return authFunctions;
}

class AuthManager {
  constructor() {
    this.auth = null;
    this.currentUser = null;
    this.authStateListeners = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Load auth functions dynamically
      await loadAuthFunctions();
      
      const { auth } = await getFirebaseInstance();
      this.auth = auth;
      this.setupAuthStateListener();
      this.isInitialized = true;
      console.log('Auth manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize auth manager:', error);
      throw error;
    }
  }

  setupAuthStateListener() {
    if (!this.auth || !authFunctions) return;

    const { onAuthStateChanged } = authFunctions;
    
    console.log('Setting up Firebase auth state listener');
    
    onAuthStateChanged(this.auth, (user) => {
      console.log('Firebase auth state changed:', user ? user.email : 'null');
      
      this.currentUser = user;
      console.log(user ? `User signed in: ${user.email}` : 'User signed out');
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(user);
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      });

      // Update UI
      this.updateAuthUI(user);
    });
    
    // Also check for existing auth state immediately
    const existingUser = this.auth.currentUser;
    if (existingUser) {
      console.log('Found existing authenticated user:', existingUser.email);
      this.currentUser = existingUser;
      // Notify listeners of existing auth state
      this.authStateListeners.forEach(listener => {
        try {
          listener(existingUser);
        } catch (error) {
          console.error('Error in auth state listener for existing user:', error);
        }
      });
      this.updateAuthUI(existingUser);
    }
  }

  updateAuthUI(user) {
    const userEmailElement = document.getElementById('userEmail');
    const signOutBtn = document.getElementById('signOutBtn');
    const loginModal = document.getElementById('loginModal');

    if (user) {
      if (userEmailElement) userEmailElement.textContent = user.email;
      if (signOutBtn) signOutBtn.style.display = 'block';
      if (loginModal) loginModal.style.display = 'none';
    } else {
      if (userEmailElement) userEmailElement.textContent = '';
      if (signOutBtn) signOutBtn.style.display = 'none';
      if (loginModal) loginModal.style.display = 'block';
    }
  }

  async signIn(email, password) {
    if (!this.auth) throw new Error('Auth not initialized');
    
    try {
      const authFns = await loadAuthFunctions();
      const { signInWithEmailAndPassword } = authFns;
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw this.getReadableError(error);
    }
  }

  async signUp(email, password) {
    if (!this.auth) throw new Error('Auth not initialized');
    
    try {
      const authFns = await loadAuthFunctions();
      const { createUserWithEmailAndPassword } = authFns;
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw this.getReadableError(error);
    }
  }

  async signOut() {
    if (!this.auth) throw new Error('Auth not initialized');
    
    try {
      const authFns = await loadAuthFunctions();
      const { signOut } = authFns;
      await signOut(this.auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw this.getReadableError(error);
    }
  }

  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    
    // If already has current user, call immediately
    if (this.currentUser !== null) {
      callback(this.currentUser);
    }

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  getReadableError(error) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    };

    return new Error(errorMessages[error.code] || error.message);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Legacy function for backward compatibility
function setupAuth(callback) {
  authManager.initialize().then(() => {
    if (callback && typeof callback === 'function') {
      callback();
    }
  }).catch(error => {
    console.error('Auth setup failed:', error);
    if (callback && typeof callback === 'function') {
      callback(error);
    }
  });
}

// Export both the manager and legacy function
export { authManager, setupAuth };
export default authManager;