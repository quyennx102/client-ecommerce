import React, { useState, useEffect, useRef } from 'react';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';
import sweetAlert from '../../utils/sweetAlert';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [pagination, setPagination] = useState({});
  
  // Image upload states
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  // Handle icon file selection
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF, WebP, SVG)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Image size should not exceed 2MB');
      return;
    }

    setSelectedIcon(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Clear icon selection
  const clearIconSelection = () => {
    setSelectedIcon(null);
    setIconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.category_name) {
      toast.error('Please fill in category name');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('category_name', formData.category_name);
      submitData.append('description', formData.description || '');
      submitData.append('display_order', formData.display_order);
      submitData.append('status', formData.status);
      
      if (formData.parent_id) {
        submitData.append('parent_id', formData.parent_id);
      }

      // Append icon file if selected
      if (selectedIcon) {
        submitData.append('icon', selectedIcon);
      }

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.category_id, submitData);
      } else {
        await categoryService.createCategory(submitData);
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

    // Set existing icon preview
    if (category.icon_url) {
      setIconPreview(`${process.env.REACT_APP_IMAGE_URL}${category.icon_url}`);
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    const result = await sweetAlert.confirmDelete(name);
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await categoryService.deleteCategory(id, false);
      await fetchCategories(searchTerm);
      toast.success('Category deleted successfully');
    } catch (err) {
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
    clearIconSelection();
  };

  if (loading && categories.length === 0) {
    return (
      <section className="cart py-80">
        <div className="container container-lg">
          <div className="text-center">
            <div className="spinner-border text-main-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-gray-600 mt-16">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && categories.length === 0) {
    return (
      <section className="cart py-80">
        <div className="container container-lg">
          <div className="alert alert-danger" role="alert">
            <p className="mb-8">Error: {error}</p>
            <button
              onClick={() => fetchCategories()}
              className="btn btn-main py-8 px-16 rounded-8"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart py-80">
      <div className="container container-lg">
        {/* Header */}
        <div className="flex-between flex-wrap gap-16 mb-40">
          <h4 className="mb-0">Category Management</h4>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-main py-18 px-40 rounded-8"
          >
            <i className="ph ph-plus me-8"></i>
            Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="border border-gray-100 rounded-8 px-24 py-24 mb-40">
          <div className="position-relative">
            <input
              type="text"
              placeholder="Search categories..."
              className="common-input common-input--lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ph ph-magnifying-glass position-absolute top-50 translate-middle-y end-0 me-16 text-gray-500"></i>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="border border-gray-100 rounded-8 p-80 text-center">
            <i className="ph ph-package text-gray-400 mb-16" style={{ fontSize: '64px' }}></i>
            <p className="text-gray-600 mb-24">No categories found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-main py-18 px-40 rounded-8"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="row g-24 mb-40">
            {categories.map((category) => (
              <div key={category.category_id} className="col-xxl-3 col-lg-4 col-sm-6">
                <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                  {/* Image Section */}
                  <div
                    className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative mb-16 overflow-hidden"
                    style={{ height: '200px' }}
                  >
                    {/* Status Badge */}
                    <span
                      className={`product-card__badge position-absolute top-8 start-8 px-10 py-4 text-xs fw-medium rounded-4 ${category.status === 'active'
                        ? 'bg-success-600 text-white'
                        : 'bg-gray-400 text-white'
                        }`}
                    >
                      {category.status}
                    </span>

                    {category.icon_url ? (
                      <img
                        src={`${process.env.REACT_APP_IMAGE_URL}${category.icon_url}`}
                        alt={category.category_name}
                        className="w-auto h-auto max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <i
                        className="ph ph-package text-gray-400"
                        style={{ fontSize: '48px' }}
                      ></i>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="product-card__content mt-8">
                    <h6 className="title text-lg fw-semibold mb-4 text-line-2">
                      {category.category_name}
                    </h6>

                    <p className="text-sm text-gray-600 mb-12 text-line-2" style={{ minHeight: '40px' }}>
                      {category.description || 'No description'}
                    </p>

                    <div className="flex-between mb-16">
                      <span className="text-sm text-gray-500">
                        Order: {category.display_order}
                      </span>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <span className="text-sm text-main-600 fw-medium">
                          {category.subcategories.length} subs
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-align gap-8">
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-8 px-16 rounded-8 flex-center gap-8 fw-medium flex-grow-1"
                      >
                        <i className="ph ph-pencil-simple"></i> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(category.category_id, category.category_name)}
                        className="btn bg-danger-50 text-danger-600 hover-bg-danger-600 hover-text-white py-8 px-16 rounded-8 flex-center gap-8 fw-medium flex-grow-1"
                      >
                        <i className="ph ph-trash"></i> Delete
                      </button>
                    </div>
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
      </div>

      {/* Modal with Icon Upload */}
      {isModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetForm}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-24">
                  {/* Category Icon Upload */}
                  <div className="col-12">
                    <label className="form-label">Category Icon</label>
                    <div className="icon-upload-wrapper">
                      {/* Preview Area */}
                      <div className="icon-preview-container mb-16 p-24 border border-gray-200 rounded-8 bg-gray-50">
                        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '150px' }}>
                          {iconPreview ? (
                            <div className="position-relative">
                              <img
                                src={iconPreview}
                                alt="Category icon preview"
                                className="img-fluid rounded-8"
                                style={{ maxHeight: '150px', maxWidth: '200px', objectFit: 'contain' }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                                style={{ width: '32px', height: '32px', padding: 0 }}
                                onClick={clearIconSelection}
                                title="Remove icon"
                              >
                                <i className="ph ph-x"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500">
                              <i className="ph ph-image" style={{ fontSize: '48px' }}></i>
                              <p className="mt-8 mb-0">No icon selected</p>
                              <small className="text-gray-400">JPG, PNG, GIF, WebP, SVG (Max 2MB)</small>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload Button */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="d-none"
                        id="categoryIconInput"
                      />
                      <label
                        htmlFor="categoryIconInput"
                        className="btn btn-outline-main w-100 py-12"
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="ph ph-upload-simple me-8"></i>
                        {iconPreview ? 'Change Icon' : 'Upload Icon'}
                      </label>

                      {/* Info Text */}
                      <div className="mt-12">
                        <small className="text-gray-600">
                          <i className="ph ph-info me-4"></i>
                          Recommended size: 200x200px. Max file size: 2MB
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Category Name */}
                  <div className="col-12">
                    <label className="form-label">Category Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="common-input"
                      value={formData.category_name}
                      onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="common-input"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter category description"
                    />
                  </div>

                  {/* Parent Category */}
                  <div className="col-md-6">
                    <label className="form-label">Parent Category</label>
                    <select
                      className="common-input"
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

                  {/* Display Order */}
                  <div className="col-md-3">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="common-input"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select
                      className="common-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary py-18 px-40 rounded-8"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-main py-18 px-40 rounded-8"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-8"></span>
                      Saving...
                    </>
                  ) : (
                    editingCategory ? 'Update Category' : 'Add Category'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryManagement;