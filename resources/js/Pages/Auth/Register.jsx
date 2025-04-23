import React, { useState, useEffect } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../../css/main';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', 
        email: '', 
        phone: '', 
        password: '', 
        password_confirmation: '',
        date_of_birth: '', 
        nationality: '', 
        address: '', 
        city: '',
        country: '',
        postal_code: '',
        profile_picture: null,
        id_verification: null,
        bio: '',
        preferred_payment_method: '',
        emergency_contact: '',
        user_type: 'guest', // 'guest' or 'host'
        // Host-specific fields
        property_type: '',
        property_address: '',
        property_description: '',
        property_photos: null,
        amenities: '',
        pricing: '',
        availability: '',
    });

    const { notification } = usePage().props;

    const [step, setStep] = useState(1);
    const [totalSteps, setTotalSteps] = useState(4);

    // Update total steps based on user type selection
    useEffect(() => {
        setTotalSteps(data.user_type === 'host' ? 5 : 4);
    }, [data.user_type]);

    const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Registration successful!');
                reset();
            },
            onError: (errors) => {
                // Loop over each error field and display a toast notification
                Object.keys(errors).forEach((field) => {
                    const errorMessages = errors[field];
                    if (Array.isArray(errorMessages)) {
                        errorMessages.forEach((message) => toast.error(message));
                    } else {
                        toast.error(errorMessages);
                    }
                });
            }
        });
    };

    return (
        <PrimeReactProvider>
        <LayoutProvider>
            <HomeLayout>
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-100 text-xl">
                <Head title="Register - Airbnb Clone" />
                
                <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
                    <h2 className="text-center text-3xl font-bold mb-6 text-red-500">Create Your Account</h2>

                    {step === 1 && (
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-semibold mb-4">I want to register as a:</h3>
                            <div className="flex justify-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setData('user_type', 'guest')}
                                    className={`px-6 py-4 rounded-lg flex flex-col items-center border-2 ${
                                        data.user_type === 'guest' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium">Guest</span>
                                    <span className="text-sm text-gray-500">I want to book stays</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setData('user_type', 'host')}
                                    className={`px-6 py-4 rounded-lg flex flex-col items-center border-2 ${
                                        data.user_type === 'host' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="font-medium">Host</span>
                                    <span className="text-sm text-gray-500">I want to rent my property</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="relative w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {step === 2 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            id="name" 
                                            value={data.name} 
                                            onChange={(e) => setData('name', e.target.value)} 
                                            placeholder="Full Name" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            id="email" 
                                            value={data.email} 
                                            onChange={(e) => setData('email', e.target.value)} 
                                            placeholder="Email" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block mb-1">Phone</label>
                                        <input 
                                            type="tel" 
                                            name="phone" 
                                            id="phone" 
                                            value={data.phone} 
                                            onChange={(e) => setData('phone', e.target.value)} 
                                            placeholder="Phone" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="date_of_birth" className="block mb-1">Date of Birth</label>
                                        <input 
                                            type="date" 
                                            name="date_of_birth" 
                                            id="date_of_birth" 
                                            value={data.date_of_birth} 
                                            onChange={(e) => setData('date_of_birth', e.target.value)} 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Account Security</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="password" className="block mb-1">Password</label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            id="password" 
                                            value={data.password} 
                                            onChange={(e) => setData('password', e.target.value)} 
                                            placeholder="Create a password" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block mb-1">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            name="password_confirmation" 
                                            id="password_confirmation" 
                                            value={data.password_confirmation} 
                                            onChange={(e) => setData('password_confirmation', e.target.value)} 
                                            placeholder="Confirm your password" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="emergency_contact" className="block mb-1">Emergency Contact (Name and Phone)</label>
                                        <input 
                                            type="text" 
                                            name="emergency_contact" 
                                            id="emergency_contact" 
                                            value={data.emergency_contact} 
                                            onChange={(e) => setData('emergency_contact', e.target.value)} 
                                            placeholder="Name and phone number" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Profile Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="address" className="block mb-1">Address</label>
                                        <input 
                                            type="text" 
                                            name="address" 
                                            id="address" 
                                            value={data.address} 
                                            onChange={(e) => setData('address', e.target.value)} 
                                            placeholder="Street address" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block mb-1">City</label>
                                        <input 
                                            type="text" 
                                            name="city" 
                                            id="city" 
                                            value={data.city} 
                                            onChange={(e) => setData('city', e.target.value)} 
                                            placeholder="City" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="block mb-1">Country</label>
                                        <input 
                                            type="text" 
                                            name="country" 
                                            id="country" 
                                            value={data.country} 
                                            onChange={(e) => setData('country', e.target.value)} 
                                            placeholder="Country" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="postal_code" className="block mb-1">Postal Code</label>
                                        <input 
                                            type="text" 
                                            name="postal_code" 
                                            id="postal_code" 
                                            value={data.postal_code} 
                                            onChange={(e) => setData('postal_code', e.target.value)} 
                                            placeholder="Postal Code" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="profile_picture" className="block mb-1">Profile Picture</label>
                                        <input 
                                            type="file" 
                                            id="profile_picture" 
                                            onChange={(e) => setData('profile_picture', e.target.files[0])} 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="id_verification" className="block mb-1">ID Verification (Passport/ID)</label>
                                        <input 
                                            type="file" 
                                            id="id_verification" 
                                            onChange={(e) => setData('id_verification', e.target.files[0])} 
                                            className="w-full p-2 border rounded" 
                                        />
                                        <p className="text-sm text-gray-500 mt-1">For security and verification purposes</p>
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="bio" className="block mb-1">About You</label>
                                        <textarea 
                                            name="bio" 
                                            id="bio" 
                                            value={data.bio} 
                                            onChange={(e) => setData('bio', e.target.value)} 
                                            placeholder="Tell us a bit about yourself..." 
                                            className="w-full p-2 border rounded h-24" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && data.user_type === 'host' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="property_type" className="block mb-1">Property Type</label>
                                        <select 
                                            name="property_type" 
                                            id="property_type" 
                                            value={data.property_type} 
                                            onChange={(e) => setData('property_type', e.target.value)} 
                                            className="w-full p-2 border rounded" 
                                        >
                                            <option value="">Select property type</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="house">House</option>
                                            <option value="condo">Condo</option>
                                            <option value="villa">Villa</option>
                                            <option value="cabin">Cabin</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="pricing" className="block mb-1">Price per Night ($)</label>
                                        <input 
                                            type="number" 
                                            name="pricing" 
                                            id="pricing" 
                                            value={data.pricing} 
                                            onChange={(e) => setData('pricing', e.target.value)} 
                                            placeholder="Price in USD" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="property_address" className="block mb-1">Property Address</label>
                                        <input 
                                            type="text" 
                                            name="property_address" 
                                            id="property_address" 
                                            value={data.property_address} 
                                            onChange={(e) => setData('property_address', e.target.value)} 
                                            placeholder="Full property address" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="property_description" className="block mb-1">Property Description</label>
                                        <textarea 
                                            name="property_description" 
                                            id="property_description" 
                                            value={data.property_description} 
                                            onChange={(e) => setData('property_description', e.target.value)} 
                                            placeholder="Describe your property..." 
                                            className="w-full p-2 border rounded h-24" 
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="amenities" className="block mb-1">Amenities (comma separated)</label>
                                        <input 
                                            type="text" 
                                            name="amenities" 
                                            id="amenities" 
                                            value={data.amenities} 
                                            onChange={(e) => setData('amenities', e.target.value)} 
                                            placeholder="WiFi, Pool, Kitchen, etc." 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="property_photos" className="block mb-1">Property Photos</label>
                                        <input 
                                            type="file" 
                                            id="property_photos" 
                                            onChange={(e) => setData('property_photos', e.target.files)} 
                                            className="w-full p-2 border rounded"
                                            multiple 
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Upload up to 5 photos of your property</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            {step > 1 && (
                                <button 
                                    type="button" 
                                    onClick={prevStep} 
                                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                                >
                                    Back
                                </button>
                            )}
                            
                            {step < totalSteps && (
                                <button 
                                    type="button" 
                                    onClick={nextStep} 
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    Next
                                </button>
                            )}
                            
                            {step === totalSteps && (
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    {processing ? 'Creating Account...' : 'Create Account'}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account? 
                            <Link href="/login" className="text-red-500 ml-1 hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}