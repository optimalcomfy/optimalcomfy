import React, {useState} from 'react';
import { Link, useForm, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { CreditCard, TrendingUp, Calendar, Clock, DollarSign, Eye, EyeOff, ArrowDownToLine } from 'lucide-react';
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
        return balanceVisible ? `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••';
    };

    // Calculate last booking payment (most recent transaction)
    const lastBookingPayment = recentTransactions.length > 0 ? parseFloat(recentTransactions[0].platform_price - recentTransactions[0].platform_charges) : 0;

    // Calculate next payout (pendingPayouts)
    const nextPayout = pendingPayouts;

    // Calculate pending amount (total earnings minus available balance)
    const pendingAmount = totalEarnings - availableBalance;

    return (
        <Layout>
            <div className="wallet-container">
                <div className='wallet-content'>
                    <div className='wallet-inner'>
                        <h1 className="wallet-title">
                            Host Wallet
                        </h1>

                        {/* Balance Cards */}
                        <div className="balance-cards-grid">
                            {/* Current Balance Card */}
                            <div className="balance-card current-balance">
                                <div className="balance-card-header">
                                    <CreditCard size={32} />
                                    <button 
                                        onClick={toggleBalanceVisibility}
                                        className="balance-visibility-toggle"
                                    >
                                        {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <h3 className="balance-card-label">
                                    Current Balance
                                </h3>
                                <div className="balance-amount">
                                    {formatCurrency(currentBalance)}
                                </div>
                                <div className="balance-subtext">
                                    Available for withdrawal
                                </div>
                                <button
                                    onClick={handleWithdraw}
                                    className="withdraw-button"
                                >
                                    <ArrowDownToLine size={16} />
                                    Withdraw Funds
                                </button>
                            </div>

                            {/* Ledger Balance Card */}
                            <div className="balance-card ledger-balance">
                                <div className="balance-card-header">
                                    <TrendingUp size={32} />
                                </div>
                                <h3 className="balance-card-label text-white">
                                    Total Ledger Balance
                                </h3>
                                <div className="balance-amount">
                                    {formatCurrency(totalEarnings)}
                                </div>
                                <div className="balance-subtext">
                                    Including pending payments
                                </div>
                            </div>
                        </div>

                        {/* Withdrawal Modal */}
                        {showWithdrawModal && (
                            <div className="modal-overlay">
                                <div className="withdraw-modal">
                                    <h2 className="modal-title">
                                        Withdraw Funds
                                    </h2>
                                    
                                    <div className="balance-display">
                                        <div className="balance-label">
                                            Available Balance
                                        </div>
                                        <div className="balance-amount-modal">
                                            {formatCurrency(currentBalance)}
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">
                                            Withdrawal Amount
                                        </label>
                                        <input
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="amount-input"
                                        />
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
                                            Withdraw
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <DollarSign className="stat-icon" style={{ color: '#27ae60' }} size={32} />
                                <div className="stat-amount">
                                    {formatCurrency(lastBookingPayment)}
                                </div>
                                <div className="stat-label">
                                    Last Booking Payment
                                </div>
                            </div>

                            <div className="stat-card">
                                <Calendar className="stat-icon" style={{ color: '#3498db' }} size={32} />
                                <div className="stat-amount">
                                    {formatCurrency(nextPayout)}
                                </div>
                                <div className="stat-label">
                                    Next Payout
                                </div>
                            </div>

                            <div className="stat-card">
                                <Clock className="stat-icon" style={{ color: '#e67e22' }} size={32} />
                                <div className="stat-amount">
                                    {formatCurrency(pendingAmount)}
                                </div>
                                <div className="stat-label">
                                    Pending Amount
                                </div>
                            </div>
                        </div>

                        <div className="transactions-container">
                            {/* Recent Transactions */}
                            <div className="transactions-section">
                                <h2 className="section-title">
                                    Recent Transactions
                                </h2>
                                <div className="transactions-list">
                                    {recentTransactions.length > 0 && recentTransactions?.map((transaction, index) => (
                                        <div key={index} className="transaction-item">
                                            <div className="transaction-details">
                                                <div className="transaction-title">
                                                    {transaction.title} - {transaction.guest}
                                                </div>
                                                <div className="transaction-date">
                                                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="transaction-amount">
                                                <div className="amount-value">
                                                    {formatCurrency(transaction.platform_price - transaction.platform_charges)}
                                                </div>
                                                <div className={`status-badge ${transaction.status === 'Paid' ? 'paid' : 'pending'}`}>
                                                    {transaction.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile-specific elements */}
                <style jsx>{`
                    .wallet-container {
                        width: 100%;
                        background: white;
                        padding-bottom: 2rem;
                        padding-top: 2rem;
                        border-radius: 20px;
                    }
                    
                    .wallet-content {
                        min-height: 100vh;
                        padding: 0 1rem;
                        font-family: 'system-ui, -apple-system, sans-serif';
                    }
                    
                    .wallet-inner {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    
                    .wallet-title {
                        color: #2c3e50;
                        font-size: 1.75rem;
                        font-weight: 700;
                        margin-bottom: 1.5rem;
                        text-align: left;
                        padding-top: 1rem;
                    }
                    
                    /* Balance Cards */
                    .balance-cards-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .balance-card {
                        border-radius: 1.25rem;
                        padding: 1.5rem;
                        color: white;
                        box-shadow: 0 0.625rem 1.875rem rgba(0,0,0,0.2);
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .current-balance {
                        background: linear-gradient(135deg, #d45522, #d45522);
                    }
                    
                    .ledger-balance {
                        background: linear-gradient(135deg, #0d3c46, #0d3c46);
                    }
                    
                    .balance-card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1rem;
                    }
                    
                    .balance-visibility-toggle {
                        background: rgba(255,255,255,0.2);
                        border: none;
                        border-radius: 50%;
                        width: 2.5rem;
                        height: 2.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        color: white;
                    }
                    
                    .balance-card-label {
                        font-size: 1rem;
                        font-weight: 500;
                        margin-bottom: 0.625rem;
                        opacity: 0.9;
                    }
                    
                    .balance-amount {
                        font-size: 2rem;
                        font-weight: 700;
                        margin-bottom: 0.625rem;
                    }
                    
                    .balance-subtext {
                        font-size: 0.875rem;
                        opacity: 0.8;
                        margin-bottom: 1rem;
                    }
                    
                    .withdraw-button {
                        background: rgba(255,255,255,0.2);
                        border: 2px solid rgba(255,255,255,0.3);
                        border-radius: 0.75rem;
                        padding: 0.75rem 1.25rem;
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
                    
                    .withdraw-button:hover {
                        background: rgba(255,255,255,0.3);
                        transform: translateY(-2px);
                    }
                    
                    /* Modal Styles */
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0,0,0,0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 1rem;
                    }
                    
                    .withdraw-modal {
                        background-color: white;
                        border-radius: 1.25rem;
                        padding: 1.5rem;
                        width: 100%;
                        max-width: 25rem;
                        box-shadow: 0 1.25rem 3.75rem rgba(0,0,0,0.3);
                    }
                    
                    .modal-title {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 1.25rem;
                        text-align: center;
                    }
                    
                    .balance-display {
                        background-color: #f8f9fa;
                        border-radius: 0.75rem;
                        padding: 1rem;
                        margin-bottom: 1.25rem;
                        text-align: center;
                    }
                    
                    .balance-label {
                        font-size: 0.875rem;
                        color: #7f8c8d;
                        margin-bottom: 0.3125rem;
                    }
                    
                    .balance-amount-modal {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #27ae60;
                    }
                    
                    .input-group {
                        margin-bottom: 1.25rem;
                    }
                    
                    .input-label {
                        display: block;
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #2c3e50;
                        margin-bottom: 0.5rem;
                    }
                    
                    .amount-input {
                        width: 100%;
                        padding: 0.9375rem;
                        border: 2px solid #ecf0f1;
                        border-radius: 0.75rem;
                        font-size: 1rem;
                        outline: none;
                        transition: border-color 0.3s ease;
                    }
                    
                    .amount-input:focus {
                        border-color: #667eea;
                    }
                    
                    .modal-buttons {
                        display: flex;
                        gap: 0.9375rem;
                    }
                    
                    .cancel-button {
                        flex: 1;
                        padding: 0.9375rem;
                        border: 2px solid #ecf0f1;
                        border-radius: 0.75rem;
                        background-color: white;
                        color: #7f8c8d;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    
                    .cancel-button:hover {
                        background-color: #f8f9fa;
                    }
                    
                    .confirm-button {
                        flex: 1;
                        padding: 0.9375rem;
                        border: none;
                        border-radius: 0.75rem;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    
                    .confirm-button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    
                    .confirm-button:not(:disabled):hover {
                        transform: translateY(-2px);
                        box-shadow: 0 0.3125rem 0.9375rem rgba(102, 126, 234, 0.4);
                    }
                    
                    /* Stats Cards */
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .stat-card {
                        background-color: white;
                        border-radius: 0.9375rem;
                        padding: 1.25rem;
                        box-shadow: 0 0.3125rem 1.25rem rgba(0,0,0,0.1);
                        text-align: center;
                    }
                    
                    .stat-icon {
                        margin-bottom: 0.625rem;
                    }
                    
                    .stat-amount {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 0.3125rem;
                    }
                    
                    .stat-label {
                        font-size: 0.875rem;
                        color: #7f8c8d;
                    }
                    
                    /* Transactions Section */
                    .transactions-container {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .transactions-section {
                        background-color: white;
                        border-radius: 1.25rem;
                        padding: 1.5rem;
                        box-shadow: 0 0.625rem 1.875rem rgba(0,0,0,0.1);
                    }
                    
                    .section-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 1.25rem;
                    }
                    
                    .transactions-list {
                        max-height: 30rem;
                        overflow-y: auto;
                    }
                    
                    .transaction-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.9375rem 0;
                        border-bottom: 1px solid #ecf0f1;
                    }
                    
                    .transaction-details {
                        flex: 1;
                        margin-right: 1rem;
                    }
                    
                    .transaction-title {
                        font-size: 1rem;
                        font-weight: 600;
                        color: #2c3e50;
                        margin-bottom: 0.3125rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    
                    .transaction-date {
                        font-size: 0.875rem;
                        color: #7f8c8d;
                    }
                    
                    .transaction-amount {
                        text-align: right;
                        min-width: 7rem;
                    }
                    
                    .amount-value {
                        font-size: 1rem;
                        font-weight: 700;
                        color: #27ae60;
                        margin-bottom: 0.3125rem;
                    }
                    
                    .status-badge {
                        font-size: 0.75rem;
                        padding: 0.25rem 0.5rem;
                        border-radius: 1rem;
                        display: inline-block;
                    }
                    
                    .paid {
                        background-color: #d5f4e6;
                        color: #155724;
                    }
                    
                    .pending {
                        background-color: #fff3cd;
                        color: #856404;
                    }
                    
                    /* Responsive Styles */
                    @media (min-width: 640px) {
                        .balance-cards-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }
                        
                        .wallet-title {
                            font-size: 1.75rem;
                        }
                        
                        .balance-amount {
                            font-size: 2.25rem;
                        }
                    }
                    
                    @media (min-width: 768px) {
                        .wallet-content {
                            padding: 0 1.25rem;
                        }
                        
                        .balance-cards-grid {
                            gap: 1.25rem;
                            margin-bottom: 2rem;
                        }
                        
                        .stats-grid {
                            gap: 1.25rem;
                            margin-bottom: 2rem;
                        }
                        
                        .transactions-container {
                            grid-template-columns: 2fr 1fr;
                            gap: 1.25rem;
                        }
                    }
                    
                    @media (min-width: 1024px) {
                        .wallet-content {
                            padding: 0 1.5rem;
                        }
                        
                        .balance-amount {
                            font-size: 2.5rem;
                        }
                    }
                `}</style>
            </div>
        </Layout>
    );
};

export default Wallet;