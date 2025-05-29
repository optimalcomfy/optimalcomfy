import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import React, { useContext } from "react";
import Layout from "@/Layouts/Layout";
import { CreditCard, TrendingUp, Calendar, Clock, DollarSign, Eye, EyeOff, ArrowDownToLine, Search, X, Filter } from 'lucide-react';

export default function Wallet({ auth, laravelVersion, phpVersion }) {
  const { flash, pagination, amenities, services } = usePage().props;

   const [balanceVisible, setBalanceVisible] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [currentBalance] = useState(2847.50);
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    const toggleBalanceVisibility = () => {
        setBalanceVisible(!balanceVisible);
    };

    const handleWithdraw = () => {
        setShowWithdrawModal(true);
    };

    const processWithdrawal = () => {
        // Process withdrawal logic here
        alert(`Withdrawal of ${withdrawAmount} initiated successfully!`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
    };

    const formatCurrency = (amount) => {
        return balanceVisible ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••';
    };

    const transactions = [
        { id: 1, date: '2024-05-25', description: 'Booking Payment - Ocean View Suite', amount: 450.00, status: 'completed', type: 'income' },
        { id: 2, date: '2024-05-24', description: 'Service Fee', amount: -22.50, status: 'completed', type: 'fee' },
        { id: 3, date: '2024-05-23', description: 'Booking Payment - Mountain Cabin', amount: 320.00, status: 'pending', type: 'income' },
        { id: 4, date: '2024-05-22', description: 'Cleaning Fee Deduction', amount: -45.00, status: 'completed', type: 'fee' },
        { id: 5, date: '2024-05-21', description: 'Booking Payment - City Apartment', amount: 280.00, status: 'completed', type: 'income' },
        { id: 6, date: '2024-05-20', description: 'Platform Fee', amount: -14.00, status: 'completed', type: 'fee' },
        { id: 7, date: '2024-05-19', description: 'Booking Payment - Beach House', amount: 520.00, status: 'completed', type: 'income' },
    ];

    const upcomingPayouts = [
        { date: '2024-05-28', amount: 725.50, property: 'Ocean View Suite' },
        { date: '2024-05-30', amount: 480.00, property: 'Mountain Cabin' },
    ];

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);
        
        if (value.trim() === '') {
            setFilteredTransactions(transactions);
            return;
        }

        const filtered = transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(value.toLowerCase()) ||
            transaction.status.toLowerCase().includes(value.toLowerCase()) ||
            transaction.type.toLowerCase().includes(value.toLowerCase()) ||
            new Date(transaction.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            }).toLowerCase().includes(value.toLowerCase())
        );
        setFilteredTransactions(filtered);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setFilteredTransactions(transactions);
    };

    // Initialize filtered transactions
    useEffect(() => {
        setFilteredTransactions(transactions);
    }, []);

  return (
    <>
          <Head title="Wallet" />
          <Layout>
            <>
        <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
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
            textAlign: 'center'
            }}>
            Host Wallet Dashboard
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
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
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
                {formatCurrency(2847.50)}
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
            <div style={{
                background: 'linear-gradient(135deg, #4834d4, #686de0)',
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
                <TrendingUp size={32} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px', opacity: 0.9 }}>
                Total Ledger Balance
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>
                {formatCurrency(3125.75)}
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
                    ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                {formatCurrency(450.00)}
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
                {formatCurrency(1205.50)}
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
                {formatCurrency(278.25)}
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
            {/* Recent Transactions with Search */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#2c3e50',
                        margin: 0
                    }}>
                        Recent Transactions
                    </h2>
                    
                    {/* Search Input */}
                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search 
                            size={16} 
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#7f8c8d'
                            }}
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search transactions..."
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 35px',
                                border: '2px solid #ecf0f1',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#7f8c8d',
                                    padding: '2px'
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Results Summary */}
                {searchTerm && (
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '10px 15px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        color: '#495057'
                    }}>
                        {filteredTransactions.length > 0 
                            ? `Found ${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''} matching "${searchTerm}"`
                            : `No transactions found matching "${searchTerm}"`
                        }
                    </div>
                )}

                <div>
                {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} style={{
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
                        {transaction.description}
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
                        color: transaction.amount > 0 ? '#27ae60' : '#e74c3c',
                        marginBottom: '5px'
                        }}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        <div style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        backgroundColor: transaction.status === 'completed' ? '#d5f4e6' : '#fff3cd',
                        color: transaction.status === 'completed' ? '#155724' : '#856404'
                        }}>
                        {transaction.status}
                        </div>
                    </div>
                    </div>
                ))}
                
                {filteredTransactions.length === 0 && searchTerm && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#7f8c8d'
                    }}>
                        <Filter size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
                            No transactions found
                        </p>
                        <p style={{ fontSize: '14px' }}>
                            Try adjusting your search terms
                        </p>
                    </div>
                )}
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
                Upcoming Payouts
                </h2>
                <div>
                {upcomingPayouts.map((payout, index) => (
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
                        {formatCurrency(payout.amount)}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#2c3e50',
                        marginBottom: '5px'
                    }}>
                        {payout.property}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#7f8c8d'
                    }}>
                        {new Date(payout.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                        })}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
        </div>
    </>
    </Layout>
    </>
  );
}