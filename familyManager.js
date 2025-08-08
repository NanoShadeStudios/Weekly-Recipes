/**
 * Family Management System
 * Handles multi-user profiles, family creation, and member management
 */

import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs,
    addDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { getFirebaseInstance } from './firebase.js';

class FamilyManager {
    constructor() {
        this.currentFamily = null;
        this.currentUser = null;
        this.familyMembers = [];
        this.sharedPreferences = {};
        this.isInitialized = false;
        this.listeners = [];
        
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for auth and Firebase to be ready
            if (window.authManager) {
                // Verify Firebase is initialized
                try {
                    const firebaseInstance = await getFirebaseInstance();
                    if (!firebaseInstance || !firebaseInstance.db) {
                        console.log('Firebase not ready, retrying...');
                        setTimeout(() => this.initialize(), 1000);
                        return;
                    }
                } catch (error) {
                    console.log('Firebase not ready, retrying...', error.message);
                    setTimeout(() => this.initialize(), 1000);
                    return;
                }
                
                await this.setupAuthListener();
            } else {
                setTimeout(() => this.initialize(), 1000);
                return;
            }
            
            this.isInitialized = true;
            console.log('Family Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Family Manager:', error);
        }
    }

    async setupAuthListener() {
        window.authManager.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserFamilyData();
            } else {
                this.currentUser = null;
                this.currentFamily = null;
                this.familyMembers = [];
            }
            this.notifyListeners();
        });
    }

    async loadUserFamilyData() {
        try {
            const userDoc = await this.getUserDocument();
            
            if (userDoc.familyId) {
                // User is part of a family
                await this.loadFamily(userDoc.familyId);
            } else {
                // User has no family, check if they should create one
                this.currentFamily = null;
                this.familyMembers = [this.createUserProfile(this.currentUser, userDoc)];
            }
        } catch (error) {
            console.error('Failed to load family data:', error);
        }
    }

    async getUserDocument() {
        try {
            const firebaseInstance = await getFirebaseInstance();
            if (!firebaseInstance || !firebaseInstance.db) {
                throw new Error('Firebase not properly initialized');
            }
            const { db } = firebaseInstance;
            
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                return userDocSnap.data();
            } else {
                // Create default user document
                return await this.createUserDocument();
            }
        } catch (error) {
            console.error('Error in getUserDocument:', error);
            throw error;
        }
    }

    async createUserDocument() {
        try {
            const firebaseInstance = await getFirebaseInstance();
            if (!firebaseInstance || !firebaseInstance.db) {
                throw new Error('Firebase not properly initialized');
            }
            const { db } = firebaseInstance;
            
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            const userData = {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                displayName: this.currentUser.displayName || 'Family Member',
                createdAt: new Date(),
                familyId: null,
                role: 'member',
                preferences: this.getDefaultPreferences(),
                profile: this.getDefaultProfile()
            };
            
            await setDoc(userDocRef, userData);
            return userData;
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    }

    createUserProfile(user, userData = {}) {
        return {
            uid: user.uid,
            email: user.email,
            displayName: userData.displayName || user.displayName || 'Family Member',
            role: userData.role || 'member',
            preferences: userData.preferences || this.getDefaultPreferences(),
            profile: userData.profile || this.getDefaultProfile(),
            isActive: true,
            lastActive: new Date(),
            avatar: userData.avatar || this.generateDefaultAvatar(userData.displayName)
        };
    }

    getDefaultPreferences() {
        return {
            dietaryRestrictions: [],
            allergens: [],
            favoriteIngredients: [],
            dislikedIngredients: [],
            spiceLevel: 'medium',
            cookingTime: 'flexible',
            cuisinePreferences: [],
            mealTypePreferences: {
                breakfast: true,
                lunch: true,
                dinner: true,
                snacks: true
            },
            nutritionGoals: {
                calories: null,
                protein: null,
                carbs: null,
                fat: null
            },
            cookingSkillLevel: 'intermediate'
        };
    }

    getDefaultProfile() {
        return {
            age: null,
            activityLevel: 'moderate',
            weight: null,
            height: null,
            gender: null,
            healthConditions: [],
            fitnessGoals: [],
            bio: ''
        };
    }

    generateDefaultAvatar(name) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const initials = (name || 'FM').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const color = colors[name ? name.length % colors.length : 0];
        
        return {
            type: 'initials',
            initials,
            backgroundColor: color,
            textColor: '#FFFFFF'
        };
    }

    // Family Creation and Management
    async createFamily(familyData) {
        try {
            const firebaseInstance = await getFirebaseInstance();
            if (!firebaseInstance || !firebaseInstance.db) {
                throw new Error('Firebase not properly initialized');
            }
            const { db } = firebaseInstance;
            
            // Create family document
            const familyRef = await addDoc(collection(db, 'families'), {
                name: familyData.name,
                description: familyData.description || '',
                createdBy: this.currentUser.uid,
                createdAt: new Date(),
                memberIds: [this.currentUser.uid],
                settings: {
                    allowMemberInvites: familyData.allowMemberInvites !== false,
                    sharedShopping: familyData.sharedShopping !== false,
                    sharedMealPlanning: familyData.sharedMealPlanning !== false,
                    privatePreferences: familyData.privatePreferences === true
                },
                sharedPreferences: this.getDefaultSharedPreferences(),
                inviteCode: this.generateInviteCode()
            });

            // Update user document with family ID
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, {
                familyId: familyRef.id,
                role: 'admin'
            });

            // Load the new family
            await this.loadFamily(familyRef.id);
            
            return this.currentFamily;
        } catch (error) {
            console.error('Failed to create family:', error);
            throw new Error('Failed to create family. Please try again.');
        }
    }

    async loadFamily(familyId) {
        try {
            const { db } = await getFirebaseInstance();
            
            // Load family document
            const familyDocRef = doc(db, 'families', familyId);
            const familyDocSnap = await getDoc(familyDocRef);
            
            if (!familyDocSnap.exists()) {
                throw new Error('Family not found');
            }
            
            this.currentFamily = {
                id: familyId,
                ...familyDocSnap.data()
            };

            // Load family members
            const membersQuery = query(
                collection(db, 'users'),
                where('familyId', '==', familyId)
            );
            
            const membersSnapshot = await getDocs(membersQuery);
            this.familyMembers = [];
            
            membersSnapshot.forEach((memberDoc) => {
                this.familyMembers.push({
                    uid: memberDoc.id,
                    ...memberDoc.data()
                });
            });

            // Sort members (admin first, then by name)
            this.familyMembers.sort((a, b) => {
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (b.role === 'admin' && a.role !== 'admin') return 1;
                return (a.displayName || '').localeCompare(b.displayName || '');
            });

            this.sharedPreferences = this.currentFamily.sharedPreferences || this.getDefaultSharedPreferences();
            
        } catch (error) {
            console.error('Failed to load family:', error);
            throw error;
        }
    }

    getDefaultSharedPreferences() {
        return {
            householdSize: 2,
            budgetRange: 'medium',
            commonAllergens: [],
            sharedDietaryRestrictions: [],
            mealPlanningStyle: 'collaborative', // collaborative, rotation, admin-only
            groceryBudget: null,
            preferredStores: [],
            mealSchedule: {
                breakfast: '8:00',
                lunch: '12:00',
                dinner: '18:00'
            },
            cookingRotation: [], // Array of member UIDs
            specialDays: [] // Birthdays, anniversaries, etc.
        };
    }

    generateInviteCode() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    // Member Management
    async inviteMember(email, role = 'member') {
        try {
            if (!this.currentFamily) {
                throw new Error('No family selected');
            }

            if (!this.canInviteMembers()) {
                throw new Error('You do not have permission to invite members');
            }

            const { db } = await getFirebaseInstance();
            
            // Create invitation
            const inviteRef = await addDoc(collection(db, 'familyInvitations'), {
                familyId: this.currentFamily.id,
                familyName: this.currentFamily.name,
                invitedEmail: email,
                invitedBy: this.currentUser.uid,
                invitedByName: this.getCurrentMember().displayName,
                role: role,
                status: 'pending',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                inviteCode: this.currentFamily.inviteCode
            });

            // TODO: Send email invitation
            await this.sendInvitationEmail(email, inviteRef.id);

            return inviteRef.id;
        } catch (error) {
            console.error('Failed to invite member:', error);
            throw error;
        }
    }

    async joinFamilyByCode(inviteCode) {
        try {
            const { db } = await getFirebaseInstance();
            
            // Find family by invite code
            const familiesQuery = query(
                collection(db, 'families'),
                where('inviteCode', '==', inviteCode.toUpperCase())
            );
            
            const familiesSnapshot = await getDocs(familiesQuery);
            
            if (familiesSnapshot.empty) {
                throw new Error('Invalid invite code');
            }

            const familyDoc = familiesSnapshot.docs[0];
            const familyData = familyDoc.data();

            // Check if user is already a member
            if (familyData.memberIds && familyData.memberIds.includes(this.currentUser.uid)) {
                throw new Error('You are already a member of this family');
            }

            // Add user to family
            const updatedMemberIds = [...(familyData.memberIds || []), this.currentUser.uid];
            await updateDoc(familyDoc.ref, {
                memberIds: updatedMemberIds
            });

            // Update user document
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, {
                familyId: familyDoc.id,
                role: 'member'
            });

            // Load the family
            await this.loadFamily(familyDoc.id);

            return this.currentFamily;
        } catch (error) {
            console.error('Failed to join family:', error);
            throw error;
        }
    }

    async leaveFamily() {
        try {
            if (!this.currentFamily) {
                throw new Error('No family to leave');
            }

            const { db } = await getFirebaseInstance();
            
            const currentMember = this.getCurrentMember();
            
            // If user is admin and there are other members, transfer admin or require confirmation
            if (currentMember.role === 'admin' && this.familyMembers.length > 1) {
                throw new Error('As the family admin, you must either transfer admin rights to another member or delete the family entirely');
            }

            // Remove user from family member list
            const familyDocRef = doc(db, 'families', this.currentFamily.id);
            await updateDoc(familyDocRef, {
                memberIds: arrayRemove(this.currentUser.uid)
            });

            // Update user document
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, {
                familyId: null,
                role: 'member'
            });

            // If this was the last member, delete the family
            if (this.familyMembers.length === 1) {
                await deleteDoc(familyDocRef);
            }

            // Reset local state
            this.currentFamily = null;
            this.familyMembers = [this.createUserProfile(this.currentUser)];
            
            this.notifyListeners();
        } catch (error) {
            console.error('Failed to leave family:', error);
            throw error;
        }
    }

    async removeMember(memberUid) {
        try {
            if (!this.canManageMembers()) {
                throw new Error('You do not have permission to remove members');
            }

            if (memberUid === this.currentUser.uid) {
                throw new Error('Use leaveFamily() to remove yourself');
            }

            const { db } = await getFirebaseInstance();
            
            // Remove from family
            const familyDocRef = doc(db, 'families', this.currentFamily.id);
            await updateDoc(familyDocRef, {
                memberIds: arrayRemove(memberUid)
            });

            // Update member's user document
            const userDocRef = doc(db, 'users', memberUid);
            await updateDoc(userDocRef, {
                familyId: null,
                role: 'member'
            });

            // Reload family data
            await this.loadFamily(this.currentFamily.id);
            
        } catch (error) {
            console.error('Failed to remove member:', error);
            throw error;
        }
    }

    async updateMemberRole(memberUid, newRole) {
        try {
            if (!this.canManageMembers()) {
                throw new Error('You do not have permission to change member roles');
            }

            const { db } = await getFirebaseInstance();
            
            const userDocRef = doc(db, 'users', memberUid);
            await updateDoc(userDocRef, {
                role: newRole
            });

            // Reload family data
            await this.loadFamily(this.currentFamily.id);
            
        } catch (error) {
            console.error('Failed to update member role:', error);
            throw error;
        }
    }

    // Preferences Management
    async updateMemberPreferences(memberUid, preferences) {
        try {
            // Users can update their own preferences, admins can update any
            if (memberUid !== this.currentUser.uid && !this.isAdmin()) {
                throw new Error('You can only update your own preferences');
            }

            const { db } = await getFirebaseInstance();
            
            const userDocRef = doc(db, 'users', memberUid);
            await updateDoc(userDocRef, {
                preferences: preferences,
                lastUpdated: new Date()
            });

            // Update local data
            const memberIndex = this.familyMembers.findIndex(m => m.uid === memberUid);
            if (memberIndex !== -1) {
                this.familyMembers[memberIndex].preferences = preferences;
                this.notifyListeners();
            }
            
        } catch (error) {
            console.error('Failed to update member preferences:', error);
            throw error;
        }
    }

    async updateSharedPreferences(sharedPreferences) {
        try {
            if (!this.canManageFamily()) {
                throw new Error('You do not have permission to update shared preferences');
            }

            const { db } = await getFirebaseInstance();
            
            const familyDocRef = doc(db, 'families', this.currentFamily.id);
            await updateDoc(familyDocRef, {
                sharedPreferences: sharedPreferences,
                lastUpdated: new Date()
            });

            this.sharedPreferences = sharedPreferences;
            this.notifyListeners();
            
        } catch (error) {
            console.error('Failed to update shared preferences:', error);
            throw error;
        }
    }

    // Meal Planning for Families
    getAggregatedPreferences() {
        if (!this.familyMembers.length) return this.getDefaultPreferences();

        const aggregated = {
            dietaryRestrictions: new Set(),
            allergens: new Set(),
            favoriteIngredients: new Map(),
            dislikedIngredients: new Set(),
            spiceLevel: 'mild', // Default to most restrictive
            cuisinePreferences: new Map(),
            cookingSkillLevel: 'beginner' // Default to lowest skill
        };

        // Aggregate from all active members
        this.familyMembers.forEach(member => {
            if (!member.isActive || !member.preferences) return;

            const prefs = member.preferences;

            // Collect all dietary restrictions and allergens
            (prefs.dietaryRestrictions || []).forEach(r => aggregated.dietaryRestrictions.add(r));
            (prefs.allergens || []).forEach(a => aggregated.allergens.add(a));
            (prefs.dislikedIngredients || []).forEach(i => aggregated.dislikedIngredients.add(i));

            // Count favorite ingredients and cuisines
            (prefs.favoriteIngredients || []).forEach(ingredient => {
                aggregated.favoriteIngredients.set(ingredient, 
                    (aggregated.favoriteIngredients.get(ingredient) || 0) + 1);
            });

            (prefs.cuisinePreferences || []).forEach(cuisine => {
                aggregated.cuisinePreferences.set(cuisine,
                    (aggregated.cuisinePreferences.get(cuisine) || 0) + 1);
            });

            // Take most restrictive spice level
            const spiceLevels = ['mild', 'medium', 'hot'];
            const currentSpiceIndex = spiceLevels.indexOf(aggregated.spiceLevel);
            const memberSpiceIndex = spiceLevels.indexOf(prefs.spiceLevel || 'medium');
            if (memberSpiceIndex < currentSpiceIndex) {
                aggregated.spiceLevel = prefs.spiceLevel;
            }

            // Take lowest cooking skill level
            const skillLevels = ['beginner', 'intermediate', 'advanced'];
            const currentSkillIndex = skillLevels.indexOf(aggregated.cookingSkillLevel);
            const memberSkillIndex = skillLevels.indexOf(prefs.cookingSkillLevel || 'intermediate');
            if (memberSkillIndex < currentSkillIndex) {
                aggregated.cookingSkillLevel = prefs.cookingSkillLevel;
            }
        });

        // Convert to final format
        return {
            dietaryRestrictions: Array.from(aggregated.dietaryRestrictions),
            allergens: Array.from(aggregated.allergens),
            dislikedIngredients: Array.from(aggregated.dislikedIngredients),
            favoriteIngredients: this.getTopPreferences(aggregated.favoriteIngredients),
            cuisinePreferences: this.getTopPreferences(aggregated.cuisinePreferences),
            spiceLevel: aggregated.spiceLevel,
            cookingSkillLevel: aggregated.cookingSkillLevel,
            householdSize: this.familyMembers.length
        };
    }

    getTopPreferences(preferenceMap, limit = 10) {
        return Array.from(preferenceMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([preference, count]) => ({ preference, votes: count }));
    }

    // Permission Helpers
    isAdmin() {
        const currentMember = this.getCurrentMember();
        return currentMember && currentMember.role === 'admin';
    }

    canManageFamily() {
        return this.isAdmin();
    }

    canManageMembers() {
        return this.isAdmin();
    }

    canInviteMembers() {
        if (!this.currentFamily) return false;
        return this.isAdmin() || this.currentFamily.settings.allowMemberInvites;
    }

    getCurrentMember() {
        return this.familyMembers.find(m => m.uid === this.currentUser?.uid);
    }

    // Utility Methods
    async sendInvitationEmail(email, inviteId) {
        // This would integrate with an email service
        // For now, we'll just log it
        console.log(`Invitation sent to ${email} with ID: ${inviteId}`);
        
        // TODO: Implement actual email sending via Firebase Functions or similar
        // Could use services like SendGrid, Mailgun, or Firebase's email extensions
    }

    // Event System
    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback({
                    family: this.currentFamily,
                    members: this.familyMembers,
                    currentUser: this.currentUser,
                    sharedPreferences: this.sharedPreferences
                });
            } catch (error) {
                console.error('Listener callback error:', error);
            }
        });
    }

    // Public API
    getFamily() {
        return this.currentFamily;
    }

    getMembers() {
        return this.familyMembers;
    }

    getSharedPreferences() {
        return this.sharedPreferences;
    }

    hasFamily() {
        return !!this.currentFamily;
    }

    getMemberCount() {
        return this.familyMembers.length;
    }

    // Cleanup
    destroy() {
        this.listeners = [];
        this.currentFamily = null;
        this.familyMembers = [];
        this.sharedPreferences = {};
    }
}

// Global instance
let familyManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    familyManager = new FamilyManager();
    window.familyManager = familyManager;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FamilyManager;
}
