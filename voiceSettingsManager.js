/**
 * Voice Settings Manager
 * Provides user interface for voice control customization
 */

class VoiceSettingsManager {
    constructor(voiceControl) {
        this.voiceControl = voiceControl;
        this.settings = {
            speechRate: 0.9,
            speechPitch: 1.0,
            speechVolume: 0.8,
            language: 'en-US',
            preferredVoice: null,
            feedbackEnabled: true,
            wakeWordEnabled: false,
            confidenceThreshold: 0.7,
            autoStopListening: true,
            voiceShortcuts: true
        };
        
        this.loadSettings();
        this.createSettingsUI();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('voiceControlSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load voice settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('voiceControlSettings', JSON.stringify(this.settings));
            this.applySettings();
        } catch (error) {
            console.warn('Failed to save voice settings:', error);
        }
    }

    applySettings() {
        if (this.voiceControl) {
            // Apply settings to voice control
            this.voiceControl.setFeedbackEnabled(this.settings.feedbackEnabled);
            this.voiceControl.setVoiceRate(this.settings.speechRate);
            
            if (this.settings.wakeWordEnabled) {
                this.voiceControl.enableWakeWordMode();
            } else {
                this.voiceControl.disableWakeWordMode();
            }
        }
    }

    createSettingsUI() {
        // Create settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'voiceSettingsBtn';
        settingsBtn.className = 'voice-settings-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Voice Settings';
        settingsBtn.setAttribute('aria-label', 'Open voice control settings');
        
        settingsBtn.addEventListener('click', () => this.showSettings());
        
        // Add to voice control button area
        const voiceBtn = document.getElementById('voiceControlBtn');
        if (voiceBtn && voiceBtn.parentNode) {
            voiceBtn.parentNode.insertBefore(settingsBtn, voiceBtn.nextSibling);
        }

        // Create settings modal
        this.createSettingsModal();
    }

    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'voiceSettingsModal';
        modal.className = 'voice-settings-modal hidden';
        modal.innerHTML = `
            <div class="voice-settings-content">
                <div class="voice-settings-header">
                    <h3>🎤 Voice Control Settings</h3>
                    <button class="close-voice-settings" aria-label="Close settings">×</button>
                </div>
                <div class="voice-settings-body">
                    <div class="settings-section">
                        <h4>Speech Output</h4>
                        <div class="setting-item">
                            <label for="speechRate">Speaking Rate</label>
                            <input type="range" id="speechRate" min="0.5" max="2" step="0.1" value="${this.settings.speechRate}">
                            <span class="setting-value">${this.settings.speechRate}</span>
                        </div>
                        <div class="setting-item">
                            <label for="speechPitch">Speaking Pitch</label>
                            <input type="range" id="speechPitch" min="0.5" max="2" step="0.1" value="${this.settings.speechPitch}">
                            <span class="setting-value">${this.settings.speechPitch}</span>
                        </div>
                        <div class="setting-item">
                            <label for="speechVolume">Speaking Volume</label>
                            <input type="range" id="speechVolume" min="0" max="1" step="0.1" value="${this.settings.speechVolume}">
                            <span class="setting-value">${this.settings.speechVolume}</span>
                        </div>
                        <div class="setting-item">
                            <label for="preferredVoice">Voice</label>
                            <select id="preferredVoice">
                                <option value="">Default</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4>Speech Recognition</h4>
                        <div class="setting-item">
                            <label for="language">Language</label>
                            <select id="language" value="${this.settings.language}">
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                                <option value="en-AU">English (Australia)</option>
                                <option value="es-ES">Spanish</option>
                                <option value="fr-FR">French</option>
                                <option value="de-DE">German</option>
                                <option value="it-IT">Italian</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label for="confidenceThreshold">Recognition Sensitivity</label>
                            <input type="range" id="confidenceThreshold" min="0.3" max="1" step="0.05" value="${this.settings.confidenceThreshold}">
                            <span class="setting-value">${this.settings.confidenceThreshold}</span>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4>Behavior</h4>
                        <div class="setting-item checkbox-item">
                            <label for="feedbackEnabled">
                                <input type="checkbox" id="feedbackEnabled" ${this.settings.feedbackEnabled ? 'checked' : ''}>
                                Enable voice feedback
                            </label>
                        </div>
                        <div class="setting-item checkbox-item">
                            <label for="wakeWordEnabled">
                                <input type="checkbox" id="wakeWordEnabled" ${this.settings.wakeWordEnabled ? 'checked' : ''}>
                                Always listen for "Hey Recipe"
                            </label>
                        </div>
                        <div class="setting-item checkbox-item">
                            <label for="autoStopListening">
                                <input type="checkbox" id="autoStopListening" ${this.settings.autoStopListening ? 'checked' : ''}>
                                Auto-stop listening after command
                            </label>
                        </div>
                        <div class="setting-item checkbox-item">
                            <label for="voiceShortcuts">
                                <input type="checkbox" id="voiceShortcuts" ${this.settings.voiceShortcuts ? 'checked' : ''}>
                                Enable voice shortcuts
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4>Test & Calibration</h4>
                        <div class="test-controls">
                            <button class="test-btn" id="testSpeech">Test Speech Output</button>
                            <button class="test-btn" id="testRecognition">Test Recognition</button>
                            <button class="test-btn" id="calibrateMicrophone">Calibrate Microphone</button>
                        </div>
                    </div>
                </div>
                <div class="voice-settings-footer">
                    <button class="settings-btn secondary" id="resetSettings">Reset to Defaults</button>
                    <button class="settings-btn primary" id="saveSettings">Save Settings</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupSettingsEvents(modal);
        this.populateVoiceOptions();
    }

    setupSettingsEvents(modal) {
        // Close button
        modal.querySelector('.close-voice-settings').addEventListener('click', () => {
            this.hideSettings();
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideSettings();
            }
        });

        // Range inputs
        const rangeInputs = modal.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const valueSpan = e.target.nextElementSibling;
                if (valueSpan) {
                    valueSpan.textContent = e.target.value;
                }
                this.updateSetting(e.target.id, parseFloat(e.target.value));
            });
        });

        // Checkboxes
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateSetting(e.target.id, e.target.checked);
            });
        });

        // Select inputs
        const selects = modal.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateSetting(e.target.id, e.target.value);
            });
        });

        // Test buttons
        modal.querySelector('#testSpeech').addEventListener('click', () => {
            this.testSpeechOutput();
        });

        modal.querySelector('#testRecognition').addEventListener('click', () => {
            this.testSpeechRecognition();
        });

        modal.querySelector('#calibrateMicrophone').addEventListener('click', () => {
            this.calibrateMicrophone();
        });

        // Action buttons
        modal.querySelector('#resetSettings').addEventListener('click', () => {
            this.resetToDefaults();
        });

        modal.querySelector('#saveSettings').addEventListener('click', () => {
            this.saveSettings();
            this.hideSettings();
        });
    }

    populateVoiceOptions() {
        const voiceSelect = document.getElementById('preferredVoice');
        if (!voiceSelect) return;

        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '<option value="">Default</option>';
        
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (this.settings.preferredVoice === index) {
                option.selected = true;
            }
            voiceSelect.appendChild(option);
        });
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        
        // Apply some settings immediately
        if (key === 'feedbackEnabled' || key === 'speechRate' || key === 'wakeWordEnabled') {
            this.applySettings();
        }
    }

    testSpeechOutput() {
        const testMessage = "This is a test of the voice output system. How does this sound?";
        
        if (this.voiceControl) {
            this.voiceControl.speak(testMessage, {
                rate: this.settings.speechRate,
                pitch: this.settings.speechPitch,
                volume: this.settings.speechVolume
            });
        }
    }

    testSpeechRecognition() {
        if (this.voiceControl) {
            this.voiceControl.speak("Please say something to test speech recognition.");
            setTimeout(() => {
                this.voiceControl.startListening();
            }, 2000);
        }
    }

    calibrateMicrophone() {
        if (this.voiceControl) {
            this.voiceControl.speak("Starting microphone calibration. Please speak clearly for 5 seconds.");
            
            // Simple calibration - just test if microphone is working
            setTimeout(() => {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(stream => {
                            this.voiceControl.speak("Microphone is working correctly.");
                            stream.getTracks().forEach(track => track.stop());
                        })
                        .catch(error => {
                            this.voiceControl.speak("Microphone access denied or not available.");
                        });
                }
            }, 1000);
        }
    }

    resetToDefaults() {
        this.settings = {
            speechRate: 0.9,
            speechPitch: 1.0,
            speechVolume: 0.8,
            language: 'en-US',
            preferredVoice: null,
            feedbackEnabled: true,
            wakeWordEnabled: false,
            confidenceThreshold: 0.7,
            autoStopListening: true,
            voiceShortcuts: true
        };

        this.updateSettingsUI();
        this.applySettings();
    }

    updateSettingsUI() {
        // Update all form inputs with current settings
        Object.entries(this.settings).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                    const valueSpan = element.nextElementSibling;
                    if (valueSpan) {
                        valueSpan.textContent = value;
                    }
                } else {
                    element.value = value;
                }
            }
        });
    }

    showSettings() {
        const modal = document.getElementById('voiceSettingsModal');
        if (modal) {
            this.updateSettingsUI();
            this.populateVoiceOptions();
            modal.classList.remove('hidden');
        }
    }

    hideSettings() {
        const modal = document.getElementById('voiceSettingsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    // Export/Import settings
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'voice-control-settings.json';
        link.click();
    }

    async importSettings(file) {
        try {
            const text = await file.text();
            const imported = JSON.parse(text);
            
            // Validate imported settings
            if (typeof imported === 'object' && imported !== null) {
                this.settings = { ...this.settings, ...imported };
                this.saveSettings();
                this.updateSettingsUI();
                return true;
            }
        } catch (error) {
            console.error('Failed to import settings:', error);
        }
        return false;
    }
}

// Initialize when voice control is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for voice control to be available
    const initSettings = () => {
        if (window.voiceControl) {
            window.voiceSettings = new VoiceSettingsManager(window.voiceControl);
        } else {
            setTimeout(initSettings, 1000);
        }
    };
    
    setTimeout(initSettings, 2000);
});

// Export for use
if (typeof window !== 'undefined') {
    window.VoiceSettingsManager = VoiceSettingsManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceSettingsManager;
}
