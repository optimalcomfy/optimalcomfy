import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import React, { useContext } from "react";

import { LayoutContext } from '@/Layouts/layout/context/layoutcontext';
import Layout from "@/Layouts/layout/layout.jsx";
import { CreditCard, TrendingUp, Calendar, Clock, DollarSign, Eye, EyeOff, ArrowDownToLine, Search, X, Filter, Car, Home } from 'lucide-react';

export default function Wallet({ auth, laravelVersion, phpVersion }) {
  const { 
    flash, 
    carsCount,
    propertiesCount,
    propertyBookingTotal,
    carBookingTotal,
    totalEarnings,
    pendingPayouts,
    availableBalance,
    monthlyEarnings,
    recentTransactions,
    averagePropertyBookingValue,
    averageCarBookingValue,
    totalBookingsCount
  } = usePage().props;

   const [balanceVisible, setBalanceVisible] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
   const { layoutConfig } = useContext(LayoutContext);
    
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
        const numAmount = parseFloat(amount) || 0;
        return balanceVisible ? `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••';
    };

    // Transform backend transactions data for display
    const transformedTransactions = recentTransactions ? recentTransactions.map((transaction, index) => ({
        id: index + 1,
        date: transaction.date,
        description: `${transaction.type === 'property' ? 'Property' : 'Car'} Booking - ${transaction.title}`,
        amount: parseFloat(transaction.amount),
        status: transaction.status,
        type: 'income',
        guest: transaction.guest
    })) : [];

    // Calculate upcoming payouts based on recent transactions
    const upcomingPayouts = transformedTransactions
        .filter(transaction => transaction.status === 'completed')
        .slice(0, 2)
        .map((transaction, index) => ({
            date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: transaction.amount * 0.85, // After platform fee
            property: transaction.description.replace('Property Booking - ', '').replace('Car Booking - ', '')
        }));

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);
        
        if (value.trim() === '') {
            setFilteredTransactions(transformedTransactions);
            return;
        }

        const filtered = transformedTransactions.filter(transaction =>
            transaction.description.toLowerCase().includes(value.toLowerCase()) ||
            transaction.status.toLowerCase().includes(value.toLowerCase()) ||
            transaction.type.toLowerCase().includes(value.toLowerCase()) ||
            (transaction.guest && transaction.guest.toLowerCase().includes(value.toLowerCase())) ||
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
        setFilteredTransactions(transformedTransactions);
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    // Initialize filtered transactions
    useEffect(() => {
        setFilteredTransactions(transformedTransactions);
    }, [recentTransactions]);

    // Get latest transaction amount for stats
    const latestTransactionAmount = transformedTransactions.length > 0 ? transformedTransactions[0].amount : 0;

  return (
    <>
          <Head title="Wallet" />
          <Layout>
            <>
        <div style={{
        minHeight: '100vh',
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
            {/* Available Balance Card */}
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
                Available Balance
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>
                {formatCurrency(availableBalance)}
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

            {/* Total Earnings Card */}
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
                Total Earnings
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>
                {formatCurrency(totalEarnings)}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Including all bookings
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
                    {formatCurrency(availableBalance)}
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
                    max={availableBalance}
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
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > availableBalance}
                    style={{
                        flex: 1,
                        padding: '15px',
                        border: 'none',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= availableBalance ? 'pointer' : 'not-allowed',
                        opacity: withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= availableBalance ? 1 : 0.5,
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
                <Home style={{ color: '#27ae60', marginBottom: '10px' }} size={32} />
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50', marginBottom: '5px' }}>
                {formatCurrency(propertyBookingTotal)}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                Property Earnings
                </div>
                <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
                {propertiesCount} {propertiesCount === 1 ? 'Property' : 'Properties'}
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <Car style={{ color: '#3498db', marginBottom: '10px' }} size={32} />
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50', marginBottom: '5px' }}>
                {formatCurrency(carBookingTotal)}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                Car Rental Earnings
                </div>
                <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
                {carsCount} {carsCount === 1 ? 'Car' : 'Cars'}
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
                {formatCurrency(pendingPayouts)}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                Pending Payouts
                </div>
                <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
                After platform fees
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <Calendar style={{ color: '#9b59b6', marginBottom: '10px' }} size={32} />
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50', marginBottom: '5px' }}>
                {totalBookingsCount}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                Total Bookings
                </div>
                <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
                All time
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
                {filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => (
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
                        color: '#7f8c8d',
                        marginBottom: '2px'
                        }}>
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                        })}
                        </div>
                        {transaction.guest && (
                            <div style={{
                                fontSize: '12px',
                                color: '#95a5a6'
                            }}>
                                Guest: {transaction.guest}
                            </div>
                        )}
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
                )) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#7f8c8d'
                    }}>
                        <DollarSign size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
                            No transactions yet
                        </p>
                        <p style={{ fontSize: '14px' }}>
                            Your booking transactions will appear here
                        </p>
                    </div>
                )}
                
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
                {upcomingPayouts.length > 0 ? upcomingPayouts.map((payout, index) => (
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
                )) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#7f8c8d'
                    }}>
                        <Calendar size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
                            No upcoming payouts
                        </p>
                        <p style={{ fontSize: '14px' }}>
                            Payouts will be scheduled after bookings
                        </p>
                    </div>
                )}
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