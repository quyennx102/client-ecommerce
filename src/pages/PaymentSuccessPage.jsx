import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import paymentService from '../services/paymentService';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        // Get order_id from URL params
        const orderId = searchParams.get('orderId') || searchParams.get('order_id');
        const paymentMethod = searchParams.get('payment_method') || 'momo';

        if (!orderId) {
            navigate('/');
            return;
        }

        try {
            const response = await paymentService.checkPaymentStatus(orderId, paymentMethod);
            if (response.success) {
                setPaymentStatus(response.data);
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
        } finally {
            setChecking(false);
        }
    };

    if (checking) {
        return (
            <section className="py-80">
                <div className="container">
                    <div className="text-center">
                        <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-16">Verifying payment...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-80">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="text-center">
                            <div className="mb-32">
                                <i className="ph-fill ph-check-circle text-success-600" style={{ fontSize: '80px' }}></i>
                            </div>
                            <h3 className="mb-16">Payment Successful!</h3>
                            <p className="text-gray-600 mb-32">
                                Thank you for your purchase. Your order has been confirmed.
                            </p>
                            
                            {paymentStatus && (
                                <div className="bg-gray-50 rounded-8 p-24 mb-32 text-start">
                                    <div className="mb-16">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="fw-semibold ms-8">#{paymentStatus.order.order_id}</span>
                                    </div>
                                    <div className="mb-16">
                                        <span className="text-gray-600">Amount Paid:</span>
                                        <span className="fw-semibold ms-8">${paymentStatus.order.final_amount}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="fw-semibold ms-8 text-uppercase">
                                            {paymentStatus.transaction.payment_method}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="d-flex gap-16 justify-content-center">
                                <Link to="/orders/my-orders" className="btn btn-main px-40">
                                    View Orders
                                </Link>
                                <Link to="/" className="btn btn-outline-main px-40">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentSuccessPage;