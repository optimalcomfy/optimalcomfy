import React, { useState, useEffect } from 'react';
import { Link, useForm, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import {
  CreditCard,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  ArrowDownToLine,
  Wallet as WalletIcon,
  RefreshCw,
  Home,
  Car,
  TrendingUp as TrendingIcon,
  Users,
  Filter,
  Download
} from 'lucide-react';
import Swal from "sweetalert2";

const Wallet = ({ user }) => {
    const {
      flash,
      summary,
      breakdown,
      transactions,
      totalTransactions,
      carsCount,
      propertiesCount,
      isAdmin,
      platform_percentage,
      host_percentage,
      referral_percentage,
      auth
    } = usePage().props;

    const [balanceVisible, setBalanceVisible] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);

    const roleId = parseInt(auth.user?.role_id);

    // Filter transactions based on active filter
    useEffect(() => {
      if (activeFilter === 'all') {
        setFilteredTransactions(transactions);
      } else {
        setFilteredTransactions(
          transactions.filter(tx => tx.type === activeFilter || tx.subtype === activeFilter)
        );
      }
    }, [activeFilter, transactions]);

    const toggleBalanceVisibility = () => {
        setBalanceVisible(!balanceVisible);
    };

    const handleWithdraw = () => {
        setShowWithdrawModal(true);
        setVerificationStep(false);
        setVerificationCode('');
        setWithdrawAmount('');
    };

    // Initiate withdrawal
    const initiateWithdrawal = () => {
        const amount = parseFloat(withdrawAmount);

        // Check if amount is less than 100 shillings
        if (amount < 100) {
            Swal.fire('Error', 'Minimum withdrawal amount is 100 shillings', 'error');
            return;
        }

        if (!withdrawAmount || amount <= 0 || amount > summary.availableBalance) {
            Swal.fire('Error', 'Please enter a valid amount', 'error');
            return;
        }

        setIsProcessing(true);

        router.post(route('withdraw.initiate'),
            { amount: withdrawAmount },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    if (page.props.flash?.success) {
                        setVerificationStep(true);
                        startResendTimer();
                        Swal.fire('Code Sent!', page.props.flash.success, 'success');
                    }
                },
                onError: (errors) => {
                    Swal.fire('Error', errors.message || 'Failed to initiate withdrawal', 'error');
                },
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    // Verify and withdraw
    const verifyAndWithdraw = () => {
        if (!verificationCode || verificationCode.length !== 6) {
            Swal.fire('Error', 'Please enter a valid 6-digit code', 'error');
            return;
        }

        setIsProcessing(true);

        router.post(route('withdraw'),
            { amount: withdrawAmount, verification_code: verificationCode },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Handled in router callback
                },
                onError: (errors) => {
                    Swal.fire('Error', errors.message || 'Failed to process withdrawal', 'error');
                    setIsProcessing(false);
                }
            }
        );
    };

    // Resend verification code
    const resendVerificationCode = () => {
        if (resendTimer > 0) return;

        setIsResending(true);

        router.post(route('withdraw.resend-code'), {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.flash?.success) {
                    startResendTimer();
                    Swal.fire('Code Sent!', page.props.flash.success, 'success');
                }
            },
            onError: (errors) => {
                Swal.fire('Error', errors.message || 'Failed to resend code', 'error');
            },
            onFinish: () => setIsResending(false),
        });
    };

    // Export earnings report
    const exportEarningsReport = () => {
        Swal.fire({
            title: 'Export Earnings Report',
            text: 'Select date range and type to export',
            input: 'select',
            inputOptions: {
                'all': 'All Earnings',
                'direct_property': 'Direct Property Earnings',
                'direct_car': 'Direct Car Earnings',
                'markup_property': 'Markup Property Earnings',
                'markup_car': 'Markup Car Earnings',
                'referral': 'Referral Earnings'
            },
            inputPlaceholder: 'Select type',
            showCancelButton: true,
            confirmButtonText: 'Export',
            showLoaderOnConfirm: true,
            preConfirm: (type) => {
                const startDate = prompt('Start Date (YYYY-MM-DD):', '2025-01-01');
                const endDate = prompt('End Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);

                if (!startDate || !endDate) {
                    Swal.showValidationMessage('Please enter both dates');
                    return false;
                }

                return router.get(route('wallet.earnings-report'), {
                    start_date: startDate,
                    end_date: endDate,
                    type: type
                }, {
                    preserveScroll: true,
                    onSuccess: (response) => {
                        const data = response.props.data;
                        const csvContent = convertToCSV(data);
                        downloadCSV(csvContent, `earnings_report_${type}_${startDate}_to_${endDate}.csv`);
                    }
                });
            }
        });
    };

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header =>
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ];

        return csvRows.join('\n');
    };

    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const startResendTimer = () => {
        setResendTimer(120); // 2 minutes
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'KES 0';
        if (typeof amount === 'string') {
            amount = parseFloat(amount);
        }
        if (isNaN(amount)) return 'KES 0';

        return balanceVisible
            ? `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
            : '••••••';
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type) => {
        switch(type) {
            case 'property_booking':
            case 'property_markup':
                return <Home size={16} />;
            case 'car_booking':
            case 'car_markup':
                return <Car size={16} />;
            case 'referral':
                return <Users size={16} />;
            default:
                return <DollarSign size={16} />;
        }
    };

    const getTransactionColor = (type) => {
        switch(type) {
            case 'property_booking':
                return 'bg-green-100 text-green-800';
            case 'car_booking':
                return 'bg-blue-100 text-blue-800';
            case 'property_markup':
            case 'car_markup':
                return 'bg-purple-100 text-purple-800';
            case 'referral':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'available':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout>
            <div className="wallet-container">
                <div className='wallet-content'>
                    <div className='wallet-inner'>
                        {/* Header Section */}
                        <div className="wallet-header">
                            <div className="header-content">
                                <WalletIcon size={28} className="header-icon" />
                                <div>
                                    <h1 className="wallet-title">
                                        Your Earnings Dashboard
                                    </h1>
                                    {isAdmin && (
                                        <div className="admin-badge">
                                            Admin View
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="wallet-subtitle">
                                Track your earnings, manage withdrawals, and monitor your financial activity
                            </p>
                            <div className="commission-info">
                                <div className="commission-item">
                                    <span className="commission-label">Platform Fee:</span>
                                    <span className="commission-value">{platform_percentage}%</span>
                                </div>
                                <div className="commission-item">
                                    <span className="commission-label">Your Share:</span>
                                    <span className="commission-value">{host_percentage}%</span>
                                </div>
                                <div className="commission-item">
                                    <span className="commission-label">Referral Commission:</span>
                                    <span className="commission-value">{referral_percentage}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="summary-cards-grid">
                            {/* Available Balance */}
                            <div className="summary-card available-balance">
                                <div className="summary-card-header">
                                    <div className="icon-wrapper">
                                        <CreditCard size={24} />
                                    </div>
                                    <button
                                        onClick={toggleBalanceVisibility}
                                        className="balance-visibility-toggle"
                                        title={balanceVisible ? "Hide balance" : "Show balance"}
                                    >
                                        {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <h3 className="summary-card-label">
                                    Available Balance
                                </h3>
                                <div className="summary-amount">
                                    {formatCurrency(summary.availableBalance)}
                                </div>
                                <div className="summary-subtext">
                                    Ready for immediate withdrawal
                                </div>
                                <button
                                    onClick={handleWithdraw}
                                    className="withdraw-button"
                                    disabled={summary.availableBalance < 100}
                                >
                                    <ArrowDownToLine size={16} />
                                    Withdraw Now
                                </button>
                            </div>

                            {/* Total Earnings */}
                            <div className="summary-card total-earnings">
                                <div className="summary-card-header">
                                    <div className="icon-wrapper">
                                        <TrendingUp size={24} />
                                    </div>
                                </div>
                                <h3 className="summary-card-label">
                                    Total Earnings
                                </h3>
                                <div className="summary-amount">
                                    {formatCurrency(summary.totalEarnings)}
                                </div>
                                <div className="summary-subtext">
                                    All-time combined earnings
                                </div>
                            </div>

                            {/* Pending Payouts */}
                            <div className="summary-card pending-payouts">
                                <div className="summary-card-header">
                                    <div className="icon-wrapper">
                                        <Clock size={24} />
                                    </div>
                                </div>
                                <h3 className="summary-card-label">
                                    Processing Payouts
                                </h3>
                                <div className="summary-amount">
                                    {formatCurrency(summary.pendingPayouts)}
                                </div>
                                <div className="summary-subtext">
                                    Awaiting guest check-in
                                </div>
                            </div>
                        </div>

                        {/* Earnings Breakdown */}
                        <div className="breakdown-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    Earnings Breakdown
                                </h2>
                                <button
                                    onClick={exportEarningsReport}
                                    className="export-button"
                                >
                                    <Download size={16} />
                                    Export Report
                                </button>
                            </div>

                            <div className="breakdown-grid">
                                {/* Direct Property Earnings */}
                                <div className="breakdown-card">
                                    <div className="breakdown-header">
                                        <div className={`breakdown-icon ${getTransactionColor('property_booking')}`}>
                                            <Home size={20} />
                                        </div>
                                        <h3 className="breakdown-title">
                                            Direct Property
                                        </h3>
                                    </div>
                                    <div className="breakdown-stats">
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Total:</span>
                                            <span className="stat-value">
                                                {formatCurrency(breakdown.direct_property.total)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Available:</span>
                                            <span className="stat-value available">
                                                {formatCurrency(breakdown.direct_property.available)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Pending:</span>
                                            <span className="stat-value pending">
                                                {formatCurrency(breakdown.direct_property.pending)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Direct Car Earnings */}
                                <div className="breakdown-card">
                                    <div className="breakdown-header">
                                        <div className={`breakdown-icon ${getTransactionColor('car_booking')}`}>
                                            <Car size={20} />
                                        </div>
                                        <h3 className="breakdown-title">
                                            Direct Car
                                        </h3>
                                    </div>
                                    <div className="breakdown-stats">
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Total:</span>
                                            <span className="stat-value">
                                                {formatCurrency(breakdown.direct_car.total)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Available:</span>
                                            <span className="stat-value available">
                                                {formatCurrency(breakdown.direct_car.available)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Pending:</span>
                                            <span className="stat-value pending">
                                                {formatCurrency(breakdown.direct_car.pending)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Markup Property Earnings */}
                                <div className="breakdown-card">
                                    <div className="breakdown-header">
                                        <div className={`breakdown-icon ${getTransactionColor('property_markup')}`}>
                                            <TrendingIcon size={20} />
                                        </div>
                                        <h3 className="breakdown-title">
                                            Markup Property
                                        </h3>
                                    </div>
                                    <div className="breakdown-stats">
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Total:</span>
                                            <span className="stat-value">
                                                {formatCurrency(breakdown.markup_property.total)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Available:</span>
                                            <span className="stat-value available">
                                                {formatCurrency(breakdown.markup_property.available)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Pending:</span>
                                            <span className="stat-value pending">
                                                {formatCurrency(breakdown.markup_property.pending)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Markup Car Earnings */}
                                <div className="breakdown-card">
                                    <div className="breakdown-header">
                                        <div className={`breakdown-icon ${getTransactionColor('car_markup')}`}>
                                            <TrendingIcon size={20} />
                                        </div>
                                        <h3 className="breakdown-title">
                                            Markup Car
                                        </h3>
                                    </div>
                                    <div className="breakdown-stats">
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Total:</span>
                                            <span className="stat-value">
                                                {formatCurrency(breakdown.markup_car.total)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Available:</span>
                                            <span className="stat-value available">
                                                {formatCurrency(breakdown.markup_car.available)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Pending:</span>
                                            <span className="stat-value pending">
                                                {formatCurrency(breakdown.markup_car.pending)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Referral Earnings */}
                                <div className="breakdown-card">
                                    <div className="breakdown-header">
                                        <div className={`breakdown-icon ${getTransactionColor('referral')}`}>
                                            <Users size={20} />
                                        </div>
                                        <h3 className="breakdown-title">
                                            Referral Earnings
                                        </h3>
                                    </div>
                                    <div className="breakdown-stats">
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Total:</span>
                                            <span className="stat-value">
                                                {formatCurrency(breakdown.referral.total)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Available:</span>
                                            <span className="stat-value available">
                                                {formatCurrency(breakdown.referral.available)}
                                            </span>
                                        </div>
                                        <div className="breakdown-stat">
                                            <span className="stat-label">Pending:</span>
                                            <span className="stat-value pending">
                                                {formatCurrency(breakdown.referral.pending)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Withdrawal Modal */}
                        {showWithdrawModal && (
                            <div className="modal-overlay">
                                <div className="withdraw-modal">
                                    <div className="modal-header">
                                        <h2 className="modal-title">
                                            {verificationStep ? 'Verify Withdrawal' : 'Withdraw Funds'}
                                        </h2>
                                        <p className="modal-subtitle">
                                            {verificationStep
                                                ? 'Enter the verification code sent to your phone'
                                                : 'Transfer money to your registered account'
                                            }
                                        </p>
                                    </div>

                                    {!verificationStep ? (
                                        <>
                                            <div className="balance-display">
                                                <div className="balance-label">
                                                    Available for Withdrawal
                                                </div>
                                                <div className="balance-amount-modal">
                                                    {formatCurrency(summary.availableBalance)}
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">
                                                    Amount to Withdraw (Minimum KES 100)
                                                </label>
                                                <div className="input-wrapper">
                                                    <span className="currency-prefix">KES</span>
                                                    <input
                                                        type="number"
                                                        value={withdrawAmount}
                                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="amount-input"
                                                        min="100"
                                                        step="0.01"
                                                        max={summary.availableBalance}
                                                    />
                                                </div>
                                                <div className="amount-hint">
                                                    Minimum: KES 100
                                                </div>
                                                {withdrawAmount && parseFloat(withdrawAmount) < 100 && (
                                                    <div className="error-message">
                                                        Minimum withdrawal is KES 100
                                                    </div>
                                                )}
                                                {withdrawAmount && parseFloat(withdrawAmount) > summary.availableBalance && (
                                                    <div className="error-message">
                                                        Amount exceeds available balance
                                                    </div>
                                                )}
                                            </div>

                                            <div className="modal-buttons">
                                                <button
                                                    onClick={() => {
                                                        setShowWithdrawModal(false);
                                                        setWithdrawAmount('');
                                                    }}
                                                    className="cancel-button"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={initiateWithdrawal}
                                                    disabled={
                                                        !withdrawAmount ||
                                                        parseFloat(withdrawAmount) < 100 ||
                                                        parseFloat(withdrawAmount) > summary.availableBalance ||
                                                        isProcessing
                                                    }
                                                    className="confirm-button"
                                                >
                                                    {isProcessing ? 'Sending Code...' : 'Send Verification Code'}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="verification-section">
                                                <div className="verification-info">
                                                    <p>We've sent a 6-digit verification code to your registered phone number ending in {user?.phone?.slice(-4)}</p>
                                                </div>

                                                <div className="input-group">
                                                    <label className="input-label">
                                                        Verification Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={verificationCode}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                            setVerificationCode(value);
                                                        }}
                                                        placeholder="Enter 6-digit code"
                                                        className="verification-input"
                                                        maxLength={6}
                                                    />
                                                </div>

                                                <div className="resend-section">
                                                    <button
                                                        onClick={resendVerificationCode}
                                                        disabled={resendTimer > 0 || isResending}
                                                        className="resend-button"
                                                    >
                                                        {isResending ? (
                                                            <RefreshCw size={16} className="animate-spin" />
                                                        ) : (
                                                            <RefreshCw size={16} />
                                                        )}
                                                        {resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : 'Resend Code'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="modal-buttons">
                                                <button
                                                    onClick={() => setVerificationStep(false)}
                                                    className="cancel-button"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={verifyAndWithdraw}
                                                    disabled={!verificationCode || verificationCode.length !== 6 || isProcessing}
                                                    className="confirm-button"
                                                >
                                                    {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recent Transactions */}
                        <div className="transactions-container">
                            <div className="transactions-section">
                                <div className="section-header">
                                    <div>
                                        <h2 className="section-title">
                                            Recent Transactions
                                        </h2>
                                        <span className="section-count">
                                            {filteredTransactions.length} of {totalTransactions} transactions
                                        </span>
                                    </div>

                                    <div className="filter-buttons">
                                        <button
                                            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                                            onClick={() => setActiveFilter('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`filter-button ${activeFilter === 'property_booking' ? 'active' : ''}`}
                                            onClick={() => setActiveFilter('property_booking')}
                                        >
                                            Direct Property
                                        </button>
                                        <button
                                            className={`filter-button ${activeFilter === 'car_booking' ? 'active' : ''}`}
                                            onClick={() => setActiveFilter('car_booking')}
                                        >
                                            Direct Car
                                        </button>
                                        <button
                                            className={`filter-button ${activeFilter.includes('markup') ? 'active' : ''}`}
                                            onClick={() => setActiveFilter('markup_profit')}
                                        >
                                            Markup
                                        </button>
                                        <button
                                            className={`filter-button ${activeFilter === 'referral' ? 'active' : ''}`}
                                            onClick={() => setActiveFilter('referral')}
                                        >
                                            Referral
                                        </button>
                                    </div>
                                </div>

                                {filteredTransactions.length > 0 ? (
                                    <div className="transactions-list">
                                        {filteredTransactions.map((transaction, index) => (
                                            <div key={index} className="transaction-item">
                                                <div className="transaction-icon">
                                                    {getTransactionIcon(transaction.type)}
                                                </div>
                                                <div className="transaction-details">
                                                    <div className="transaction-header">
                                                        <div className="transaction-title">
                                                            {transaction.title}
                                                        </div>
                                                        <span className={`transaction-type ${getTransactionColor(transaction.type)}`}>
                                                            {transaction.subtype === 'direct_host' ? 'Direct Host' :
                                                             transaction.subtype === 'markup_profit' ? 'Markup Profit' :
                                                             transaction.subtype === 'referral_commission' ? 'Referral' :
                                                             transaction.subtype}
                                                        </span>
                                                    </div>

                                                    <div className="transaction-meta">
                                                        {transaction.booking_number && (
                                                            <span className="meta-item">
                                                                Booking: {transaction.booking_number}
                                                            </span>
                                                        )}
                                                        {transaction.guest && (
                                                            <span className="meta-item">
                                                                Guest: {transaction.guest}
                                                            </span>
                                                        )}
                                                        {transaction.referrer && (
                                                            <span className="meta-item">
                                                                Referrer: {transaction.referrer}
                                                            </span>
                                                        )}
                                                        {transaction.original_host && (
                                                            <span className="meta-item">
                                                                Original Host: {transaction.original_host}
                                                            </span>
                                                        )}
                                                        {transaction.markup_user && (
                                                            <span className="meta-item">
                                                                Markup Added By: {transaction.markup_user}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="transaction-date">
                                                        {formatDate(transaction.date)}
                                                    </div>
                                                </div>
                                                <div className="transaction-amount">
                                                    <div className="amount-value">
                                                        {formatCurrency(transaction.amount)}
                                                    </div>
                                                    <div className={`status-badge ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status === 'available' ? 'Available' :
                                                         transaction.status === 'pending' ? 'Processing' :
                                                         transaction.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <WalletIcon size={48} className="empty-icon" />
                                        <h3>No transactions found</h3>
                                        <p>Try changing your filter or check back later</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Professional Styles */}
                <style jsx>{`
                    .wallet-container {
                        width: 100%;
                        background: #fafbfc;
                        min-height: 100vh;
                        padding: 2rem 0;
                    }

                    .wallet-content {
                        padding: 0 1rem;
                        font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                        color: #1a1a1a;
                        line-height: 1.6;
                    }

                    .wallet-inner {
                        max-width: 1400px;
                        margin: 0 auto;
                    }

                    /* Header Section */
                    .wallet-header {
                        margin-bottom: 2rem;
                        background: white;
                        padding: 2rem;
                        border-radius: 16px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        border: 1px solid #e5e7eb;
                    }

                    .header-content {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        margin-bottom: 0.5rem;
                    }

                    .admin-badge {
                        display: inline-block;
                        background: linear-gradient(135deg, #f06826, #ffe077);
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        margin-top: 0.25rem;
                    }

                    .header-icon {
                        color: #f06826;
                    }

                    .wallet-title {
                        color: #111827;
                        font-size: 1.875rem;
                        font-weight: 700;
                        margin: 0;
                        letter-spacing: -0.025em;
                    }

                    .wallet-subtitle {
                        color: #6b7280;
                        font-size: 1rem;
                        margin: 0 0 1rem 0;
                        font-weight: 400;
                    }

                    .commission-info {
                        display: flex;
                        gap: 1.5rem;
                        flex-wrap: wrap;
                        padding-top: 1rem;
                        border-top: 1px solid #e5e7eb;
                    }

                    .commission-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .commission-label {
                        font-size: 0.875rem;
                        color: #6b7280;
                        font-weight: 500;
                    }

                    .commission-value {
                        font-size: 0.875rem;
                        color: #059669;
                        font-weight: 600;
                    }

                    /* Summary Cards */
                    .summary-cards-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }

                    .summary-card {
                        border-radius: 16px;
                        padding: 1.5rem;
                        color: white;
                        position: relative;
                        overflow: hidden;
                        border: 1px solid rgba(255,255,255,0.1);
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                    }

                    .available-balance {
                        background: linear-gradient(135deg, #f06826, #ffe077);
                    }

                    .total-earnings {
                        background: linear-gradient(135deg, #059669, #10b981);
                    }

                    .pending-payouts {
                        background: linear-gradient(135deg, #f59e0b, #f97316);
                    }

                    .summary-card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1rem;
                    }

                    .icon-wrapper {
                        padding: 0.75rem;
                        background: rgba(255,255,255,0.15);
                        border-radius: 12px;
                        backdrop-filter: blur(10px);
                    }

                    .balance-visibility-toggle {
                        background: rgba(255,255,255,0.15);
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 8px;
                        width: 2.25rem;
                        height: 2.25rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        color: white;
                        transition: all 0.2s ease;
                    }

                    .balance-visibility-toggle:hover {
                        background: rgba(255,255,255,0.25);
                        transform: scale(1.05);
                    }

                    .summary-card-label {
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        opacity: 0.9;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }

                    .summary-amount {
                        font-size: 1.75rem;
                        font-weight: 800;
                        margin-bottom: 0.5rem;
                        letter-spacing: -0.025em;
                    }

                    .summary-subtext {
                        font-size: 0.875rem;
                        opacity: 0.8;
                        margin-bottom: 1rem;
                        font-weight: 400;
                    }

                    .withdraw-button {
                        background: rgba(255,255,255,0.15);
                        border: 1px solid rgba(255,255,255,0.25);
                        border-radius: 12px;
                        padding: 0.75rem 1rem;
                        color: white;
                        font-size: 0.875rem;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(10px);
                        width: 100%;
                        justify-content: center;
                    }

                    .withdraw-button:hover:not(:disabled) {
                        background: rgba(255,255,255,0.25);
                        transform: translateY(-1px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                    }

                    .withdraw-button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    /* Breakdown Section */
                    .breakdown-section {
                        background: white;
                        border-radius: 16px;
                        padding: 2rem;
                        margin-bottom: 2rem;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        border: 1px solid #e5e7eb;
                    }

                    .breakdown-section .section-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1.5rem;
                    }

                    .section-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #111827;
                        margin: 0;
                        letter-spacing: -0.025em;
                    }

                    .export-button {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        background: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        color: #374151;
                        font-size: 0.875rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .export-button:hover {
                        background: #e5e7eb;
                    }

                    .breakdown-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .breakdown-card {
                        padding: 1.25rem;
                        border: 1px solid #e5e7eb;
                        border-radius: 12px;
                        background: #fafbfc;
                        transition: all 0.2s ease;
                    }

                    .breakdown-card:hover {
                        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                        transform: translateY(-2px);
                    }

                    .breakdown-header {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        margin-bottom: 1rem;
                    }

                    .breakdown-icon {
                        padding: 0.5rem;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .breakdown-title {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #374151;
                        margin: 0;
                    }

                    .breakdown-stats {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .breakdown-stat {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .stat-label {
                        font-size: 0.75rem;
                        color: #6b7280;
                        font-weight: 500;
                    }

                    .stat-value {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #111827;
                    }

                    .stat-value.available {
                        color: #059669;
                    }

                    .stat-value.pending {
                        color: #d97706;
                    }

                    /* Modal Styles */
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0,0,0,0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 1rem;
                        backdrop-filter: blur(4px);
                    }

                    .withdraw-modal {
                        background-color: white;
                        border-radius: 20px;
                        padding: 2rem;
                        width: 100%;
                        max-width: 28rem;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        border: 1px solid #e5e7eb;
                    }

                    .modal-header {
                        text-align: center;
                        margin-bottom: 1.5rem;
                    }

                    .modal-title {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #111827;
                        margin: 0 0 0.5rem 0;
                        letter-spacing: -0.025em;
                    }

                    .modal-subtitle {
                        color: #6b7280;
                        font-size: 0.875rem;
                        margin: 0;
                        font-weight: 400;
                    }

                    .balance-display {
                        background: linear-gradient(135deg, #f3f4f6, #f9fafb);
                        border-radius: 12px;
                        padding: 1.25rem;
                        margin-bottom: 1.5rem;
                        text-align: center;
                        border: 1px solid #e5e7eb;
                    }

                    .balance-label {
                        font-size: 0.75rem;
                        color: #6b7280;
                        margin-bottom: 0.5rem;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        font-weight: 600;
                    }

                    .balance-amount-modal {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #059669;
                        letter-spacing: -0.025em;
                    }

                    .input-group {
                        margin-bottom: 1.5rem;
                    }

                    .input-label {
                        display: block;
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #374151;
                        margin-bottom: 0.5rem;
                    }

                    .input-wrapper {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }

                    .currency-prefix {
                        position: absolute;
                        left: 1rem;
                        color: #6b7280;
                        font-weight: 600;
                        z-index: 1;
                        font-size: 0.875rem;
                    }

                    .amount-input {
                        width: 100%;
                        padding: 1rem 1rem 1rem 3rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        font-size: 1rem;
                        font-weight: 600;
                        outline: none;
                        transition: all 0.2s ease;
                        background: white;
                    }

                    .amount-input:focus {
                        border-color: #f06826;
                        box-shadow: 0 0 0 3px rgba(240, 104, 38, 0.1);
                    }

                    .amount-hint {
                        font-size: 0.75rem;
                        color: #6b7280;
                        margin-top: 0.25rem;
                    }

                    .error-message {
                        color: #dc2626;
                        font-size: 0.75rem;
                        margin-top: 0.5rem;
                        font-weight: 500;
                    }

                    .modal-buttons {
                        display: flex;
                        gap: 1rem;
                    }

                    .cancel-button {
                        flex: 1;
                        padding: 1rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        background-color: white;
                        color: #6b7280;
                        font-size: 0.875rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .cancel-button:hover {
                        background-color: #f9fafb;
                        border-color: #d1d5db;
                    }

                    .confirm-button {
                        flex: 1;
                        padding: 1rem;
                        border: none;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #f06826, #ffe077);
                        color: white;
                        font-size: 0.875rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .confirm-button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                        transform: none;
                    }

                    .confirm-button:not(:disabled):hover {
                        transform: translateY(-1px);
                        box-shadow: 0 8px 25px rgba(240, 104, 38, 0.3);
                    }

                    /* Transactions Section */
                    .transactions-container {
                        background-color: white;
                        border-radius: 16px;
                        padding: 2rem;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        border: 1px solid #e5e7eb;
                    }

                    .transactions-section .section-header {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    }

                    .section-count {
                        font-size: 0.875rem;
                        color: #6b7280;
                        font-weight: 500;
                    }

                    .filter-buttons {
                        display: flex;
                        gap: 0.5rem;
                        flex-wrap: wrap;
                    }

                    .filter-button {
                        padding: 0.5rem 1rem;
                        border: 1px solid #e5e7eb;
                        border-radius: 20px;
                        background: #f3f4f6;
                        color: #374151;
                        font-size: 0.75rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .filter-button:hover {
                        background: #e5e7eb;
                    }

                    .filter-button.active {
                        background: #f06826;
                        color: white;
                        border-color: #f06826;
                    }

                    .transactions-list {
                        max-height: 32rem;
                        overflow-y: auto;
                    }

                    .transaction-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 1rem;
                        padding: 1.25rem 0;
                        border-bottom: 1px solid #f3f4f6;
                        transition: all 0.2s ease;
                    }

                    .transaction-item:hover {
                        background: #fafbfc;
                        margin: 0 -1rem;
                        padding: 1.25rem 1rem;
                        border-radius: 8px;
                    }

                    .transaction-item:last-child {
                        border-bottom: none;
                    }

                    .transaction-icon {
                        padding: 0.75rem;
                        border-radius: 8px;
                        background: #f3f4f6;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }

                    .transaction-details {
                        flex: 1;
                    }

                    .transaction-header {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        margin-bottom: 0.5rem;
                        flex-wrap: wrap;
                    }

                    .transaction-title {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #111827;
                        line-height: 1.4;
                    }

                    .transaction-type {
                        font-size: 0.625rem;
                        padding: 0.125rem 0.5rem;
                        border-radius: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }

                    .transaction-meta {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.75rem;
                        margin-bottom: 0.5rem;
                    }

                    .meta-item {
                        font-size: 0.75rem;
                        color: #6b7280;
                        font-weight: 500;
                    }

                    .transaction-date {
                        font-size: 0.75rem;
                        color: #9ca3af;
                        font-weight: 500;
                    }

                    .transaction-amount {
                        text-align: right;
                        min-width: 6rem;
                    }

                    .amount-value {
                        font-size: 1rem;
                        font-weight: 700;
                        color: #059669;
                        margin-bottom: 0.5rem;
                        letter-spacing: -0.025em;
                    }

                    .status-badge {
                        font-size: 0.75rem;
                        padding: 0.25rem 0.75rem;
                        border-radius: 12px;
                        display: inline-block;
                        font-weight: 600;
                        text-transform: capitalize;
                    }

                    /* Empty State */
                    .empty-state {
                        text-align: center;
                        padding: 3rem 1rem;
                        color: #6b7280;
                    }

                    .empty-icon {
                        color: #d1d5db;
                        margin-bottom: 1rem;
                    }

                    .empty-state h3 {
                        font-size: 1.125rem;
                        font-weight: 600;
                        color: #374151;
                        margin: 0 0 0.5rem 0;
                    }

                    .empty-state p {
                        font-size: 0.875rem;
                        color: #6b7280;
                        margin: 0;
                        max-width: 20rem;
                        margin-left: auto;
                        margin-right: auto;
                        line-height: 1.5;
                    }

                    /* Verification Styles */
                    .verification-section {
                        margin-bottom: 1.5rem;
                    }

                    .verification-info {
                        background: #f0f9ff;
                        border: 1px solid #bae6fd;
                        border-radius: 8px;
                        padding: 1rem;
                        margin-bottom: 1rem;
                    }

                    .verification-info p {
                        margin: 0;
                        color: #0369a1;
                        font-size: 0.875rem;
                        line-height: 1.4;
                    }

                    .verification-input {
                        width: 100%;
                        padding: 1rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        font-size: 1.25rem;
                        font-weight: 600;
                        text-align: center;
                        letter-spacing: 0.5em;
                        outline: none;
                        transition: all 0.2s ease;
                    }

                    .verification-input:focus {
                        border-color: #f06826;
                        box-shadow: 0 0 0 3px rgba(240, 104, 38, 0.1);
                    }

                    .resend-section {
                        text-align: center;
                        margin-top: 1rem;
                    }

                    .resend-button {
                        background: none;
                        border: none;
                        color: #f06826;
                        font-size: 0.875rem;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: color 0.2s ease;
                    }

                    .resend-button:hover:not(:disabled) {
                        color: #d45a1f;
                    }

                    .resend-button:disabled {
                        color: #9ca3af;
                        cursor: not-allowed;
                    }

                    .animate-spin {
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    /* Responsive Styles */
                    @media (min-width: 640px) {
                        .wallet-content {
                            padding: 0 1.5rem;
                        }

                        .summary-cards-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }

                        .breakdown-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }

                        .wallet-title {
                            font-size: 2rem;
                        }

                        .summary-amount {
                            font-size: 2rem;
                        }
                    }

                    @media (min-width: 768px) {
                        .wallet-content {
                            padding: 0 2rem;
                        }

                        .summary-cards-grid {
                            grid-template-columns: repeat(3, 1fr);
                            gap: 1.5rem;
                            margin-bottom: 2.5rem;
                        }

                        .breakdown-grid {
                            grid-template-columns: repeat(3, 1fr);
                            gap: 1.5rem;
                        }

                        .transactions-section .section-header {
                            flex-direction: row;
                            justify-content: space-between;
                            align-items: center;
                        }
                    }

                    @media (min-width: 1024px) {
                        .wallet-content {
                            padding: 0 2rem;
                        }

                        .summary-amount {
                            font-size: 2.25rem;
                        }

                        .wallet-title {
                            font-size: 2.25rem;
                        }

                        .breakdown-grid {
                            grid-template-columns: repeat(5, 1fr);
                        }
                    }

                    @media (min-width: 1280px) {
                        .wallet-content {
                            padding: 0;
                        }
                    }

                    /* Smooth scrollbar for transactions */
                    .transactions-list::-webkit-scrollbar {
                        width: 6px;
                    }

                    .transactions-list::-webkit-scrollbar-track {
                        background: #f1f5f9;
                        border-radius: 3px;
                    }

                    .transactions-list::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 3px;
                    }

                    .transactions-list::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }

                    /* Animations */
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .summary-card, .breakdown-card, .transaction-item {
                        animation: fadeIn 0.5s ease-out forwards;
                    }

                    /* Focus styles for accessibility */
                    .withdraw-button:focus,
                    .balance-visibility-toggle:focus,
                    .cancel-button:focus,
                    .confirm-button:focus,
                    .filter-button:focus,
                    .export-button:focus {
                        outline: 2px solid #f06826;
                        outline-offset: 2px;
                    }

                    .amount-input:focus,
                    .verification-input:focus {
                        outline: none;
                    }
                `}</style>
            </div>
        </Layout>
    );
};

export default Wallet;
