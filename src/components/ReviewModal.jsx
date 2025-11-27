import React, { useState } from 'react';
import { toast } from 'react-toastify';
import reviewService from '../services/reviewService';

const ReviewModal = ({ show, onClose, product, orderId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      toast.warning('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      const reviewData = {
        product_id: product.product_id,
        order_id: orderId,
        rating,
        comment,
        images
      };

      const response = await reviewService.createReview(reviewData);

      if (response.success) {
        toast.success('Review submitted successfully!');
        onReviewSubmitted?.();
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setImages([]);
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Write a Review</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              disabled={submitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Product Info */}
              <div className="d-flex align-items-center gap-16 mb-24 p-16 bg-gray-50 rounded-8">
                {product.image_url && (
                  <img
                    src={`${process.env.REACT_APP_IMAGE_URL}${product.image_url}`}
                    alt={product.product_name}
                    className="rounded-8"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <h6 className="mb-4">{product.product_name}</h6>
                  <p className="text-gray-600 text-sm mb-0">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-24">
                <label className="form-label fw-semibold">Rating *</label>
                <div className="d-flex align-items-center gap-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`ph-fill ph-star cursor-pointer ${
                        star <= (hoverRating || rating) 
                          ? 'text-warning' 
                          : 'text-gray-300'
                      }`}
                      style={{ fontSize: '32px', cursor: 'pointer' }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    ></i>
                  ))}
                  <span className="text-gray-600 ms-8">
                    {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-24">
                <label className="form-label fw-semibold">Your Review</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <small className="text-gray-500">
                  Optional: Tell us what you liked or didn't like
                </small>
              </div>

              {/* Image Upload */}
              <div className="mb-24">
                <label className="form-label fw-semibold">Add Photos (Optional)</label>
                <div className="mb-16">
                  <input
                    type="file"
                    id="review-images"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={images.length >= 5}
                  />
                  <small className="text-gray-500">
                    Maximum 5 images. Supported formats: JPG, PNG
                  </small>
                </div>

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="row g-8">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="col-3">
                        <div className="position-relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-100 rounded-8"
                            style={{ height: '100px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                            style={{ padding: '2px 8px' }}
                            onClick={() => removeImage(index)}
                          >
                            <i className="ph ph-x" style={{color: "#fff"}}></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-main"
                disabled={submitting || rating === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-8"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ph ph-paper-plane-right me-8"></i>
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;