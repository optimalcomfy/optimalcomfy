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
            preserveState: false,
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Location..."
                                className="browse-properties-input"
                            />
                        </div>

                        {/* Search Button */}
                        <div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="browse-properties-search-btn"
                            >
                                <Search className="browse-properties-search-btn-icon" />
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="browse-properties-price-grid">
                        <div>
                            <label className="browse-properties-price-label">Min Price</label>
                            <div className="browse-properties-price-input-container">
                                <DollarSign className="browse-properties-price-icon" />
                                <input
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    placeholder="Min price"
                                    className="browse-properties-price-input"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="browse-properties-price-label">Max Price</label>
                            <div className="browse-properties-price-input-container">
                                <DollarSign className="browse-properties-price-icon" />
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    placeholder="Max price"
                                    className="browse-properties-price-input"
                                />
                            </div>
                        </div>
                        <div className="browse-properties-filter-buttons">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="browse-properties-apply-btn"
                            >
                                {loading ? 'Applying...' : 'Apply Filters'}
                            </button>
                            <button
                                onClick={clearFilters}
                                disabled={loading}
                                className="browse-properties-clear-btn"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                {properties.length > 0 && (
                    <div className="browse-properties-results-info">
                        <p className="browse-properties-results-text">
                            Showing {properties.length} of {pagination.total || properties.length} properties
                            {pagination.current_page && ` (Page ${pagination.current_page} of ${pagination.last_page})`}
                        </p>

                        {pagination.last_page > 1 && (
                            <div className="browse-properties-pagination-info">
                                <span>Page {pagination.current_page} of {pagination.last_page}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Properties Grid */}
                {loading && properties.length === 0 ? (
                    <div className="browse-properties-loading">
                        <div className="browse-properties-spinner"></div>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="browse-properties-empty">
                        <Home className="browse-properties-empty-icon" />
                        <h3 className="browse-properties-empty-title">No properties found</h3>
                        <p className="browse-properties-empty-text">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="browse-properties-grid">
                            {properties.map((property) => (
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
                                        <h3 className="browse-properties-name">
                                            {property.property_name}
                                        </h3>
                                        <p className="browse-properties-location">
                                            <MapPin className="browse-properties-location-icon" />
                                            <span className="browse-properties-location-text">{property.location}</span>
                                        </p>
                                        <div className="browse-properties-meta">
                                            <span className="browse-properties-type">{property.type}</span>
                                            <span className="browse-properties-price">
                                                KES {new Intl.NumberFormat('en-KE').format(property.price_per_night)}
                                            </span>
                                        </div>

                                        {/* Platform Price */}
                                        <div className="browse-properties-platform-info">
                                            <div className="browse-properties-platform-row">
                                                <span className="browse-properties-platform-label">Platform Price:</span>
                                                <span className="browse-properties-platform-value">KES {new Intl.NumberFormat('en-KE').format(property.platform_price)}</span>
                                            </div>
                                            <div className="browse-properties-platform-row">
                                                <span className="browse-properties-platform-label">Platform Charges:</span>
                                                <span className="browse-properties-platform-value">KES {new Intl.NumberFormat('en-KE').format(property.platform_charges)}</span>
                                            </div>
                                        </div>

                                        {/* Host Info */}
                                        <div className="browse-properties-host-info">
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

                        {/* Pagination Controls */}
                        {pagination.last_page > 1 && (
                            <div className="browse-properties-pagination">
                                <div className="browse-properties-pagination-links">
                                    {pagination.links?.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(link.url)}
                                            disabled={!link.url || link.active || loading}
                                            className={`browse-properties-pagination-btn ${
                                                link.active
                                                    ? 'browse-properties-pagination-btn-active'
                                                    : link.url
                                                    ? 'browse-properties-pagination-btn-inactive'
                                                    : 'browse-properties-pagination-btn-disabled'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>

                                <div className="browse-properties-page-info">
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
                        router.reload({ only: ['properties', 'pagination'] });
                    }}
                />
            )}
        </Layout>
    );
};

export default BrowseProperties;
