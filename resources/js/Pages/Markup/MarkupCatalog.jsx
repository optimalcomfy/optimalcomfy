// resources/js/Pages/Markup/Catalog.jsx
import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { Car, Home, MapPin, Star, Filter, Search, X, User, Phone, Mail, ChevronLeft, ChevronRight, Shield, CreditCard } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MarkupCatalog = () => {
    const { auth, host, markups } = usePage().props;
    const [filteredMarkups, setFilteredMarkups] = useState(markups || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [currentImageIndices, setCurrentImageIndices] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    console.log('Markups data:', markups);

    // Your color scheme
    const colors = {
        background: '#f4f4f4',
        primary: '#0f3b48',
        accent: '#d15026'
    };

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        filterMarkups();
        // Initialize image indices
        const initialIndices = {};
        markups?.forEach((markup) => {
            initialIndices[markup.id] = 0;
        });
        setCurrentImageIndices(initialIndices);
    }, [searchTerm, typeFilter, markups]);

    const filterMarkups = () => {
        let filtered = markups || [];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(markup =>
                markup.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                markup.item.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(markup =>
                typeFilter === 'cars' ? markup.type === 'App\\Models\\Car' : markup.type === 'App\\Models\\Property'
            );
        }

        setFilteredMarkups(filtered);
    };

    const getItemTypeIcon = (type) => {
        return type === 'App\\Models\\Car' ? <Car className="h-4" /> : <Home className="h-4" />;
    };

    const getItemTypeLabel = (type) => {
        return type === 'App\\Models\\Car' ? 'Car Rental' : 'Property';
    };

    const formatPrice = (price) => {
        // Ensure price is a number
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(numericPrice);
    };

    // Image slider functions
    const nextImage = (markupId, imagesLength) => {
        setCurrentImageIndices(prev => ({
            ...prev,
            [markupId]: prev[markupId] === imagesLength - 1 ? 0 : prev[markupId] + 1
        }));
    };

    const prevImage = (markupId, imagesLength) => {
        setCurrentImageIndices(prev => ({
            ...prev,
            [markupId]: prev[markupId] === 0 ? imagesLength - 1 : prev[markupId] - 1
        }));
    };

    const goToImage = (markupId, index) => {
        setCurrentImageIndices(prev => ({
            ...prev,
            [markupId]: index
        }));
    };

    // Get images for a markup item
    const getItemImages = (markup) => {
        const images = [];
        const isCar = markup.type === 'App\\Models\\Car';

        // Use the main image from item data
        if (markup.item.image) {
            images.push(markup.item.image);
        }

        // For cars with media
        if (isCar && markup.item.media && markup.item.media.length > 0) {
            markup.item.media.forEach(media => {
                if (media.url && !images.includes(`/storage/${media.url}`)) {
                    images.push(`/storage/${media.url}`);
                }
            });
        }

        // For properties with gallery
        if (!isCar && markup.item.initial_gallery && markup.item.initial_gallery.length > 0) {
            markup.item.initial_gallery.forEach(gallery => {
                if (gallery.image && !images.includes(`/storage/${gallery.image}`)) {
                    images.push(`/storage/${gallery.image}`);
                }
            });
        }

        // Remove duplicates and ensure we have at least one image
        const uniqueImages = [...new Set(images)];
        if (uniqueImages.length === 0) {
            uniqueImages.push(isCar ? '/cars/images/cars/placeholder.jpg' : '/images/property-placeholder.jpg');
        }

        return uniqueImages;
    };

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title={`${host?.name}'s Exclusive Offers`} />
                <ToastContainer position="top-right" autoClose={3000} />

                <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
                    {/* Hero Section */}
                    <div style={{ backgroundColor: colors.primary }} className="text-white">
                        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                                {/* Host Info */}
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="relative">
                                        <img
                                            src={host?.profile_picture ? `/storage/${host.profile_picture}` : '/images/default-avatar.png'}
                                            alt={host?.name}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg object-cover"
                                            onError={(e) => {
                                                e.target.src = '/images/default-avatar.png';
                                            }}
                                        />
                                        {host?.ristay_verified && (
                                            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-green-500 rounded-full p-1">
                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight text-[#d15026]">
                                            {host?.name}'s Exclusive Offers
                                        </h1>
                                        <p className="text-blue-100 text-sm sm:text-base">
                                            {host?.user_type === 'host' ? 'Premium host' : 'Verified partner'} with special pricing
                                        </p>
                                        {host?.bio && (
                                            <p className="text-blue-200 mt-2 max-w-2xl text-xs sm:text-sm">
                                                {host.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
                                    <div>
                                        <span className="font-semibold text-gray-900">{filteredMarkups.length}</span> offers available
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className="font-semibold text-gray-900">
                                            {markups?.filter(m => m.type === 'App\\Models\\Property').length || 0}
                                        </span> properties
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className="font-semibold text-gray-900">
                                            {markups?.filter(m => m.type === 'App\\Models\\Car').length || 0}
                                        </span> cars
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                                {/* Search */}
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 sm:h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search properties or cars..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Filter Buttons */}
                                <div className={`flex lg:flex flex-wrap gap-2`}>
                                    <button
                                        onClick={() => setTypeFilter('all')}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                            typeFilter === 'all'
                                                ? 'text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        style={{ backgroundColor: typeFilter === 'all' ? colors.accent : undefined }}
                                    >
                                        All Offers
                                    </button>
                                    <button
                                        onClick={() => setTypeFilter('properties')}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 ${
                                            typeFilter === 'properties'
                                                ? 'text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        style={{ backgroundColor: typeFilter === 'properties' ? colors.accent : undefined }}
                                    >
                                        <Home className="h-3 sm:h-4" />
                                        Properties
                                    </button>
                                    <button
                                        onClick={() => setTypeFilter('cars')}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 ${
                                            typeFilter === 'cars'
                                                ? 'text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        style={{ backgroundColor: typeFilter === 'cars' ? colors.accent : undefined }}
                                    >
                                        <Car className="h-3 sm:h-4" />
                                        Cars
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Markups Grid */}
                        {filteredMarkups.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No offers found</h3>
                                <p className="text-gray-500 text-sm sm:text-base">
                                    {searchTerm || typeFilter !== 'all'
                                        ? 'Try adjusting your search or filters'
                                        : 'No exclusive offers available at the moment'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {filteredMarkups.map((markup) => {
                                    const images = getItemImages(markup);
                                    const currentIndex = currentImageIndices[markup.id] || 0;
                                    const isCar = markup.type === 'App\\Models\\Car';
                                    const finalPrice = parseFloat(markup?.item?.final_amount);


                                    return (
                                        <div key={markup.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                                            {/* Image Slider */}
                                            <div className="relative h-48 sm:h-56 bg-gray-200">
                                                <img
                                                    src={images[currentIndex]}
                                                    alt={markup.item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = isCar ? '/cars/images/cars/placeholder.jpg' : '/images/property-placeholder.jpg';
                                                    }}
                                                />

                                                {images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => prevImage(markup.id, images.length)}
                                                            className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                                                        >
                                                            <ChevronLeft className="h-3 sm:h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => nextImage(markup.id, images.length)}
                                                            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                                                        >
                                                            <ChevronRight className="h-3 sm:h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Type Badge */}
                                                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                    {getItemTypeIcon(markup.type)}
                                                    {getItemTypeLabel(markup.type)}
                                                </div>

                                                {images.length > 1 && (
                                                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                                        {currentIndex + 1} / {images.length}
                                                    </div>
                                                )}

                                                {/* Image Dots */}
                                                {images.length > 1 && (
                                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                                        {images.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => goToImage(markup.id, index)}
                                                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                                    index === currentIndex
                                                                        ? 'bg-white'
                                                                        : 'bg-white/50 hover:bg-white/70'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 sm:p-6">
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base sm:text-lg">
                                                    {markup.item.name}
                                                </h3>

                                                {markup.item.location && (
                                                    <div className="flex items-start gap-1 text-sm text-gray-600 mb-3">
                                                        <MapPin className="h-3 sm:h-4 flex-shrink-0 mt-0.5" />
                                                        <span className="flex-1">{markup.item.location}</span>
                                                    </div>
                                                )}

                                                {/* Pricing - Only show final price */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-gray-900">Price:</span>
                                                        <span className="text-lg sm:text-xl font-bold" style={{ color: colors.accent }}>
                                                            {formatPrice(finalPrice)}
                                                            <span className="text-sm font-normal text-gray-600 ml-1">
                                                                {isCar ? '/day' : '/night'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-right mt-1">
                                                        All fees included
                                                    </div>
                                                </div>

                                                {/* Features */}
                                                {markup.item.features && markup.item.features.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {markup.item.features.slice(0, 3).map((feature, index) => (
                                                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                                {feature}
                                                            </span>
                                                        ))}
                                                        {markup.item.features.length > 3 && (
                                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                                +{markup.item.features.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Book Button */}
                                                <a
                                                    href={markup.markup_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full text-white text-center py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold block text-sm sm:text-base"
                                                    style={{ backgroundColor: colors.primary }}
                                                >
                                                    Book Now
                                                </a>

                                                {/* Quick Info */}
                                                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                                    <span>Exclusive offer from {host?.name}</span>
                                                    {markup.item.rating && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 fill-yellow-400 text-yellow-400" />
                                                            <span>{markup.item.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Trust Badges */}
                        {filteredMarkups.length > 0 && (
                            <div className="mt-8 sm:mt-12 text-center">
                                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Why Book With {host?.name}?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 justify-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${colors.primary}15` }}>
                                                <Shield className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.primary }} />
                                            </div>
                                            <span className="font-semibold text-gray-900">Secure Booking</span>
                                            <span className="mt-1">Safe and protected payments</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${colors.accent}15` }}>
                                                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.accent }} />
                                            </div>
                                            <span className="font-semibold text-gray-900">Best Value</span>
                                            <span className="mt-1">Competitive pricing & premium service</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${colors.primary}15` }}>
                                                <User className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.primary }} />
                                            </div>
                                            <span className="font-semibold text-gray-900">24/7 Support</span>
                                            <span className="mt-1">Always here to help you</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </LayoutProvider>
        </PrimeReactProvider>
    );
};

export default MarkupCatalog;
