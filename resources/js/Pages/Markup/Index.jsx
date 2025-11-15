import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Copy, Trash2, Plus, Eye, Car, Home, Filter, X, Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MarkupIndex = () => {
    const { auth } = usePage().props;
    const [markups, setMarkups] = useState([]);
    const [stats, setStats] = useState({
        total_markups: 0,
        total_profit: 0,
        total_bookings: 0
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, cars, properties
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        fetchMarkups();
        fetchStats();
    }, [filter]);

    const fetchMarkups = async () => {
        try {
            const response = await axios.get(route('markup.user.markups'), {
                params: { type: filter === 'all' ? null : filter }
            });
            setMarkups(response.data.markups || []);
        } catch (error) {
            console.error('Error fetching markups:', error);
            toast.error('Failed to load markups');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(route('markup.stats'));
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Link copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    };

    const removeMarkup = async (markupId) => {
        if (!confirm('Are you sure you want to remove this markup?')) {
            return;
        }

        try {
            await router.delete(route('markup.remove', markupId));
            toast.success('Markup removed successfully');
            fetchMarkups();
            fetchStats();
        } catch (error) {
            toast.error('Failed to remove markup');
        }
    };

    const getItemTypeIcon = (type) => {
        return type === 'App\\Models\\Car' ? <Car className="h-4" /> : <Home className="h-4" />;
    };

    const getItemTypeLabel = (type) => {
        return type === 'App\\Models\\Car' ? 'Car' : 'Property';
    };

    if (!auth.user?.can_add_markup) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h2>
                        <p className="text-yellow-700">
                            You need to be a verified host to add markups to listings.
                            Please contact support if you believe this is an error.
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    const filteredMarkups = markups.filter(markup => {
        if (filter === 'all') return true;
        if (filter === 'cars') return markup.type === 'App\\Models\\Car';
        if (filter === 'properties') return markup.type === 'App\\Models\\Property';
        return true;
    });

    return (
        <Layout>
            <Head title="My Markups" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Markups</h1>
                    <p className="text-gray-600 mt-2">Manage your markups and share links with clients</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Markups</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total_markups}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Potential Profit</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    KES {new Intl.NumberFormat('en-KE').format(stats.total_profit)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Bookings Through Markup</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total_bookings}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Mobile Filters Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                                className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {mobileFiltersOpen ? (
                                    <>
                                        <X className="h-4 mr-2" /> Close Filters
                                    </>
                                ) : (
                                    <>
                                        <Filter className="h-4 mr-2" /> Filter Markups
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Filter Buttons */}
                        <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block flex flex-wrap gap-2 space-x-4 space-y-4`}>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All Markups
                            </button>
                            <button
                                onClick={() => setFilter('cars')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'cars'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Cars Only
                            </button>
                            <button
                                onClick={() => setFilter('properties')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'properties'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Properties Only
                            </button>
                        </div>

                        {/* Browse Links */}
                        <div className="flex gap-3">
                            <Link
                                href={route('properties.index')}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                <Home className="h-4 mr-2" />
                                Browse Properties
                            </Link>
                            <Link
                                href={route('main-cars.index')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                                <Car className="h-4 mr-2" />
                                Browse Cars
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Markups List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                            <p className="text-gray-500 mt-2">Loading your markups...</p>
                        </div>
                    ) : filteredMarkups.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No active markups</h3>
                            <p className="text-gray-500 mb-6">
                                {filter === 'all'
                                    ? "You haven't added any markups yet. Browse properties or cars to add your markup."
                                    : `No ${filter} markups found.`}
                            </p>
                            <div className="flex justify-center gap-3">
                                <Link
                                    href={route('properties.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Home className="h-4 mr-2" />
                                    Browse Properties
                                </Link>
                                <Link
                                    href={route('main-cars.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Car className="h-4 mr-2" />
                                    Browse Cars
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredMarkups.map((markup) => (
                                <div key={markup.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        {/* Item Info */}
                                        <div className="flex gap-4 flex-1">
                                            <img
                                                src={markup.item.image || '/images/placeholder.jpg'}
                                                alt={markup.item.name}
                                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getItemTypeIcon(markup.type)}
                                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {getItemTypeLabel(markup.type)}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {markup.item.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Base Price:</span>{' '}
                                                        KES {new Intl.NumberFormat('en-KE').format(markup.item.original_amount)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Your Price:</span>{' '}
                                                        KES {new Intl.NumberFormat('en-KE').format(markup.final_amount)}
                                                    </div>
                                                    <div className="text-green-600 font-medium">
                                                        <span className="font-medium">Your Profit:</span>{' '}
                                                        KES {new Intl.NumberFormat('en-KE').format(markup.profit)}
                                                    </div>
                                                </div>
                                                {markup.markup_percentage && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Markup: {markup.markup_percentage}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                                            <button
                                                onClick={() => copyToClipboard(markup.markup_link)}
                                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                <Copy className="h-4 mr-2" />
                                                Copy Link
                                            </button>
                                            <button
                                                onClick={() => removeMarkup(markup.id)}
                                                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                            >
                                                <Trash2 className="h-4 mr-2" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Markup Link */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">Markup Link:</span>
                                            <span className="text-xs text-gray-500">
                                                Share this link with your clients
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={markup.markup_link}
                                                readOnly
                                                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onClick={(e) => e.target.select()}
                                            />
                                            <button
                                                onClick={() => copyToClipboard(markup.markup_link)}
                                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                            >
                                                <Copy className="h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MarkupIndex;
