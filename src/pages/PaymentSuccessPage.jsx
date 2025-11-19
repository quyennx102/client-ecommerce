import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/paymentService';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchCartCount } = useAuth();
    const [checking, setChecking] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        const orderId = searchParams.get('orderId');
        const paymentMethod = searchParams.get('payment_method');
        const transId = searchParams.get('transId');
        const apptransid = searchParams.get('apptransid');
        if (!orderId || !paymentMethod) {
            navigate('/');
            return;
        }

        try {
            // Update cart count
            await fetchCartCount();

            const response = await paymentService.checkPaymentStatus(orderId, paymentMethod);
            if (response.success) {
                setPaymentStatus({
                    ...response.data,
                    transId,
                    apptransid
                });
            } else {
                setError('Failed to verify payment');
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            setError(error.response?.data?.message || 'Payment verification failed');
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

    if (error) {
        return (
            <section className="py-80">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="text-center">
                                <i className="ph-fill ph-warning-circle text-warning-600" style={{ fontSize: '80px' }}></i>
                                <h3 className="mt-24 mb-16">Verification Error</h3>
                                <p className="text-gray-600 mb-32">{error}</p>
                                <Link to="/" className="btn btn-main px-40">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
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
                                        <span className="fw-semibold ms-8">
                                            ${parseFloat(paymentStatus.order.final_amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="mb-16">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="fw-semibold ms-8 text-uppercase">
                                            {paymentStatus.transaction.payment_method}
                                        </span>
                                    </div>
                                    {paymentStatus.transId && (
                                        <div className="mb-16">
                                            <span className="text-gray-600">Transaction ID:</span>
                                            <span className="fw-semibold ms-8 text-sm">
                                                {paymentStatus.transId}
                                            </span>
                                        </div>
                                    )}
                                    {paymentStatus.apptransid && (
                                        <div>
                                            <span className="text-gray-600">App Transaction ID:</span>
                                            <span className="fw-semibold ms-8 text-sm">
                                                {paymentStatus.apptransid}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="d-flex gap-16 justify-content-center flex-wrap">
                                <Link 
                                    to={`/orders/${searchParams.get('orderId')}`} 
                                    className="btn btn-main px-40"
                                >
                                    View Order Details
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