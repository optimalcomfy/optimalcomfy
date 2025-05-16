import React, { useEffect, useState, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, Users, Calendar, Star, DollarSign, Loader } from 'lucide-react';
import { usePage } from '@inertiajs/react';

import { LayoutContext } from '@/Layouts/layout/context/layoutcontext';
import Layout from "@/Layouts/layout/layout.jsx";
import './Dashboard.css'

// Mock data for the chart
const data = [
  { name: 'Jan', bookings: 65, revenue: 3200 },
  { name: 'Feb', bookings: 59, revenue: 2800 },
  { name: 'Mar', bookings: 80, revenue: 4100 },
  { name: 'Apr', bookings: 81, revenue: 4300 },
  { name: 'May', bookings: 56, revenue: 3100 },
  { name: 'Jun', bookings: 55, revenue: 3000 },
  { name: 'Jul', bookings: 70, revenue: 3800 },
];

const Dashboard = ({ auth }) => {
    // Get data from the page props - adapted to Airbnb context
    const { propertyCount, bookingCount } = usePage().props;
    
    const [lineOptions, setLineOptions] = useState({});
    const { layoutConfig } = useContext(LayoutContext);
    const roleId = parseInt(auth.user?.role_id);
    const isDarkMode = layoutConfig.colorScheme === 'dark';
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const hasReloaded = sessionStorage.getItem('hasReloaded');
    
        if (!hasReloaded) {
            setIsLoading(true);
            sessionStorage.setItem('hasReloaded', 'true');
            
            // Add a slight delay before reload for better user experience
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }, []);    

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
                        <Loader size={48} className="text-blue-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Home size={20} className="text-blue-700 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
                    <div className="mt-3 h-1 w-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
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
                    <div className="flex justify-between items-center mb-3">
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
    
    // Chart data configuration
    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Bookings',
                data: [65, 59, 80, 81, 56, 55, 70],
                fill: false,
                backgroundColor: '#3B82F6',
                borderColor: '#3B82F6',
            },
            {
                label: 'Revenue (KES 100s)',
                data: [32, 28, 41, 43, 31, 30, 38],
                fill: false,
                backgroundColor: '#10B981',
                borderColor: '#10B981',
            }
        ]
    };

    return (
        <Layout>
            {isLoading && <LoadingScreen />}
            
            <div className="grid">
                <div className="col-12">
                    <h2 className="text-2xl font-bold mb-4">Property Overview</h2>
                </div>
                
                {roleId === 1 && (
                    <div className="lg:flex pt-4 w-full">
                        <InfoCard 
                            title="Total Properties" 
                            value={propertyCount || 24} 
                            icon={Home} 
                            iconColor="rose" 
                            description="Active listings on platform" 
                        />
                        
                        <InfoCard 
                            title="Total Bookings" 
                            value={bookingCount || 146} 
                            icon={Calendar} 
                            iconColor="blue" 
                            description="Reservations this year" 
                        />
                        
                        <InfoCard 
                            title="Average Rating" 
                            value="4.8" 
                            icon={Star} 
                            iconColor="amber" 
                            description="Based on 458 reviews" 
                        />
                        
                        <InfoCard 
                            title="Revenue" 
                            value="KES 15,280" 
                            icon={DollarSign} 
                            iconColor="green" 
                            description="Earnings this month" 
                        />
                    </div>
                )}
                
                <div className="col-12 mt-5">
                    <div className={`p-4 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className="text-xl font-semibold mb-3">Booking Analytics</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3B82F6" activeDot={{ r: 8 }} strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                <div className="col-12 lg:col-6 mt-5">
                    <div className={`p-4 rounded-lg shadow-md h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Top Performing Properties</h3>
                            <button className="text-sm text-blue-500 font-medium">View All</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Oceanfront Villa', location: 'Malibu, CA', bookings: 18, rating: 4.9, image: '/api/placeholder/60/60' },
                                { name: 'Downtown Loft', location: 'New York, NY', bookings: 15, rating: 4.8, image: '/api/placeholder/60/60' },
                                { name: 'Mountain Cabin', location: 'Aspen, CO', bookings: 12, rating: 4.7, image: '/api/placeholder/60/60' }
                            ].map((property, index) => (
                                <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-center`}>
                                    <img src={property.image} alt={property.name} className="rounded-lg w-16 h-16 object-cover mr-3" />
                                    <div className="flex-grow">
                                        <h4 className="font-medium">{property.name}</h4>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{property.location}</p>
                                        <div className="flex items-center mt-1">
                                            <Star size={14} className="text-amber-500 mr-1" />
                                            <span className="text-sm">{property.rating}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {property.bookings} bookings
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="col-12 lg:col-6 mt-5">
                    <div className={`p-4 rounded-lg shadow-md h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Recent Bookings</h3>
                            <button className="text-sm text-blue-500 font-medium">View All</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { guest: 'Emma Wilson', property: 'Beachside Cottage', date: 'Apr 22 - Apr 27', status: 'Confirmed', avatar: 'EW' },
                                { guest: 'Michael Brown', property: 'Downtown Loft', date: 'Apr 18 - Apr 20', status: 'Checked In', avatar: 'MB' },
                                { guest: 'Sarah Davis', property: 'Mountain View Cabin', date: 'Apr 25 - May 2', status: 'Pending', avatar: 'SD' }
                            ].map((booking, index) => (
                                <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-center`}>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-rose-200 text-rose-800 mr-3 flex items-center justify-center">
                                            {booking.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{booking.guest}</h4>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {booking.property} • {booking.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        booking.status === 'Confirmed' 
                                            ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                            : booking.status === 'Checked In'
                                                ? (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                                                : (isDarkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800')
                                    }`}>
                                        {booking.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="col-12 mt-5">
                    <div className={`p-4 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className="text-xl font-semibold mb-4">Upcoming Calendar</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <th className="text-left py-3 px-4 font-medium">Property</th>
                                        <th className="text-left py-3 px-4 font-medium">Guest</th>
                                        <th className="text-left py-3 px-4 font-medium">Check-in</th>
                                        <th className="text-left py-3 px-4 font-medium">Check-out</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { property: 'Oceanfront Villa', guest: 'James Wilson', checkin: 'Apr 20, 2025', checkout: 'Apr 25, 2025', status: 'Upcoming' },
                                        { property: 'City Apartment', guest: 'Laura Miller', checkin: 'Apr 22, 2025', checkout: 'Apr 24, 2025', status: 'Confirmed' },
                                        { property: 'Mountain Retreat', guest: 'Robert Taylor', checkin: 'Apr 23, 2025', checkout: 'Apr 30, 2025', status: 'Pending' },
                                        { property: 'Lake House', guest: 'Jennifer Brown', checkin: 'Apr 24, 2025', checkout: 'Apr 28, 2025', status: 'Payment Due' }
                                    ].map((booking, index) => (
                                        <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <td className="py-3 px-4">{booking.property}</td>
                                            <td className="py-3 px-4">{booking.guest}</td>
                                            <td className="py-3 px-4">{booking.checkin}</td>
                                            <td className="py-3 px-4">{booking.checkout}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    booking.status === 'Confirmed' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : booking.status === 'Upcoming'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : booking.status === 'Pending'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;