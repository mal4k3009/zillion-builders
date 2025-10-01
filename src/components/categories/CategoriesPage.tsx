import React, { useState } from 'react';
import { Plus, Tags, Users, Edit2, Trash2, Search, X, UserPlus, UserMinus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserCategory } from '../../types';

export function CategoriesPage() {
  const { state, createUserCategory, updateUserCategory, deleteUserCategory } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UserCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Check if current user can edit categories (only master and chairman)
  const canEdit = state.currentUser?.role === 'master' || 
                  (state.currentUser?.role === 'director' && state.currentUser?.designation === 'chairman');

  // Filter categories based on search term
  const filteredCategories = state.userCategories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentUser) return;

    try {
      await createUserCategory({
        name: formData.name,
        description: formData.description,
        color: formData.color,
        createdBy: state.currentUser.id,
        assignedUsers: []
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await updateUserCategory(selectedCategory.id, formData);
      setShowEditModal(false);
      setSelectedCategory(null);
      resetForm();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteUserCategory(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleAssignUser = async (userId: number) => {
    if (!selectedCategory) return;

    const updatedUsers = selectedCategory.assignedUsers.includes(userId)
      ? selectedCategory.assignedUsers.filter(id => id !== userId)
      : [...selectedCategory.assignedUsers, userId];

    try {
      await updateUserCategory(selectedCategory.id, { assignedUsers: updatedUsers });
      setSelectedCategory({ ...selectedCategory, assignedUsers: updatedUsers });
    } catch (error) {
      console.error('Error updating user assignment:', error);
    }
  };

  const openEditModal = (category: UserCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
    setShowEditModal(true);
  };

  const openAssignModal = (category: UserCategory) => {
    setSelectedCategory(category);
    setShowAssignModal(true);
  };

  const getAssignedUsersNames = (userIds: number[]) => {
    return userIds
      .map(id => state.users.find(user => user.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'No users assigned';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-deep-charcoal dark:text-pure-white flex items-center gap-2 sm:gap-3">
            <Tags className="w-6 h-6 sm:w-8 sm:h-8 text-brand-gold flex-shrink-0" />
            <span className="truncate">Categories Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create and manage user categories
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-accent-gold text-pure-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            Create Category
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent bg-white dark:bg-gray-800 text-deep-charcoal dark:text-pure-white"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="font-semibold text-deep-charcoal dark:text-pure-white text-sm sm:text-base truncate">
                  {category.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {canEdit && (
                  <>
                    <button
                      onClick={() => openAssignModal(category)}
                      className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Assign Users"
                    >
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Assigned Users:</p>
              <p className="text-xs sm:text-sm text-deep-charcoal dark:text-pure-white line-clamp-2">
                {getAssignedUsersNames(category.assignedUsers)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                {category.assignedUsers.length} user(s) assigned
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Tags className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No categories found
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first category to get started.'}
          </p>
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-pure-white">
                Create New Category
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent bg-white dark:bg-gray-700 text-deep-charcoal dark:text-pure-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent bg-white dark:bg-gray-700 text-deep-charcoal dark:text-pure-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-8 sm:h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-brand-gold hover:bg-accent-gold text-pure-white rounded-lg transition-colors"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-pure-white">
                Edit Category
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCategory} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent bg-white dark:bg-gray-700 text-deep-charcoal dark:text-pure-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent bg-white dark:bg-gray-700 text-deep-charcoal dark:text-pure-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-8 sm:h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                    resetForm();
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-brand-gold hover:bg-accent-gold text-pure-white rounded-lg transition-colors"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Users Modal */}
      {showAssignModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-pure-white truncate">
                Assign Users to {selectedCategory.name}
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCategory(null);
                }}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto flex-1">
              {state.users.map((user) => {
                const isAssigned = selectedCategory.assignedUsers.includes(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-gold rounded-full flex items-center justify-center text-pure-white text-xs sm:text-sm font-medium flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-deep-charcoal dark:text-pure-white text-xs sm:text-sm truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.designation} • {user.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignUser(user.id)}
                      className={`p-1 rounded transition-colors flex-shrink-0 ${
                        isAssigned
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-green-600 hover:text-green-700'
                      }`}
                      title={isAssigned ? 'Remove from category' : 'Add to category'}
                    >
                      {isAssigned ? <UserMinus className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCategory(null);
                }}
                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm bg-brand-gold hover:bg-accent-gold text-pure-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}