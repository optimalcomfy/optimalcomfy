import React, {useState} from 'react';
import { Link, useForm, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { CreditCard, TrendingUp, Calendar, Clock, DollarSign, Eye, EyeOff, ArrowDownToLine } from 'lucide-react';
import Swal from "sweetalert2";

const Wallet = ({ user }) => {
    const { flash, availableBalance, recentTransactions, monthlyEarnings, pendingPayouts, totalEarnings } = usePage().props;
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
            <div className="max-w-full bg-white pb-8 shadow-md rounded-lg overflow-hidden">
                <div className='' style={{
                    minHeight: '100vh',
                    padding: '0px 20px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        <h1 style={{
                            color: 'white',
                            fontSize: '28px',
                            fontWeight: '700',
                            marginBottom: '30px',
                            textAlign: 'left'
                        }}>
                            Host Wallet
                        </h1>

                        {/* Balance Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {/* Current Balance Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, #f17466, #7466f1)',
                                borderRadius: '20px',
                                padding: '30px',
                                color: 'white',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%'
                                }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <CreditCard size={32} />
                                    <button 
                                        onClick={toggleBalanceVisibility}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}
                                    >
                                        {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px', opacity: 0.9 }}>
                                    Current Balance
                                </h3>
                                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>
                                    {formatCurrency(currentBalance)}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
                                    Available for withdrawal
                                </div>
                                <button
                                    onClick={handleWithdraw}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.3)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.2)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <ArrowDownToLine size={16} />
                                    Withdraw Funds
                                </button>
                            </div>

                            {/* Ledger Balance Card */}
                            <div className='bg-peach' style={{
                                borderRadius: '20px',
                                padding: '30px',
                                color: 'white',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div className='bg-peachDark' style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%'
                                }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <TrendingUp size={32} />
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px', opacity: 0.9 }}>
                                    Total Ledger Balance
                                </h3>
                                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>
                                    {formatCurrency(totalEarnings)}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                                    Including pending payments
                                </div>
                            </div>
                        </div>

                        {/* Withdrawal Modal */}
                        {showWithdrawModal && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000
                            }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '20px',
                                    padding: '30px',
                                    width: '90%',
                                    maxWidth: '400px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                                }}>
                                    <h2 style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: '#2c3e50',
                                        marginBottom: '20px',
                                        textAlign: 'center'
                                    }}>
                                        Withdraw Funds
                                    </h2>
                                    
                                    <div style={{
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '12px',
                                        padding: '15px',
                                        marginBottom: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
                                            Available Balance
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#27ae60' }}>
                                            {formatCurrency(currentBalance)}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            marginBottom: '8px'
                                        }}>
                                            Withdrawal Amount
                                        </label>
                                        <input
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            style={{
                                                width: '100%',
                                                padding: '15px',
                                                border: '2px solid #ecf0f1',
                                                borderRadius: '12px',
                                                fontSize: '16px',
                                                outline: 'none',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                                        />
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '15px'
                                    }}>
                                        <button
                                            onClick={() => setShowWithdrawModal(false)}
                                            style={{
                                                flex: 1,
                                                padding: '15px',
                                                border: '2px solid #ecf0f1',
                                                borderRadius: '12px',
                                                backgroundColor: 'white',
                                                color: '#7f8c8d',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#f8f9fa';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'white';
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={processWithdrawal}
                                            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > currentBalance}
                                            style={{
                                                flex: 1,
                                                padding: '15px',
                                                border: 'none',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                color: 'white',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= currentBalance ? 'pointer' : 'not-allowed',
                                                opacity: withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= currentBalance ? 1 : 0.5,
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!e.target.disabled) {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!e.target.disabled) {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                        >
                                            Withdraw
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <DollarSign style={{ color: '#27ae60', marginBottom: '10px' }} size={32} />
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50', marginBottom: '5px' }}>
                                    {formatCurrency(lastBookingPayment)}
                                </div>
                                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                    Last Booking Payment
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <Calendar style={{ color: '#3498db', marginBottom: '10px' }} size={32} />
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50', marginBottom: '5px' }}>
                                    {formatCurrency(nextPayout)}
                                </div>
                                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                    Next Payout
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <Clock style={{ color: '#e67e22', marginBottom: '10px' }} size={32} />
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50', marginBottom: '5px' }}>
                                    {formatCurrency(pendingAmount)}
                                </div>
                                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                    Pending Amount
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '20px'
                        }}>
                            {/* Recent Transactions */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '30px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    marginBottom: '25px'
                                }}>
                                    Recent Transactions
                                </h2>
                                <div>
                                    {recentTransactions.length > 0 && recentTransactions?.map((transaction, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '15px 0',
                                            borderBottom: '1px solid #ecf0f1'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#2c3e50',
                                                    marginBottom: '5px'
                                                }}>
                                                    {transaction.title} - {transaction.guest}
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#7f8c8d'
                                                }}>
                                                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: '700',
                                                    color: '#27ae60',
                                                    marginBottom: '5px'
                                                }}>
                                                    {formatCurrency(transaction.platform_price - transaction.platform_charges)}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    padding: '4px 8px',
                                                    borderRadius: '20px',
                                                    backgroundColor: transaction.status === 'Paid' ? '#d5f4e6' : '#fff3cd',
                                                    color: transaction.status === 'Paid' ? '#155724' : '#856404'
                                                }}>
                                                    {transaction.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upcoming Payouts */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '30px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    marginBottom: '25px'
                                }}>
                                    Monthly Earnings
                                </h2>
                                <div>
                                    {monthlyEarnings.filter(month => month.total > 0).map((month, index) => (
                                        <div key={index} style={{
                                            padding: '20px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '15px',
                                            marginBottom: '15px'
                                        }}>
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#27ae60',
                                                marginBottom: '5px'
                                            }}>
                                                {formatCurrency(month.total)}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#2c3e50',
                                                marginBottom: '5px'
                                            }}>
                                                {month.month}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#7f8c8d'
                                            }}>
                                                Property: {formatCurrency(month.property_earnings)} | Cars: {formatCurrency(month.car_earnings)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Wallet;