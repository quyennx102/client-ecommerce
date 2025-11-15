import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProductCard from '../product/ProductCard'; // Import card
import productService from '../../services/productService'; // Import service

// Component này dùng để hiển thị 1 ô loading
const ProductCardLoader = () => (
    <div className="product-card">
        <div className="product-card__image-wrapper" style={{ backgroundColor: '#f0f0f0', height: '250px' }}></div>
        <div className="product-card__content">
            <div style={{ height: '14px', width: '40%', backgroundColor: '#f0f0f0', marginBottom: '8px' }}></div>
            <div style={{ height: '20px', width: '80%', backgroundColor: '#f0f0f0', marginBottom: '8px' }}></div>
            <div style={{ height: '20px', width: '30%', backgroundColor: '#f0f0f0' }}></div>
        </div>
    </div>
);

/**
 * Component hiển thị một khu vực sản phẩm
 * @param {object} props
 * @param {string} props.title - Tiêu đề (e.g., "Top Selling")
 * @param {function} props.fetchMethod - Hàm API để gọi (e.g., productService.getTopSellingProducts)
 */
const ProductSection = ({ title, fetchMethod }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await fetchMethod(); // Gọi hàm API được truyền vào
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error(`Failed to fetch ${title}:`, error);
                toast.error(`Could not load ${title}`);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [title, fetchMethod]); // Chạy lại khi props thay đổi

    return (
        <section className="py-80"> {/* Hoặc padding bạn muốn */}
            <div className="container">
                <div className="mb-48 text-center">
                    <h2 className="section-title">{title}</h2>
                    <p className="section-subtitle">Check out our most {title.toLowerCase()} items</p>
                </div>

                <div className="row g-4">
                    {loading ? (
                        // Hiển thị 4 ô loading
                        Array.from({ length: 4 }).map((_, index) => (
                            <div className="col-lg-3 col-md-6" key={index}>
                                <ProductCardLoader />
                            </div>
                        ))
                    ) : products.length === 0 ? (
                        <div className="col-12">
                            <p className="text-center text-muted">No products found in this section.</p>
                        </div>
                    ) : (
                        // Hiển thị sản phẩm
                        products.map(product => (
                            <div className="col-lg-3 col-md-6" key={product.product_id}>
                                <ProductCard product={product} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductSection;