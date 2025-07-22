// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWoplG8Wk8JMRIYEHCjPoqcTRlzVIZAZE",
  authDomain: "mealmap-540a2.firebaseapp.com",
  projectId: "mealmap-540a2",
  storageBucket: "mealmap-540a2.appspot.com",
  messagingSenderId: "537782288029",
  appId: "1:537782288029:web:c13a6d09970fe8b45b1e74",
  measurementId: "G-8GRYMPKTS2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
