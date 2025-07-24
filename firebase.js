// Initialize Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWoplG8Wk8JMRIYEHCjPoqcTRlzVIZAZE",
  authDomain: "mealmap-540a2.firebaseapp.com",
  projectId: "mealmap-540a2",
  storageBucket: "mealmap-540a2.firebasestorage.app",
  messagingSenderId: "537782288029",
  appId: "1:537782288029:web:c13a6d09970fe8b45b1e74",
  measurementId: "G-8GRYMPKTS2"
};
firebase.initializeApp(firebaseConfig);

window.auth = firebase.auth();
window.db = firebase.firestore();