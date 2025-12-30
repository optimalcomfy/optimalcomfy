import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const WaitingForCallback = ({ amount, repayment = null }) => {
    const [status, setStatus] = useState('processing');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentRepayment, setCurrentRepayment] = useState(repayment);

    // Function to check repayment status
    const checkRepaymentStatus = async () => {
        if (!currentRepayment) return;
        
        try {
            const response = await fetch(route('repayment.status', { repayment: currentRepayment.id }), {
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('Failed to check status');
            
            const data = await response.json();
            setCurrentRepayment(data.repayment);
            
            if (data.status === 'Approved') {
                setStatus('success');
            } else if (data.status === 'Failed') {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Error checking repayment status:', error);
        }
    };

    // Poll for status updates
    useEffect(() => {
        // Initial check
        if (currentRepayment) {
            checkRepaymentStatus();
        }

        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
            
            if (currentRepayment && status === 'processing') {
                checkRepaymentStatus();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [currentRepayment, status]);

    // Initialize status based on initial repayment data
    useEffect(() => {
        if (currentRepayment) {
            if (currentRepayment.status === 'Approved') {
                setStatus('success');
            } else if (currentRepayment.status === 'Failed') {
                setStatus('failed');
            }
        }
    }, [currentRepayment]);

    const handleRetry = () => {
        router.visit(route('wallet'));
    };

    const handleBackToWallet = () => {
        router.visit(route('wallet'));
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    {status === 'processing' && (
                        <>
                            <div className="flex justify-center mb-6">
                                <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                Processing Your Withdrawal
                            </h1>
                            <p className="text-gray-600 mb-6">
                                We're processing your withdrawal of <strong>KES {parseFloat(amount).toLocaleString()}</strong>.
                                This may take a few moments.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center text-sm text-gray-500">
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing... {elapsedTime}s
                                </div>
                                <div className="text-xs text-gray-400">
                                    Please don't close this window
                                </div>
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="flex justify-center mb-6">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                Withdrawal Successful!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Your withdrawal of <strong>KES {parseFloat(amount).toLocaleString()}</strong> has been processed successfully.
                                The funds should reflect in your account shortly.
                            </p>
                            <button
                                onClick={handleBackToWallet}
                                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Back to Wallet
                            </button>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="flex justify-center mb-6">
                                <XCircle className="h-16 w-16 text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                Withdrawal Failed
                            </h1>
                            <p className="text-gray-600 mb-6">
                                We encountered an issue processing your withdrawal of <strong>KES {parseFloat(amount).toLocaleString()}</strong>.
                                Please try again or contact support if the problem persists.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleRetry}
                                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={handleBackToWallet}
                                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Back to Wallet
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default WaitingForCallback;