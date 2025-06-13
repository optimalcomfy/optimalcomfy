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
        contact_phone: '',
        user_type: 'guest', // 'guest' or 'host'
    });

    // Separate name fields state
    const [nameFields, setNameFields] = useState({
        firstName: '',
        middleName: '',
        lastName: ''
    });

    const { notification } = usePage().props;

    const [step, setStep] = useState(1);
    const [totalSteps, setTotalSteps] = useState(4);

    const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    // Function to update name fields and join them
    const updateNameField = (field, value) => {
        const updatedNameFields = { ...nameFields, [field]: value };
        setNameFields(updatedNameFields);
        
        // Join the names and update the main form data
        const fullName = [
            updatedNameFields.firstName.trim(),
            updatedNameFields.middleName.trim(),
            updatedNameFields.lastName.trim()
        ].filter(name => name !== '').join(' ');
        
        setData('name', fullName);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Registration successful!');
                reset();
                setNameFields({ firstName: '', middleName: '', lastName: '' });
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
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-xl">
                <Head title="Register - Airbnb Clone" />
                
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-center text-3xl font-bold mb-6 text-peachDark">Create Your Account</h2>

                    {step === 1 && (
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-semibold mb-4">I want to register as a:</h3>
                            <div className="flex justify-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setData('user_type', 'guest')}
                                    className={`px-6 py-4 rounded-lg flex flex-col items-center border-2 ${
                                        data.user_type === 'guest' ? 'border-peachDark bg-red-50' : 'border-gray-300'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-peachDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium">Guest</span>
                                    <span className="text-sm text-gray-500">I want to book stays</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setData('user_type', 'host')}
                                    className={`px-6 py-4 rounded-lg flex flex-col items-center border-2 ${
                                        data.user_type === 'host' ? 'border-peachDark bg-red-50' : 'border-gray-300'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-peachDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="font-medium">Host</span>
                                    <span className="text-sm text-gray-500">I want to rent my property / Hire my car</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="relative w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div className="bg-peachDark h-2 rounded-full" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {step === 2 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block mb-1">First Name</label>
                                        <input 
                                            type="text" 
                                            name="firstName" 
                                            id="firstName" 
                                            value={nameFields.firstName} 
                                            onChange={(e) => updateNameField('firstName', e.target.value)} 
                                            placeholder="First Name" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="middleName" className="block mb-1">Middle Name</label>
                                        <input 
                                            type="text" 
                                            name="middleName" 
                                            id="middleName" 
                                            value={nameFields.middleName} 
                                            onChange={(e) => updateNameField('middleName', e.target.value)} 
                                            placeholder="Middle Name (Optional)" 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block mb-1">Last Name</label>
                                        <input 
                                            type="text" 
                                            name="lastName" 
                                            id="lastName" 
                                            value={nameFields.lastName} 
                                            onChange={(e) => updateNameField('lastName', e.target.value)} 
                                            placeholder="Last Name" 
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
                                        <label htmlFor="emergency_contact" className="block mb-1">Emergency Contact name</label>
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

                                    <div>
                                        <label htmlFor="contact_phone" className="block mb-1">Emergency Contact Phone</label>
                                        <input 
                                            type="tel" 
                                            name="contact_phone" 
                                            id="contact_phone" 
                                            value={data.contact_phone} 
                                            onChange={(e) => setData('contact_phone', e.target.value)} 
                                            placeholder="Contact Phone" 
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
                                    className="px-4 py-2 bg-peach text-white rounded hover:bg-peachDark transition"
                                >
                                    Next
                                </button>
                            )}
                            
                            {step === totalSteps && (
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="px-4 py-2 bg-peach text-white rounded hover:bg-peachDark transition"
                                >
                                    {processing ? 'Creating Account...' : 'Create Account'}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account? 
                            <Link href="/login" className="text-peach ml-1 hover:underline">
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