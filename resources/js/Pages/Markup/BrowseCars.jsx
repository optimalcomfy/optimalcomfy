import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Plus, Search, Filter, Car, DollarSign, MapPin, Eye, Users, Fuel, Calendar } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddMarkupModal from '@/Components/AddMarkupModal';

const BrowseCars = () => {
    const { auth, cars, pagination, filters: initialFilters } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
    const [filters, setFilters] = useState({
        brand: initialFilters?.brand || '',
        minPrice: initialFilters?.minPrice || '',
        maxPrice: initialFilters?.maxPrice || '',
        fuel_type: initialFilters?.fuel_type || '',
        transmission: initialFilters?.transmission || ''
    });
    const [showMarkupModal, setShowMarkupModal] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            if (searchTerm !== initialFilters?.search) {
                handleFilterChange();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        handleFilterChange();
    }, [filters]);

    const handleFilterChange = () => {
        setLoading(true);

        router.get(route('markup.browse.cars'), {
            search: searchTerm,
            ...filters
        }, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleAddMarkup = (car) => {
        setSelectedCar(car);
        setShowMarkupModal(true);
    };

    const hasExistingMarkup = (carId) => {
        return cars?.find(c => c.id === carId)?.has_user_markup || false;
    };

    const clearFilters = () => {
        setFilters({
            brand: '',
            minPrice: '',
            maxPrice: '',
            fuel_type: '',
            transmission: ''
        });
        setSearchTerm('');
    };

    const getTransmissionLabel = (transmission) => {
        const labels = {
            'automatic': 'Automatic',
            'manual': 'Manual',
            'cvt': 'CVT'
        };
        return labels[transmission] || transmission;
    };

    const getFuelTypeLabel = (fuelType) => {
        const labels = {
            'petrol': 'Petrol',
            'diesel': 'Diesel',
            'electric': 'Electric',
            'hybrid': 'Hybrid'
        };
        return labels[fuelType] || fuelType;
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
            <Head title="Browse Cars for Markup" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Browse Cars</h1>
                            <p className="text-gray-600 mt-2">
                                Add your markup to any car and earn profit from rentals
                            </p>
                        </div>
                        <Link
                            href={route('markup.browse.properties')}
                            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Browse Properties Instead
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search ..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div>
                            <select
                                value={filters.brand}
                                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Brands</option>
                                <option value="Toyota">Toyota</option>
                                <option value="Honda">Honda</option>
                                <option value="Ford">Ford</option>
                                <option value="BMW">BMW</option>
                                <option value="Mercedes">Mercedes</option>
                                <option value="Audi">Audi</option>
                                <option value="Nissan">Nissan</option>
                                <option value="Volkswagen">Volkswagen</option>
                            </select>
                        </div>

                        {/* Fuel Type Filter */}
                        <div>
                            <select
                                value={filters.fuel_type}
                                onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Fuel Types</option>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>

                        {/* Transmission Filter */}
                        <div>
                            <select
                                value={filters.transmission}
                                onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Transmissions</option>
                                <option value="automatic">Automatic</option>
                                <option value="manual">Manual</option>
                                <option value="cvt">CVT</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div>
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (KES)</label>
                            <input
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                placeholder="Min price per day"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (KES)</label>
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                placeholder="Max price per day"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilterChange}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? (
                                    <p>Loading ...</p>
                                ) : null}
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>


                {/* Cars Grid */}
                {!loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {cars?.length === 0 ? (
                            <div className="text-center py-12">
                                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
                                <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {cars?.map((car) => (
                                    <div key={car.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Car Image */}
                                        <div className="relative">
                                            <img
                                                src={car.primary_image || '/images/car-placeholder.jpg'}
                                                alt={car.name}
                                                className="w-full h-48 object-cover"
                                            />
                                            {hasExistingMarkup(car.id) && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                        Your Markup Active
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-3 left-3">
                                                <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                    {car.year}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Car Info */}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {car.name}
                                                </h3>
                                                <span className="text-lg font-bold text-blue-600">
                                                    KES {new Intl.NumberFormat('en-KE').format(car.amount)}
                                                    <span className="text-sm text-gray-500 font-normal">/day</span>
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3">
                                                {car.brand} {car.model}
                                            </p>

                                            {/* Car Specifications */}
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center">
                                                    <Fuel className="w-4 h-4 mr-1 text-gray-400" />
                                                    <span>{getFuelTypeLabel(car.fuel_type)}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                    <span>{getTransmissionLabel(car.transmission)}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                                                    <span>{car.seats} seats</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Car className="w-4 h-4 mr-1 text-gray-400" />
                                                    <span>{car.doors} doors</span>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            {car.location_address && (
                                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span className="truncate">{car.location_address}</span>
                                                </div>
                                            )}

                                            {/* Host Info */}
                                            <div className="border-t border-gray-200 pt-3 mt-3">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Owner:</span> {car.user?.name}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleAddMarkup(car)}
                                                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        hasExistingMarkup(car.id)
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    {hasExistingMarkup(car.id) ? 'Update Markup' : 'Add Markup'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.total > pagination.per_page && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center gap-2">
                            {/* Previous Page */}
                            {pagination.prev_page_url ? (
                                <Link
                                    href={pagination.prev_page_url}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    preserveState
                                >
                                    Previous
                                </Link>
                            ) : (
                                <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                                    Previous
                                </span>
                            )}

                            {/* Page Numbers */}
                            {pagination.links?.map((link, index) => (
                                <React.Fragment key={index}>
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            className={`px-4 py-2 rounded-lg ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                                            }`}
                                            preserveState
                                        >
                                            {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                                        </Link>
                                    ) : (
                                        <span
                                            className={`px-4 py-2 rounded-lg ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-400'
                                            }`}
                                        >
                                            {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}

                            {/* Next Page */}
                            {pagination.next_page_url ? (
                                <Link
                                    href={pagination.next_page_url}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    preserveState
                                >
                                    Next
                                </Link>
                            ) : (
                                <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                                    Next
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Markup Modal */}
            {showMarkupModal && selectedCar && (
                <AddMarkupModal
                    isOpen={showMarkupModal}
                    onClose={() => {
                        setShowMarkupModal(false);
                        setSelectedCar(null);
                    }}
                    item={selectedCar}
                    itemType="cars"
                    onSuccess={() => {
                        handleFilterChange(); // Refresh the list
                    }}
                />
            )}
        </Layout>
    );
};

export default BrowseCars;
