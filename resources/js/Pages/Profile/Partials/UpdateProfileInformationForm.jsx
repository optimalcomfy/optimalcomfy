import { useRef, useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { InputText } from "primereact/inputtext";
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function UpdateProfileInformationForm({ 
    mustVerifyEmail, 
    status, 
    user,
    className = '',
    onSuccess,
    onError 
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [profilePreview, setProfilePreview] = useState(user.profile_picture ? `/storage/${user.profile_picture}` : null);
    const [idPreview, setIdPreview] = useState(user.id_verification ? `/storage/${user.id_verification}` : null);
    const [profileFile, setProfileFile] = useState(null);
    const [idFile, setIdFile] = useState(null);
    const toast = useRef(null);

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        profile_picture: null,
        id_verification: null,
        _method: 'PATCH'
    });

    // Update form data when user prop changes
    useEffect(() => {
        setData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            profile_picture: null,
            id_verification: null,
            _method: 'PATCH'
        });
        setProfilePreview(user.profile_picture ? `/storage/${user.profile_picture}` : null);
        setIdPreview(user.id_verification ? `/storage/${user.id_verification}` : null);
    }, [user]);

    const submit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('address', data.address);
        formData.append('_method', 'PATCH');
        
        // Append files if they exist
        if (profileFile) {
            formData.append('profile_picture', profileFile);
        }
        
        if (idFile) {
            formData.append('id_verification', idFile);
        }

        try {
            // Use the Inertia patch method with FormData
            await router.post(route('profile.update'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    if (onSuccess) onSuccess('Profile updated successfully!');
                    
                    // Clear file inputs and reset state
                    setProfileFile(null);
                    setIdFile(null);
                    reset();
                    
                    // Reload user data to get updated image URLs
                    router.reload({ only: ['user'] });
                },
                onError: (errors) => {
                    if (onError) onError('Failed to update profile. Please try again.');
                    console.error('Update error:', errors);
                },
                onFinish: () => {
                    setIsUploading(false);
                }
            });
        } catch (error) {
            console.error('Submission error:', error);
            setIsUploading(false);
            if (onError) onError('An error occurred. Please try again.');
        }
    };

    // Handle profile picture upload with preview
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            toast.current?.show({
                severity: 'error',
                summary: 'Invalid File',
                detail: 'Please select an image file',
                life: 3000
            });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.current?.show({
                severity: 'error',
                summary: 'File Too Large',
                detail: 'Image must be less than 2MB',
                life: 3000
            });
            return;
        }

        setProfileFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setProfilePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle ID verification upload with preview
    const handleIdVerificationChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('application/pdf|image.*')) {
            toast.current?.show({
                severity: 'error',
                summary: 'Invalid File',
                detail: 'Please select a PDF or image file',
                life: 3000
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.current?.show({
                severity: 'error',
                summary: 'File Too Large',
                detail: 'File must be less than 5MB',
                life: 3000
            });
            return;
        }

        setIdFile(file);
        
        // Create preview for images only
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setIdPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setIdPreview(null);
        }
    };

    // Remove profile picture
    const removeProfilePicture = () => {
        setProfileFile(null);
        setProfilePreview(null);
        
        // Send request to remove from server
        router.post(route('profile.update'), {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            profile_picture: '', // Empty string to indicate removal
            _method: 'PATCH'
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['user'] });
            }
        });
    };

    // Remove ID verification
    const removeIdVerification = () => {
        setIdFile(null);
        setIdPreview(null);
        
        // Send request to remove from server
        router.post(route('profile.update'), {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            id_verification: '', // Empty string to indicate removal
            _method: 'PATCH'
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['user'] });
            }
        });
    };

    return (
        <section className={className}>
            <Toast ref={toast} />
            
            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                        
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
                            <InputText
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <InputText
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="Phone Number" />
                            <InputText
                                id="phone"
                                type="tel"
                                className="mt-1 block w-full"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                autoComplete="tel"
                            />
                            <InputError className="mt-2" message={errors.phone} />
                        </div>

                        <div>
                            <InputLabel htmlFor="address" value="Address" />
                            <InputText
                                id="address"
                                className="mt-1 block w-full"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.address} />
                        </div>
                    </div>

                    {/* Profile Picture Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                        
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                                    {profilePreview ? (
                                        <img 
                                            src={profilePreview} 
                                            alt="Profile Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <i className="pi pi-user text-gray-400 text-3xl"></i>
                                        </div>
                                    )}
                                </div>
                                {profilePreview && (
                                    <button
                                        type="button"
                                        onClick={removeProfilePicture}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                        title="Remove photo"
                                    >
                                        <i className="pi pi-times text-xs"></i>
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Profile Photo
                                </label>
                                <div className="flex items-center space-x-2">
                                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 transition-colors">
                                        <i className="pi pi-upload mr-2"></i>
                                        Choose File
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                        />
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        JPG, PNG up to 2MB
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Recommended: Square image, 400x400px minimum
                                </p>
                            </div>
                        </div>

                        {/* ID Verification Section */}
                        <div className="pt-4 border-t">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">ID Verification</h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                    {idPreview ? (
                                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
                                            <img 
                                                src={idPreview} 
                                                alt="ID Preview" 
                                                className="w-full h-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeIdVerification}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                            <i className="pi pi-id-card text-gray-400 text-2xl"></i>
                                        </div>
                                    )}
                                    
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload ID Document
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
                                                <i className="pi pi-file-upload mr-2"></i>
                                                Choose File
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleIdVerificationChange}
                                                />
                                            </label>
                                            <span className="text-sm text-gray-500">
                                                PDF, JPG, PNG up to 5MB
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Upload a government-issued ID for verification
                                        </p>
                                    </div>
                                </div>
                                
                                {user.id_verification && (
                                    <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                                        <i className="pi pi-check-circle mr-2"></i>
                                        ID verification document uploaded
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Verification Section */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <i className="pi pi-exclamation-triangle text-yellow-400"></i>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your email address is unverified.
                                    <button
                                        type="button"
                                        className="underline text-sm text-yellow-700 hover:text-yellow-600 ml-1"
                                        onClick={() => router.post(route('verification.send'))}
                                    >
                                        Click here to resend the verification email.
                                    </button>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center space-x-3">
                        <PrimaryButton 
                            disabled={processing || isUploading}
                            type="submit"
                        >
                            {processing || isUploading ? (
                                <>
                                    <i className="pi pi-spin pi-spinner mr-2"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="pi pi-save mr-2"></i>
                                    Save Changes
                                </>
                            )}
                        </PrimaryButton>
                        
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <div className="flex items-center text-green-600 text-sm">
                                <i className="pi pi-check-circle mr-2"></i>
                                Saved successfully!
                            </div>
                        </Transition>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => router.reload({ only: ['user'] })}
                        className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
                    >
                        <i className="pi pi-refresh mr-2"></i>
                        Refresh Data
                    </button>
                </div>
            </form>
        </section>
    );
}