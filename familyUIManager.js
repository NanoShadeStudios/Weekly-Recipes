/**
 * Family UI Manager
 * Handles the user interface for family management features
 */

class FamilyUIManager {
    constructor() {
        this.familyManager = null;
        this.isInitialized = false;
        this.currentView = 'overview';
        
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for family manager to be ready
            if (window.familyManager) {
                this.familyManager = window.familyManager;
                this.setupEventListeners();
                this.createFamilyInterface();
                this.isInitialized = true;
            } else {
                setTimeout(() => this.initialize(), 1000);
                return;
            }
            
            console.log('Family UI Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Family UI Manager:', error);
        }
    }

    setupEventListeners() {
        // Listen for family data changes
        this.familyManager.addListener((data) => {
            this.updateFamilyDisplay(data);
        });
    }

    createFamilyInterface() {
        // Add family section to sidebar if not exists
        this.addFamilyTab();
        
        // Create family content section
        this.createFamilyContent();
    }

    addFamilyTab() {
        const sidebar = document.querySelector('.tabs');
        if (!sidebar) return;

        // Check if family tab already exists
        if (document.getElementById('family-btn')) return;

        const familyTab = document.createElement('button');
        familyTab.className = 'tab-btn';
        familyTab.id = 'family-btn';
        familyTab.setAttribute('role', 'tab');
        familyTab.setAttribute('aria-selected', 'false');
        familyTab.setAttribute('aria-controls', 'family');
        familyTab.setAttribute('tabindex', '-1');
        familyTab.innerHTML = '👨‍👩‍👧‍👦 Family';

        // Insert before profile tab
        const profileTab = document.getElementById('profile-btn');
        if (profileTab) {
            sidebar.insertBefore(familyTab, profileTab);
        } else {
            sidebar.appendChild(familyTab);
        }

        // Add click handler
        familyTab.addEventListener('click', () => {
            this.showFamilySection();
        });
    }

    createFamilyContent() {
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;

        // Check if family section already exists
        if (document.getElementById('family')) return;

        const familySection = document.createElement('section');
        familySection.id = 'family';
        familySection.className = 'content-section hidden';
        familySection.setAttribute('role', 'tabpanel');
        familySection.setAttribute('aria-labelledby', 'family-btn');

        familySection.innerHTML = `
            <div class="family-container">
                <div class="family-header">
                    <h2>Family Management</h2>
                    <div class="family-actions">
                        <button id="createFamilyBtn" class="btn btn-primary">Create Family</button>
                        <button id="joinFamilyBtn" class="btn btn-secondary">Join Family</button>
                        <button id="familySettingsBtn" class="btn btn-secondary hidden">⚙️ Settings</button>
                    </div>
                </div>

                <!-- Family Overview -->
                <div id="familyOverview" class="family-overview">
                    <div class="family-status">
                        <div class="status-card no-family">
                            <div class="status-icon">👤</div>
                            <h3>Individual Account</h3>
                            <p>You're currently using an individual account. Create or join a family to start collaborative meal planning!</p>
                        </div>
                    </div>
                </div>

                <!-- Family Details (hidden initially) -->
                <div id="familyDetails" class="family-details hidden">
                    <div class="family-info-card">
                        <div class="family-header-info">
                            <h3 id="familyName">My Family</h3>
                            <span id="familyMemberCount" class="member-count">0 members</span>
                        </div>
                        <p id="familyDescription" class="family-description"></p>
                        <div class="family-invite-code">
                            <label>Invite Code:</label>
                            <div class="code-display">
                                <span id="inviteCode">XXXXXXXX</span>
                                <button id="copyInviteCode" class="btn-icon" title="Copy invite code">📋</button>
                            </div>
                        </div>
                    </div>

                    <!-- Family Members -->
                    <div class="family-members-section">
                        <div class="section-header">
                            <h4>Family Members</h4>
                            <button id="inviteMemberBtn" class="btn btn-small btn-primary">Invite Member</button>
                        </div>
                        <div id="familyMembersList" class="family-members-list">
                            <!-- Members will be populated here -->
                        </div>
                    </div>

                    <!-- Shared Preferences -->
                    <div class="shared-preferences-section">
                        <div class="section-header">
                            <h4>Shared Preferences</h4>
                            <button id="editSharedPreferencesBtn" class="btn btn-small btn-secondary">Edit</button>
                        </div>
                        <div id="sharedPreferencesDisplay" class="preferences-display">
                            <!-- Shared preferences will be populated here -->
                        </div>
                    </div>

                    <!-- Family Statistics -->
                    <div class="family-stats-section">
                        <h4>Family Activity</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number" id="totalMealsPlanned">0</div>
                                <div class="stat-label">Meals Planned</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="totalRatings">0</div>
                                <div class="stat-label">Meal Ratings</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="favoritesCombined">0</div>
                                <div class="stat-label">Shared Favorites</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="completedShoppingLists">0</div>
                                <div class="stat-label">Shopping Lists</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modals will be added here -->
                <div id="familyModals"></div>
            </div>
        `;

        contentArea.appendChild(familySection);
        this.setupFamilyEventHandlers();
    }

    setupFamilyEventHandlers() {
        // Create Family button
        document.getElementById('createFamilyBtn')?.addEventListener('click', () => {
            this.showCreateFamilyModal();
        });

        // Join Family button
        document.getElementById('joinFamilyBtn')?.addEventListener('click', () => {
            this.showJoinFamilyModal();
        });

        // Family Settings button
        document.getElementById('familySettingsBtn')?.addEventListener('click', () => {
            this.showFamilySettings();
        });

        // Invite Member button
        document.getElementById('inviteMemberBtn')?.addEventListener('click', () => {
            this.showInviteMemberModal();
        });

        // Copy Invite Code button
        document.getElementById('copyInviteCode')?.addEventListener('click', () => {
            this.copyInviteCode();
        });

        // Edit Shared Preferences button
        document.getElementById('editSharedPreferencesBtn')?.addEventListener('click', () => {
            this.showSharedPreferencesModal();
        });
    }

    showFamilySection() {
        // Update tab state
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        document.getElementById('family-btn').classList.add('active');
        document.getElementById('family-btn').setAttribute('aria-selected', 'true');

        // Show family content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        document.getElementById('family').classList.remove('hidden');
    }

    updateFamilyDisplay(data) {
        const { family, members, currentUser, sharedPreferences } = data;

        if (family) {
            this.showFamilyDetails(family, members, sharedPreferences);
        } else {
            this.showNoFamilyState();
        }
    }

    showNoFamilyState() {
        document.getElementById('familyOverview').classList.remove('hidden');
        document.getElementById('familyDetails').classList.add('hidden');
        document.getElementById('createFamilyBtn').classList.remove('hidden');
        document.getElementById('joinFamilyBtn').classList.remove('hidden');
        document.getElementById('familySettingsBtn').classList.add('hidden');
    }

    showFamilyDetails(family, members, sharedPreferences) {
        document.getElementById('familyOverview').classList.add('hidden');
        document.getElementById('familyDetails').classList.remove('hidden');
        document.getElementById('createFamilyBtn').classList.add('hidden');
        document.getElementById('joinFamilyBtn').classList.add('hidden');
        document.getElementById('familySettingsBtn').classList.remove('hidden');

        // Update family info
        document.getElementById('familyName').textContent = family.name;
        document.getElementById('familyMemberCount').textContent = `${members.length} member${members.length !== 1 ? 's' : ''}`;
        document.getElementById('familyDescription').textContent = family.description || 'No description';
        document.getElementById('inviteCode').textContent = family.inviteCode;

        // Update members list
        this.updateMembersList(members);

        // Update shared preferences
        this.updateSharedPreferencesDisplay(sharedPreferences);

        // Update permissions
        this.updatePermissions();
    }

    updateMembersList(members) {
        const membersList = document.getElementById('familyMembersList');
        if (!membersList) return;

        membersList.innerHTML = '';

        members.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'family-member-card';
            memberCard.innerHTML = `
                <div class="member-avatar">
                    ${this.renderAvatar(member.avatar, member.displayName)}
                </div>
                <div class="member-info">
                    <div class="member-name">
                        ${member.displayName}
                        ${member.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
                    </div>
                    <div class="member-email">${member.email}</div>
                    <div class="member-preferences">
                        ${this.renderMemberPreferences(member.preferences)}
                    </div>
                </div>
                <div class="member-actions">
                    ${this.renderMemberActions(member)}
                </div>
            `;

            membersList.appendChild(memberCard);
        });
    }

    renderAvatar(avatar, displayName) {
        if (!avatar || avatar.type === 'initials') {
            const initials = avatar?.initials || displayName?.charAt(0) || 'M';
            const backgroundColor = avatar?.backgroundColor || '#4ECDC4';
            const textColor = avatar?.textColor || '#FFFFFF';
            
            return `
                <div class="avatar-initials" style="background-color: ${backgroundColor}; color: ${textColor};">
                    ${initials}
                </div>
            `;
        } else if (avatar.type === 'image') {
            return `<img src="${avatar.url}" alt="${displayName}" class="avatar-image">`;
        }
        
        return `<div class="avatar-default">👤</div>`;
    }

    renderMemberPreferences(preferences) {
        if (!preferences) return '<span class="no-preferences">No preferences set</span>';

        const restrictions = [];
        if (preferences.dietaryRestrictions?.length) {
            restrictions.push(...preferences.dietaryRestrictions);
        }
        if (preferences.allergens?.length) {
            restrictions.push(...preferences.allergens.map(a => `No ${a}`));
        }

        if (restrictions.length === 0) {
            return '<span class="no-restrictions">No dietary restrictions</span>';
        }

        return restrictions.slice(0, 3).map(r => 
            `<span class="preference-tag">${r}</span>`
        ).join('') + (restrictions.length > 3 ? '<span class="more-preferences">+' + (restrictions.length - 3) + ' more</span>' : '');
    }

    renderMemberActions(member) {
        const currentUser = this.familyManager.getCurrentMember();
        const isCurrentUser = member.uid === currentUser?.uid;
        const canManage = this.familyManager.canManageMembers() && !isCurrentUser;

        let actions = '';

        if (isCurrentUser) {
            actions += '<button class="btn-small btn-secondary edit-own-profile">Edit Profile</button>';
        }

        if (canManage) {
            actions += `
                <div class="member-actions-dropdown">
                    <button class="btn-small btn-secondary dropdown-toggle">⋮</button>
                    <div class="dropdown-menu">
                        <button class="dropdown-item edit-member" data-member-id="${member.uid}">Edit</button>
                        ${member.role === 'admin' ? 
                            '<button class="dropdown-item demote-member" data-member-id="' + member.uid + '">Remove Admin</button>' :
                            '<button class="dropdown-item promote-member" data-member-id="' + member.uid + '">Make Admin</button>'
                        }
                        <button class="dropdown-item remove-member" data-member-id="${member.uid}">Remove</button>
                    </div>
                </div>
            `;
        }

        return actions;
    }

    updateSharedPreferencesDisplay(sharedPreferences) {
        const display = document.getElementById('sharedPreferencesDisplay');
        if (!display || !sharedPreferences) return;

        display.innerHTML = `
            <div class="preferences-grid">
                <div class="preference-item">
                    <label>Household Size:</label>
                    <span>${sharedPreferences.householdSize || 'Not set'}</span>
                </div>
                <div class="preference-item">
                    <label>Budget Range:</label>
                    <span>${sharedPreferences.budgetRange || 'Not set'}</span>
                </div>
                <div class="preference-item">
                    <label>Common Allergens:</label>
                    <span>${sharedPreferences.commonAllergens?.join(', ') || 'None'}</span>
                </div>
                <div class="preference-item">
                    <label>Meal Planning Style:</label>
                    <span>${sharedPreferences.mealPlanningStyle || 'Collaborative'}</span>
                </div>
                <div class="preference-item">
                    <label>Meal Times:</label>
                    <div class="meal-times">
                        <div>Breakfast: ${sharedPreferences.mealSchedule?.breakfast || '8:00'}</div>
                        <div>Lunch: ${sharedPreferences.mealSchedule?.lunch || '12:00'}</div>
                        <div>Dinner: ${sharedPreferences.mealSchedule?.dinner || '18:00'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    updatePermissions() {
        const canInvite = this.familyManager.canInviteMembers();
        const canManage = this.familyManager.canManageFamily();

        // Show/hide invite button
        const inviteBtn = document.getElementById('inviteMemberBtn');
        if (inviteBtn) {
            inviteBtn.style.display = canInvite ? 'block' : 'none';
        }

        // Show/hide edit preferences button
        const editBtn = document.getElementById('editSharedPreferencesBtn');
        if (editBtn) {
            editBtn.style.display = canManage ? 'block' : 'none';
        }
    }

    // Modal Functions
    showCreateFamilyModal() {
        const modal = this.createModal('createFamily', 'Create Family', `
            <form id="createFamilyForm" class="family-form">
                <div class="form-group">
                    <label for="familyName">Family Name *</label>
                    <input type="text" id="familyName" name="familyName" required 
                           placeholder="e.g., The Smith Family" maxlength="50">
                </div>
                <div class="form-group">
                    <label for="familyDescription">Description</label>
                    <textarea id="familyDescription" name="familyDescription" 
                              placeholder="Tell us about your family..." maxlength="200"></textarea>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="allowMemberInvites" name="allowMemberInvites" checked>
                        Allow members to invite others
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="sharedShopping" name="sharedShopping" checked>
                        Enable shared shopping lists
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="sharedMealPlanning" name="sharedMealPlanning" checked>
                        Enable collaborative meal planning
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Family</button>
                </div>
            </form>
        `);

        // Handle form submission
        document.getElementById('createFamilyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateFamily(new FormData(e.target));
            this.closeModal('createFamily');
        });
    }

    showJoinFamilyModal() {
        const modal = this.createModal('joinFamily', 'Join Family', `
            <form id="joinFamilyForm" class="family-form">
                <div class="form-group">
                    <label for="inviteCode">Family Invite Code *</label>
                    <input type="text" id="inviteCodeInput" name="inviteCode" required 
                           placeholder="Enter 8-character code" maxlength="8" 
                           style="text-transform: uppercase;">
                    <small class="form-help">Ask a family member for the invite code</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button type="submit" class="btn btn-primary">Join Family</button>
                </div>
            </form>
        `);

        // Handle form submission
        document.getElementById('joinFamilyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleJoinFamily(new FormData(e.target));
            this.closeModal('joinFamily');
        });
    }

    showInviteMemberModal() {
        const modal = this.createModal('inviteMember', 'Invite Family Member', `
            <form id="inviteMemberForm" class="family-form">
                <div class="form-group">
                    <label for="memberEmail">Email Address *</label>
                    <input type="email" id="memberEmail" name="memberEmail" required 
                           placeholder="member@example.com">
                </div>
                <div class="form-group">
                    <label for="memberRole">Role</label>
                    <select id="memberRole" name="memberRole">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button type="submit" class="btn btn-primary">Send Invitation</button>
                </div>
            </form>
        `);

        // Handle form submission
        document.getElementById('inviteMemberForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleInviteMember(new FormData(e.target));
            this.closeModal('inviteMember');
        });
    }

    showSharedPreferencesModal() {
        const preferences = this.familyManager.getSharedPreferences();
        
        const modal = this.createModal('editSharedPreferences', 'Edit Shared Preferences', `
            <form id="sharedPreferencesForm" class="family-form">
                <div class="form-group">
                    <label for="householdSize">Household Size</label>
                    <input type="number" id="householdSize" name="householdSize" 
                           value="${preferences.householdSize || ''}" min="1" max="20">
                </div>
                <div class="form-group">
                    <label for="budgetRange">Budget Range</label>
                    <select id="budgetRange" name="budgetRange">
                        <option value="low" ${preferences.budgetRange === 'low' ? 'selected' : ''}>Low ($)</option>
                        <option value="medium" ${preferences.budgetRange === 'medium' ? 'selected' : ''}>Medium ($$)</option>
                        <option value="high" ${preferences.budgetRange === 'high' ? 'selected' : ''}>High ($$$)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="mealPlanningStyle">Meal Planning Style</label>
                    <select id="mealPlanningStyle" name="mealPlanningStyle">
                        <option value="collaborative" ${preferences.mealPlanningStyle === 'collaborative' ? 'selected' : ''}>Collaborative</option>
                        <option value="rotation" ${preferences.mealPlanningStyle === 'rotation' ? 'selected' : ''}>Take Turns</option>
                        <option value="admin-only" ${preferences.mealPlanningStyle === 'admin-only' ? 'selected' : ''}>Admin Only</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Meal Schedule</label>
                    <div class="time-inputs">
                        <div class="time-input">
                            <label for="breakfastTime">Breakfast:</label>
                            <input type="time" id="breakfastTime" name="breakfastTime" 
                                   value="${preferences.mealSchedule?.breakfast || '08:00'}">
                        </div>
                        <div class="time-input">
                            <label for="lunchTime">Lunch:</label>
                            <input type="time" id="lunchTime" name="lunchTime" 
                                   value="${preferences.mealSchedule?.lunch || '12:00'}">
                        </div>
                        <div class="time-input">
                            <label for="dinnerTime">Dinner:</label>
                            <input type="time" id="dinnerTime" name="dinnerTime" 
                                   value="${preferences.mealSchedule?.dinner || '18:00'}">
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Preferences</button>
                </div>
            </form>
        `);

        // Handle form submission
        document.getElementById('sharedPreferencesForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdateSharedPreferences(new FormData(e.target));
            this.closeModal('editSharedPreferences');
        });
    }

    // Form Handlers
    async handleCreateFamily(formData) {
        try {
            this.showLoading('Creating family...');
            
            const familyData = {
                name: formData.get('familyName'),
                description: formData.get('familyDescription'),
                allowMemberInvites: formData.get('allowMemberInvites') === 'on',
                sharedShopping: formData.get('sharedShopping') === 'on',
                sharedMealPlanning: formData.get('sharedMealPlanning') === 'on'
            };

            await this.familyManager.createFamily(familyData);
            this.showSuccess('Family created successfully!');
        } catch (error) {
            this.showError('Failed to create family: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async handleJoinFamily(formData) {
        try {
            this.showLoading('Joining family...');
            
            const inviteCode = formData.get('inviteCode');
            await this.familyManager.joinFamilyByCode(inviteCode);
            this.showSuccess('Successfully joined family!');
        } catch (error) {
            this.showError('Failed to join family: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async handleInviteMember(formData) {
        try {
            this.showLoading('Sending invitation...');
            
            const email = formData.get('memberEmail');
            const role = formData.get('memberRole');
            
            await this.familyManager.inviteMember(email, role);
            this.showSuccess('Invitation sent successfully!');
        } catch (error) {
            this.showError('Failed to send invitation: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async handleUpdateSharedPreferences(formData) {
        try {
            this.showLoading('Updating preferences...');
            
            const preferences = {
                householdSize: parseInt(formData.get('householdSize')) || null,
                budgetRange: formData.get('budgetRange'),
                mealPlanningStyle: formData.get('mealPlanningStyle'),
                mealSchedule: {
                    breakfast: formData.get('breakfastTime'),
                    lunch: formData.get('lunchTime'),
                    dinner: formData.get('dinnerTime')
                }
            };

            await this.familyManager.updateSharedPreferences(preferences);
            this.showSuccess('Preferences updated successfully!');
        } catch (error) {
            this.showError('Failed to update preferences: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // Utility Functions
    copyInviteCode() {
        const inviteCode = document.getElementById('inviteCode').textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(inviteCode).then(() => {
                this.showSuccess('Invite code copied to clipboard!');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = inviteCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Invite code copied to clipboard!');
        }
    }

    createModal(id, title, content) {
        const modalContainer = document.getElementById('familyModals');
        
        const modal = document.createElement('div');
        modal.id = `${id}Modal`;
        modal.className = 'family-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        modalContainer.appendChild(modal);

        // Add event listeners
        modal.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(id));
        });

        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.closeModal(id);
        });

        return modal;
    }

    closeModal(id) {
        const modal = document.getElementById(`${id}Modal`);
        if (modal) {
            modal.remove();
        }
    }

    showLoading(message) {
        // Create or update loading indicator
        let loading = document.getElementById('familyLoading');
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'familyLoading';
            loading.className = 'family-loading';
            document.body.appendChild(loading);
        }
        
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        loading.classList.remove('hidden');
    }

    hideLoading() {
        const loading = document.getElementById('familyLoading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `family-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Global instance
let familyUIManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Delay to ensure other managers are loaded
    setTimeout(() => {
        familyUIManager = new FamilyUIManager();
        window.familyUIManager = familyUIManager;
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FamilyUIManager;
}
