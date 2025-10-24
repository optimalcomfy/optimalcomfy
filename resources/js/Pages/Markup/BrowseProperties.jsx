import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Plus, Search, Filter, Home, DollarSign, MapPin, Eye } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddMarkupModal from '@/Components/AddMarkupModal';

const BrowseProperties = ({ auth, properties: initialProperties, pagination: initialPagination, filters: initialFilters }) => {
    const { props } = usePage();

    const [properties, setProperties] = useState([]);
    const [pagination, setPagination] = useState(initialPagination || {});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: initialFilters?.type || '',
        minPrice: initialFilters?.minPrice || '',
        maxPrice: initialFilters?.maxPrice || '',
        location: initialFilters?.location || ''
    });
    const [showMarkupModal, setShowMarkupModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    // Initialize properties and pagination
    useEffect(() => {
        if (Array.isArray(initialProperties)) {
            setProperties(initialProperties);
        } else if (initialProperties?.data) {
            setProperties(initialProperties.data);
        } else {
            setProperties([]);
        }

        if (initialPagination) {
            setPagination(initialPagination);
        }
    }, [initialProperties, initialPagination]);

    const handleSearch = () => {
        setLoading(true);
        router.get(route('markup.browse.properties'), {
            search: searchTerm,
            ...filters
        }, {
            preserveState: false, // Important: don't preserve state for new searches
            onFinish: () => setLoading(false)
        });
    };

    const handleAddMarkup = (property) => {
        setSelectedProperty(property);
        setShowMarkupModal(true);
    };

    const hasExistingMarkup = (propertyId) => {
        return properties.find(p => p.id === propertyId)?.has_user_markup || false;
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            minPrice: '',
            maxPrice: '',
            location: ''
        });
        setSearchTerm('');
        router.get(route('markup.browse.properties'), {}, {
            preserveState: false
        });
    };

    const loadMore = () => {
        if (pagination.next_page_url && !loading) {
            setLoading(true);
            router.get(pagination.next_page_url, {}, {
                preserveState: true,
                only: ['properties', 'pagination'],
                onSuccess: (page) => {
                    const newProperties = page.props.properties?.data || [];
                    setProperties(prev => [...prev, ...newProperties]);
                    setPagination(page.props.pagination || {});
                },
                onFinish: () => setLoading(false)
            });
        }
    };

    // Handle pagination links click
    const handlePageChange = (url) => {
        if (url && !loading) {
            setLoading(true);
            router.get(url, {}, {
                preserveState: true,
                only: ['properties', 'pagination'],
                onSuccess: (page) => {
                    const newProperties = page.props.properties?.data || [];
                    setProperties(newProperties);
                    setPagination(page.props.pagination || {});
                    // Scroll to top when changing pages
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onFinish: () => setLoading(false)
            });
        }
    };

    if (!auth.user?.can_add_markup) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h2>
                        <p className="text-yellow-700">
                            You need to be a verified host to add markups to listings.
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head title="Browse Properties for Markup" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Browse Properties</h1>
                            <p className="text-gray-600 mt-2">
                                Add your markup to any property and earn profit from bookings
                            </p>
                        </div>
                        <Link
                            href={route('markup.browse.cars')}
                            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Browse Cars Instead
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search properties..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="Entire Apartment">Entire Apartment</option>
                                <option value="Villa">Villa</option>
                                <option value="Private Room">Private Room</option>
                                <option value="Entire House">Entire House</option>
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Location..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Search Button */}
                        <div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    placeholder="Min price"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    placeholder="Max price"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Applying...' : 'Apply Filters'}
                            </button>
                            <button
                                onClick={clearFilters}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                {properties.length > 0 && (
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-gray-600">
                            Showing {properties.length} of {pagination.total || properties.length} properties
                            {pagination.current_page && ` (Page ${pagination.current_page} of ${pagination.last_page})`}
                        </p>

                        {/* Pagination Info - Simple */}
                        {pagination.last_page > 1 && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Page {pagination.current_page} of {pagination.last_page}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Properties Grid */}
                {loading && properties.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-12">
                        <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property) => (
                                <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Property Image */}
                                    <div className="relative">
                                        <img
                                            src={property.primary_image || '/images/placeholder-property.jpg'}
                                            alt={property.property_name}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder-property.jpg';
                                            }}
                                        />
                                        {hasExistingMarkup(property.id) && (
                                            <div className="absolute top-3 right-3">
                                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                    Your Markup Active
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 left-3">
                                            <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                {property.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {property.property_name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 flex items-start">
                                            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{property.location}</span>
                                        </p>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-500 capitalize">{property.type}</span>
                                            <span className="text-lg font-semibold text-blue-600">
                                                KES {new Intl.NumberFormat('en-KE').format(property.price_per_night)}
                                            </span>
                                        </div>

                                        {/* Platform Price */}
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Platform Price:</span>
                                                <span className="font-medium">KES {new Intl.NumberFormat('en-KE').format(property.platform_price)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Platform Charges:</span>
                                                <span className="font-medium">KES {new Intl.NumberFormat('en-KE').format(property.platform_charges)}</span>
                                            </div>
                                        </div>

                                        {/* Host Info */}
                                        <div className="border-t border-gray-200 pt-3 mt-3">
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span className="font-medium">Host:</span>
                                                <span>{property.user?.name}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleAddMarkup(property)}
                                                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    hasExistingMarkup(property.id)
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                {hasExistingMarkup(property.id) ? 'Update Markup' : 'Add Markup'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pagination.last_page > 1 && (
                            <div className="mt-8">

                                {/* Traditional Pagination Links */}
                                <div className="flex justify-center items-center space-x-2">
                                    {/* Previous Page */}
                                    {pagination.links?.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(link.url)}
                                            disabled={!link.url || link.active || loading}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>

                                {/* Page Info */}
                                <div className="text-center mt-4 text-sm text-gray-600">
                                    Page {pagination.current_page} of {pagination.last_page} •
                                    Total {pagination.total} properties
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Markup Modal */}
            {showMarkupModal && selectedProperty && (
                <AddMarkupModal
                    isOpen={showMarkupModal}
                    onClose={() => {
                        setShowMarkupModal(false);
                        setSelectedProperty(null);
                    }}
                    item={selectedProperty}
                    itemType="properties"
                    onSuccess={() => {
                        // Refresh the properties to update markup status
                        router.reload({ only: ['properties', 'pagination'] });
                    }}
                />
            )}
        </Layout>
    );
};

export default BrowseProperties;
