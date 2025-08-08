// Firebase mocks for testing
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    // Simulate auth state change
    setTimeout(() => callback(mockAuth.currentUser), 0);
    return jest.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(() => 
    Promise.resolve({
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      }
    })
  ),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      }
    })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve())
};

export const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: true,
        data: () => ({ test: 'data' }),
        id: 'test-doc-id'
      })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      onSnapshot: jest.fn((callback) => {
        callback({
          exists: true,
          data: () => ({ test: 'data' }),
          id: 'test-doc-id'
        });
        return jest.fn(); // unsubscribe function
      })
    })),
    add: jest.fn(() => Promise.resolve({
      id: 'test-doc-id'
    })),
    where: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        docs: [
          {
            id: 'test-doc-1',
            data: () => ({ test: 'data1' })
          },
          {
            id: 'test-doc-2', 
            data: () => ({ test: 'data2' })
          }
        ]
      }))
    })),
    orderBy: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        docs: []
      }))
    })),
    limit: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        docs: []
      }))
    }))
  }))
};

export const mockApp = {
  name: 'test-app',
  options: {
    projectId: 'test-project'
  }
};

// Default exports
export const getAuth = jest.fn(() => mockAuth);
export const getFirestore = jest.fn(() => mockFirestore);
export const initializeApp = jest.fn(() => mockApp);

// Auth functions
export const signInWithEmailAndPassword = jest.fn(() => mockAuth.signInWithEmailAndPassword());
export const createUserWithEmailAndPassword = jest.fn(() => mockAuth.createUserWithEmailAndPassword());
export const signOut = jest.fn(() => mockAuth.signOut());
export const onAuthStateChanged = jest.fn(() => mockAuth.onAuthStateChanged());
export const updateProfile = jest.fn(() => mockAuth.updateProfile());

// Firestore functions
export const doc = jest.fn(() => mockFirestore.collection().doc());
export const collection = jest.fn(() => mockFirestore.collection());
export const getDoc = jest.fn(() => Promise.resolve({
  exists: () => true,
  data: () => ({ test: 'data' })
}));
export const setDoc = jest.fn(() => Promise.resolve());
export const updateDoc = jest.fn(() => Promise.resolve());
export const deleteDoc = jest.fn(() => Promise.resolve());
export const addDoc = jest.fn(() => Promise.resolve({ id: 'test-doc-id' }));
export const getDocs = jest.fn(() => Promise.resolve({
  docs: [
    {
      id: 'test-doc-1',
      data: () => ({ test: 'data1' })
    }
  ]
}));
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
export const onSnapshot = jest.fn();
