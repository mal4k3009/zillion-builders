import React, { useState, useEffect } from 'react';
import { X, Plus, User, Mail, Lock, Building } from 'lucide-react';
import { User as UserType } from '../../types';
import { useApp } from '../../context/AppContext';

const designations = [
  { id: 'chairman', name: 'Chairman', color: '#DC2626' },
  { id: 'director', name: 'Director', color: '#7C3AED' },
  { id: 'staff', name: 'Staff', color: '#059669' }
];

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType | null;
  mode: 'create' | 'edit';
}

export function UserModal({ isOpen, onClose, user, mode }: UserModalProps) {
  const { state, createUser, updateUser, createActivity } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        designation: user.designation
      });
    } else {
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        designation: ''
      });
    }
    setError(''); // Clear any previous errors when modal opens
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Full name is required.');
      }
      if (!formData.email.trim()) {
        throw new Error('Email address is required.');
      }
      if (!formData.username.trim()) {
        throw new Error('Username is required.');
      }
      if (!formData.password.trim()) {
        throw new Error('Password is required.');
      }
      if (!formData.designation) {
        throw new Error('Designation is required.');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Check if username already exists (for new users)
      if (mode === 'create') {
        const existingUser = state.users.find(u => u.username === formData.username);
        if (existingUser) {
          throw new Error('Username already exists. Please choose a different username.');
        }
        
        // Check if email already exists
        const existingEmail = state.users.find(u => u.email === formData.email);
        if (existingEmail) {
          throw new Error('Email address already exists. Please use a different email.');
        }
      }

      // Determine role based on designation
      let userRole: 'master' | 'director' | 'employee';
      if (formData.designation === 'chairman') {
        userRole = 'master'; // Chairman has master privileges
      } else if (formData.designation === 'director') {
        userRole = 'director'; // Director role
      } else {
        userRole = 'employee'; // Staff members are employees
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: userRole,
        designation: formData.designation,
        status: user?.status || 'active' as const,
        createdAt: user?.createdAt || new Date().toISOString(),
        ...(user?.lastLogin && { lastLogin: user.lastLogin }) // Only include lastLogin if it exists
      };

      if (mode === 'create') {
        await createUser(userData);
        
        // Add activity
        await createActivity({
          type: 'user_created',
          description: `Created new ${designations.find(d => d.id === formData.designation)?.name} account: ${formData.name}`,
          userId: state.currentUser!.id,
          timestamp: new Date().toISOString()
        });
        
        // Show message about creating authentication
        console.log('🔐 User created in Firestore. Firebase Auth will be created automatically.');
        console.log('📝 Login credentials will be:', { email: formData.email, password: formData.password });
      } else {
        await updateUser(user!.id, userData);
        
        // Add activity for edit
        await createActivity({
          type: 'user_updated',
          description: `Updated ${designations.find(d => d.id === formData.designation)?.name} account: ${formData.name}`,
          userId: state.currentUser!.id,
          timestamp: new Date().toISOString()
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error instanceof Error ? error.message : 'Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {mode === 'create' ? 'Add User' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Designation
            </label>
            <select
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Designation</option>
              {designations.map(designation => (
                <option key={designation.id} value={designation.id}>
                  {designation.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              {mode === 'create' ? 'Create User' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}