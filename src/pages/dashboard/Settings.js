// src/pages/dashboard/Settings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For potential redirects if needed
import { getUserSettings, updateUserSettings, changePassword, getOverviewData } from '../../api'; // Import getOverviewData for fetching user data like name

const defaultSettings = {
  account: {
    organization_name: '', // Renamed from company, optional
  },
  notifications: {
    email_alerts: true, // Boolean for email alerts
    low_credit_threshold: 2, // Default to 2 as per instructions
    usage_reports: 'never', // Default to 'never' as per instructions
  },
};

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [error, setError] = useState(null); // State to handle errors
  const [settings, setSettings] = useState(defaultSettings);
  const [userName, setUserName] = useState(null); // State for user name
  const [userEmail, setUserEmail] = useState(null); // State for user email
  const authToken = localStorage.getItem('authToken'); // Retrieve JWT token
  const userId = localStorage.getItem('userId'); // Assume userId is stored
  const navigate = useNavigate(); // For navigation if needed (e.g., redirect on error)

  // Add logging when the component mounts to check localStorage values and auth status
  useEffect(() => {
    console.log('Settings component mounted');
    console.log('localStorage userName:', localStorage.getItem('userName'));
    console.log('localStorage userEmail:', localStorage.getItem('userEmail'));
    console.log('localStorage authToken:', authToken ? 'Present' : 'Missing');
    console.log('localStorage userId:', userId ? 'Present' : 'Missing');
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (!authToken || !userId) {
      console.error('No authentication token or user ID found. Redirecting to login.');
      navigate('/login', { replace: true }); // Redirect to login if not authenticated
      return;
    }

    const fetchUserDataAndSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user data using getOverviewData (which includes name)
        console.log('Fetching user data from getOverviewData...');
        const overviewData = await getOverviewData(authToken); // This returns name and other data
        console.log('Received user data from getOverviewData:', overviewData);
        
        // Set user name from fetched data
        setUserName(overviewData.name || 'N/A');

        // Now fetch settings, which now includes email from getUserSettings
        console.log('Fetching user settings from getUserSettings...');
        const settingsData = await getUserSettings(authToken); // Fetch settings using new API function
        const fetchedSettings = settingsData.settings || {};
        
        // Set user email from fetched settings (since email is now included in getUserSettings response)
        setUserEmail(fetchedSettings.email || 'N/A');
        
        // Merge fetched settings with default settings to handle partial data
        setSettings({
          account: { ...defaultSettings.account, ... (fetchedSettings.account || {}) },
          notifications: { ...defaultSettings.notifications, ... (fetchedSettings.notifications || {}) },
        });
      } catch (err) {
        console.error('Error fetching user data or settings:', err);
        setError('Failed to load user data or settings. Please try again or check your authentication.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndSettings();
  }, [authToken, userId, navigate]);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!authToken || !userId) {
      setError('Authentication required. Please log in.');
      return;
    }
  
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
  
    // Flatten the settings object to send a flat structure to the backend
    const flatSettings = {
      organization_name: settings.account.organization_name,
      email_alerts: settings.notifications.email_alerts,
      low_credit_threshold: settings.notifications.low_credit_threshold,
      usage_reports: settings.notifications.usage_reports,
    };
  
    try {
      const data = await updateUserSettings(authToken, flatSettings); // Pass flattened settings
      setSaveSuccess(true);
      console.log('Settings updated successfully:', data);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!authToken || !userId) {
      setError('Authentication required. Please log in.');
      return;
    }

    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSaving(true); // Reuse isSaving for password change or add a separate state if needed
    setError(null);
    setPasswordChangeSuccess(false);

    try {
      const data = await changePassword(authToken, userId, currentPassword, newPassword); // Use new API function
      setPasswordChangeSuccess(true);
      // Clear password fields after success
      document.getElementById('current_password').value = '';
      document.getElementById('new_password').value = '';
      document.getElementById('confirm_password').value = '';
      console.log('Password changed successfully:', data);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your current password and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!userName || !userEmail) {
    // If user data is not yet fetched or missing, show a fallback or error
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <p className="text-red-600">User data not loaded. Please refresh the page or check authentication.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        {saveSuccess && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
            Settings saved successfully!
          </div>
        )}
        {passwordChangeSuccess && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
            Password changed successfully!
          </div>
        )}
      </div>

      {/* Settings Form for Organization and Notifications */}
      <form onSubmit={handleSettingsSubmit}>
        {/* Account Settings with Organization Name */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Account Settings</h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Display name and email as read-only for reference, using fetched state */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 cursor-not-allowed"
                  onFocus={() => console.log('Focused on Full Name input. Current value:', userName)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 cursor-not-allowed"
                  onFocus={() => console.log('Focused on Email Address input. Current value:', userEmail)}
                />
              </div>
            </div>

            {/* Organization Name Field */}
            <div>
              <label htmlFor="organization_name" className="block text-sm font-medium text-slate-700 mb-1">
                Organization Name (Optional)
              </label>
              <input
                type="text"
                id="organization_name"
                value={settings.account.organization_name}
                onChange={(e) => handleChange('account', 'organization_name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Notification Settings</h3>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center">
              <input
                id="email_alerts"
                type="checkbox"
                checked={settings.notifications.email_alerts}
                onChange={(e) => handleChange('notifications', 'email_alerts', e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="email_alerts" className="ml-2 block text-sm text-slate-700">
                Enable email notifications
              </label>
            </div>

            {settings.notifications.email_alerts && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-slate-100">
                <div>
                  <label htmlFor="low_credit_threshold" className="block text-sm font-medium text-slate-700 mb-1">
                    Low Credit Alert Threshold
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 px-3 py-2.5 rounded-l-lg border border-r-0 border-slate-300">$</span>
                    <input
                      type="number"
                      id="low_credit_threshold"
                      value={settings.notifications.low_credit_threshold}
                      onChange={(e) => handleChange('notifications', 'low_credit_threshold', parseFloat(e.target.value))}
                      min="0"
                      className="w-full px-4 py-2.5 rounded-r-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Get notified when your credit balance falls below this amount (default: $2)</p>
                </div>

                <div>
                  <label htmlFor="usage_reports" className="block text-sm font-medium text-slate-700 mb-1">
                    Usage Report Frequency
                  </label>
                  <select
                    id="usage_reports"
                    value={settings.notifications.usage_reports}
                    onChange={(e) => handleChange('notifications', 'usage_reports', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="never">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">Receive regular reports summarizing your API usage (default: Never)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button for Settings (excludes password) */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Separate Password Change Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current_password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changing...
                  </>
                ) : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}