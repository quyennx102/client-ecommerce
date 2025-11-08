import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';

const CreateProduct = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    store_id: storeId,
    category_id: '',
    product_name: '',
    description: '',
    price: '',
    stock_quantity: ''
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories({ status: 'active' });
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.warning('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id || !formData.product_name || !formData.price || !formData.stock_quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      images.forEach(image => {
        data.append('images', image);
      });

      const response = await productService.createProduct(data);

      if (response.success) {
        toast.success('Product created successfully!');
        setTimeout(() => {
          navigate(`/seller/stores/${storeId}/products`);
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="border border-gray-100 rounded-16 px-24 py-40">
          <h4 className="mb-32">Add New Product</h4>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Left Column */}
              <div className="col-lg-8">
                {/* Product Name */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="common-input"
                    name="product_name"
                    placeholder="Enter product name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Description
                  </label>
                  <textarea
                    className="common-input"
                    name="description"
                    rows="6"
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Images */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Product Images <span className="text-danger">*</span>
                    <span className="text-sm text-gray-500 ms-8">(Max 5 images)</span>
                  </label>
                  
                  {imagePreviews.length > 0 && (
                    <div className="row g-3 mb-16">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="col-4 col-md-3">
                          <div className="position-relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-100 rounded-8"
                              style={{ height: '150px', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-8"
                              onClick={() => removeImage(index)}
                              style={{ padding: '4px 8px' }}
                            >
                              <i className="ph ph-x"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length < 5 && (
                    <div className="upload-file">
                      <input
                        type="file"
                        className="upload-file__input"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                      <div className="upload-file__content text-center">
                        <span className="upload-file__icon d-inline-block mb-16">
                          <i className="ph ph-images text-main-600" style={{ fontSize: '48px' }}></i>
                        </span>
                        <p className="text-gray-600 mb-0">
                          Click to upload product images
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                {/* Category */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="common-input"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Price <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="common-input"
                    name="price"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Stock */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Stock Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="common-input"
                    name="stock_quantity"
                    placeholder="0"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                {/* Submit Buttons */}
                <div className="mt-32">
                  <button
                    type="submit"
                    className="btn btn-main w-100 py-18 mb-16"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Product'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-main w-100 py-18"
                    onClick={() => navigate(`/seller/stores/${storeId}/products`)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateProduct;