import React, { useState, useEffect } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Guest from '@/Layouts/GuestLayout';
import {
    LayoutContext,
    LayoutProvider,
  } from "@/Layouts/layout/context/layoutcontext.jsx";
  import { PrimeReactProvider } from "primereact/api";
  import HomeLayout from "@/Layouts/HomeLayout";
  import '../../../css/main'

export default function Register() {
    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', password: '', password_confirmation: '',
        dateOfBirth: '', nationality: '', current_location: '', preferred_countries: '',
        position: '', education: '', languages: '', passport_number: '',
        cv: null, cover_letter: null, references: '', role_id: 3,
        job_id: getQueryParam('job_id') || ''
    });
    

    const { notification } = usePage().props;

    const [step, setStep] = useState(1);
    const totalSteps = 4;

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
            },
            onFinish: () => {
                console.log("Request completed");
            }
        });
    };

    useEffect(() => {
        setData('job_id', getQueryParam('job_id') || '');
    }, []);

    return (
        <PrimeReactProvider>
        <LayoutProvider>
            <HomeLayout>
            {/* Toast container to render toast notifications */}
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-100 text-xl">
                <Head title="Register" />
                
                <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
                    <h2 className="text-center text-3xl font-bold mb-6">Registration Form</h2>

                    <div className="relative w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {step === 1 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                                
                                <div className="mb-3">
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

                                <div className="mb-3">
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

                                <div className="mb-3">
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
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Education</h3>

                                <div className="mb-3">
                                    <label htmlFor="education" className="block mb-1">Highest education level</label>
                                    <input 
                                        type="text" 
                                        name="education" 
                                        id="education" 
                                        value={data.education} 
                                        onChange={(e) => setData('education', e.target.value)} 
                                        placeholder="Education level" 
                                        className="w-full p-2 border rounded" 
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Additional Details</h3>
                                <div className="mb-3">
                                    <label htmlFor="passport_number" className="block mb-1">Passport/ID number</label>
                                    <input 
                                        type="text" 
                                        name="passport_number" 
                                        id="passport_number" 
                                        value={data.passport_number} 
                                        onChange={(e) => setData('passport_number', e.target.value)} 
                                        placeholder="Passport/ID Number" 
                                        className="w-full p-2 border rounded" 
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Upload Documents</h3>
                                <div className="mb-3">
                                    <label htmlFor="cv" className="block mb-1">Upload CV</label>
                                    <input 
                                        type="file" 
                                        id="cv" 
                                        onChange={(e) => setData('cv', e.target.files[0])} 
                                        className="w-full p-2 border rounded" 
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="cover_letter" className="block mb-1">Certificate of good conduct</label>
                                    <input 
                                        type="file" 
                                        id="cover_letter" 
                                        onChange={(e) => setData('cover_letter', e.target.files[0])} 
                                        className="w-full p-2 border rounded" 
                                    />
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Registration Fees Details</h3>
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <div className="space-y-4">
                                        {notification?.message ? (
                                            <p className="text-gray-700">{notification.message}</p>
                                        ) : (
                                            <>
                                                <p className="text-gray-700">Standard Registration Fee: Kes 3000</p>
                                                <p className="text-gray-600 text-sm">
                                                    This fee covers the processing of your application and related administrative costs.
                                                </p>
                                                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                                    <p className="text-blue-800 text-sm">
                                                        Please review all your information before proceeding with the payment.
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            {step > 1 && (
                                <button 
                                    type="button" 
                                    onClick={prevStep} 
                                    className="px-4 py-2 bg-gray-400 text-white rounded"
                                >
                                    Back
                                </button>
                            )}
                            {step < totalSteps && (
                                <button 
                                    type="button" 
                                    onClick={nextStep} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Next
                                </button>
                            )}
                            {step === 4 && (
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="px-4 py-2 bg-green-600 text-white rounded"
                                >
                                    {processing ? 'Submitting...' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}
