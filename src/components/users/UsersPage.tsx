import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, User, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserModal } from './UserModal';
import { User as UserType } from '../../types';

// Only master admin can access this page
export function UsersPage() {
  const { state, deleteUser, updateUser, createActivity } = useApp();
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');

  const subAdmins = state.users.filter(u => u.role === 'sub');
  
  const filteredUsers = subAdmins.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowUserModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(userId);
      
      // Add activity
      await createActivity({
        type: 'user_created',
        description: `Deleted sub admin account`,
        userId: state.currentUser!.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const toggleUserStatus = async (user: UserType) => {
    const updatedUser = {
      ...user,
      status: user.status === 'active' ? 'inactive' : 'active'
    } as UserType;
    
    await updateUser(user.id, updatedUser);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-deep-charcoal dark:text-pure-white">
          User Management
        </h1>
        <button
          onClick={handleCreateUser}
          className="bg-brand-gold hover:bg-accent-gold text-pure-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors text-sm sm:text-base w-fit"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Add Sub Admin</span>
          <span className="xs:hidden">Add User</span>
        </button>
      </div>

      <div className="bg-pure-white dark:bg-dark-gray rounded-lg sm:rounded-xl shadow-sm border border-light-gray dark:border-soft-black p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-medium-gray" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-light-gray dark:border-soft-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold dark:bg-dark-gray dark:text-pure-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-light-gray dark:border-soft-black">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white">User</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white">Department</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white">Status</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white hidden sm:table-cell">Last Login</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-light-gray dark:border-soft-black hover:bg-off-white dark:hover:bg-soft-black transition-colors">
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 sm:w-5 sm:h-5 text-pure-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-medium-gray truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-brand-gold/20 text-brand-gold text-xs font-medium rounded-full capitalize">
                      <Shield className="w-2 h-2 sm:w-3 sm:h-3" />
                      {user.department}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`inline-flex items-center px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {user.status === 'active' ? '● Active' : '● Inactive'}
                    </button>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-medium-gray hidden sm:table-cell">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1.5 sm:p-2 text-medium-gray hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 sm:p-2 text-medium-gray hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-medium-gray mx-auto mb-4" />
            <h3 className="text-lg font-medium text-deep-charcoal dark:text-pure-white mb-2">No users found</h3>
            <p className="text-medium-gray">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first sub admin to get started.'}
            </p>
          </div>
        )}
      </div>

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  );
}