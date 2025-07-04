import React, { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { Avatar } from "primereact/avatar";

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const fileUploadRef = useRef(null);
    
    const countries = [
        { name: 'United States', code: 'US' },
        { name: 'Canada', code: 'CA' },
        { name: 'United Kingdom', code: 'UK' },
        // Add more countries as needed
    ];

    const paymentMethods = [
        { name: 'PayPal', code: 'paypal' },
        { name: 'Pesapal', code: 'pesapal' },
        { name: 'Credit Card', code: 'credit_card' },
        { name: 'Bank Transfer', code: 'bank_transfer' },
        { name: 'Crypto', code: 'crypto' },
    ];

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
        bio: user.bio || '',
        preferred_payment_method: user.preferred_payment_method || '',
        emergency_contact: user.emergency_contact || '',
        contact_phone: user.contact_phone || '',
        profile_picture: null,
        id_verification: null,
    });

    const [preview, setPreview] = useState({
        profile: user.profile_picture ? `/storage/${user.profile_picture}` : null,
        id: user.id_verification ? `/storage/${user.id_verification}` : null
    });

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setData(field, file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(prev => ({
                    ...prev,
                    [field]: event.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        router.post(route('profile.reload', { id: user.id }), formData, {
        forceFormData: true,
        preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and contact details.
                </p>
            </header>

            <form onSubmit={submit} className="mt-4 space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                        {preview.profile ? (
                            <Avatar 
                                image={preview.profile} 
                                size="xlarge" 
                                shape="circle" 
                                className="w-32 h-32 border-2 border-primary"
                            />
                        ) : (
                            <Avatar 
                                icon="pi pi-user" 
                                size="xlarge" 
                                shape="circle" 
                                className="w-32 h-32 bg-gray-200 border-2 border-primary"
                            />
                        )}
                    </div>
                    <label className="btn btn-primary cursor-pointer">
                        <span>Upload Profile Picture</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'profile_picture')}
                        />
                    </label>
                    <InputError message={errors.profile_picture} />
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-3 col">
                        <label htmlFor="name" className="block text-900 font-medium mb-2">Full Name</label>
                        <InputText
                            id="name"
                            type="text"
                            placeholder="Your full name"
                            className="w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="block text-900 font-medium mb-2">Email</label>
                        <InputText
                            id="email"
                            type="email"
                            placeholder="Email address"
                            className="w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-3">
                        <label htmlFor="contact_phone" className="block text-900 font-medium mb-2">Phone Number</label>
                        <InputText
                            id="contact_phone"
                            type="tel"
                            placeholder="+1 (123) 456-7890"
                            className="w-full"
                            value={data.contact_phone}
                            onChange={(e) => setData('contact_phone', e.target.value)}
                        />
                        <InputError message={errors.contact_phone} />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="emergency_contact" className="block text-900 font-medium mb-2">Emergency Contact</label>
                        <InputText
                            id="emergency_contact"
                            type="text"
                            placeholder="Name and phone number"
                            className="w-full"
                            value={data.emergency_contact}
                            onChange={(e) => setData('emergency_contact', e.target.value)}
                        />
                        <InputError message={errors.emergency_contact} />
                    </div>
                </div>

                {/* Address Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-3">
                        <label htmlFor="address" className="block text-900 font-medium mb-2">Street Address</label>
                        <InputText
                            id="address"
                            type="text"
                            placeholder="123 Main St"
                            className="w-full"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="city" className="block text-900 font-medium mb-2">City</label>
                        <InputText
                            id="city"
                            type="text"
                            placeholder="New York"
                            className="w-full"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                        />
                        <InputError message={errors.city} />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="postal_code" className="block text-900 font-medium mb-2">Postal Code</label>
                        <InputText
                            id="postal_code"
                            type="text"
                            placeholder="10001"
                            className="w-full"
                            value={data.postal_code}
                            onChange={(e) => setData('postal_code', e.target.value)}
                        />
                        <InputError message={errors.postal_code} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-3">
                        <label htmlFor="country" className="block text-900 font-medium mb-2">Country</label>
                        <Dropdown
                            id="country"
                            value={data.country}
                            options={countries}
                            optionLabel="name"
                            placeholder="Select Country"
                            className="w-full"
                            onChange={(e) => setData('country', e.value)}
                        />
                        <InputError message={errors.country} />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="preferred_payment_method" className="block text-900 font-medium mb-2">Preferred Payment Method</label>
                        <Dropdown
                            id="preferred_payment_method"
                            value={data.preferred_payment_method}
                            options={paymentMethods}
                            optionLabel="name"
                            placeholder="Select Payment Method"
                            className="w-full"
                            onChange={(e) => setData('preferred_payment_method', e.value)}
                        />
                        <InputError message={errors.preferred_payment_method} />
                    </div>
                </div>

                {/* Bio */}
                <div className="mb-3">
                    <label htmlFor="bio" className="block text-900 font-medium mb-2">About You</label>
                    <InputTextarea
                        id="bio"
                        rows={3}
                        placeholder="Tell us a little about yourself..."
                        className="w-full"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                    />
                    <InputError message={errors.bio} />
                </div>

                {/* ID Verification */}
                <div className="mb-6">
                    <label className="block text-900 font-medium mb-2">ID Verification</label>
                    {preview.id ? (
                        <div className="mb-3">
                            <img 
                                src={preview.id} 
                                alt="ID Verification" 
                                className="max-w-full h-auto border rounded-md"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-3">No ID verification uploaded yet</p>
                    )}
                    <label className="btn btn-outline-primary cursor-pointer">
                        <span>{preview.id ? 'Update ID' : 'Upload ID Verification'}</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(e, 'id_verification')}
                        />
                    </label>
                    <InputError message={errors.id_verification} />
                    <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your government-issued ID or passport</p>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="ml-1 underline text-sm text-yellow-700 hover:text-yellow-600"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'verification-link-sent' && (
                    <div className="mb-4 font-medium text-sm text-green-600">
                        A new verification link has been sent to your email address.
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">Profile updated successfully!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}