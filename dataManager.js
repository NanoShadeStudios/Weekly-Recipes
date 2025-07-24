// Use global db and auth from window

// Load user data from Firestore
function loadUserData() {
  // Get current user
  const user = auth.currentUser;

  if (user) {
    const userDocRef = db.collection('users').doc(user.uid);

    userDocRef.get()
      .then((docSnap) => {
        if (docSnap.exists) {
          // Process user data
          console.log('User data loaded successfully');
        } else {
          // Create new user document
          userDocRef.set({
            meals: {},
            preferences: {},
            createdAt: new Date()
          });
        }
      })
      .catch((error) => {
        console.error('Error loading user data:', error);
      });
  }
}

// Save weekly meal plan
function saveWeeklyPlan(weekStartDate, meals) {
  // Get current user
  const user = auth.currentUser;

  if (user) {
    const userDocRef = db.collection('users').doc(user.uid);

    const update = {};
    update[`meals.${weekStartDate}`] = meals;
    userDocRef.update(update);
  }
}

window.loadUserData = loadUserData;
window.saveWeeklyPlan = saveWeeklyPlan;