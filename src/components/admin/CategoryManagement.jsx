import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, ChevronRight, Package, 
  Star, ShoppingCart, Heart, Share2, Tag, Grid, List,
  ChevronLeft, Check, X, Eye, Filter, TrendingUp, Loader
} from 'lucide-react';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

// ==================== CATEGORY MANAGEMENT ====================

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [pagination, setPagination] = useState({});
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    parent_id: null,
    display_order: 0,
    status: 'active'
  });

  // Fetch categories
  const fetchCategories = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: 1,
        limit: 50,
        status: 'active'
      };
      if (search) params.search = search;

      const result = await categoryService.getCategories(params);
      setCategories(result.data || []);
      setPagination(result.pagination || {});
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSubmit = async () => {
    if (!formData.category_name) {
       toast.error('Please fill in category name');
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.category_id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      
      await fetchCategories(searchTerm);
      resetForm();
       toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
    } catch (err) {
       toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      description: category.description || '',
      parent_id: category.parent_id,
      display_order: category.display_order || 0,
      status: category.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setLoading(true);
      await categoryService.deleteCategory(id, false);
      await fetchCategories(searchTerm);
       toast.success('Category deleted successfully');
    } catch (err) {
      // Nếu có products, hỏi có muốn force delete không
      if (err.message.includes('products')) {
        const forceDelete = window.confirm(
          'This category has products. Do you want to move them to Uncategorized and delete?'
        );
        if (forceDelete) {
          try {
            await categoryService.deleteCategory(id, true);
            await fetchCategories(searchTerm);
             toast.success('Category deleted successfully');
          } catch (err2) {
             toast.error(`Error: ${err2.message}`);
          }
        }
      } else {
         toast.error(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category_name: '',
      description: '',
      parent_id: null,
      display_order: 0,
      status: 'active'
    });
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={() => fetchCategories()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No categories found</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {categories.map(category => (
            <div key={category.category_id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
              <div className="relative h-40 rounded-t-xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                {category.icon_url ? (
                  <img
                    src={category.icon_url}
                    alt={category.category_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    category.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{category.category_name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description || 'No description'}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    Order: {category.display_order}
                  </span>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <span className="text-sm text-blue-600">
                      {category.subcategories.length} subs
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.category_id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {pagination.total_pages > 1 && (
        <div className="text-center text-gray-600">
          Page {pagination.current_page} of {pagination.total_pages} 
          ({pagination.total_items} total items)
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Parent Category</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter(cat => !cat.parent_id && cat.category_id !== editingCategory?.category_id).map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;