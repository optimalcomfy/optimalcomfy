import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, Head, Link, usePage, router } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../../css/main';

export default function CRRegistration() {
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
        id_front: null,
        id_back: null,
        bio: '',
        preferred_payment_method: '',
        emergency_contact: '',
        contact_phone: '',
        user_type: 'guest',
        agree_terms: false,
        confirm_age: false,
    });

    // Separate name fields state
    const [nameFields, setNameFields] = useState({
        firstName: '',
        middleName: '',
        lastName: ''
    });

    // File preview states
    const [profilePreview, setProfilePreview] = useState(null);
    const [idFrontPreview, setIdFrontPreview] = useState(null);
    const [idBackPreview, setIdBackPreview] = useState(null);

    // File input refs
    const profilePictureInputRef = useRef(null);
    const idFrontInputRef = useRef(null);
    const idBackInputRef = useRef(null);

    const { notification, car } = usePage().props;

    const url = usePage().url;
    const params = new URLSearchParams(url.split('?')[1]);
    
    const checkInDate = params.get('check_in_date');
    const checkOutDate = params.get('check_out_date');

    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Validation states for each step
    const [stepErrors, setStepErrors] = useState({
        1: '',
        2: '',
        3: '',
        4: ''
    });

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);

    // Function to update name fields
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

    // Handle field changes
    const handleFieldChange = (field, value) => {
        setData(field, value);
    };

    // Check mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Memoized validation function
    const validateStep = useCallback((stepNumber) => {
        let isValid = true;
        let errorMessage = '';

        switch (stepNumber) {
            case 1:
                if (!data.user_type) {
                    isValid = false;
                    errorMessage = 'Please select an account type';
                }
                break;
                
            case 2:
                if (!nameFields.firstName.trim()) {
                    isValid = false;
                    errorMessage = 'First name is required';
                } else if (!nameFields.lastName.trim()) {
                    isValid = false;
                    errorMessage = 'Last name is required';
                } else if (!data.email.trim()) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(data.email)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email';
                } else if (!data.phone) {
                    isValid = false;
                    errorMessage = 'Phone number is required';
                } else if (!data.date_of_birth) {
                    isValid = false;
                    errorMessage = 'Date of birth is required';
                } else if (!data.nationality) {
                    isValid = false;
                    errorMessage = 'Nationality is required';
                }
                break;
                
            case 3:
                if (!data.password.trim()) {
                    isValid = false;
                    errorMessage = 'Password is required';
                } else if (data.password.length < 8) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters';
                } else if (!data.password_confirmation.trim()) {
                    isValid = false;
                    errorMessage = 'Please confirm your password';
                } else if (data.password !== data.password_confirmation) {
                    isValid = false;
                    errorMessage = 'Passwords do not match';
                }
                break;
                
            case 4:
                if (!data.id_front) {
                    isValid = false;
                    errorMessage = 'ID front verification document is required';
                } else if (!data.id_back) {
                    isValid = false;
                    errorMessage = 'ID back verification document is required';
                } else if (!data.agree_terms) {
                    isValid = false;
                    errorMessage = 'You must agree to the Terms & Conditions';
                } else if (!data.confirm_age) {
                    isValid = false;
                    errorMessage = 'You must confirm you are 18 years or older';
                }
                break;
        }

        return { isValid, errorMessage };
    }, [data, nameFields]);

    // Update step errors
    useEffect(() => {
        const { errorMessage } = validateStep(step);
        if (stepErrors[step] !== errorMessage) {
            setStepErrors(prev => ({ ...prev, [step]: errorMessage }));
        }
    }, [step, data, nameFields, validateStep]);

    const nextStep = () => {
        const { isValid, errorMessage } = validateStep(step);
        
        if (isValid) {
            if (step < totalSteps) {
                setStep(prev => prev + 1);
                // Scroll to top on mobile
                if (isMobile) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } else {
            // Update error state
            setStepErrors(prev => ({ ...prev, [step]: errorMessage }));
            
            // Show error toast
            toast.error(errorMessage, {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
            // Scroll to top on mobile
            if (isMobile) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Calculate completion percentage for progress bar
    const calculateCompletion = useCallback(() => {
        let completed = 0;
        for (let i = 1; i <= step; i++) {
            const { isValid } = validateStep(i);
            if (isValid) completed++;
        }
        return (completed / totalSteps) * 100;
    }, [step, validateStep]);

    // Profile picture upload
    const handleProfilePictureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file.', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB.', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
                return;
            }

            setData('profile_picture', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            toast.success('Profile picture uploaded successfully!', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
        }
    };

    // ID Front upload
    const handleIdFrontUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid file (JPEG, PNG, JPG, or PDF).', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB.', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        // Create preview if it's an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdFrontPreview(reader.result);
                setData('id_front', file);
                toast.success('ID front uploaded successfully!', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
            };
            reader.readAsDataURL(file);
        } else {
            // For PDF files
            setData('id_front', file);
            setIdFrontPreview('pdf');
            toast.success('ID front document uploaded successfully!', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
        }

        // Clear validation error
        setStepErrors(prev => ({ ...prev, [4]: '' }));
    };

    // ID Back upload
    const handleIdBackUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid file (JPEG, PNG, JPG, or PDF).', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB.', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        // Create preview if it's an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdBackPreview(reader.result);
                setData('id_back', file);
                toast.success('ID back uploaded successfully!', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
            };
            reader.readAsDataURL(file);
        } else {
            // For PDF files
            setData('id_back', file);
            setIdBackPreview('pdf');
            toast.success('ID back document uploaded successfully!', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
        }

        // Clear validation error
        setStepErrors(prev => ({ ...prev, [4]: '' }));
    };

    // Trigger file uploads
    const triggerProfilePictureUpload = () => {
        if (profilePictureInputRef.current) {
            profilePictureInputRef.current.click();
        }
    };

    const triggerIdFrontUpload = () => {
        if (idFrontInputRef.current) {
            idFrontInputRef.current.click();
        }
    };

    const triggerIdBackUpload = () => {
        if (idBackInputRef.current) {
            idBackInputRef.current.click();
        }
    };

    // Remove uploaded files
    const removeProfilePicture = () => {
        setData('profile_picture', null);
        setProfilePreview(null);
        toast.info('Profile picture removed', {
            position: isMobile ? 'bottom-center' : 'top-center'
        });
    };

    const removeIdFront = () => {
        setData('id_front', null);
        setIdFrontPreview(null);
        toast.info('ID front document removed', {
            position: isMobile ? 'bottom-center' : 'top-center'
        });
    };

    const removeIdBack = () => {
        setData('id_back', null);
        setIdBackPreview(null);
        toast.info('ID back document removed', {
            position: isMobile ? 'bottom-center' : 'top-center'
        });
    };

    // Get current step validation
    const { isValid: isCurrentStepValid } = validateStep(step);

    // Step titles
    const stepTitles = {
        1: "Account Type",
        2: "Personal Info",
        3: "Security",
        4: "Profile Setup"
    };

    const submit = async (e) => {
        e.preventDefault();

        const { isValid, errorMessage } = validateStep(4);
        if (!isValid) {
            toast.error(errorMessage, {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        // Create FormData for file uploads
        const formData = new FormData();
        
        // Append all form data
        Object.keys(data).forEach(key => {
            if (key === 'profile_picture' || key === 'id_front' || key === 'id_back') {
                if (data[key]) {
                    formData.append(key, data[key]);
                }
            } else if (key === 'agree_terms' || key === 'confirm_age') {
                formData.append(key, data[key] ? '1' : '0');
            } else {
                formData.append(key, data[key] || '');
            }
        });

        // Also append name from nameFields
        const fullName = [
            nameFields.firstName.trim(),
            nameFields.middleName.trim(),
            nameFields.lastName.trim()
        ].filter(name => name !== '').join(' ');
        formData.append('name', fullName);

        // Add booking parameters
        formData.append('car_id', car.id);
        if (checkInDate) formData.append('check_in_date', checkInDate);
        if (checkOutDate) formData.append('check_out_date', checkOutDate);

        post(route('customer-ride-register'), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Registration successful!', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
                reset();
                setNameFields({ firstName: '', middleName: '', lastName: '' });
                setProfilePreview(null);
                setIdFrontPreview(null);
                setIdBackPreview(null);
                
                // Redirect to booking page with parameters
                router.get('/car-booking', {
                    car_id: car.id,
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate
                });
            },
            onError: (errors) => {
                Object.keys(errors).forEach((field) => {
                    const errorMessages = errors[field];
                    if (Array.isArray(errorMessages)) {
                        errorMessages.forEach((message) => toast.error(message, {
                            position: isMobile ? 'bottom-center' : 'top-center'
                        }));
                    } else {
                        toast.error(errorMessages, {
                            position: isMobile ? 'bottom-center' : 'top-center'
                        });
                    }
                });
            }
        });
    };

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <HomeLayout>
                    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-3 py-4 md:px-4 md:py-8">
                        <Head title="Register - Ristay" />
                        <ToastContainer 
                            position={isMobile ? "bottom-center" : "top-center"}
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable={!isMobile}
                            pauseOnHover
                            theme="light"
                        />

                        {/* Main Content */}
                        <div className="w-full max-w-2xl">
                            {/* Header */}
                            <div className="mb-6 md:mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => window.history.back()}
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <svg className="h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </button>
                                    <div className="text-center flex-1">
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 white-space-nowrap">
                                            Create Account
                                        </h1>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Step {step} of {totalSteps}
                                        </p>
                                    </div>
                                    <div className="w-10"></div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-600">Progress</span>
                                        <span className="text-xs font-bold text-peachDark">{Math.round(calculateCompletion())}%</span>
                                    </div>
                                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-peach to-peachDark transition-all duration-500"
                                            style={{ width: `${calculateCompletion()}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Step Indicators */}
                                <div className="flex justify-between items-center mb-6">
                                    {[...Array(totalSteps)].map((_, index) => {
                                        const stepNum = index + 1;
                                        const isActive = step === stepNum;
                                        const { isValid } = validateStep(stepNum);
                                        
                                        return (
                                            <div key={stepNum} className="flex flex-col items-center flex-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                                    isActive 
                                                        ? 'bg-peachDark text-white border-2 border-peachDark' 
                                                        : isValid 
                                                            ? 'bg-green-500 text-white border-2 border-green-500'
                                                            : 'bg-gray-200 text-gray-500 border-2 border-gray-300'
                                                }`}>
                                                    {isValid && !isActive ? '✓' : stepNum}
                                                </div>
                                                <span className={`text-xs font-medium text-center px-1 ${
                                                    isActive ? 'text-peachDark' : 'text-gray-500'
                                                }`}>
                                                    {stepTitles[stepNum]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Registration Form Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
                                <div className="mb-6">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                        {step === 1 && "How will you use Ristay?"}
                                        {step === 2 && "Tell us about yourself"}
                                        {step === 3 && "Create your password"}
                                        {step === 4 && "Complete your profile"}
                                    </h2>
                                </div>

                                {/* Error Message */}
                                {stepErrors[step] && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <div className="flex items-center">
                                            <svg className="h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-red-700">{stepErrors[step]}</span>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    {/* Step 1: Account Type */}
                                    {step === 1 && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('user_type', 'guest')}
                                                    className={`p-4 rounded-xl border-2 ${
                                                        data.user_type === 'guest' 
                                                            ? 'border-peachDark bg-red-50' 
                                                            : 'border-gray-200 hover:border-peach'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="h-12 rounded-full flex items-center justify-center mr-4">
                                                            <svg className="h-6 text-peachDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-left flex-1">
                                                            <h3 className="font-bold text-gray-900">Guest</h3>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                I want to book car rentals
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Personal Information */}
                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            First Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={nameFields.firstName}
                                                            onChange={(e) => updateNameField('firstName', e.target.value)}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                stepErrors[2] && !nameFields.firstName.trim() ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                            placeholder="First Name"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Middle Name (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={nameFields.middleName}
                                                            onChange={(e) => updateNameField('middleName', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                            placeholder="Middle Name"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Last Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={nameFields.lastName}
                                                            onChange={(e) => updateNameField('lastName', e.target.value)}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                stepErrors[2] && !nameFields.lastName.trim() ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                            placeholder="Last Name"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Email Address *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                stepErrors[2] && !data.email.trim() ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                            placeholder="john@example.com"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Date of Birth *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={data.date_of_birth}
                                                            onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                stepErrors[2] && !data.date_of_birth ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Phone Number *
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={data.phone}
                                                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                stepErrors[2] && !data.phone ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                            placeholder="+254 712 345 678"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Nationality *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.nationality}
                                                            onChange={(e) => handleFieldChange('nationality', e.target.value)}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                stepErrors[2] && !data.nationality ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                            placeholder="Nationality"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Address Information */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Address (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.address || ''}
                                                            onChange={(e) => handleFieldChange('address', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                            placeholder="Street address"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            City (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.city || ''}
                                                            onChange={(e) => handleFieldChange('city', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                            placeholder="City"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Country (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.country || ''}
                                                            onChange={(e) => handleFieldChange('country', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                            placeholder="Country"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Postal Code (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.postal_code || ''}
                                                            onChange={(e) => handleFieldChange('postal_code', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                            placeholder="Postal code"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bio Field */}
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Bio (Optional)
                                                        </label>
                                                        <span className="text-xs text-gray-500">
                                                            {data.bio?.length || 0}/500 characters
                                                        </span>
                                                    </div>
                                                    <textarea
                                                        value={data.bio || ''}
                                                        onChange={(e) => handleFieldChange('bio', e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach min-h-[100px]"
                                                        placeholder="Tell us about yourself..."
                                                        maxLength={500}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        This will appear on your public profile
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Account Security */}
                                    {step === 3 && (
                                        <div className="space-y-5">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Password *
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={data.password}
                                                        onChange={(e) => handleFieldChange('password', e.target.value)}
                                                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                            stepErrors[3] && !data.password.trim() ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Create a strong password"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Confirm Password *
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => handleFieldChange('password_confirmation', e.target.value)}
                                                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                            stepErrors[3] && data.password !== data.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Confirm your password"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Emergency Contact Name (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.emergency_contact || ''}
                                                            onChange={(e) => handleFieldChange('emergency_contact', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                            placeholder="Full name"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Emergency Contact Phone (Optional)
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={data.contact_phone || ''}
                                                            onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                            placeholder="Phone number"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Profile Details */}
                                    {step === 4 && (
                                        <div className="space-y-6">
                                            {/* Profile Picture */}
                                            <div className="bg-gray-50 p-4 rounded-2xl">
                                                <h4 className="text-base font-semibold text-gray-900 mb-4">Profile Picture (Optional)</h4>
                                                <div className="space-y-4">
                                                    {profilePreview && (
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                <img
                                                                    src={profilePreview}
                                                                    alt="Profile preview"
                                                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={removeProfilePicture}
                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <input
                                                            ref={profilePictureInputRef}
                                                            type="file"
                                                            onChange={handleProfilePictureUpload}
                                                            accept="image/*"
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={triggerProfilePictureUpload}
                                                            className="w-full h-28 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-white hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            <p className="text-sm text-gray-600">Click to upload photo</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ID Verification - Front and Back */}
                                            <div className="bg-gray-50 p-4 rounded-2xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-base font-semibold text-gray-900">
                                                        ID Verification *
                                                    </h4>
                                                    <span className="text-xs text-red-500 font-medium">
                                                        Required for all users
                                                    </span>
                                                </div>
                                                
                                                {/* ID Front */}
                                                <div className="mb-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="text-sm font-medium text-gray-700">Front Side *</h5>
                                                        {idFrontPreview && (
                                                            <span className="text-xs text-green-500 font-medium">✓ Uploaded</span>
                                                        )}
                                                    </div>
                                                    
                                                    {idFrontPreview && (
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                {idFrontPreview === 'pdf' ? (
                                                                    <div className="w-48 h-32 bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center">
                                                                        <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span className="text-xs font-medium text-gray-700">PDF Document</span>
                                                                        <span className="text-xs text-gray-500">ID Front Document</span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={idFrontPreview}
                                                                        alt="ID Front preview"
                                                                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300 shadow"
                                                                    />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={removeIdFront}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <input
                                                            ref={idFrontInputRef}
                                                            type="file"
                                                            onChange={handleIdFrontUpload}
                                                            accept="image/*,.pdf"
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={triggerIdFrontUpload}
                                                            className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                                                                stepErrors[4] && !data.id_front 
                                                                    ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                                                                    : idFrontPreview
                                                                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                                                                        : 'border-peach bg-white hover:bg-red-50'
                                                            }`}
                                                        >
                                                            {idFrontPreview ? (
                                                                <div className="text-center">
                                                                    <p className="text-sm font-medium text-green-600">Front Side Uploaded</p>
                                                                    <p className="text-xs text-gray-500 mt-1">Click to change document</p>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <svg className="w-8 h-8 text-peach mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    <p className="text-sm font-medium text-peach">Upload ID Front</p>
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ID Back */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="text-sm font-medium text-gray-700">Back Side *</h5>
                                                        {idBackPreview && (
                                                            <span className="text-xs text-green-500 font-medium">✓ Uploaded</span>
                                                        )}
                                                    </div>
                                                    
                                                    {idBackPreview && (
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                {idBackPreview === 'pdf' ? (
                                                                    <div className="w-48 h-32 bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center">
                                                                        <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span className="text-xs font-medium text-gray-700">PDF Document</span>
                                                                        <span className="text-xs text-gray-500">ID Back Document</span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={idBackPreview}
                                                                        alt="ID Back preview"
                                                                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300 shadow"
                                                                    />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={removeIdBack}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <input
                                                            ref={idBackInputRef}
                                                            type="file"
                                                            onChange={handleIdBackUpload}
                                                            accept="image/*,.pdf"
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={triggerIdBackUpload}
                                                            className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                                                                stepErrors[4] && !data.id_back 
                                                                    ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                                                                    : idBackPreview
                                                                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                                                                        : 'border-peach bg-white hover:bg-red-50'
                                                            }`}
                                                        >
                                                            {idBackPreview ? (
                                                                <div className="text-center">
                                                                    <p className="text-sm font-medium text-green-600">Back Side Uploaded</p>
                                                                    <p className="text-xs text-gray-500 mt-1">Click to change document</p>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <svg className="w-8 h-8 text-peach mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    <p className="text-sm font-medium text-peach">Upload ID Back</p>
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 space-y-1">
                                                    <p className="text-xs text-gray-500">
                                                        Upload both front and back sides of your ID, Passport, or Driver's License
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Accepted formats: JPEG, PNG, JPG, PDF (max 5MB each)
                                                    </p>
                                                    {stepErrors[4] && (!data.id_front || !data.id_back) && (
                                                        <p className="text-xs text-red-500">
                                                            Please upload both front and back ID verification documents
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Required Agreements */}
                                            <div className="space-y-4 pt-4 border-t">
                                                <div className={`flex items-start space-x-3 p-3 rounded-xl ${
                                                    stepErrors[4] && !data.agree_terms ? 'bg-red-50 border border-red-200' : ''
                                                }`}>
                                                    <input
                                                        type="checkbox"
                                                        id="agree_terms"
                                                        checked={data.agree_terms}
                                                        onChange={(e) => handleFieldChange('agree_terms', e.target.checked)}
                                                        className="mt-1 h-5 text-peachDark focus:ring-peachDark rounded border-gray-300 cursor-pointer"
                                                    />
                                                    <label htmlFor="agree_terms" className="text-sm text-gray-700 flex-1 cursor-pointer">
                                                        I agree to the Terms & Conditions and Privacy Policy
                                                    </label>
                                                </div>

                                                <div className={`flex items-start space-x-3 p-3 rounded-xl ${
                                                    stepErrors[4] && !data.confirm_age ? 'bg-red-50 border border-red-200' : ''
                                                }`}>
                                                    <input
                                                        type="checkbox"
                                                        id="confirm_age"
                                                        checked={data.confirm_age}
                                                        onChange={(e) => handleFieldChange('confirm_age', e.target.checked)}
                                                        className="mt-1 h-5 text-peachDark focus:ring-peachDark rounded border-gray-300 cursor-pointer"
                                                    />
                                                    <label htmlFor="confirm_age" className="text-sm text-gray-700 flex-1 cursor-pointer">
                                                        I confirm that I am 18 years or older
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                                            {step > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={prevStep}
                                                    className="w-full py-3.5 px-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium cursor-pointer"
                                                >
                                                    ← Back
                                                </button>
                                            )}

                                            {step < totalSteps ? (
                                                <button
                                                    type="button"
                                                    onClick={nextStep}
                                                    className={`w-full py-3.5 px-4 rounded-xl font-medium cursor-pointer ${
                                                        isCurrentStepValid
                                                            ? 'bg-peachDark text-white hover:opacity-90'
                                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                    disabled={!isCurrentStepValid}
                                                >
                                                    Continue →
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    disabled={processing || !isCurrentStepValid}
                                                    className={`w-full py-3.5 px-4 rounded-xl font-medium cursor-pointer ${
                                                        !processing && isCurrentStepValid
                                                            ? 'bg-green-500 text-white hover:opacity-90'
                                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {processing ? 'Creating Account...' : 'Create Account'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Login Link */}
                            <div className="text-center">
                                <p className="text-gray-600 text-sm">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-peachDark font-medium hover:underline">
                                        Sign in
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