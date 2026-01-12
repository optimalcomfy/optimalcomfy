import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import HomeLayout from "@/Layouts/HomeLayout";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Select from 'react-select';
import '../../../css/main';
import countriesWithNationality from './Countries.jsx';


// Format countries for react-select with nationality
const countryOptions = countriesWithNationality.map(item => ({
    value: item.nationality,
    label: `${item.country} (${item.nationality})`
}));

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        display_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        date_of_birth: '',
        nationality: '',
        passport_number: '',
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

    // Selfie capture state
    const [showSelfieModal, setShowSelfieModal] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // ID Verification state
    const [idVerificationFile, setIdVerificationFile] = useState(null);
    const [idVerificationPreview, setIdVerificationPreview] = useState(null);

    // File input refs
    const profilePictureInputRef = useRef(null);
    const idVerificationInputRef = useRef(null);

    const { notification } = usePage().props;

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

    // Payment methods
    const paymentMethods = [
        { value: 'mpesa', label: 'M-Pesa', icon: '💰' },
        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
        { value: 'paypal', label: 'PayPal', icon: '🔗' },
        { value: 'credit_card', label: 'Credit Card', icon: '💳' },
        { value: 'cash', label: 'Cash', icon: '💵' }
    ];

    // Payment options for react-select
    const paymentOptions = paymentMethods.map(method => ({
        value: method.value,
        label: `${method.icon} ${method.label}`
    }));

    // Update display name whenever name fields change
    useEffect(() => {
        const fullName = [
            nameFields.firstName.trim(),
            nameFields.middleName.trim(),
            nameFields.lastName.trim()
        ].filter(name => name !== '').join(' ');

        setData('name', fullName);
        
        // Set display name to first name by default
        const displayName = nameFields.firstName.trim() || fullName;
        if (data.display_name === '' || data.display_name === nameFields.firstName.trim()) {
            setData('display_name', displayName);
        }
    }, [nameFields.firstName, nameFields.middleName, nameFields.lastName]);

    // Check mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Memoized validation function to prevent infinite loops
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
                } else if (data.user_type === 'host' && !data.passport_number) {
                    isValid = false;
                    errorMessage = 'ID or Passport number is required';
                } else if (data.bio && data.bio.length > 500) {
                    isValid = false;
                    errorMessage = 'Bio must be less than 500 characters';
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
                if (!data.id_verification) {
                    isValid = false;
                    errorMessage = 'ID verification document is required';
                } else if (data.user_type === 'host' && !data.preferred_payment_method) {
                    isValid = false;
                    errorMessage = 'Preferred payment method is required for hosts';
                } else if (data.user_type === 'host' && !data.emergency_contact) {
                    isValid = false;
                    errorMessage = 'Emergency contact name is required for hosts';
                } else if (data.user_type === 'host' && !data.contact_phone) {
                    isValid = false;
                    errorMessage = 'Emergency contact phone is required for hosts';
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

    // Update step errors only when relevant data changes
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

    // Function to update name fields
    const updateNameField = (field, value) => {
        setNameFields(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle field changes
    const handleFieldChange = (field, value) => {
        setData(field, value);
    };

    // Handle React Select changes
    const handleSelectChange = (field, selectedOption) => {
        setData(field, selectedOption ? selectedOption.value : '');
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

    // Selfie capture functions
    const startCamera = async () => {
        if (isMobile) {
            try {
                if (typeof navigator.permissions !== 'undefined') {
                    const cameraPermission = await navigator.permissions.query({ name: 'camera' });
                    if (cameraPermission.state === 'denied') {
                        toast.error('Camera access denied. Please enable camera permissions in your browser settings.', {
                            position: 'bottom-center'
                        });
                        return;
                    }
                }
            } catch (error) {
                console.log('Permission query not supported');
            }
        }

        try {
            setIsCapturing(true);
            setShowSelfieModal(true);
            setCameraReady(false);
        } catch (error) {
            console.error('Error preparing camera:', error);
            toast.error('Unable to prepare camera. Please try again.', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            setIsCapturing(false);
            setShowSelfieModal(false);
        }
    };

    const initializeCamera = async () => {
        if (!videoRef.current) {
            toast.error('Camera initialization failed. Please try again.', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            setIsCapturing(false);
            setShowSelfieModal(false);
            return;
        }

        try {
            const constraints = {
                video: {
                    width: { ideal: isMobile ? 640 : 1280 },
                    height: { ideal: isMobile ? 480 : 720 },
                    facingMode: 'user'
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            videoRef.current.onloadedmetadata = () => {
                setCameraReady(true);
            };

        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMsg = 'Unable to access camera. ';
            
            if (error.name === 'NotAllowedError') {
                errorMsg += 'Please allow camera access in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMsg += 'No camera found. Please check your device.';
            } else {
                errorMsg += 'Please check permissions and try again.';
            }
            
            toast.error(errorMsg, {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            setIsCapturing(false);
            setShowSelfieModal(false);
        }
    };

    const captureSelfie = () => {
        if (!cameraReady) {
            toast.error('Camera is not ready yet. Please wait.', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== 4) {
            toast.error('Camera not ready. Please try again.', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                setData('profile_picture', file);
                setCapturedImage(canvas.toDataURL('image/jpeg'));
                stopCamera();
                setShowSelfieModal(false);
                setCameraReady(false);
                toast.success('Selfie captured successfully!', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
            } else {
                toast.error('Failed to capture image. Please try again.', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
            }
        }, 'image/jpeg', 0.8);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCapturing(false);
        setCameraReady(false);
    };

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
            setCapturedImage(null);
            toast.success('Profile picture uploaded successfully!', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
        }
    };

    // Trigger profile picture upload
    const triggerProfilePictureUpload = () => {
        if (profilePictureInputRef.current) {
            profilePictureInputRef.current.click();
        }
    };

    // ID Verification upload - FIXED VERSION
    const handleIdVerificationUpload = (e) => {
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
                setIdVerificationPreview(reader.result);
                // Set the file after preview is ready
                setData('id_verification', file);
                setIdVerificationFile(file);
                
                toast.success('ID verification file uploaded successfully!', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
            };
            reader.readAsDataURL(file);
        } else {
            // For PDF files, set immediately
            setData('id_verification', file);
            setIdVerificationFile(file);
            setIdVerificationPreview('pdf');
            
            toast.success('ID verification document uploaded successfully!', {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
        }

        // Clear validation error
        setStepErrors(prev => ({ ...prev, [4]: '' }));
    };

    // Trigger ID verification upload
    const triggerIdVerificationUpload = () => {
        if (idVerificationInputRef.current) {
            idVerificationInputRef.current.click();
        }
    };

    const removeProfilePicture = () => {
        setData('profile_picture', null);
        setCapturedImage(null);
        toast.info('Profile picture removed', {
            position: isMobile ? 'bottom-center' : 'top-center'
        });
    };

    const removeIdVerification = () => {
        setData('id_verification', null);
        setIdVerificationFile(null);
        setIdVerificationPreview(null);
        toast.info('ID verification document removed', {
            position: isMobile ? 'bottom-center' : 'top-center'
        });
    };

    // Clean up camera
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                stopCamera();
            }
        };
    }, []);

    // Initialize camera when modal opens
    useEffect(() => {
        if (showSelfieModal) {
            const timer = setTimeout(() => {
                initializeCamera();
            }, 100);

            return () => {
                clearTimeout(timer);
                if (showSelfieModal) {
                    stopCamera();
                }
            };
        }
    }, [showSelfieModal]);

    const submit = (e) => {
        e.preventDefault();

        const { isValid, errorMessage } = validateStep(4);
        if (!isValid) {
            toast.error(errorMessage, {
                position: isMobile ? 'bottom-center' : 'top-center'
            });
            return;
        }

        // Create FormData object to handle file uploads
        const formData = new FormData();
        
        // Append all form data
        Object.keys(data).forEach(key => {
            if (key === 'profile_picture' || key === 'id_verification') {
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

        post(route('register'), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Registration successful! Welcome to Ristay!', {
                    position: isMobile ? 'bottom-center' : 'top-center'
                });
                reset();
                setNameFields({ firstName: '', middleName: '', lastName: '' });
                setCapturedImage(null);
                setIdVerificationFile(null);
                setIdVerificationPreview(null);
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

    // Step titles
    const stepTitles = {
        1: "Account Type",
        2: "Personal Info",
        3: "Security",
        4: "Profile Setup"
    };

    // Get current step validation
    const { isValid: isCurrentStepValid } = validateStep(step);

    // Custom styles for react-select - FIXED BLUE BORDER
    const customStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '48px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: state.isFocused ? '#fc8f72' : '#d1d5db',
            borderRadius: '12px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#fc8f72'
            },
            outline: 'none',
            '&:focus': {
                borderColor: '#fc8f72',
                boxShadow: '0 0 0 2px rgba(252, 143, 114, 0.2)',
                outline: 'none'
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#fc8f72' : state.isFocused ? '#fff5f2' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            '&:active': {
                backgroundColor: '#fc8f72'
            }
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            zIndex: 9999
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9ca3af'
        }),
        singleValue: (base) => ({
            ...base,
            color: '#374151'
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: '#d1d5db'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#9ca3af',
            '&:hover': {
                color: '#6b7280'
            }
        }),
        clearIndicator: (base) => ({
            ...base,
            color: '#9ca3af',
            '&:hover': {
                color: '#6b7280'
            }
        })
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

                        {/* Selfie Capture Modal */}
                        {showSelfieModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-3 md:p-4">
                                <div className="bg-white rounded-2xl w-full max-w-md mx-auto overflow-hidden">
                                    <div className="p-4 md:p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900">Take a Selfie</h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    stopCamera();
                                                    setShowSelfieModal(false);
                                                    setCameraReady(false);
                                                }}
                                                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                                            >
                                                <svg className="h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full aspect-video object-cover"
                                            />
                                            <canvas
                                                ref={canvasRef}
                                                className="hidden"
                                            />

                                            {!cameraReady && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black">
                                                    <div className="text-center">
                                                        <p className="text-white text-sm mt-3">Initializing camera...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                type="button"
                                                onClick={captureSelfie}
                                                disabled={!cameraReady}
                                                className={`flex-1 py-3 px-4 rounded-xl font-medium text-base ${
                                                    cameraReady
                                                        ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {cameraReady ? 'Capture Photo' : 'Loading...'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    stopCamera();
                                                    setShowSelfieModal(false);
                                                    setCameraReady(false);
                                                }}
                                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 active:scale-95"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                                                Book stays and experiences
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setData('user_type', 'host')}
                                                    className={`p-4 rounded-xl border-2 ${
                                                        data.user_type === 'host' 
                                                            ? 'border-peachDark bg-red-50' 
                                                            : 'border-gray-200 hover:border-peach'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="h-12 rounded-full flex items-center justify-center mr-4">
                                                            <svg className="h-6 text-peachDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-left flex-1">
                                                            <h3 className="font-bold text-gray-900">Host</h3>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Rent properties or list services
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
                                                            placeholder="John"
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
                                                            placeholder="Middle name"
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
                                                            placeholder="Doe"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Display Name Field */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Display Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.display_name}
                                                        onChange={(e) => handleFieldChange('display_name', e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peach focus:border-peach"
                                                        placeholder="Choose your display name"
                                                    />
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
                                                        placeholder="Tell us about yourself... Share your interests, what you're passionate about, or anything else you'd like others to know."
                                                        maxLength={500}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        This will appear on your public profile
                                                    </p>
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
                                                        <PhoneInput
                                                            international
                                                            defaultCountry="KE"
                                                            value={data.phone}
                                                            onChange={(value) => handleFieldChange('phone', value)}
                                                            className="w-full"
                                                            inputClassName={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                stepErrors[2] && !data.phone ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                            placeholder="+254 712 345 678"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Nationality *
                                                        </label>
                                                        <Select
                                                            options={countryOptions}
                                                            value={countryOptions.find(option => option.value === data.nationality)}
                                                            onChange={(selectedOption) => handleSelectChange('nationality', selectedOption)}
                                                            placeholder="Select Nationality"
                                                            styles={customStyles}
                                                            className="react-select-container"
                                                            classNamePrefix="react-select"
                                                            isClearable
                                                            isSearchable
                                                        />
                                                    </div>

                                                    {data.user_type === 'host' && (
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                ID / Passport Number *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={data.passport_number || ''}
                                                                onChange={(e) => handleFieldChange('passport_number', e.target.value)}
                                                                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                    stepErrors[2] && !data.passport_number ? 'border-red-300' : 'border-gray-300'
                                                                }`}
                                                                placeholder="Enter your passport number"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Required for host verification
                                                            </p>
                                                        </div>
                                                    )}
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
                                                        <Select
                                                            options={countryOptions.map(item => ({
                                                                value: item.value,
                                                                label: item.label.split(' (')[0] // Show only country name
                                                            }))}
                                                            value={countryOptions.find(option => option.value === data.country) ? {
                                                                value: data.country,
                                                                label: countryOptions.find(option => option.value === data.country)?.label.split(' (')[0]
                                                            } : null}
                                                            onChange={(selectedOption) => handleSelectChange('country', selectedOption)}
                                                            placeholder="Select Country"
                                                            styles={customStyles}
                                                            className="react-select-container"
                                                            classNamePrefix="react-select"
                                                            isClearable
                                                            isSearchable
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
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Profile Details */}
                                    {step === 4 && (
                                        <div className="space-y-6">
                                            {/* Profile Picture */}
                                            <div className="bg-gray-50 p-4 rounded-2xl">
                                                <h4 className="text-base font-semibold text-gray-900 mb-4">Profile Picture</h4>
                                                <div className="space-y-4">
                                                    {(data.profile_picture || capturedImage) && (
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                <img
                                                                    src={capturedImage || (data.profile_picture ? URL.createObjectURL(data.profile_picture) : '')}
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

                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Upload Photo
                                                            </label>
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

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Take Selfie
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={startCamera}
                                                                className="w-full h-28 border-2 border-dashed border-peach text-peach rounded-2xl flex flex-col items-center justify-center bg-white hover:bg-red-50 cursor-pointer"
                                                            >
                                                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                <p className="text-sm font-medium">Take Selfie</p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ID Verification (Required for BOTH Hosts and Guests) */}
                                            <div className="bg-gray-50 p-4 rounded-2xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-base font-semibold text-gray-900">
                                                        ID Verification *
                                                    </h4>
                                                    <span className="text-xs text-red-500 font-medium">
                                                        Required for all users
                                                    </span>
                                                </div>
                                                <div className="space-y-4">
                                                    {idVerificationPreview && (
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                {idVerificationPreview === 'pdf' ? (
                                                                    <div className="w-48 h-32 bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center">
                                                                        <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span className="text-xs font-medium text-gray-700">PDF Document</span>
                                                                        <span className="text-xs text-gray-500">{idVerificationFile?.name}</span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={idVerificationPreview}
                                                                        alt="ID Verification preview"
                                                                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300 shadow"
                                                                    />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={removeIdVerification}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {idVerificationFile?.name || 'ID Verification Document'}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Upload ID Document *
                                                        </label>
                                                        <div>
                                                            <input
                                                                ref={idVerificationInputRef}
                                                                type="file"
                                                                onChange={handleIdVerificationUpload}
                                                                accept="image/*,.pdf"
                                                                className="hidden"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={triggerIdVerificationUpload}
                                                                className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                                                                    stepErrors[4] && !data.id_verification 
                                                                        ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                                                                        : idVerificationPreview
                                                                            ? 'border-green-300 bg-green-50 hover:bg-green-100'
                                                                            : 'border-peach bg-white hover:bg-red-50'
                                                                }`}
                                                            >
                                                                {idVerificationPreview ? (
                                                                    <div className="text-center">
                                                                        <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <p className="text-sm font-medium text-green-600">Document Uploaded</p>
                                                                        <p className="text-xs text-gray-500 mt-1">Click to change document</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center">
                                                                        <svg className="w-10 h-10 text-peach mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <p className="text-sm font-medium text-peach">Upload ID Document</p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Click to upload Passport, National ID, or Driver's License
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-xs text-gray-500">
                                                                Accepted formats: JPEG, PNG, JPG, PDF (max 5MB)
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Required for verification and security purposes
                                                            </p>
                                                            {stepErrors[4] && !data.id_verification && (
                                                                <p className="text-xs text-red-500">
                                                                    Please upload your ID verification document
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Host-specific fields */}
                                            {data.user_type === 'host' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-base font-semibold text-gray-900 mb-4">Payment Preferences *</h4>
                                                        <p className="text-sm text-gray-600 mb-3">Select your preferred payment method for receiving payments</p>
                                                        <div className="w-full">
                                                            <Select
                                                                options={paymentOptions}
                                                                value={paymentOptions.find(option => option.value === data.preferred_payment_method)}
                                                                onChange={(selectedOption) => handleSelectChange('preferred_payment_method', selectedOption)}
                                                                placeholder="Select payment method"
                                                                styles={customStyles}
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                isClearable
                                                            />
                                                        </div>
                                                        {stepErrors[4] && !data.preferred_payment_method && (
                                                            <p className="text-xs text-red-500 mt-2">
                                                                Please select a preferred payment method
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Emergency Contact Name *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={data.emergency_contact || ''}
                                                                onChange={(e) => handleFieldChange('emergency_contact', e.target.value)}
                                                                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                    stepErrors[4] && !data.emergency_contact ? 'border-red-300' : 'border-gray-300'
                                                                }`}
                                                                placeholder="Full name of emergency contact"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Person to contact in case of emergency
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Emergency Contact Phone *
                                                            </label>
                                                            <PhoneInput
                                                                international
                                                                defaultCountry="KE"
                                                                value={data.contact_phone}
                                                                onChange={(value) => handleFieldChange('contact_phone', value)}
                                                                className="w-full"
                                                                inputClassName={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-peach focus:border-peach ${
                                                                    stepErrors[4] && !data.contact_phone ? 'border-red-300' : 'border-gray-300'
                                                                }`}
                                                                placeholder="+254 712 345 678"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Phone number for emergency contact
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

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
                                                    {processing ? 'Creating Account...' : 'Complete Registration'}
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