function savePreferences() {
  const preferences = {
    vegetarian: document.getElementById('vegetarianPref').checked,
    easyMeals: document.getElementById('easyMealsPref').checked
  };

  if (window.auth && window.auth.currentUser) {
    const user = window.auth.currentUser;
    const userDocRef = window.db.collection('users').doc(user.uid);
    userDocRef.update({ preferences });
  }

  // Show save confirmation
  const saveMsg = document.createElement('div');
  saveMsg.className = 'save-message';
  saveMsg.textContent = 'Preferences saved!';
  document.body.appendChild(saveMsg);
  setTimeout(() => saveMsg.remove(), 2000);
}

window.savePreferences = savePreferences; 