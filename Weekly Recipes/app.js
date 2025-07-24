function savePreferences() {
  const preferences = {
    vegetarian: document.getElementById('vegetarianPref').checked,
    easyMeals: document.getElementById('easyMealsPref').checked
  };
  
  if (currentUser) {
    updateDoc(doc(db, 'users', currentUser.uid), {
      preferences: preferences
    });
  }
  
  // Show save confirmation
  const saveMsg = document.createElement('div');
  saveMsg.className = 'save-message';
  saveMsg.textContent = 'Preferences saved!';
  document.body.appendChild(saveMsg);
  setTimeout(() => saveMsg.remove(), 2000);
}

function loadPreferences(userData) {
  const preferences = userData.preferences || {};
  document.getElementById('vegetarianPref').checked = preferences.vegetarian || false;
  document.getElementById('easyMealsPref').checked = preferences.easyMeals || false;
}
