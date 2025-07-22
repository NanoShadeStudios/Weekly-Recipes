import { auth } from './firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

export function setupAuth(onUserChanged) {
  const signInForm = document.getElementById('signInForm');
  const signOutBtn = document.getElementById('signOutBtn');
  const userEmail = document.getElementById('userEmail');

  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = signInForm.email.value;
    const password = signInForm.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert('Sign in failed: ' + err.message);
    }
  });

  signOutBtn.addEventListener('click', async () => {
    await signOut(auth);
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.textContent = user.email;
      signInForm.style.display = 'none';
      signOutBtn.style.display = 'inline-block';
      userEmail.style.display = 'inline-block';
    } else {
      userEmail.textContent = '';
      signInForm.style.display = 'block';
      signOutBtn.style.display = 'none';
      userEmail.style.display = 'none';
    }
    onUserChanged(user);
  });
}
