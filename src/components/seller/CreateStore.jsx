import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import storeService from '../../services/storeService';

const CreateStore = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    address: ''
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.store_name) {
      toast.error('Store name is required');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('store_name', formData.store_name);
      data.append('description', formData.description);
      data.append('address', formData.address);
      
      if (logo) data.append('logo', logo);
      if (banner) data.append('banner', banner);

      const response = await storeService.createStore(data);

      if (response.success) {
        toast.success('Store created successfully! Waiting for admin approval.');
        setTimeout(() => {
          navigate('/seller/stores');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="row">
          <div className="col-12">
            <div className="border border-gray-100 rounded-16 px-24 py-40">
              <div className="mb-32">
                <h4 className="mb-8">Create Your Store</h4>
                <p className="text-gray-500">
                  Fill in the information below to create your online store
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Store Name */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Store Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="common-input"
                    name="store_name"
                    placeholder="Enter your store name"
                    value={formData.store_name}
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
                    rows="4"
                    placeholder="Describe your store..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Address */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Address
                  </label>
                  <input
                    type="text"
                    className="common-input"
                    name="address"
                    placeholder="Enter store address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                {/* Logo Upload */}
                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Store Logo
                  </label>
                  <div className="upload-image-wrapper">
                    <div className="upload-file">
                      <input
                        type="file"
                        className="upload-file__input"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <div className="upload-file__content text-center">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="mb-16"
                            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <>
                            <span className="upload-file__icon d-inline-block mb-16">
                              <i className="ph ph-upload-simple text-main-600" style={{ fontSize: '48px' }}></i>
                            </span>
                            <p className="text-gray-600 mb-0">
                              Click to upload store logo
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="mb-32">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    Store Banner
                  </label>
                  <div className="upload-image-wrapper">
                    <div className="upload-file">
                      <input
                        type="file"
                        className="upload-file__input"
                        accept="image/*"
                        onChange={handleBannerChange}
                      />
                      <div className="upload-file__content text-center">
                        {bannerPreview ? (
                          <img
                            src={bannerPreview}
                            alt="Banner preview"
                            className="mb-16"
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                          />
                        ) : (
                          <>
                            <span className="upload-file__icon d-inline-block mb-16">
                              <i className="ph ph-image text-main-600" style={{ fontSize: '48px' }}></i>
                            </span>
                            <p className="text-gray-600 mb-0">
                              Click to upload store banner (Recommended: 1200x400px)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex-align gap-16">
                  <button
                    type="submit"
                    className="btn btn-main py-18 px-40"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Store'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-main py-18 px-40"
                    onClick={() => navigate('/seller/stores')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateStore;