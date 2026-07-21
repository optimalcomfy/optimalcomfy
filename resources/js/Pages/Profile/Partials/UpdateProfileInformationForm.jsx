import { useRef, useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import 'primeicons/primeicons.css';
import countriesWithNationality from '@/Pages/Auth/Countries';

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
    const [idFrontPreview, setIdFrontPreview] = useState(user.id_front ? `/storage/${user.id_front}` : null);
    const [idBackPreview, setIdBackPreview] = useState(user.id_back ? `/storage/${user.id_back}` : null);
    const [pendingProfilePreview, setPendingProfilePreview] = useState(user.pending_profile_picture ? `/storage/${user.pending_profile_picture}` : null);
    const [pendingIdFrontPreview, setPendingIdFrontPreview] = useState(user.pending_id_front ? `/storage/${user.pending_id_front}` : null);
    const [pendingIdBackPreview, setPendingIdBackPreview] = useState(user.pending_id_back ? `/storage/${user.pending_id_back}` : null);
    
    const [profileFile, setProfileFile] = useState(null);
    const [idFrontFile, setIdFrontFile] = useState(null);
    const [idBackFile, setIdBackFile] = useState(null);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const toast = useRef(null);

    // Check if user has pending changes
    const hasPendingChanges = user.profile_status === 'pending' || user.pending_data !== null;

    // Format countries for dropdown with nationality auto-fill
    const countryOptions = countriesWithNationality.map(country => ({
        label: country.country,
        value: country.code,
        nationality: country.nationality
    }));

    // Payment method options
    const paymentMethods = [
        { label: 'Select Payment Method', value: '' },
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Stripe', value: 'stripe' },
        { label: 'Cash', value: 'cash' },
        { label: 'M-Pesa', value: 'mpesa' },
        { label: 'Other', value: 'other' },
    ];

    // FIXED: Handle both string JSON and object for pending_data
    const getPendingData = () => {
        if (!user.pending_data) return {};
        
        if (typeof user.pending_data === 'string') {
            try {
                return JSON.parse(user.pending_data);
            } catch (e) {
                console.error('Error parsing pending_data JSON:', e);
                return {};
            }
        }
        
        return user.pending_data;
    };

    const pendingData = getPendingData();

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm({
        name: user.name || '',
        display_name: user.display_name || '',
        phone: user.phone || '',
        email: user.email || '',
        date_of_birth: user.date_of_birth || '',
        nationality: user.nationality || '',
        passport_number: user.passport_number || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
        profile_picture: null,
        id_front: null,
        id_back: null,
        bio: user.bio || '',
        preferred_payment_method: user.preferred_payment_method || '',
        emergency_contact: user.emergency_contact || '',
        contact_phone: user.contact_phone || '',
        _method: 'PATCH'
    });

    // Update form data when user prop changes
    useEffect(() => {
        const currentPendingData = getPendingData();
        
        setData({
            name: hasPendingChanges ? (currentPendingData.name || user.name || '') : (user.name || ''),
            display_name: hasPendingChanges ? (currentPendingData.display_name || user.display_name || '') : (user.display_name || ''),
            phone: hasPendingChanges ? (currentPendingData.phone || user.phone || '') : (user.phone || ''),
            email: user.email || '',
            date_of_birth: hasPendingChanges ? (currentPendingData.date_of_birth || user.date_of_birth || '') : (user.date_of_birth || ''),
            nationality: hasPendingChanges ? (currentPendingData.nationality || user.nationality || '') : (user.nationality || ''),
            passport_number: hasPendingChanges ? (currentPendingData.passport_number || user.passport_number || '') : (user.passport_number || ''),
            address: hasPendingChanges ? (currentPendingData.address || user.address || '') : (user.address || ''),
            city: hasPendingChanges ? (currentPendingData.city || user.city || '') : (user.city || ''),
            country: hasPendingChanges ? (currentPendingData.country || user.country || '') : (user.country || ''),
            postal_code: hasPendingChanges ? (currentPendingData.postal_code || user.postal_code || '') : (user.postal_code || ''),
            profile_picture: null,
            id_front: null,
            id_back: null,
            bio: hasPendingChanges ? (currentPendingData.bio || user.bio || '') : (user.bio || ''),
            preferred_payment_method: hasPendingChanges ? (currentPendingData.preferred_payment_method || user.preferred_payment_method || '') : (user.preferred_payment_method || ''),
            emergency_contact: hasPendingChanges ? (currentPendingData.emergency_contact || user.emergency_contact || '') : (user.emergency_contact || ''),
            contact_phone: hasPendingChanges ? (currentPendingData.contact_phone || user.contact_phone || '') : (user.contact_phone || ''),
            _method: 'PATCH'
        });
        
        // Set previews based on pending or active status
        if (hasPendingChanges) {
            setProfilePreview(user.pending_profile_picture ? `/storage/${user.pending_profile_picture}` : (user.profile_picture ? `/storage/${user.profile_picture}` : null));
            setIdFrontPreview(user.pending_id_front ? `/storage/${user.pending_id_front}` : (user.id_front ? `/storage/${user.id_front}` : null));
            setIdBackPreview(user.pending_id_back ? `/storage/${user.pending_id_back}` : (user.id_back ? `/storage/${user.id_back}` : null));
            setPendingProfilePreview(user.pending_profile_picture ? `/storage/${user.pending_profile_picture}` : null);
            setPendingIdFrontPreview(user.pending_id_front ? `/storage/${user.pending_id_front}` : null);
            setPendingIdBackPreview(user.pending_id_back ? `/storage/${user.pending_id_back}` : null);
        } else {
            setProfilePreview(user.profile_picture ? `/storage/${user.profile_picture}` : null);
            setIdFrontPreview(user.id_front ? `/storage/${user.id_front}` : null);
            setIdBackPreview(user.id_back ? `/storage/${user.id_back}` : null);
            setPendingProfilePreview(null);
            setPendingIdFrontPreview(null);
            setPendingIdBackPreview(null);
        }
    }, [user, hasPendingChanges]);

    // Handle country selection - auto-fill nationality
    const handleCountryChange = (e) => {
        const selectedCountry = countryOptions.find(country => country.value === e.value);
        setData('country', e.value);
        
        if (selectedCountry && selectedCountry.nationality) {
            setData('nationality', selectedCountry.nationality);
        }
    };

    // Handle nationality input - filter countries
    const handleNationalityChange = (value) => {
        setData('nationality', value);
        
        if (value.trim() !== '') {
            const filtered = countryOptions.filter(country => 
                country.nationality.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCountries(filtered);
        } else {
            setFilteredCountries([]);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        // Create FormData for file upload
        const formData = new FormData();
        
        // Append all text fields
        const fields = [
            'name', 'display_name', 'phone', 'email', 'date_of_birth',
            'nationality', 'passport_number', 'address', 'city', 'country',
            'postal_code', 'bio', 'preferred_payment_method', 
            'emergency_contact', 'contact_phone'
        ];
        
        fields.forEach(field => {
            formData.append(field, data[field] || '');
        });
        
        formData.append('_method', 'PATCH');
        formData.append('is_pending_update', 'true'); // Flag for pending updates
        
        // Append files if they exist
        if (profileFile) {
            formData.append('profile_picture', profileFile);
        }
        
        if (idFrontFile) {
            formData.append('id_front', idFrontFile);
        }
        
        if (idBackFile) {
            formData.append('id_back', idBackFile);
        }

        try {
            await router.post(route('profile.update'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    if (onSuccess) onSuccess('Profile update submitted for verification! It will be reviewed by our team.');
                    
                    // Clear file inputs and reset state
                    setProfileFile(null);
                    setIdFrontFile(null);
                    setIdBackFile(null);
                    reset();
                    
                    // Reload user data to get updated pending status
                    router.reload({ only: ['user'] });
                },
                onError: (errors) => {
                    if (onError) onError('Failed to submit profile update. Please try again.');
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

    // Handle ID Front upload with preview
    const handleIdFrontChange = (e) => {
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

        setIdFrontFile(file);
        
        // Create preview for images only
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setIdFrontPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setIdFrontPreview(null);
        }
    };

    // Handle ID Back upload with preview
    const handleIdBackChange = (e) => {
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

        setIdBackFile(file);
        
        // Create preview for images only
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setIdBackPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setIdBackPreview(null);
        }
    };

    // Remove profile picture
    const removeProfilePicture = () => {
        setProfileFile(null);
        setProfilePreview(user.profile_picture ? `/storage/${user.profile_picture}` : null);
        
        // Send request to remove pending profile picture
        const formData = new FormData();
        formData.append('remove_pending_profile', 'true');
        formData.append('_method', 'PATCH');
        
        router.post(route('profile.update'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['user'] });
            }
        });
    };

    // Remove ID Front
    const removeIdFront = () => {
        setIdFrontFile(null);
        setIdFrontPreview(user.id_front ? `/storage/${user.id_front}` : null);
        
        // Send request to remove pending ID front
        const formData = new FormData();
        formData.append('remove_pending_id_front', 'true');
        formData.append('_method', 'PATCH');
        
        router.post(route('profile.update'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['user'] });
            }
        });
    };

    // Remove ID Back
    const removeIdBack = () => {
        setIdBackFile(null);
        setIdBackPreview(user.id_back ? `/storage/${user.id_back}` : null);
        
        // Send request to remove pending ID back
        const formData = new FormData();
        formData.append('remove_pending_id_back', 'true');
        formData.append('_method', 'PATCH');
        
        router.post(route('profile.update'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['user'] });
            }
        });
    };

    // Cancel pending changes
    const cancelPendingChanges = () => {
        if (!confirm('Are you sure you want to cancel your pending changes?')) return;
        
        router.post(route('profile.cancel-pending'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Cancelled',
                    detail: 'Pending changes have been cancelled',
                    life: 3000
                });
                router.reload({ only: ['user'] });
            }
        });
    };

    return (
        <section className={className}>
            <Toast ref={toast} />
            
            {/* Pending Changes Alert */}
            {hasPendingChanges && (
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center">
                            <i className="pi pi-clock text-blue-500 text-xl mr-3"></i>
                            <div className='flex flex-col'>
                                <h4 className="font-semibold text-blue-800">Profile Update Pending Verification</h4>
                                <p className="text-blue-600 text-sm mt-1">
                                    Your profile changes are under review. You cannot make additional changes until the current request is processed.
                                </p>
                                {user.profile_status === 'rejected' && user.rejection_reason && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-red-700 text-sm font-medium">Rejection Reason:</p>
                                        <p className="text-red-600 text-sm">{user.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={cancelPendingChanges}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 w-fit py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                        >
                            Cancel Changes
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Badge */}
                        {hasPendingChanges && (
                            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Badge 
                                            value="PENDING" 
                                            severity="warning"
                                            className="mr-3"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Current values shown. Pending changes in review.
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        <i className="pi pi-info-circle mr-1"></i>
                                        Updates require verification
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                Personal Information
                                {hasPendingChanges && (
                                    <Badge value="Pending" severity="warning" className="ml-2" />
                                )}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <InputLabel htmlFor="name" value="Full Name *" />
                                    <InputText
                                        id="name"
                                        className="w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="display_name" value="Display Name" />
                                    <InputText
                                        id="display_name"
                                        className="w-full"
                                        value={data.display_name}
                                        onChange={(e) => setData('display_name', e.target.value)}
                                        autoComplete="nickname"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.display_name} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="email" value="Email *" />
                                    <InputText
                                        id="email"
                                        type="email"
                                        className="w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="email"
                                        disabled
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="phone" value="Phone Number" />
                                    <InputText
                                        id="phone"
                                        type="tel"
                                        className="w-full"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        autoComplete="tel"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                                    <Calendar
                                        id="date_of_birth"
                                        className="w-full"
                                        value={data.date_of_birth ? new Date(data.date_of_birth) : null}
                                        onChange={(e) => setData('date_of_birth', e.value ? e.value.toISOString().split('T')[0] : '')}
                                        dateFormat="yy-mm-dd"
                                        showIcon
                                        maxDate={new Date()}
                                        placeholder="YYYY-MM-DD"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.date_of_birth} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="country" value="Country" />
                                    <Dropdown
                                        id="country"
                                        className="w-full"
                                        value={data.country}
                                        onChange={handleCountryChange}
                                        options={countryOptions}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Select Country"
                                        filter
                                        filterBy="label"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.country} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="nationality" value="Nationality" />
                                    <InputText
                                        id="nationality"
                                        className="w-full"
                                        value={data.nationality}
                                        onChange={(e) => handleNationalityChange(e.target.value)}
                                        list="nationality-options"
                                        autoComplete="off"
                                        disabled={hasPendingChanges}
                                    />
                                    <datalist id="nationality-options">
                                        {countryOptions.map((country, index) => (
                                            <option key={index} value={country.nationality} />
                                        ))}
                                    </datalist>
                                    <InputError message={errors.nationality} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="passport_number" value="ID / Passport Number" />
                                    <InputText
                                        id="passport_number"
                                        className="w-full"
                                        value={data.passport_number}
                                        onChange={(e) => setData('passport_number', e.target.value)}
                                        autoComplete="off"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.passport_number} />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <InputLabel htmlFor="address" value="Street Address" />
                                    <InputText
                                        id="address"
                                        className="w-full"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        autoComplete="street-address"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="city" value="City" />
                                    <InputText
                                        id="city"
                                        className="w-full"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        autoComplete="address-level2"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="postal_code" value="Postal Code" />
                                    <InputText
                                        id="postal_code"
                                        className="w-full"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        autoComplete="postal-code"
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <InputLabel htmlFor="bio" value="Bio / About Me" />
                                    <textarea
                                        id="bio"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                        disabled={hasPendingChanges}
                                    />
                                    <InputError message={errors.bio} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="preferred_payment_method" value="Preferred Payment Method" />
                                        <Dropdown
                                            id="preferred_payment_method"
                                            className="w-full"
                                            value={data.preferred_payment_method}
                                            onChange={(e) => setData('preferred_payment_method', e.value)}
                                            options={paymentMethods}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Select Payment Method"
                                            disabled={hasPendingChanges}
                                        />
                                        <InputError message={errors.preferred_payment_method} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="emergency_contact" value="Emergency Contact Name" />
                                        <InputText
                                            id="emergency_contact"
                                            className="w-full"
                                            value={data.emergency_contact}
                                            onChange={(e) => setData('emergency_contact', e.target.value)}
                                            disabled={hasPendingChanges}
                                        />
                                        <InputError message={errors.emergency_contact} />
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="contact_phone" value="Emergency Contact Phone" />
                                        <InputText
                                            id="contact_phone"
                                            type="tel"
                                            className="w-full"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            disabled={hasPendingChanges}
                                        />
                                        <InputError message={errors.contact_phone} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Profile Picture & ID Verification */}
                    <div className="space-y-6">
                        {/* Profile Picture Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                Profile Picture
                                {hasPendingChanges && user.pending_profile_picture && (
                                    <Badge value="New" severity="warning" className="ml-2" />
                                )}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                                            {profilePreview ? (
                                                <img 
                                                    src={profilePreview} 
                                                    alt="Profile Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <i className="pi pi-user text-gray-400 text-5xl"></i>
                                                </div>
                                            )}
                                        </div>
                                        {profilePreview && !hasPendingChanges && (
                                            <button
                                                type="button"
                                                onClick={removeProfilePicture}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                                                title="Remove photo"
                                            >
                                                <i className="pi pi-times text-sm"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {hasPendingChanges && user.pending_profile_picture && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-yellow-700 text-sm font-medium mb-1">
                                            <i className="pi pi-clock mr-1"></i>
                                            New profile picture pending verification
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-yellow-300">
                                                <img 
                                                    src={pendingProfilePreview} 
                                                    alt="Pending Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-xs text-yellow-600">Pending review by admin</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {!hasPendingChanges && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Upload New Photo
                                            </label>
                                            <label className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50">
                                                <i className="pi pi-cloud-upload text-gray-400 text-xl mr-3"></i>
                                                <span className="text-gray-600">Click to upload</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleProfilePictureChange}
                                                    disabled={hasPendingChanges}
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 text-center">
                                                JPG, PNG up to 2MB. Recommended: 400x400px
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ID Front Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                ID Front
                                {hasPendingChanges && user.pending_id_front && (
                                    <Badge value="New" severity="warning" className="ml-2" />
                                )}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="relative w-full max-w-xs">
                                        {idFrontPreview ? (
                                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                                <img 
                                                    src={idFrontPreview} 
                                                    alt="ID Front Preview" 
                                                    className="w-full h-48 object-contain"
                                                />
                                                {!hasPendingChanges && (
                                                    <button
                                                        type="button"
                                                        onClick={removeIdFront}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-6 p-2 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 p-4">
                                                <i className="pi pi-id-card text-gray-400 text-3xl mb-2"></i>
                                                <span className="text-gray-500 text-sm text-center">
                                                    No ID front uploaded
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {hasPendingChanges && user.pending_id_front && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-yellow-700 text-sm font-medium">
                                            <i className="pi pi-clock mr-1"></i>
                                            New ID front pending verification
                                        </p>
                                    </div>
                                )}
                                
                                {!hasPendingChanges && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Upload ID Front
                                            </label>
                                            <label className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50">
                                                <i className="pi pi-file-upload text-gray-400 text-xl mr-3"></i>
                                                <span className="text-gray-600">Choose File</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleIdFrontChange}
                                                    disabled={hasPendingChanges}
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 text-center">
                                                PDF, JPG, PNG up to 5MB
                                            </p>
                                        </div>
                                    </>
                                )}
                                
                                {user.id_front && !hasPendingChanges && (
                                    <div className="flex items-center justify-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                        <i className="pi pi-check-circle mr-2"></i>
                                        ID front uploaded
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ID Back Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                ID Back
                                {hasPendingChanges && user.pending_id_back && (
                                    <Badge value="New" severity="warning" className="ml-2" />
                                )}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="relative w-full max-w-xs">
                                        {idBackPreview ? (
                                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                                <img 
                                                    src={idBackPreview} 
                                                    alt="ID Back Preview" 
                                                    className="w-full h-48 object-contain"
                                                />
                                                {!hasPendingChanges && (
                                                    <button
                                                        type="button"
                                                        onClick={removeIdBack}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-6 p-2 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 p-4">
                                                <i className="pi pi-id-card text-gray-400 text-3xl mb-2"></i>
                                                <span className="text-gray-500 text-sm text-center">
                                                    No ID back uploaded
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {hasPendingChanges && user.pending_id_back && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-yellow-700 text-sm font-medium">
                                            <i className="pi pi-clock mr-1"></i>
                                            New ID back pending verification
                                        </p>
                                    </div>
                                )}
                                
                                {!hasPendingChanges && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Upload ID Back
                                            </label>
                                            <label className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50">
                                                <i className="pi pi-file-upload text-gray-400 text-xl mr-3"></i>
                                                <span className="text-gray-600">Choose File</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleIdBackChange}
                                                    disabled={hasPendingChanges}
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 text-center">
                                                PDF, JPG, PNG up to 5MB
                                            </p>
                                        </div>
                                    </>
                                )}
                                
                                {user.id_back && !hasPendingChanges && (
                                    <div className="flex items-center justify-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                        <i className="pi pi-check-circle mr-2"></i>
                                        ID back uploaded
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Verification Section */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <i className="pi pi-exclamation-triangle text-yellow-400 text-xl"></i>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your email address is unverified.
                                    <button
                                        type="button"
                                        className="underline text-sm text-yellow-700 hover:text-yellow-600 ml-1 font-medium"
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
                            disabled={processing || isUploading || hasPendingChanges}
                            type="submit"
                            className="px-6 py-3"
                        >
                            {processing || isUploading ? (
                                <>
                                    <i className="pi pi-spin pi-spinner mr-2"></i>
                                    Submitting...
                                </>
                            ) : hasPendingChanges ? (
                                <>
                                    <i className="pi pi-clock mr-2"></i>
                                    Changes Pending Review
                                </>
                            ) : (
                                <>
                                    <i className="pi pi-save mr-2"></i>
                                    Submit for Verification
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
                            <div className="flex items-center text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                                <i className="pi pi-check-circle mr-2"></i>
                                Submitted for verification!
                            </div>
                        </Transition>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setProfileFile(null);
                                setIdFrontFile(null);
                                setIdBackFile(null);
                                if (hasPendingChanges) {
                                    setProfilePreview(user.pending_profile_picture ? `/storage/${user.pending_profile_picture}` : (user.profile_picture ? `/storage/${user.profile_picture}` : null));
                                    setIdFrontPreview(user.pending_id_front ? `/storage/${user.pending_id_front}` : (user.id_front ? `/storage/${user.id_front}` : null));
                                    setIdBackPreview(user.pending_id_back ? `/storage/${user.pending_id_back}` : (user.id_back ? `/storage/${user.id_back}` : null));
                                } else {
                                    setProfilePreview(user.profile_picture ? `/storage/${user.profile_picture}` : null);
                                    setIdFrontPreview(user.id_front ? `/storage/${user.id_front}` : null);
                                    setIdBackPreview(user.id_back ? `/storage/${user.id_back}` : null);
                                }
                            }}
                            className="text-gray-600 hover:text-gray-900 text-sm flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={hasPendingChanges}
                        >
                            <i className="pi pi-times mr-2"></i>
                            Reset Changes
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => router.reload({ only: ['user'] })}
                            className="text-gray-600 hover:text-gray-900 text-sm flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <i className="pi pi-refresh mr-2"></i>
                            Refresh Data
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}