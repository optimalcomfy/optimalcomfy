import React, {useState} from 'react';
import { Link, useForm, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { CreditCard, TrendingUp, Calendar, Clock, DollarSign, Eye, EyeOff, ArrowDownToLine, Wallet as WalletIcon } from 'lucide-react';
import Swal from "sweetalert2";

const Wallet = ({ user }) => {
    const { flash, availableBalance, recentTransactions, pendingPayouts, totalEarnings } = usePage().props;
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [currentBalance] = useState(availableBalance);

    const toggleBalanceVisibility = () => {
        setBalanceVisible(!balanceVisible);
    };

    const handleWithdraw = () => {
        setShowWithdrawModal(true);
    };

    const processWithdrawal = () => {
        const formData = {
            amount: withdrawAmount,
        };

        Swal.fire({
            title: `Are you sure you want to withdraw?`,
            text: 'This action will withdraw money from your wallet.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#gray',
            confirmButtonText: `Yes, withdraw it!`,
        }).then((result) => {
            if (result.isConfirmed) {
                // Close modal first
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                
                router.post(route('withdraw'), formData, {
                    onSuccess: (page) => {
                        // Check if there's a success message in the session
                        if (page.props.flash?.success) {
                            Swal.fire(
                                'Success!', 
                                page.props.flash.success, 
                                'success'
                            );
                        } else {
                            Swal.fire(
                                'Success!', 
                                'The withdrawal has been initiated.', 
                                'success'
                            );
                        }
                    },
                    onError: (errors) => {
                        // Handle validation or other errors
                        const errorMessage = errors.error || 'There was a problem processing the withdrawal.';
                        console.error('Withdrawal error:', errors);
                        Swal.fire('Error', errorMessage, 'error');
                    }
                });
            }
        });
    };

    const formatCurrency = (amount) => {
        if (typeof amount === 'string') {
            amount = parseFloat(amount);
        }
        return balanceVisible 
            ? `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
            : '••••••';
    };

    // Calculate last booking payment (most recent transaction)
    const lastBookingPayment = recentTransactions.length > 0 ? parseFloat(recentTransactions[0].net_amount) * recentTransactions[0].days  : 0;

    // Calculate next payout (pendingPayouts)
    const nextPayout = pendingPayouts;

    // Calculate pending amount (total earnings minus available balance)
    const pendingAmount = pendingPayouts - availableBalance;

    return (
        <Layout>
            <div className="wallet-container">
                <div className='wallet-content'>
                    <div className='wallet-inner'>
                        {/* Header Section */}
                        <div className="wallet-header">
                            <div className="header-content">
                                <WalletIcon size={28} className="header-icon" />
                                <h1 className="wallet-title">
                                    Your Earnings Dashboard
                                </h1>
                            </div>
                            <p className="wallet-subtitle">
                                Track your earnings, manage withdrawals, and monitor your financial activity
                            </p>
                        </div>

                        {/* Balance Cards */}
                        <div className="balance-cards-grid">
                            {/* Current Balance Card */}
                            <div className="balance-card current-balance">
                                <div className="balance-card-header">
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
                                <h3 className="balance-card-label">
                                    Available Balance
                                </h3>
                                <div className="balance-amount">
                                    {formatCurrency(currentBalance)}
                                </div>
                                <div className="balance-subtext">
                                    Ready for immediate withdrawal
                                </div>
                                <button
                                    onClick={handleWithdraw}
                                    className="withdraw-button"
                                >
                                    <ArrowDownToLine size={16} />
                                    Withdraw Now
                                </button>
                            </div>

                            {/* Total Earnings Card */}
                            <div className="balance-card total-earnings">
                                <div className="balance-card-header">
                                    <div className="icon-wrapper">
                                        <TrendingUp size={24} />
                                    </div>
                                </div>
                                <h3 className="balance-card-label">
                                    Total Earnings
                                </h3>
                                <div className="balance-amount">
                                    {formatCurrency(totalEarnings)}
                                </div>
                                <div className="balance-subtext">
                                    All-time earnings including pending amounts
                                </div>
                            </div>

                            {/* Pending Earnings Card */}
                            <div className="balance-card pending-earnings">
                                <div className="balance-card-header">
                                    <div className="icon-wrapper">
                                        <Clock size={24} />
                                    </div>
                                </div>
                                <h3 className="balance-card-label">
                                    Processing
                                </h3>
                                <div className="balance-amount">
                                    {formatCurrency(pendingAmount)}
                                </div>
                                <div className="balance-subtext">
                                    Payments being processed for next payout
                                </div>
                            </div>
                        </div>

                        {/* Withdrawal Modal */}
                        {showWithdrawModal && (
                            <div className="modal-overlay">
                                <div className="withdraw-modal">
                                    <div className="modal-header">
                                        <h2 className="modal-title">
                                            Withdraw Funds
                                        </h2>
                                        <p className="modal-subtitle">
                                            Transfer money to your registered account
                                        </p>
                                    </div>
                                    
                                    <div className="balance-display">
                                        <div className="balance-label">
                                            Available for Withdrawal
                                        </div>
                                        <div className="balance-amount-modal">
                                            {formatCurrency(currentBalance)}
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">
                                            Amount to Withdraw
                                        </label>
                                        <div className="input-wrapper">
                                            <span className="currency-prefix">KES</span>
                                            <input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="amount-input"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        {withdrawAmount && parseFloat(withdrawAmount) > currentBalance && (
                                            <div className="error-message">
                                                Amount exceeds available balance
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-buttons">
                                        <button
                                            onClick={() => setShowWithdrawModal(false)}
                                            className="cancel-button"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={processWithdrawal}
                                            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > currentBalance}
                                            className="confirm-button"
                                        >
                                            Confirm Withdrawal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper green">
                                    <DollarSign size={20} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-amount">
                                        {formatCurrency(lastBookingPayment)}
                                    </div>
                                    <div className="stat-label">
                                        Latest Payment Received
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon-wrapper blue">
                                    <Calendar size={20} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-amount">
                                        {formatCurrency(nextPayout)}
                                    </div>
                                    <div className="stat-label">
                                        Next Scheduled Payout
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon-wrapper orange">
                                    <Clock size={20} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-amount">
                                        {formatCurrency(pendingAmount)}
                                    </div>
                                    <div className="stat-label">
                                        Amount Under Review
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="transactions-container">
                            <div className="transactions-section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        Recent Activity
                                    </h2>
                                    <span className="section-count">
                                        {recentTransactions.length} transactions
                                    </span>
                                </div>
                                
                                {recentTransactions.length > 0 ? (
                                    <div className="transactions-list">
                                        {recentTransactions?.map((transaction, index) => (
                                            <div key={index} className="transaction-item">
                                                <div className="transaction-details">
                                                    <div className="transaction-title">
                                                        Booking: {transaction.title}
                                                    </div>
                                                    <div className="transaction-guest">
                                                        Guest: {transaction.guest}
                                                    </div>
                                                    <div className="transaction-date">
                                                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                                                            weekday: 'short',
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="transaction-amount">
                                                    <div className="amount-value">
                                                        {formatCurrency((transaction.net_amount - transaction.platform_charges) * transaction.days)}
                                                    </div>
                                                    <div className={`status-badge ${transaction.status === 'Paid' ? 'paid' : 'pending'}`}>
                                                        {transaction.status === 'Paid' ? 'Completed' : 'Processing'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <WalletIcon size={48} className="empty-icon" />
                                        <h3>No transactions yet</h3>
                                        <p>Your transaction history will appear here once you receive payments</p>
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
                        padding: 4rem 0;
                        border-radius: 20px;
                    }
                    
                    .wallet-content {
                        padding: 0 1rem;
                        font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                        color: #1a1a1a;
                        line-height: 1.6;
                    }
                    
                    .wallet-inner {
                        max-width: 1200px;
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
                        margin: 0;
                        font-weight: 400;
                    }
                    
                    /* Balance Cards */
                    .balance-cards-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1.25rem;
                        margin-bottom: 2rem;
                    }
                    
                    .balance-card {
                        border-radius: 16px;
                        padding: 2rem;
                        color: white;
                        position: relative;
                        overflow: hidden;
                        border: 1px solid rgba(255,255,255,0.1);
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                    }
                    
                    .current-balance {
                        background: linear-gradient(135deg, #f06826, #ffe077);
                    }
                    
                    .total-earnings {
                        background: linear-gradient(135deg, #059669, #10b981);
                    }
                    
                    .pending-earnings {
                        background: linear-gradient(135deg, #f59e0b, #f97316);
                    }
                    
                    .balance-card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1.5rem;
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
                    
                    .balance-card-label {
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.75rem;
                        opacity: 0.9;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    
                    .balance-amount {
                        font-size: 2.25rem;
                        font-weight: 800;
                        margin-bottom: 0.75rem;
                        letter-spacing: -0.025em;
                    }
                    
                    .balance-subtext {
                        font-size: 0.875rem;
                        opacity: 0.8;
                        margin-bottom: 1.5rem;
                        font-weight: 400;
                    }
                    
                    .withdraw-button {
                        background: rgba(255,255,255,0.15);
                        border: 1px solid rgba(255,255,255,0.25);
                        border-radius: 12px;
                        padding: 0.875rem 1.5rem;
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
                        text-transform: none;
                    }
                    
                    .withdraw-button:hover {
                        background: rgba(255,255,255,0.25);
                        transform: translateY(-1px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
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
                        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
                        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
                    }
                    
                    /* Stats Cards */
                    .stats-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1.25rem;
                        margin-bottom: 2rem;
                    }
                    
                    .stat-card {
                        background-color: white;
                        border-radius: 16px;
                        padding: 1.5rem;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        border: 1px solid #e5e7eb;
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        transition: all 0.2s ease;
                    }
                    
                    .stat-card:hover {
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        transform: translateY(-2px);
                    }
                    
                    .stat-icon-wrapper {
                        padding: 0.75rem;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }
                    
                    .stat-icon-wrapper.green {
                        background: #dcfce7;
                        color: #166534;
                    }
                    
                    .stat-icon-wrapper.blue {
                        background: #dbeafe;
                        color: #1d4ed8;
                    }
                    
                    .stat-icon-wrapper.orange {
                        background: #fed7aa;
                        color: #c2410c;
                    }
                    
                    .stat-content {
                        flex: 1;
                    }
                    
                    .stat-amount {
                        font-size: 1.125rem;
                        font-weight: 700;
                        color: #111827;
                        margin-bottom: 0.25rem;
                        letter-spacing: -0.025em;
                    }
                    
                    .stat-label {
                        font-size: 0.875rem;
                        color: #6b7280;
                        font-weight: 500;
                    }
                    
                    /* Transactions Section */
                    .transactions-container {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1.25rem;
                    }
                    
                    .transactions-section {
                        background-color: white;
                        border-radius: 16px;
                        padding: 2rem;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        border: 1px solid #e5e7eb;
                    }
                    
                    .section-header {
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
                    
                    .section-count {
                        font-size: 0.875rem;
                        color: #6b7280;
                        background: #f3f4f6;
                        padding: 0.25rem 0.75rem;
                        border-radius: 16px;
                        font-weight: 500;
                    }
                    
                    .transactions-list {
                        max-height: 32rem;
                        overflow-y: auto;
                    }
                    
                    .transaction-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
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
                    
                    .transaction-details {
                        flex: 1;
                        margin-right: 1rem;
                    }
                    
                    .transaction-title {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #111827;
                        margin-bottom: 0.25rem;
                        line-height: 1.4;
                    }
                    
                    .transaction-guest {
                        font-size: 0.875rem;
                        color: #6b7280;
                        margin-bottom: 0.25rem;
                        font-weight: 500;
                    }
                    
                    .transaction-date {
                        font-size: 0.75rem;
                        color: #9ca3af;
                        font-weight: 500;
                    }
                    
                    .transaction-amount {
                        text-align: right;
                        min-width: 8rem;
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
                    
                    .paid {
                        background-color: #dcfce7;
                        color: #166534;
                    }
                    
                    .pending {
                        background-color: #fef3c7;
                        color: #92400e;
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
                    
                    /* Responsive Styles */
                    @media (min-width: 640px) {
                        .wallet-content {
                            padding: 0 1.5rem;
                        }
                        
                        .balance-cards-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }
                        
                        .stats-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }
                        
                        .wallet-title {
                            font-size: 2rem;
                        }
                        
                        .balance-amount {
                            font-size: 2.5rem;
                        }
                    }
                    
                    @media (min-width: 768px) {
                        .wallet-content {
                            padding: 0 2rem;
                        }
                        
                        .balance-cards-grid {
                            grid-template-columns: repeat(3, 1fr);
                            gap: 1.5rem;
                            margin-bottom: 2.5rem;
                        }
                        
                        .stats-grid {
                            grid-template-columns: repeat(3, 1fr);
                            gap: 1.5rem;
                            margin-bottom: 2.5rem;
                        }
                        
                        .transactions-container {
                            grid-template-columns: 1fr;
                            gap: 1.5rem;
                        }
                        
                        .wallet-header {
                            padding: 2.5rem;
                        }
                        
                        .transactions-section {
                            padding: 2.5rem;
                        }
                    }
                    
                    @media (min-width: 1024px) {
                        .wallet-content {
                            padding: 0 2rem;
                        }
                        
                        .balance-amount {
                            font-size: 2.75rem;
                        }
                        
                        .wallet-title {
                            font-size: 2.25rem;
                        }
                        
                        .transaction-item {
                            align-items: center;
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
                    
                    /* Loading states and micro-interactions */
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
                    
                    .balance-card {
                        animation: fadeIn 0.5s ease-out forwards;
                    }
                    
                    .balance-card:nth-child(2) {
                        animation-delay: 0.1s;
                    }
                    
                    .balance-card:nth-child(3) {
                        animation-delay: 0.2s;
                    }
                    
                    .stat-card {
                        animation: fadeIn 0.5s ease-out forwards;
                    }
                    
                    .stat-card:nth-child(2) {
                        animation-delay: 0.1s;
                    }
                    
                    .stat-card:nth-child(3) {
                        animation-delay: 0.2s;
                    }
                    
                    /* Focus styles for accessibility */
                    .withdraw-button:focus,
                    .balance-visibility-toggle:focus,
                    .cancel-button:focus,
                    .confirm-button:focus {
                        outline: 2px solid #f06826;
                        outline-offset: 2px;
                    }
                    
                    .amount-input:focus {
                        outline: none;
                    }
                `}</style>
            </div>
        </Layout>
    );
};

export default Wallet;