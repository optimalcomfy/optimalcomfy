import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Plus, Search, Filter, Car, DollarSign, MapPin, Eye, Users, Fuel, Calendar } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddMarkupModal from '@/Components/AddMarkupModal';
import './browse-properties.css'; // Using the same CSS file

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
                <div className="browse-properties-restricted">
                    <div className="browse-properties-warning">
                        <h2 className="browse-properties-warning-title">Access Restricted</h2>
                        <p className="browse-properties-warning-text">
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

            <div className="browse-properties-container">
                {/* Header */}
                <div className="browse-properties-header">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="browse-properties-title">Browse Cars</h1>
                            <p className="browse-properties-subtitle">
                                Add your markup to any car and earn profit from rentals
                            </p>
                        </div>
                        <Link
                            href={route('markup.browse.properties')}
                            className="browse-properties-browse-link"
                        >
                            Browse Properties Instead
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="browse-properties-filters">
                    <div className="browse-properties-search-grid">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="browse-properties-search-input">
                                <Search className="browse-properties-search-icon" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search ..."
                                    className="browse-properties-input"
                                />
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div>
                            <select
                                value={filters.brand}
                                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                className="browse-properties-select"
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
                                className="browse-properties-select"
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
                                className="browse-properties-select"
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
                                className="browse-properties-clear-btn"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="browse-properties-price-grid">
                        <div>
                            <label className="browse-properties-price-label">Min Price (KES)</label>
                            <div className="browse-properties-price-input-container">
                                <DollarSign className="browse-properties-price-icon" />
                                <input
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    placeholder="Min price per day"
                                    className="browse-properties-price-input"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="browse-properties-price-label">Max Price (KES)</label>
                            <div className="browse-properties-price-input-container">
                                <DollarSign className="browse-properties-price-icon" />
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    placeholder="Max price per day"
                                    className="browse-properties-price-input"
                                />
                            </div>
                        </div>
                        <div className="browse-properties-filter-buttons">
                            <button
                                onClick={handleFilterChange}
                                disabled={loading}
                                className="browse-properties-apply-btn"
                            >
                                {loading ? 'Loading ...' : 'Apply Filters'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cars Grid */}
                {!loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {cars?.length === 0 ? (
                            <div className="browse-properties-empty">
                                <Car className="browse-properties-empty-icon" />
                                <h3 className="browse-properties-empty-title">No cars found</h3>
                                <p className="browse-properties-empty-text">Try adjusting your search criteria</p>
                                <button
                                    onClick={clearFilters}
                                    className="browse-properties-browse-link mt-4"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="browse-properties-grid p-6">
                                {cars?.map((car) => (
                                    <div key={car.id} className="browse-properties-card">
                                        {/* Car Image */}
                                        <div className="browse-properties-image-container">
                                            <img
                                                src={car.primary_image || '/images/car-placeholder.jpg'}
                                                alt={car.name}
                                                className="browse-properties-image"
                                            />
                                            {hasExistingMarkup(car.id) && (
                                                <div className="browse-properties-markup-badge">
                                                    <span className="browse-properties-markup-active">
                                                        Your Markup Active
                                                    </span>
                                                </div>
                                            )}
                                            <div className="browse-properties-type-badge">
                                                <span>{car.year}</span>
                                            </div>
                                        </div>

                                        {/* Car Info */}
                                        <div className="browse-properties-info">
                                            <div className="browse-properties-meta mb-2">
                                                <h3 className="browse-properties-name">
                                                    {car.name}
                                                </h3>
                                                <span className="browse-properties-price">
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
                                                <div className="browse-properties-location mb-3">
                                                    <MapPin className="browse-properties-location-icon" />
                                                    <span className="browse-properties-location-text">{car.location_address}</span>
                                                </div>
                                            )}

                                            {/* Host Info */}
                                            <div className="browse-properties-host-info">
                                                <div className="browse-properties-host-row">
                                                    <span className="browse-properties-host-label">Owner:</span>
                                                    <span>{car.user?.name}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="browse-properties-actions">
                                                <button
                                                    onClick={() => handleAddMarkup(car)}
                                                    className={`browse-properties-markup-btn ${
                                                        hasExistingMarkup(car.id)
                                                            ? 'browse-properties-markup-btn-success'
                                                            : 'browse-properties-markup-btn-primary'
                                                    }`}
                                                >
                                                    <Plus className="browse-properties-markup-btn-icon" />
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
                    <div className="browse-properties-pagination">
                        <div className="browse-properties-pagination-links">
                            {/* Previous Page */}
                            {pagination.prev_page_url ? (
                                <Link
                                    href={pagination.prev_page_url}
                                    className="browse-properties-pagination-btn browse-properties-pagination-btn-inactive"
                                    preserveState
                                >
                                    Previous
                                </Link>
                            ) : (
                                <span className="browse-properties-pagination-btn browse-properties-pagination-btn-disabled">
                                    Previous
                                </span>
                            )}

                            {/* Page Numbers */}
                            {pagination.links?.map((link, index) => (
                                <React.Fragment key={index}>
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            className={`browse-properties-pagination-btn ${
                                                link.active
                                                    ? 'browse-properties-pagination-btn-active'
                                                    : 'browse-properties-pagination-btn-inactive'
                                            }`}
                                            preserveState
                                        >
                                            {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                                        </Link>
                                    ) : (
                                        <span
                                            className={`browse-properties-pagination-btn ${
                                                link.active
                                                    ? 'browse-properties-pagination-btn-active'
                                                    : 'browse-properties-pagination-btn-disabled'
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
                                    className="browse-properties-pagination-btn browse-properties-pagination-btn-inactive"
                                    preserveState
                                >
                                    Next
                                </Link>
                            ) : (
                                <span className="browse-properties-pagination-btn browse-properties-pagination-btn-disabled">
                                    Next
                                </span>
                            )}
                        </div>

                        {/* Page Info */}
                        <div className="browse-properties-page-info">
                            Page {pagination.current_page} of {pagination.last_page} •
                            Total {pagination.total} cars
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
