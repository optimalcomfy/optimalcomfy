import React, { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Avatar } from "primereact/avatar";

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const countries = [
        { name: 'Afghanistan', code: 'AF' },
        { name: 'Albania', code: 'AL' },
        { name: 'Algeria', code: 'DZ' },
        { name: 'Andorra', code: 'AD' },
        { name: 'Angola', code: 'AO' },
        { name: 'Antigua and Barbuda', code: 'AG' },
        { name: 'Argentina', code: 'AR' },
        { name: 'Armenia', code: 'AM' },
        { name: 'Australia', code: 'AU' },
        { name: 'Austria', code: 'AT' },
        { name: 'Azerbaijan', code: 'AZ' },
        { name: 'Bahamas', code: 'BS' },
        { name: 'Bahrain', code: 'BH' },
        { name: 'Bangladesh', code: 'BD' },
        { name: 'Barbados', code: 'BB' },
        { name: 'Belarus', code: 'BY' },
        { name: 'Belgium', code: 'BE' },
        { name: 'Belize', code: 'BZ' },
        { name: 'Benin', code: 'BJ' },
        { name: 'Bhutan', code: 'BT' },
        { name: 'Bolivia', code: 'BO' },
        { name: 'Bosnia and Herzegovina', code: 'BA' },
        { name: 'Botswana', code: 'BW' },
        { name: 'Brazil', code: 'BR' },
        { name: 'Brunei', code: 'BN' },
        { name: 'Bulgaria', code: 'BG' },
        { name: 'Burkina Faso', code: 'BF' },
        { name: 'Burundi', code: 'BI' },
        { name: 'Cabo Verde', code: 'CV' },
        { name: 'Cambodia', code: 'KH' },
        { name: 'Cameroon', code: 'CM' },
        { name: 'Canada', code: 'CA' },
        { name: 'Central African Republic', code: 'CF' },
        { name: 'Chad', code: 'TD' },
        { name: 'Chile', code: 'CL' },
        { name: 'China', code: 'CN' },
        { name: 'Colombia', code: 'CO' },
        { name: 'Comoros', code: 'KM' },
        { name: 'Congo', code: 'CG' },
        { name: 'Costa Rica', code: 'CR' },
        { name: 'Croatia', code: 'HR' },
        { name: 'Cuba', code: 'CU' },
        { name: 'Cyprus', code: 'CY' },
        { name: 'Czech Republic', code: 'CZ' },
        { name: 'Denmark', code: 'DK' },
        { name: 'Djibouti', code: 'DJ' },
        { name: 'Dominica', code: 'DM' },
        { name: 'Dominican Republic', code: 'DO' },
        { name: 'Ecuador', code: 'EC' },
        { name: 'Egypt', code: 'EG' },
        { name: 'El Salvador', code: 'SV' },
        { name: 'Equatorial Guinea', code: 'GQ' },
        { name: 'Eritrea', code: 'ER' },
        { name: 'Estonia', code: 'EE' },
        { name: 'Eswatini', code: 'SZ' },
        { name: 'Ethiopia', code: 'ET' },
        { name: 'Fiji', code: 'FJ' },
        { name: 'Finland', code: 'FI' },
        { name: 'France', code: 'FR' },
        { name: 'Gabon', code: 'GA' },
        { name: 'Gambia', code: 'GM' },
        { name: 'Georgia', code: 'GE' },
        { name: 'Germany', code: 'DE' },
        { name: 'Ghana', code: 'GH' },
        { name: 'Greece', code: 'GR' },
        { name: 'Grenada', code: 'GD' },
        { name: 'Guatemala', code: 'GT' },
        { name: 'Guinea', code: 'GN' },
        { name: 'Guinea-Bissau', code: 'GW' },
        { name: 'Guyana', code: 'GY' },
        { name: 'Haiti', code: 'HT' },
        { name: 'Honduras', code: 'HN' },
        { name: 'Hungary', code: 'HU' },
        { name: 'Iceland', code: 'IS' },
        { name: 'India', code: 'IN' },
        { name: 'Indonesia', code: 'ID' },
        { name: 'Iran', code: 'IR' },
        { name: 'Iraq', code: 'IQ' },
        { name: 'Ireland', code: 'IE' },
        { name: 'Israel', code: 'IL' },
        { name: 'Italy', code: 'IT' },
        { name: 'Jamaica', code: 'JM' },
        { name: 'Japan', code: 'JP' },
        { name: 'Jordan', code: 'JO' },
        { name: 'Kazakhstan', code: 'KZ' },
        { name: 'Kenya', code: 'KE' },
        { name: 'Kiribati', code: 'KI' },
        { name: 'Korea, North', code: 'KP' },
        { name: 'Korea, South', code: 'KR' },
        { name: 'Kosovo', code: 'XK' },
        { name: 'Kuwait', code: 'KW' },
        { name: 'Kyrgyzstan', code: 'KG' },
        { name: 'Laos', code: 'LA' },
        { name: 'Latvia', code: 'LV' },
        { name: 'Lebanon', code: 'LB' },
        { name: 'Lesotho', code: 'LS' },
        { name: 'Liberia', code: 'LR' },
        { name: 'Libya', code: 'LY' },
        { name: 'Liechtenstein', code: 'LI' },
        { name: 'Lithuania', code: 'LT' },
        { name: 'Luxembourg', code: 'LU' },
        { name: 'Madagascar', code: 'MG' },
        { name: 'Malawi', code: 'MW' },
        { name: 'Malaysia', code: 'MY' },
        { name: 'Maldives', code: 'MV' },
        { name: 'Mali', code: 'ML' },
        { name: 'Malta', code: 'MT' },
        { name: 'Marshall Islands', code: 'MH' },
        { name: 'Mauritania', code: 'MR' },
        { name: 'Mauritius', code: 'MU' },
        { name: 'Mexico', code: 'MX' },
        { name: 'Micronesia', code: 'FM' },
        { name: 'Moldova', code: 'MD' },
        { name: 'Monaco', code: 'MC' },
        { name: 'Mongolia', code: 'MN' },
        { name: 'Montenegro', code: 'ME' },
        { name: 'Morocco', code: 'MA' },
        { name: 'Mozambique', code: 'MZ' },
        { name: 'Myanmar', code: 'MM' },
        { name: 'Namibia', code: 'NA' },
        { name: 'Nauru', code: 'NR' },
        { name: 'Nepal', code: 'NP' },
        { name: 'Netherlands', code: 'NL' },
        { name: 'New Zealand', code: 'NZ' },
        { name: 'Nicaragua', code: 'NI' },
        { name: 'Niger', code: 'NE' },
        { name: 'Nigeria', code: 'NG' },
        { name: 'North Macedonia', code: 'MK' },
        { name: 'Norway', code: 'NO' },
        { name: 'Oman', code: 'OM' },
        { name: 'Pakistan', code: 'PK' },
        { name: 'Palau', code: 'PW' },
        { name: 'Palestine', code: 'PS' },
        { name: 'Panama', code: 'PA' },
        { name: 'Papua New Guinea', code: 'PG' },
        { name: 'Paraguay', code: 'PY' },
        { name: 'Peru', code: 'PE' },
        { name: 'Philippines', code: 'PH' },
        { name: 'Poland', code: 'PL' },
        { name: 'Portugal', code: 'PT' },
        { name: 'Qatar', code: 'QA' },
        { name: 'Romania', code: 'RO' },
        { name: 'Russia', code: 'RU' },
        { name: 'Rwanda', code: 'RW' },
        { name: 'Saint Kitts and Nevis', code: 'KN' },
        { name: 'Saint Lucia', code: 'LC' },
        { name: 'Saint Vincent and the Grenadines', code: 'VC' },
        { name: 'Samoa', code: 'WS' },
        { name: 'San Marino', code: 'SM' },
        { name: 'Sao Tome and Principe', code: 'ST' },
        { name: 'Saudi Arabia', code: 'SA' },
        { name: 'Senegal', code: 'SN' },
        { name: 'Serbia', code: 'RS' },
        { name: 'Seychelles', code: 'SC' },
        { name: 'Sierra Leone', code: 'SL' },
        { name: 'Singapore', code: 'SG' },
        { name: 'Slovakia', code: 'SK' },
        { name: 'Slovenia', code: 'SI' },
        { name: 'Solomon Islands', code: 'SB' },
        { name: 'Somalia', code: 'SO' },
        { name: 'South Africa', code: 'ZA' },
        { name: 'South Sudan', code: 'SS' },
        { name: 'Spain', code: 'ES' },
        { name: 'Sri Lanka', code: 'LK' },
        { name: 'Sudan', code: 'SD' },
        { name: 'Suriname', code: 'SR' },
        { name: 'Sweden', code: 'SE' },
        { name: 'Switzerland', code: 'CH' },
        { name: 'Syria', code: 'SY' },
        { name: 'Taiwan', code: 'TW' },
        { name: 'Tajikistan', code: 'TJ' },
        { name: 'Tanzania', code: 'TZ' },
        { name: 'Thailand', code: 'TH' },
        { name: 'Timor-Leste', code: 'TL' },
        { name: 'Togo', code: 'TG' },
        { name: 'Tonga', code: 'TO' },
        { name: 'Trinidad and Tobago', code: 'TT' },
        { name: 'Tunisia', code: 'TN' },
        { name: 'Turkey', code: 'TR' },
        { name: 'Turkmenistan', code: 'TM' },
        { name: 'Tuvalu', code: 'TV' },
        { name: 'Uganda', code: 'UG' },
        { name: 'Ukraine', code: 'UA' },
        { name: 'United Arab Emirates', code: 'AE' },
        { name: 'United Kingdom', code: 'GB' },
        { name: 'United States', code: 'US' },
        { name: 'Uruguay', code: 'UY' },
        { name: 'Uzbekistan', code: 'UZ' },
        { name: 'Vanuatu', code: 'VU' },
        { name: 'Vatican City', code: 'VA' },
        { name: 'Venezuela', code: 'VE' },
        { name: 'Vietnam', code: 'VN' },
        { name: 'Yemen', code: 'YE' },
        { name: 'Zambia', code: 'ZM' },
        { name: 'Zimbabwe', code: 'ZW' }
    ];

    const paymentMethods = [
        { name: 'Pesapal', code: 'pesapal' },
        { name: 'Credit Card', code: 'credit_card' },
        { name: 'Bank Transfer', code: 'bank_transfer' }
    ];

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        display_name: user.display_name || '',
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

    const [fileInputs, setFileInputs] = useState({
        profile_picture: null,
        id_verification: null
    });

    // Create refs for file inputs
    const profileInputRef = useRef(null);
    const idInputRef = useRef(null);

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

    const triggerFileInput = (field) => {
        if (field === 'profile_picture' && profileInputRef.current) {
            profileInputRef.current.click();
        } else if (field === 'id_verification' && idInputRef.current) {
            idInputRef.current.click();
        }
    };

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reload the page after successful update
                router.reload({ only: ['auth.user'] });
            },
        });
    };

    const quickSave = (section = 'all') => {
        patch(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reload the page after successful update
                router.reload({ only: ['auth.user'] });
            },
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
                <div className="flex flex-col items-center mb-6 p-4 border rounded-lg bg-gray-50">
                    <div className="relative mb-4">
                        {preview.profile ? (
                            <Avatar
                                image={preview.profile}
                                size="xlarge"
                                shape="circle"
                                className="w-32 h-32 border-2 border-primary cursor-pointer"
                                onClick={() => triggerFileInput('profile_picture')}
                            />
                        ) : (
                            <Avatar
                                icon="pi pi-user"
                                size="xlarge"
                                shape="circle"
                                className="w-32 h-32 bg-gray-200 border-2 border-primary cursor-pointer"
                                onClick={() => triggerFileInput('profile_picture')}
                            />
                        )}
                    </div>

                    {/* Hidden file input for profile picture */}
                    <input
                        ref={profileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'profile_picture')}
                    />

                    <button
                        type="button"
                        onClick={() => triggerFileInput('profile_picture')}
                        className="btn btn-primary cursor-pointer text-white mb-4"
                        style={{backgroundColor: "#f36722"}}
                    >
                        {preview.profile ? 'Change Profile Picture' : 'Upload Profile Picture'}
                    </button>

                    {/* Quick Save Button */}
                    <div className="flex justify-center w-full">
                        <button
                            type="button"
                            onClick={() => quickSave('profile')}
                            disabled={processing}
                            className="w-fit rounded-md px-4 py-2 max-w-xs bg-[#0d3c46] text-white text-center disabled:opacity-50 hover:bg-[#0a2d35] transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Profile Image'}
                        </button>
                    </div>

                    <InputError message={errors.profile_picture} />

                    {/* File preview info */}
                    {data.profile_picture && (
                        <div className="mt-2 text-sm text-green-600">
                            ✓ {data.profile_picture.name} selected
                        </div>
                    )}
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
                        <label htmlFor="display_name" className="block text-900 font-medium mb-2">Display Name</label>
                        <InputText
                            id="display_name"
                            type="text"
                            placeholder="How you want to be displayed"
                            className="w-full"
                            value={data.display_name}
                            onChange={(e) => setData('display_name', e.target.value)}
                        />
                        <InputError message={errors.display_name} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="mb-3">
                        <label htmlFor="contact_phone" className="block text-900 font-medium mb-2">Phone Number</label>
                        <InputText
                            id="contact_phone"
                            type="tel"
                            placeholder="+254723115440"
                            className="w-full"
                            value={data.contact_phone}
                            onChange={(e) => setData('contact_phone', e.target.value)}
                        />
                        <InputError message={errors.contact_phone} />
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="mb-3">
                    <label htmlFor="emergency_contact" className="block text-900 font-medium mb-2">Emergency Contact</label>
                    <InputTextarea
                        id="emergency_contact"
                        rows={2}
                        placeholder="Name, relationship, and phone number of emergency contact"
                        className="w-full"
                        value={data.emergency_contact}
                        onChange={(e) => setData('emergency_contact', e.target.value)}
                    />
                    <InputError message={errors.emergency_contact} />
                    <p className="text-xs text-gray-500 mt-1">Please provide name, relationship, and phone number</p>
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
                            placeholder="Nairobi"
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
                            placeholder="00100"
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
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <label className="block text-900 font-medium mb-2">ID Verification</label>

                    {preview.id ? (
                        <div className="mb-3 cursor-pointer" onClick={() => triggerFileInput('id_verification')}>
                            <img
                                src={preview.id}
                                alt="ID Verification"
                                className="max-w-full h-auto border rounded-md max-h-48"
                            />
                        </div>
                    ) : (
                        <div
                            className="mb-3 p-8 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onClick={() => triggerFileInput('id_verification')}
                        >
                            <p className="text-sm text-gray-500">Click to upload ID verification</p>
                        </div>
                    )}

                    {/* Hidden file input for ID verification */}
                    <input
                        ref={idInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'id_verification')}
                    />

                    <button
                        type="button"
                        onClick={() => triggerFileInput('id_verification')}
                        className="btn btn-outline-primary cursor-pointer mb-4"
                    >
                        {preview.id ? 'Change ID Verification' : 'Upload ID Verification'}
                    </button>

                    {/* Quick Save Button for ID Section */}
                    <div className="flex justify-center w-full">
                        <button
                            type="button"
                            onClick={() => quickSave('id')}
                            disabled={processing}
                            className="w-fit bg-[#0d3c46] text-white px-4 py-2 rounded-md max-w-xs disabled:opacity-50 hover:bg-[#0a2d35] transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save ID Verification'}
                        </button>
                    </div>

                    <InputError message={errors.id_verification} />

                    {/* File preview info */}
                    {data.id_verification && (
                        <div className="mt-2 text-sm text-green-600">
                            ✓ {data.id_verification.name} selected
                        </div>
                    )}

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
                        {processing ? 'Saving...' : 'Save All Changes'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">Profile updated successfully! Page will reload...</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
