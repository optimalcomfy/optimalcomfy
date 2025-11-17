import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Plus, Search, Filter, Home, DollarSign, MapPin, Eye } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddMarkupModal from '@/Components/AddMarkupModal';
import './browse-properties.css';

const BrowseProperties = ({ auth, properties: initialProperties, pagination: initialPagination, filters: initialFilters }) => {
    const { props } = usePage();

    const [properties, setProperties] = useState([]);
    const [pagination, setPagination] = useState(initialPagination || {});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
    const [filters, setFilters] = useState({
        type: initialFilters?.type || '',
        minPrice: initialFilters?.minPrice || '',
        maxPrice: initialFilters?.maxPrice || '',
        location: initialFilters?.location || ''
    });
    const [showMarkupModal, setShowMarkupModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [propertiesWithMarkupStatus, setPropertiesWithMarkupStatus] = useState([]);

    // Initialize properties with markup status on component mount and when properties change
    useEffect(() => {
        let propertiesData = [];

        if (Array.isArray(initialProperties)) {
            propertiesData = initialProperties;
        } else if (initialProperties?.data) {
            propertiesData = initialProperties.data;
        }

        if (propertiesData && propertiesData.length > 0) {
            const propertiesWithStatus = propertiesData.map(property => ({
                ...property,
                has_user_markup: property.has_user_markup || false
            }));
            setPropertiesWithMarkupStatus(propertiesWithStatus);
        } else {
            setPropertiesWithMarkupStatus([]);
        }

        if (initialPagination) {
            setPagination(initialPagination);
        }
    }, [initialProperties, initialPagination]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== initialFilters?.search) {
                handleFilterChange();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Handle filter changes
    useEffect(() => {
        handleFilterChange();
    }, [filters]);

    const handleFilterChange = () => {
        setLoading(true);

        router.get(route('markup.browse.properties'), {
            search: searchTerm,
            ...filters
        }, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleAddMarkup = (property) => {
        // Use platform_price for markup calculations instead of amount
        const propertyWithPlatformPrice = {
            ...property,
            // Ensure we're using platform_price for markup calculations
            platform_price: property.platform_price || property.price_per_night,
            base_price: property.platform_price || property.price_per_night // Add base_price for clarity
        };

        setSelectedProperty(propertyWithPlatformPrice);
        setShowMarkupModal(true);
    };

    const hasExistingMarkup = (propertyId) => {
        const property = propertiesWithMarkupStatus.find(p => p.id === propertyId);
        return property?.has_user_markup || false;
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            minPrice: '',
            maxPrice: '',
            location: ''
        });
        setSearchTerm('');
    };

    // Update markup status when modal closes (after successful markup addition/update)
    const handleMarkupModalClose = (success = false) => {
        if (success && selectedProperty) {
            // Update the local state to reflect the new markup status
            setPropertiesWithMarkupStatus(prevProperties =>
                prevProperties.map(property =>
                    property.id === selectedProperty.id
                        ? { ...property, has_user_markup: true }
                        : property
                )
            );
        }
        setShowMarkupModal(false);
        setSelectedProperty(null);
    };

    const handlePageChange = (url) => {
        if (url && !loading) {
            setLoading(true);
            router.get(url, {}, {
                preserveState: true,
                only: ['properties', 'pagination'],
                onSuccess: (page) => {
                    const newProperties = page.props.properties?.data || [];
                    setPropertiesWithMarkupStatus(newProperties);
                    setPagination(page.props.pagination || {});
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onFinish: () => setLoading(false)
            });
        }
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
            <Head title="Browse Properties for Markup" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="browse-properties-container">
                {/* Header */}
                <div className="browse-properties-header">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="browse-properties-title">Browse Properties</h1>
                            <p className="browse-properties-subtitle">
                                Add your markup to any property and earn profit from bookings
                            </p>
                        </div>
                        <Link
                            href={route('markup.browse.cars')}
                            className="browse-properties-browse-link"
                        >
                            Browse Cars Instead
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
                                    placeholder="Search properties..."
                                    className="browse-properties-input"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="browse-properties-select"
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
                                placeholder="Location..."
                                className="browse-properties-input"
                            />
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
                                    placeholder="Min price per night"
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
                                    placeholder="Max price per night"
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

                {/* Properties Grid */}
                {!loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {propertiesWithMarkupStatus?.length === 0 ? (
                            <div className="browse-properties-empty">
                                <Home className="browse-properties-empty-icon" />
                                <h3 className="browse-properties-empty-title">No properties found</h3>
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
                                {propertiesWithMarkupStatus?.map((property) => (
                                    <div key={property.id} className="browse-properties-card">
                                        {/* Property Image */}
                                        <div className="browse-properties-image-container">
                                            <img
                                                src={property.primary_image || '/images/placeholder-property.jpg'}
                                                alt={property.property_name}
                                                className="browse-properties-image"
                                                onError={(e) => {
                                                    e.target.src = '/images/placeholder-property.jpg';
                                                }}
                                            />
                                            {hasExistingMarkup(property.id) && (
                                                <div className="browse-properties-markup-badge">
                                                    <span className="browse-properties-markup-active">
                                                        Your Markup Active
                                                    </span>
                                                </div>
                                            )}
                                            <div className="browse-properties-type-badge">
                                                <span>{property.type}</span>
                                            </div>
                                        </div>

                                        {/* Property Info */}
                                        <div className="browse-properties-info">
                                            <div className="browse-properties-meta mb-2">
                                                <h3 className="browse-properties-name">
                                                    {property.property_name}
                                                </h3>
                                                <div className="flex flex-col items-end">
                                                    <span className="browse-properties-price">
                                                        KES {new Intl.NumberFormat('en-KE').format(property.platform_price || property.price_per_night)}
                                                        <span className="text-sm text-gray-500 font-normal">/night</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            {property.location && (
                                                <div className="browse-properties-location mb-3">
                                                    <MapPin className="browse-properties-location-icon" />
                                                    <span className="browse-properties-location-text">{property.location}</span>
                                                </div>
                                            )}

                                            {/* Property Type */}
                                            <div className="browse-properties-type-info mb-3">
                                                <span className="browse-properties-type-tag">{property.type}</span>
                                            </div>

                                            {/* Host Info */}
                                            <div className="browse-properties-host-info mb-3">
                                                <div className="browse-properties-host-row">
                                                    <span className="browse-properties-host-label">Host:</span>
                                                    <span>{property.user?.name}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="browse-properties-actions">
                                                <button
                                                    onClick={() => handleAddMarkup(property)}
                                                    className={`browse-properties-markup-btn ${
                                                        hasExistingMarkup(property.id)
                                                            ? 'browse-properties-markup-btn-success'
                                                            : 'browse-properties-markup-btn-primary'
                                                    }`}
                                                >
                                                    <Plus className="browse-properties-markup-btn-icon" />
                                                    {hasExistingMarkup(property.id) ? 'Update Markup' : 'Add Markup'}
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
                            Total {pagination.total} properties
                        </div>
                    </div>
                )}
            </div>

            {/* Add Markup Modal */}
            {showMarkupModal && selectedProperty && (
                <AddMarkupModal
                    isOpen={showMarkupModal}
                    onClose={handleMarkupModalClose}
                    item={selectedProperty}
                    itemType="properties"
                    onSuccess={() => {
                        handleMarkupModalClose(true);
                        handleFilterChange(); // Refresh the list
                    }}
                />
            )}
        </Layout>
    );
};

export default BrowseProperties;
