import React, { useEffect, useState, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, Users, Calendar, Star, DollarSign, Loader } from 'lucide-react';
import { usePage } from '@inertiajs/react';

import { LayoutContext } from '@/Layouts/layout/context/layoutcontext';
import Layout from "@/Layouts/layout/layout.jsx";
import './Dashboard.css'


const Dashboard = () => {
    // Get data from the page props - adapted to Airbnb context
    const { propertiesCount, totalBookingsCount, monthlyEarnings, averagePropertyBookingValue, auth } = usePage().props;
    
    const [lineOptions, setLineOptions] = useState({});
    const { layoutConfig } = useContext(LayoutContext);
    const roleId = parseInt(auth.user?.role_id);
    const isDarkMode = layoutConfig.colorScheme === 'dark';
    const [isLoading, setIsLoading] = useState(false);
   

    // Apply chart theme based on layout theme
    const applyLightTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };
        setLineOptions(lineOptions);
    };
    
    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };
        setLineOptions(lineOptions);
    };
    
    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    // Loading Screen Component
    const LoadingScreen = () => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 z-50">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <Loader size={48} className="text-peach animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Home size={20} className="text-blue-700 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
                    <div className="mt-3 h-1 w-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-peach rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    };

    // Custom InfoCard component for our dashboard
    const InfoCard = ({ title, value, icon, iconColor, description }) => {
        const Icon = icon;
        return (
            <div className={`p-3`}>
                <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                    <div className="flex justify-between gap-4 items-center mb-3">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <div className={`p-2 rounded-full bg-${iconColor}-100 text-${iconColor}-500`}>
                            <Icon size={20} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="text-2xl font-bold">{value}</span>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <Layout>
            {isLoading && <LoadingScreen />}
            
            <div className="grid">
                    <div className="lg:flex pt-4 w-full">
                        {parseInt(roleId) !== 3 && (
                        <>
                            <InfoCard 
                                title="Total Stays" 
                                value={propertiesCount} 
                                icon={Home} 
                                iconColor="rose" 
                                description="Active listings on platform" 
                            />  
                            <InfoCard 
                                title="Revenue" 
                                value={averagePropertyBookingValue}
                                icon={DollarSign} 
                                iconColor="green" 
                                description="Earnings this month" 
                            />  
                        </>            
                        )}
                        
                        <InfoCard 
                            title="Total Bookings" 
                            value={totalBookingsCount} 
                            icon={Calendar} 
                            iconColor="blue" 
                            description="Reservations this year" 
                        />
                    </div>
                
                 {parseInt(roleId) !== 3 && (
                <div className="col-12 mt-5">
                    <div className={`p-4 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className="text-xl font-semibold mb-3">Booking Analytics</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyEarnings}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis dataKey="month" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="total" stroke="#3B82F6" activeDot={{ r: 8 }} strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="stay_earnings" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>)}
            </div>
        </Layout>
    );
};

export default Dashboard;