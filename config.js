// Firebase configuration - Use environment variables in production
const getEnvVar = (key, fallback = null) => {
  // In production, use proper environment variables
  // For development, fallback to hardcoded values (should be moved to .env)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  
  // Vite environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  
  return fallback;
};

export const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', "AIzaSyAWoplG8Wk8JMRIYEHCjPoqcTRlzVIZAZE"),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', "mealmap-540a2.firebaseapp.com"),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', "mealmap-540a2"),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', "mealmap-540a2.firebasestorage.app"),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', "537782288029"),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', "1:537782288029:web:c13a6d09970fe8b45b1e74"),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', "G-8GRYMPKTS2")
};

// Vertex AI configuration
export const vertexAIConfig = {
  projectId: getEnvVar('VITE_VERTEX_AI_PROJECT_ID', "mealmap-540a2"),
  location: getEnvVar('VITE_VERTEX_AI_LOCATION', "us-central1"),
  model: getEnvVar('VITE_VERTEX_AI_MODEL', "gemini-1.5-flash")
};