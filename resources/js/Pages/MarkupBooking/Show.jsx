import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import HomeLayout from "@/Layouts/HomeLayout";
import { Calendar, DollarSign, User, Shield, MapPin, Star, Car, Home, ChevronLeft, ChevronRight, CreditCard, Phone, Mail } from 'lucide-react';

const MarkupBookingShow = ({ item, markup, markupToken, type }) => {
    const { auth, company } = usePage().props;
    const [form, setForm] = useState({
        start_date: '',
        end_date: '',
        special_requests: '',
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        phone: auth.user?.phone?.replace(/^254/, '') || ''
    });
    const [loading, setLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [userExists, setUserExists] = useState(!!auth.user);

    const isCar = type === 'cars';

    // Get all images for the slider
    const getAllImages = () => {
        const images = [];

        if (isCar) {
            if (item.media && item.media.length > 0) {
                item.media.forEach(media => {
                    if (media.url) images.push(`/storage/${media.url}`);
                });
            }
            if (item.initial_gallery && item.initial_gallery.length > 0) {
                item.initial_gallery.forEach(gallery => {
                    if (gallery.image) images.push(`/storage/${gallery.image}`);
                });
            }
        } else {
            if (item.initial_gallery && item.initial_gallery.length > 0) {
                item.initial_gallery.forEach(gallery => {
                    if (gallery.image) images.push(`/storage/${gallery.image}`);
                });
            }
        }

        if (images.length === 0) {
            images.push(isCar ? '/cars/images/cars/placeholder.jpg' : '/images/property-placeholder.jpg');
        }

        return images;
    };

    const images = getAllImages();

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    // Check if user exists by email
    const checkUserExists = async (email) => {
        if (!email) return;

        try {
            const response = await fetch(`/api/check-user-exists?email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.exists) {
                setUserExists(true);
                setForm(prev => ({
                    ...prev,
                    name: data.user.name,
                    phone: data.user.phone?.replace(/^254/, '') || prev.phone
                }));
            } else {
                setUserExists(false);
            }
        } catch (error) {
            console.error('Error checking user:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        if (!form.name || !form.email) {
            alert('Please enter your name and email');
            return;
        }

        if (!form.phone || form.phone.length !== 9) {
            alert('Please enter a valid 9-digit phone number (after 254)');
            return;
        }

        if (!form.start_date || !form.end_date) {
            alert('Please select booking dates');
            return;
        }

        setLoading(true);

        router.post(route('markup.booking.process', markupToken), {
            ...form,
            phone: '254' + form.phone // Add 254 prefix for backend
        }, {
            onSuccess: () => {
                setLoading(false);
            },
            onError: (errors) => {
                setLoading(false);
                if (errors.email) {
                    alert(errors.email);
                } else if (errors.phone) {
                    alert(errors.phone);
                } else {
                    alert('Please check your information and try again.');
                }
            }
        });
    };

    const calculateTotal = () => {
        if (!form.start_date || !form.end_date) return 0;

        const start = new Date(form.start_date);
        const end = new Date(form.end_date);

        if (isCar) {
            // Calculate days for cars (minimum 1 day)
            const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            return days * markup.final_amount;
        } else {
            // Calculate nights for properties (minimum 1 night)
            const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            return nights * markup.final_amount;
        }
    };

    const calculateDuration = () => {
        if (!form.start_date || !form.end_date) return { value: 0, unit: '' };

        const start = new Date(form.start_date);
        const end = new Date(form.end_date);

        if (isCar) {
            const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            return { value: days, unit: days === 1 ? 'day' : 'days' };
        } else {
            const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            return { value: nights, unit: nights === 1 ? 'night' : 'nights' };
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price).replace('KES', 'KES ');
    };

    const duration = calculateDuration();

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title={`Book ${item.name || item.property_name}`} />
                <HomeLayout>
                    <div className="min-h-screen bg-gray-50 py-8">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="grid md:grid-cols-2 gap-8 p-8">
                                    {/* Left Column - Item Details */}
                                    <div>
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                {isCar ? (
                                                    <Car className="w-6 h-6 text-blue-600" />
                                                ) : (
                                                    <Home className="w-6 h-6 text-green-600" />
                                                )}
                                                <h1 className="text-3xl font-bold text-gray-900">
                                                    Book {item.name || item.property_name}
                                                </h1>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="w-4 h-4" />
                                                <p>Shared by {markup.user?.name || 'a host'}</p>
                                            </div>
                                        </div>

                                        {/* Image Slider */}
                                        <div className="mb-6 relative">
                                            <div className="relative h-64 rounded-xl overflow-hidden">
                                                <img
                                                    src={images[currentImageIndex]}
                                                    alt={`${item.name || item.property_name} - Image ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = isCar ? '/cars/images/cars/placeholder.jpg' : '/images/property-placeholder.jpg';
                                                    }}
                                                />

                                                {images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={prevImage}
                                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                                        >
                                                            <ChevronLeft className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={nextImage}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                                        >
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {images.length > 1 && (
                                                    <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                                                        {currentImageIndex + 1} / {images.length}
                                                    </div>
                                                )}
                                            </div>

                                            {images.length > 1 && (
                                                <div className="flex justify-center mt-4 space-x-2">
                                                    {images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => goToImage(index)}
                                                            className={`w-2 h-2 rounded-full transition-all ${
                                                                index === currentImageIndex
                                                                    ? 'bg-blue-600 w-4'
                                                                    : 'bg-gray-300 hover:bg-gray-400'
                                                            }`}
                                                            aria-label={`Go to image ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Details */}
                                        <div className="mb-6">
                                            <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
                                            <div className="space-y-2 text-sm">
                                                {isCar ? (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Brand:</span>
                                                            <span className="font-medium">{item.brand}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Model:</span>
                                                            <span className="font-medium">{item.model}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Year:</span>
                                                            <span className="font-medium">{item.year}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Transmission:</span>
                                                            <span className="font-medium">{item.transmission}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Fuel Type:</span>
                                                            <span className="font-medium">{item.fuel_type}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Location:</span>
                                                            <span className="font-medium flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {item.location_address}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Type:</span>
                                                            <span className="font-medium">{item.type}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Location:</span>
                                                            <span className="font-medium flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {item.location}
                                                            </span>
                                                        </div>
                                                        {item.starRate && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Rating:</span>
                                                                <span className="font-medium flex items-center gap-1">
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                    {item.starRate}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Final Price Only */}
                                        <div className="bg-blue-50 rounded-xl p-6">
                                            <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between font-medium text-lg">
                                                    <span className="text-gray-900">Price:</span>
                                                    <span className="text-blue-600">
                                                        {formatPrice(markup.final_amount)} per {isCar ? 'day' : 'night'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 text-center">
                                                    All fees and charges included
                                                </p>
                                            </div>
                                        </div>

                                        {/* Trust Indicators */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Shield className="w-4 h-4 mr-2 text-green-500" />
                                                Secure booking through Ristay
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="w-4 h-4 mr-2 text-blue-500" />
                                                Verified host
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Booking Form */}
                                    <div>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Personal Information */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={form.name}
                                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Address *
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="email"
                                                            required
                                                            value={form.email}
                                                            onChange={e => {
                                                                setForm({ ...form, email: e.target.value });
                                                                // Check if user exists when email is changed
                                                                if (e.target.value.includes('@')) {
                                                                    checkUserExists(e.target.value);
                                                                }
                                                            }}
                                                            onBlur={(e) => checkUserExists(e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                                            placeholder="Enter your email address"
                                                        />
                                                        <Mail className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                                                    </div>
                                                    {userExists && (
                                                        <p className="mt-1 text-xs text-green-600">
                                                            ✓ Account found! We'll use your existing Ristay account.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Date/Time Selection */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {isCar ? 'Pickup Date & Time' : 'Check-in Date'}
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        value={form.start_date}
                                                        onChange={e => setForm({ ...form, start_date: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        min={new Date().toISOString().slice(0, 16)}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {isCar ? 'Return Date & Time' : 'Check-out Date'}
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        value={form.end_date}
                                                        onChange={e => setForm({ ...form, end_date: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        min={form.start_date || new Date().toISOString().slice(0, 16)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone Number for M-Pesa */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    M-Pesa Phone Number *
                                                </label>
                                                <div className="relative flex gap-1">
                                                    <div className="border rounded-tl-lg px-3 border-gray-300 rounded-bl-lg inset-y-0 left-0 flex items-center pointer-events-none text-gray-500">
                                                        +254
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={form.phone}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '');
                                                            setForm({ ...form, phone: value });
                                                        }}
                                                        className="pl-14 w-full px-4 py-3 rounded-tr-lg border-gray-300 rounded-br-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                        placeholder="712345678"
                                                        pattern="[0-9]{9}"
                                                        maxLength="9"
                                                        inputMode="numeric"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">Enter your 9-digit phone number after 254</p>
                                            </div>

                                            {/* Special Requests */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Special Requests (Optional)
                                                </label>
                                                <textarea
                                                    value={form.special_requests}
                                                    onChange={e => setForm({ ...form, special_requests: e.target.value })}
                                                    rows="3"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Any special requirements or requests..."
                                                />
                                            </div>

                                            {/* Booking Summary */}
                                            {form.start_date && form.end_date && (
                                                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                        <Calendar className="w-5 h-5 mr-2" />
                                                        Booking Summary
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Duration:</span>
                                                            <span>
                                                                {duration.value} {duration.unit}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Rate:</span>
                                                            <span>
                                                                {formatPrice(markup.final_amount)}/{isCar ? 'day' : 'night'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between font-medium text-lg border-t border-green-200 pt-3">
                                                            <span className="text-gray-900">Total Amount:</span>
                                                            <span className="text-green-600 font-bold">
                                                                {formatPrice(calculateTotal())}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <button
                                                type="submit"
                                                disabled={loading || !form.start_date || !form.end_date || !form.phone || form.phone.length !== 9 || !form.name || !form.email}
                                                className="w-full bg-gradient-to-r from-orange-400 to-rose-400 text-white py-4 px-6 rounded-lg hover:from-orange-500 hover:to-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center shadow-lg"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center">
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <CreditCard className="w-5 h-5 mr-2" />
                                                        Pay with M-Pesa
                                                    </div>
                                                )}
                                            </button>

                                            {/* Security Note */}
                                            <p className="text-xs text-gray-500 text-center">
                                                You will receive an M-Pesa prompt on your phone to complete the payment
                                            </p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
};

export default MarkupBookingShow;
