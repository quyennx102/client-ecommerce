import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/paymentService';
export const PaymentFailurePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const reason = searchParams.get('reason');

    const getReasonMessage = () => {
        switch (reason) {
            case 'invalid_signature':
                return 'Invalid payment signature. Please try again.';
            case 'missing_transaction':
                return 'Transaction information is missing.';
            case 'payment_failed':
                return 'Payment was not completed successfully.';
            case 'user_cancelled':
                return 'You have cancelled the payment.';
            default:
                return 'Payment could not be processed. Please try again.';
        }
    };

    return (
        <section className="py-80">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="text-center">
                            <div className="mb-32">
                                <i className="ph-fill ph-x-circle text-danger-600" style={{ fontSize: '80px' }}></i>
                            </div>
                            <h3 className="mb-16">Payment Failed</h3>
                            <p className="text-gray-600 mb-16">
                                {getReasonMessage()}
                            </p>
                            {orderId && (
                                <p className="text-gray-500 text-sm mb-32">
                                    Order ID: #{orderId}
                                </p>
                            )}

                            <div className="d-flex gap-16 justify-content-center flex-wrap">
                                {orderId && (
                                    <Link 
                                        to={`/orders/${orderId}`} 
                                        className="btn btn-main px-40"
                                    >
                                        View Order
                                    </Link>
                                )}
                                <button 
                                    onClick={() => navigate('/cart')} 
                                    className="btn btn-outline-main px-40"
                                >
                                    Back to Cart
                                </button>
                                <Link to="/" className="btn btn-outline-main px-40">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};