import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import paymentService from '../services/paymentService';
export const PaymentFailurePage = () => {
    const navigate = useNavigate();

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
                            <p className="text-gray-600 mb-32">
                                Your payment could not be processed. Please try again.
                            </p>

                            <div className="d-flex gap-16 justify-content-center">
                                <button 
                                    onClick={() => navigate('/checkout')} 
                                    className="btn btn-main px-40"
                                >
                                    Try Again
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