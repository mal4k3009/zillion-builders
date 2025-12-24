import React, { useState } from 'react';
import { User, Lock, Bell, Palette, Globe, Shield, Save, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppSettings } from './WhatsAppSettings';

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: state.currentUser?.name || '',
    email: state.currentUser?.email || '',
    department: state.currentUser?.department || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    taskAssignments: true,
    taskUpdates: true,
    chatMessages: true,
    whatsappNotifications: true,
    emailNotifications: false,
    pushNotifications: true
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'password', name: 'Password', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'appearance', name: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'system', name: 'System', icon: <Globe className="w-4 h-4" /> }
  ];

  const handleSaveProfile = () => {
    if (state.currentUser) {
      const updatedUser = {
        ...state.currentUser,
        name: profileData.name,
        email: profileData.email
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_CURRENT_USER', payload: updatedUser });
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (state.currentUser) {
      const updatedUser = {
        ...state.currentUser,
        password: passwordData.newPassword
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }

    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password updated successfully');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Department
              </label>
              <input
                type="text"
                value={profileData.department}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 capitalize"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              Save Changes
            </button>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-xs sm:text-sm"
            >
              Update Password
            </button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      [key]: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      case 'whatsapp':
        return <WhatsAppSettings />;

      case 'appearance':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Theme</h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                  className={`p-3 sm:p-4 rounded-lg border transition-all ${
                    state.theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg mx-auto mb-2 border border-gray-200"></div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Light</p>
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                  className={`p-3 sm:p-4 rounded-lg border transition-all ${
                    state.theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded-lg mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Dark</p>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Sidebar</h4>
              <div className="flex justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-900 dark:text-white">Auto-collapse sidebar</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Automatically collapse sidebar on mobile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200">Demo Application</h4>
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This is a demonstration application with mock data. No actual data is stored externally.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Application Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Version</p>
                  <p className="font-medium text-gray-900 dark:text-white">1.0.0</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-white">December 2024</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Data Storage</p>
                  <p className="font-medium text-gray-900 dark:text-white">Local Storage</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Role</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{state.currentUser?.role}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Data Management</h4>
              <div className="space-y-2 sm:space-y-3">
                <button className="w-full text-left p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Export Data</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download your data as JSON</p>
                </button>
                <button className="w-full text-left p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Clear Cache</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clear application cache and temporary data</p>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <nav className="space-y-1 sm:space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">{tab.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {tabs.find(t => t.id === activeTab)?.name} Settings
            </h3>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}