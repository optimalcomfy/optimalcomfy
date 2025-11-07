import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import {
    Mail,
    MessageSquare,
    Users,
    Calendar,
    FileText,
    BarChart3,
    Plus,
    Edit,
    Send,
    Eye,
    Filter,
    X,
    User,
    Search,
    Phone,
    AtSign,
    Trash2,
    Save,
    Check,
    ChevronDown,
    ChevronUp,
    Download,
    Upload,
    FileText as CsvIcon
} from 'lucide-react';

// Custom Recipients Section as a separate memoized component
const CustomRecipientsSection = React.memo(({
    customRecipients,
    newRecipient,
    onNewRecipientChange,
    onAddRecipient,
    onRemoveRecipient,
    onImportCSV
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                    Custom Recipients
                </label>
                <div className="flex gap-2">
                    <span className="text-sm text-gray-500">
                        {customRecipients.length} recipients
                    </span>
                    <button
                        type="button"
                        onClick={onImportCSV}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                        <Upload className="w-4 h-4" />
                        Import CSV
                    </button>
                </div>
            </div>

            {/* Add Custom Recipient Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Recipient</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Name *</label>
                        <input
                            type="text"
                            value={newRecipient.name}
                            onChange={(e) => onNewRecipientChange('name', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            placeholder="Recipient name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 flex items-center gap-1">
                            <AtSign className="w-3 h-3" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={newRecipient.email}
                            onChange={(e) => onNewRecipientChange('email', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Phone
                        </label>
                        <input
                            type="text"
                            value={newRecipient.phone}
                            onChange={(e) => onNewRecipientChange('phone', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            placeholder="Phone number"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={onAddRecipient}
                            disabled={!newRecipient.name.trim() || (!newRecipient.email && !newRecipient.phone)}
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                            Add Recipient
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Recipients List */}
            {customRecipients.length > 0 && (
                <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700">Custom Recipients List</h4>
                    </div>
                    <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {customRecipients.map((recipient, index) => (
                            <div key={`recipient-${index}`} className="p-4 flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{recipient.name}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {recipient.email && (
                                            <span className="flex items-center gap-1">
                                                <AtSign className="w-3 h-3" />
                                                {recipient.email}
                                            </span>
                                        )}
                                        {recipient.phone && (
                                            <span className="flex items-center gap-1 mt-1">
                                                <Phone className="w-3 h-3" />
                                                {recipient.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemoveRecipient(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remove recipient"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Custom Recipients
                        </h3>
                        <div className="mt-1 text-sm text-blue-700">
                            <p>
                                Add custom recipients who will receive communications when this template is used with "Custom" target audience.
                                Each recipient must have at least an email or phone number.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CustomRecipientsSection.displayName = 'CustomRecipientsSection';

const CommunicationsIndex = ({ templates, campaigns, availableVariables, flash }) => {
    const { pagination, auth, users: initialUsers } = usePage().props;
    const [activeTab, setActiveTab] = useState('templates');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showIndividualModal, setShowIndividualModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importData, setImportData] = useState('');
    const [importError, setImportError] = useState('');

    const animatedComponents = makeAnimated();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        sms_content: '',
        email_content: '',
        type: 'custom',
        target_audience: 'guests',
        is_active: true,
        custom_recipients: []
    });

    const [individualFormData, setIndividualFormData] = useState({
        template_id: '',
        email_subject: '',
        sms_content: '',
        email_content: '',
        selected_users: [],
        custom_phone: '',
        custom_email: '',
        custom_name: '',
        send_sms: false,
        send_email: false
    });

    const [bulkFormData, setBulkFormData] = useState({
        send_sms: false,
        send_email: false
    });

    const [newCustomRecipient, setNewCustomRecipient] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Prepare user options for React Select
    const userOptions = useMemo(() => {
        return initialUsers.map(user => ({
            value: user.id,
            label: user.name,
            user: user,
            email: user.email,
            phone: user.phone,
            role: user.role_id === 2 ? 'Host' : 'Guest'
        }));
    }, [initialUsers]);

    // Custom styles for React Select
    const customSelectStyles = useMemo(() => ({
        control: (base, state) => ({
            ...base,
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(249, 115, 22, 0.5)' : 'none',
            borderColor: state.isFocused ? '#f97316' : '#d1d5db',
            '&:hover': {
                borderColor: state.isFocused ? '#f97316' : '#9ca3af'
            },
            minHeight: '42px',
            fontSize: '14px'
        }),
        menu: base => ({
            ...base,
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 50
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#fed7aa' : state.isFocused ? '#ffedd5' : 'white',
            color: state.isSelected ? '#7c2d12' : '#1f2937',
            fontSize: '14px',
            padding: '8px 12px',
            '&:active': {
                backgroundColor: '#fdba74'
            }
        }),
        multiValue: base => ({
            ...base,
            backgroundColor: '#fed7aa',
            borderRadius: '6px'
        }),
        multiValueLabel: base => ({
            ...base,
            color: '#7c2d12',
            fontWeight: '500',
            fontSize: '13px'
        }),
        multiValueRemove: base => ({
            ...base,
            color: '#9a3412',
            borderRadius: '0 6px 6px 0',
            '&:hover': {
                backgroundColor: '#fdba74',
                color: '#7c2d12'
            }
        }),
        placeholder: base => ({
            ...base,
            color: '#9ca3af',
            fontSize: '14px'
        })
    }), []);

    // Custom option component for user selection
    const UserOption = useCallback(({ innerRef, innerProps, data, isSelected, isFocused }) => (
        <div
            ref={innerRef}
            {...innerProps}
            className={`
                p-3 border-b border-gray-100 cursor-pointer transition-colors
                ${isSelected ? 'bg-orange-100' : isFocused ? 'bg-orange-50' : 'bg-white'}
                hover:bg-orange-50
            `}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                        {data.label}
                        {isSelected && <Check className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                            <AtSign className="w-3 h-3" />
                            {data.email}
                        </div>
                        {data.phone && (
                            <div className="flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {data.phone}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 capitalize mt-1">
                        {data.role}
                    </div>
                </div>
            </div>
        </div>
    ), []);

    // Custom value component for selected users
    const UserValue = useCallback(({ children, ...props }) => (
        <div {...props} className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
            {children}
        </div>
    ), []);

    // Handle template form submission
    const handleTemplateSubmit = (e) => {
        e.preventDefault();

        const url = selectedTemplate
            ? route('communications.templates.update', { template: selectedTemplate.id })
            : route('communications.templates.create');

        const method = selectedTemplate ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                setShowTemplateModal(false);
                setSelectedTemplate(null);
                setFormData({
                    name: '',
                    subject: '',
                    sms_content: '',
                    email_content: '',
                    type: 'custom',
                    target_audience: 'guests',
                    is_active: true,
                    custom_recipients: []
                });
                setNewCustomRecipient({ name: '', email: '', phone: '' });
            }
        });
    };

    // Handle bulk send
    const handleBulkSend = (campaignId) => {
        router.post(route('communications.bulk.send', { bulkCommunication: campaignId }), {}, {
            onSuccess: () => {
                // Success handled by flash message
            }
        });
    };

    // Handle individual communication send
    const handleIndividualSend = (e) => {
        e.preventDefault();

        // Validate that at least one communication method is selected
        if (!individualFormData.send_sms && !individualFormData.send_email) {
            alert('Please select at least one communication method (SMS or Email)');
            return;
        }

        // Validate content based on selected methods
        if (individualFormData.send_sms && !individualFormData.sms_content.trim()) {
            alert('Please enter SMS content when SMS is selected');
            return;
        }

        if (individualFormData.send_email && !individualFormData.email_content.trim()) {
            alert('Please enter email content when email is selected');
            return;
        }

        if (individualFormData.send_email && !individualFormData.email_subject.trim()) {
            alert('Please enter email subject when email is selected');
            return;
        }

        const payload = {
            ...individualFormData,
            selected_users: individualFormData.selected_users.map(user => user.value),
            recipient_type: 'individual'
        };

        router.post(route('communications.individual.send'), payload, {
            onSuccess: () => {
                setShowIndividualModal(false);
                setIndividualFormData({
                    template_id: '',
                    email_subject: '',
                    sms_content: '',
                    email_content: '',
                    selected_users: [],
                    custom_phone: '',
                    custom_email: '',
                    custom_name: '',
                    send_sms: false,
                    send_email: false
                });
            }
        });
    };

    // Handle bulk campaign creation
    const handleBulkCreate = () => {
        // Validate that at least one communication method is selected
        if (!bulkFormData.send_sms && !bulkFormData.send_email) {
            alert('Please select at least one communication method (SMS or Email)');
            return;
        }

        // Validate content based on selected methods
        if (bulkFormData.send_sms && !selectedTemplate?.sms_content?.trim()) {
            alert('Selected template has no SMS content. Please edit the template or choose email only.');
            return;
        }

        if (bulkFormData.send_email && !selectedTemplate?.email_content?.trim()) {
            alert('Selected template has no email content. Please edit the template or choose SMS only.');
            return;
        }

        const bulkData = {
            template_id: selectedTemplate.id,
            subject: selectedTemplate.subject,
            sms_content: selectedTemplate.sms_content,
            email_content: selectedTemplate.email_content,
            target_audience: selectedTemplate.target_audience,
            type: selectedTemplate.type,
            send_sms: bulkFormData.send_sms,
            send_email: bulkFormData.send_email
        };

        router.post(route('communications.bulk.create'), bulkData, {
            onSuccess: () => {
                setShowBulkModal(false);
                setSelectedTemplate(null);
                setBulkFormData({
                    send_sms: false,
                    send_email: false
                });
            }
        });
    };

    // Insert variable into content
    const insertVariable = (variable, field) => {
        const currentContent = formData[field] || '';
        setFormData(prev => ({
            ...prev,
            [field]: currentContent + ` {{${variable}}} `
        }));
    };

    // Insert variable into individual form content
    const insertIndividualVariable = (variable, field) => {
        const currentContent = individualFormData[field] || '';
        setIndividualFormData(prev => ({
            ...prev,
            [field]: currentContent + ` {{${variable}}} `
        }));
    };

    // Handle search
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setLoading(true);

        router.get(route('communications.index'), { search: e.target.value }, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    // Load template for individual sending
    const loadTemplateForIndividual = (template) => {
        setIndividualFormData(prev => ({
            ...prev,
            template_id: template.id,
            email_subject: template.subject || '',
            sms_content: template.sms_content || '',
            email_content: template.email_content || '',
            send_sms: !!template.sms_content,
            send_email: !!template.email_content
        }));
    };

    // Custom Recipients Functions
    const addCustomRecipient = useCallback(() => {
        if (!newCustomRecipient.name.trim()) {
            alert('Please enter a name for the custom recipient');
            return;
        }

        if (!newCustomRecipient.email && !newCustomRecipient.phone) {
            alert('Please enter either email or phone for the custom recipient');
            return;
        }

        setFormData(prev => ({
            ...prev,
            custom_recipients: [...prev.custom_recipients, { ...newCustomRecipient }]
        }));
        setNewCustomRecipient({ name: '', email: '', phone: '' });
    }, [newCustomRecipient]);

    const removeCustomRecipient = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            custom_recipients: prev.custom_recipients.filter((_, i) => i !== index)
        }));
    }, []);

    // Handle new recipient field changes
    const handleNewRecipientChange = useCallback((field, value) => {
        setNewCustomRecipient(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Handle template editing
    const handleEditTemplate = (template) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject,
            sms_content: template.sms_content || '',
            email_content: template.email_content || '',
            type: template.type,
            target_audience: template.target_audience,
            is_active: template.is_active,
            custom_recipients: template.custom_recipients || []
        });
        setShowTemplateModal(true);
    };

    // Handle CSV import
    const handleImportCSV = () => {
        if (!importData.trim()) {
            setImportError('Please paste CSV data');
            return;
        }

        const lines = importData.trim().split('\n');
        const importedRecipients = [];

        lines.forEach((line, index) => {
            const [name, email, phone] = line.split(',').map(field => field.trim());

            if (name && (email || phone)) {
                importedRecipients.push({
                    name,
                    email: email || '',
                    phone: phone || ''
                });
            }
        });

        if (importedRecipients.length === 0) {
            setImportError('No valid recipients found in CSV data');
            return;
        }

        setFormData(prev => ({
            ...prev,
            custom_recipients: [...prev.custom_recipients, ...importedRecipients]
        }));
        setImportData('');
        setImportError('');
        setImportModalOpen(false);
    };

    // Check if can send SMS
    const canSendSMS = useCallback(() => {
        const hasSelectedUsersWithPhone = individualFormData.selected_users.some(
            user => user.user.phone
        );
        return hasSelectedUsersWithPhone || individualFormData.custom_phone;
    }, [individualFormData.selected_users, individualFormData.custom_phone]);

    // Check if can send Email
    const canSendEmail = useCallback(() => {
        const hasSelectedUsersWithEmail = individualFormData.selected_users.some(
            user => user.user.email
        );
        return hasSelectedUsersWithEmail || individualFormData.custom_email;
    }, [individualFormData.selected_users, individualFormData.custom_email]);

    // Get recipient info for summary
    const getRecipientInfo = useCallback(() => {
        const selectedUsersWithPhone = individualFormData.selected_users.filter(
            user => user.user.phone
        ).length;
        const selectedUsersWithEmail = individualFormData.selected_users.filter(
            user => user.user.email
        ).length;

        return {
            total: individualFormData.selected_users.length,
            withPhone: selectedUsersWithPhone,
            withEmail: selectedUsersWithEmail,
            customPhone: individualFormData.custom_phone,
            customEmail: individualFormData.custom_email
        };
    }, [individualFormData.selected_users, individualFormData.custom_phone, individualFormData.custom_email]);

    const recipientInfo = getRecipientInfo();

    // User Selection Component with React Select
    const UserSelectionSection = useCallback(() => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users
                </label>
                <Select
                    isMulti
                    options={userOptions}
                    value={individualFormData.selected_users}
                    onChange={(selectedOptions) => setIndividualFormData(prev => ({
                        ...prev,
                        selected_users: selectedOptions || []
                    }))}
                    components={{
                        Option: UserOption,
                        MultiValue: UserValue,
                        ...animatedComponents
                    }}
                    styles={customSelectStyles}
                    placeholder="Search and select users..."
                    noOptionsMessage={() => "No users found"}
                    isSearchable
                    isClearable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                />
            </div>

            {/* Selected Users Summary */}
            {individualFormData.selected_users.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Selected Users Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-green-600 font-medium">Total:</span>
                            <span className="ml-1">{recipientInfo.total}</span>
                        </div>
                        <div>
                            <span className="text-green-600 font-medium">With Phone:</span>
                            <span className="ml-1">{recipientInfo.withPhone}</span>
                        </div>
                        <div>
                            <span className="text-green-600 font-medium">With Email:</span>
                            <span className="ml-1">{recipientInfo.withEmail}</span>
                        </div>
                        <div>
                            <span className="text-green-600 font-medium">Can SMS:</span>
                            <span className="ml-1">{recipientInfo.withPhone > 0 ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ), [userOptions, individualFormData.selected_users, UserOption, UserValue, customSelectStyles, animatedComponents, recipientInfo]);

    return (
        <Layout>
            <Head title="Communications" />

            <div className="w-full">
                {/* Mobile Filters Toggle */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {mobileFiltersOpen ? (
                            <>
                                <X className="w-5 h-5 mr-2" /> Close Filters
                            </>
                        ) : (
                            <>
                                <Filter className="w-5 h-5 mr-2" /> Open Filters
                            </>
                        )}
                    </button>
                </div>

                {/* Top Section - Responsive */}
                <div className={`
                    ${mobileFiltersOpen ? 'block' : 'hidden'}
                    lg:block bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4
                `}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900 w-full sm:w-auto my-auto">
                            Communications
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <input
                                    type="text"
                                    placeholder="Search communications..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {loading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>

                            {/* Individual Send Button - Only for Hosts */}
                            {auth.user.role_id === 2 && (
                                <button
                                    onClick={() => setShowIndividualModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    Send to Individual
                                </button>
                            )}

                            <button
                                onClick={() => setShowTemplateModal(true)}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                New Template
                            </button>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
                        <strong className="font-semibold">Success: </strong>
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
                        <strong className="font-semibold">Error: </strong>
                        {flash.error}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['templates', 'campaigns', 'analytics', 'individual'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                        activeTab === tab
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab === 'individual' ? 'Individual Messages' : tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Templates Tab */}
                {activeTab === 'templates' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Communication Templates</h2>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {templates && templates.length > 0 ? (
                                templates.map((template) => (
                                    <div key={template.id} className="px-6 py-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">
                                                    {template.type} • {template.target_audience}
                                                    {template.target_audience === 'custom' && template.custom_recipients && (
                                                        <span className="ml-2 text-blue-600">
                                                            ({template.custom_recipients.length} custom recipients)
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                    {template.sms_content && (
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-4 h-4" />
                                                            SMS
                                                        </span>
                                                    )}
                                                    {template.email_content && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-4 h-4" />
                                                            Email
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                    {template.sms_content || template.email_content}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditTemplate(template)}
                                                    className="text-gray-400 hover:text-gray-500 p-2 rounded-lg hover:bg-gray-100"
                                                    title="Edit Template"
                                                >
                                                    <Edit className="h-8" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTemplate(template);
                                                        setBulkFormData({
                                                            send_sms: !!template.sms_content,
                                                            send_email: !!template.email_content
                                                        });
                                                        setShowBulkModal(true);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-500 p-2 rounded-lg hover:bg-gray-100"
                                                    title="Send Bulk Communication"
                                                >
                                                    <Send className="h-8" />
                                                </button>
                                                {/* Individual Send for Hosts */}
                                                {auth.user.role_id === 2 && (
                                                    <button
                                                        onClick={() => {
                                                            loadTemplateForIndividual(template);
                                                            setShowIndividualModal(true);
                                                        }}
                                                        className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                                                        title="Send to Individual"
                                                    >
                                                        <User className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No templates found. Create your first template to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Bulk Communications</h2>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {campaigns && campaigns.data && campaigns.data.length > 0 ? (
                                campaigns.data.map((campaign) => (
                                    <div key={campaign.id} className="px-6 py-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {campaign.template?.name || 'Untitled Campaign'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Target: {campaign.target_audience} •
                                                    Status: <span className={`capitalize ${
                                                        campaign.status === 'completed' ? 'text-green-600' :
                                                        campaign.status === 'failed' ? 'text-red-600' :
                                                        campaign.status === 'sending' ? 'text-blue-600' :
                                                        'text-yellow-600'
                                                    }`}>{campaign.status}</span>
                                                </p>
                                                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                                    {campaign.send_sms && (
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-4 h-4" />
                                                            SMS
                                                        </span>
                                                    )}
                                                    {campaign.send_email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-4 h-4" />
                                                            Email
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Recipients: {campaign.total_recipients} •
                                                    SMS: {campaign.sms_sent}/{campaign.sms_failed} •
                                                    Email: {campaign.emails_sent}/{campaign.emails_failed}
                                                </p>
                                                {campaign.sent_at && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Sent: {new Date(campaign.sent_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('communications.bulk.logs', { bulkCommunication: campaign.id })}
                                                    className="text-gray-400 hover:text-gray-500 p-2 rounded-lg hover:bg-gray-100"
                                                    title="View Logs"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {campaign.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleBulkSend(campaign.id)}
                                                        className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                                                        title="Send Campaign"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No campaigns found. Create your first campaign to start sending communications.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination for Campaigns */}
                        {campaigns && pagination && pagination.total > pagination.per_page && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-700">
                                        Showing {campaigns.data.length} of {pagination.total} campaigns
                                    </p>
                                    <div className="flex gap-2">
                                        {pagination.prev_page_url && (
                                            <Link
                                                href={pagination.prev_page_url}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {pagination.next_page_url && (
                                            <Link
                                                href={pagination.next_page_url}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Individual Messages Tab */}
                {activeTab === 'individual' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Individual Messages</h2>
                            {auth.user.role_id === 2 && (
                                <button
                                    onClick={() => setShowIndividualModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    New Individual Message
                                </button>
                            )}
                        </div>

                        <div className="px-6 py-8 text-center">
                            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-4">View individual message logs and history</p>
                            <Link
                                href={route('communications.individual.logs')}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Individual Logs
                            </Link>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Communication Analytics</h2>
                        </div>
                        <div className="px-6 py-8 text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-4">View detailed analytics and performance metrics</p>
                            <Link
                                href={route('communications.analytics')}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Open Analytics Dashboard
                            </Link>
                        </div>
                    </div>
                )}

                {/* Template Modal */}
                {showTemplateModal && (
                    <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z1500">
                        <div className="relative top-[100px] mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowTemplateModal(false);
                                            setSelectedTemplate(null);
                                            setFormData({
                                                name: '',
                                                subject: '',
                                                sms_content: '',
                                                email_content: '',
                                                type: 'custom',
                                                target_audience: 'guests',
                                                is_active: true,
                                                custom_recipients: []
                                            });
                                            setNewCustomRecipient({ name: '', email: '', phone: '' });
                                        }}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleTemplateSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                required
                                                placeholder="Enter template name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                <option value="custom">Custom</option>
                                                <option value="booking_confirmation">Booking Confirmation</option>
                                                <option value="payment_reminder">Payment Reminder</option>
                                                <option value="checkin_reminder">Check-in Reminder</option>
                                                <option value="checkout_reminder">Check-out Reminder</option>
                                                <option value="promotional">Promotional</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                                        <select
                                            value={formData.target_audience}
                                            onChange={(e) => setFormData(prev => ({...prev, target_audience: e.target.value}))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="guests">Guests Only</option>
                                            <option value="hosts">Hosts Only</option>
                                            <option value="both">Both Guests & Hosts</option>
                                            <option value="custom">Custom Recipients</option>
                                        </select>
                                    </div>

                                    {/* Custom Recipients Section - Only show when target audience is custom */}
                                    {formData.target_audience === 'custom' && (
                                        <CustomRecipientsSection
                                            customRecipients={formData.custom_recipients}
                                            newRecipient={newCustomRecipient}
                                            onNewRecipientChange={handleNewRecipientChange}
                                            onAddRecipient={addCustomRecipient}
                                            onRemoveRecipient={removeCustomRecipient}
                                            onImportCSV={() => setImportModalOpen(true)}
                                        />
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">SMS Content</label>
                                        <div className="mt-1">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                <span className="text-xs text-gray-500 mr-2">Available variables:</span>
                                                {availableVariables && availableVariables.map((variable) => (
                                                    <button
                                                        key={variable}
                                                        type="button"
                                                        onClick={() => insertVariable(variable, 'sms_content')}
                                                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border"
                                                    >
                                                        {variable}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={formData.sms_content || ''}
                                                onChange={(e) => setFormData(prev => ({...prev, sms_content: e.target.value}))}
                                                rows="3"
                                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Enter SMS message content (optional)..."
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Character count: {(formData.sms_content || '').length}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Content</label>
                                        <div className="mt-1">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                <span className="text-xs text-gray-500 mr-2">Available variables:</span>
                                                {availableVariables && availableVariables.map((variable) => (
                                                    <button
                                                        key={variable}
                                                        type="button"
                                                        onClick={() => insertVariable(variable, 'email_content')}
                                                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border"
                                                    >
                                                        {variable}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={formData.email_content || ''}
                                                onChange={(e) => setFormData(prev => ({...prev, email_content: e.target.value}))}
                                                rows="5"
                                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Enter email content (HTML supported, optional)..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                            Template is active
                                        </label>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowTemplateModal(false);
                                                setSelectedTemplate(null);
                                                setFormData({
                                                    name: '',
                                                    subject: '',
                                                    sms_content: '',
                                                    email_content: '',
                                                    type: 'custom',
                                                    target_audience: 'guests',
                                                    is_active: true,
                                                    custom_recipients: []
                                                });
                                                setNewCustomRecipient({ name: '', email: '', phone: '' });
                                            }}
                                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {selectedTemplate ? 'Update Template' : 'Create Template'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Individual Send Modal */}
                {showIndividualModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z1500">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Send Individual Communication
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowIndividualModal(false);
                                            setIndividualFormData({
                                                template_id: '',
                                                email_subject: '',
                                                sms_content: '',
                                                email_content: '',
                                                selected_users: [],
                                                custom_phone: '',
                                                custom_email: '',
                                                custom_name: '',
                                                send_sms: false,
                                                send_email: false
                                            });
                                        }}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleIndividualSend} className="space-y-6">
                                    {/* Template Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Use Template (Optional)</label>
                                        <select
                                            value={individualFormData.template_id}
                                            onChange={(e) => {
                                                const template = templates.find(t => t.id == e.target.value);
                                                if (template) {
                                                    loadTemplateForIndividual(template);
                                                } else {
                                                    // Clear template data if "Select a template..." is chosen
                                                    setIndividualFormData(prev => ({
                                                        ...prev,
                                                        template_id: '',
                                                        email_subject: '',
                                                        sms_content: '',
                                                        email_content: '',
                                                        send_sms: false,
                                                        send_email: false
                                                    }));
                                                }
                                            }}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="">Select a template...</option>
                                            {templates && templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* User Selection with React Select */}
                                    <UserSelectionSection />

                                    {/* Custom Recipient Option */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Or Send to Custom Recipient</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Name</label>
                                                <input
                                                    type="text"
                                                    value={individualFormData.custom_name}
                                                    onChange={(e) => setIndividualFormData(prev => ({
                                                        ...prev,
                                                        custom_name: e.target.value
                                                    }))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                    placeholder="Recipient name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualFormData.custom_phone}
                                                    onChange={(e) => setIndividualFormData(prev => ({
                                                        ...prev,
                                                        custom_phone: e.target.value
                                                    }))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                    placeholder="Phone for SMS"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 flex items-center gap-1">
                                                    <AtSign className="w-3 h-3" />
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={individualFormData.custom_email}
                                                    onChange={(e) => setIndividualFormData(prev => ({
                                                        ...prev,
                                                        custom_email: e.target.value
                                                    }))}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                    placeholder="Email for email"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Communication Method Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Communication Methods
                                        </label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={individualFormData.send_sms}
                                                    onChange={(e) => setIndividualFormData(prev => ({
                                                        ...prev,
                                                        send_sms: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    disabled={!canSendSMS()}
                                                />
                                                <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Send SMS
                                                    {!canSendSMS() && (
                                                        <span className="text-xs text-red-500">(No phone numbers available)</span>
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={individualFormData.send_email}
                                                    onChange={(e) => setIndividualFormData(prev => ({
                                                        ...prev,
                                                        send_email: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    disabled={!canSendEmail()}
                                                />
                                                <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    Send Email
                                                    {!canSendEmail() && (
                                                        <span className="text-xs text-red-500">(No email addresses available)</span>
                                                    )}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Recipient Summary */}
                                        {(individualFormData.selected_users.length > 0 || individualFormData.custom_phone || individualFormData.custom_email) && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <h4 className="text-sm font-medium text-blue-800 mb-2">Recipient Summary</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-blue-600 font-medium">Total:</span>
                                                        <span className="ml-1">{recipientInfo.total + (individualFormData.custom_phone || individualFormData.custom_email ? 1 : 0)}</span>
                                                    </div>
                                                    {individualFormData.send_sms && (
                                                        <div>
                                                            <span className="text-blue-600 font-medium">SMS Capable:</span>
                                                            <span className="ml-1">{recipientInfo.withPhone + (individualFormData.custom_phone ? 1 : 0)}</span>
                                                        </div>
                                                    )}
                                                    {individualFormData.send_email && (
                                                        <div>
                                                            <span className="text-blue-600 font-medium">Email Capable:</span>
                                                            <span className="ml-1">{recipientInfo.withEmail + (individualFormData.custom_email ? 1 : 0)}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-blue-600 font-medium">Custom:</span>
                                                        <span className="ml-1">{(individualFormData.custom_phone || individualFormData.custom_email) ? 'Yes' : 'No'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Subject */}
                                    {individualFormData.send_email && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email Subject</label>
                                            <input
                                                type="text"
                                                value={individualFormData.email_subject}
                                                onChange={(e) => setIndividualFormData(prev => ({
                                                    ...prev,
                                                    email_subject: e.target.value
                                                }))}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Enter email subject..."
                                                required={individualFormData.send_email}
                                            />
                                        </div>
                                    )}

                                    {/* Message Content */}
                                    {individualFormData.send_sms && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">SMS Content</label>
                                            <div className="mt-1">
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    <span className="text-xs text-gray-500 mr-2">Available variables:</span>
                                                    {availableVariables && availableVariables.map((variable) => (
                                                        <button
                                                            key={variable}
                                                            type="button"
                                                            onClick={() => insertIndividualVariable(variable, 'sms_content')}
                                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border"
                                                        >
                                                            {variable}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={individualFormData.sms_content || ''}
                                                    onChange={(e) => setIndividualFormData(prev => ({
                                                        ...prev,
                                                        sms_content: e.target.value
                                                    }))}
                                                    rows="3"
                                                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="Enter SMS message content..."
                                                    required={individualFormData.send_sms}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Character count: {(individualFormData.sms_content || '').length}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {individualFormData.send_email && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email Content</label>
                                            <div className="mt-1">
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    <span className="text-xs text-gray-500 mr-2">Available variables:</span>
                                                    {availableVariables && availableVariables.map((variable) => (
                                                        <button
                                                            key={variable}
                                                            type="button"
                                                            onClick={() => insertIndividualVariable(variable, 'email_content')}
                                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border"
                                                        >
                                                            {variable}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={individualFormData.email_content || ''}
                                                    onChange={(e) => setIndividualFormData(prev => ({
                                                        ...prev,
                                                        email_content: e.target.value
                                                    }))}
                                                    rows="5"
                                                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="Enter email content (HTML supported)..."
                                                    required={individualFormData.send_email}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowIndividualModal(false);
                                                setIndividualFormData({
                                                    template_id: '',
                                                    email_subject: '',
                                                    sms_content: '',
                                                    email_content: '',
                                                    selected_users: [],
                                                    custom_phone: '',
                                                    custom_email: '',
                                                    custom_name: '',
                                                    send_sms: false,
                                                    send_email: false
                                                });
                                            }}
                                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                (!individualFormData.send_sms && !individualFormData.send_email) ||
                                                (individualFormData.selected_users.length === 0 && !individualFormData.custom_phone && !individualFormData.custom_email) ||
                                                (individualFormData.send_sms && !individualFormData.sms_content.trim()) ||
                                                (individualFormData.send_email && (!individualFormData.email_content.trim() || !individualFormData.email_subject.trim()))
                                            }
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Send Communication
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Send Modal */}
                {showBulkModal && (
                    <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z1500">
                        <div className="relative top-[100px] mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Send Bulk Communication
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowBulkModal(false);
                                            setSelectedTemplate(null);
                                            setBulkFormData({
                                                send_sms: false,
                                                send_email: false
                                            });
                                        }}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {selectedTemplate && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900">Using Template: {selectedTemplate.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{selectedTemplate.sms_content}</p>
                                        </div>
                                    )}

                                    {/* Communication Method Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Communication Methods
                                        </label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={bulkFormData.send_sms}
                                                    onChange={(e) => setBulkFormData(prev => ({
                                                        ...prev,
                                                        send_sms: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    disabled={!selectedTemplate?.sms_content}
                                                />
                                                <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Send SMS
                                                    {!selectedTemplate?.sms_content && (
                                                        <span className="text-xs text-red-500">(No SMS content in template)</span>
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={bulkFormData.send_email}
                                                    onChange={(e) => setBulkFormData(prev => ({
                                                        ...prev,
                                                        send_email: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    disabled={!selectedTemplate?.email_content}
                                                />
                                                <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    Send Email
                                                    {!selectedTemplate?.email_content && (
                                                        <span className="text-xs text-red-500">(No email content in template)</span>
                                                    )}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Bulk Communication
                                                </h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>
                                                        This will send the communication to all users matching the template's target audience.
                                                        Please review the template settings before proceeding.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                                            <p className="mt-1 text-sm text-gray-900 capitalize">
                                                {selectedTemplate?.target_audience || 'guests'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Communication Type</label>
                                            <p className="mt-1 text-sm text-gray-900 capitalize">
                                                {selectedTemplate?.type || 'custom'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                                        <div className="space-y-3">
                                            {selectedTemplate?.sms_content && (
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4" />
                                                        SMS Content
                                                    </label>
                                                    <p className="text-sm text-gray-900">{selectedTemplate.sms_content}</p>
                                                </div>
                                            )}
                                            {selectedTemplate?.email_content && (
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        Email Content
                                                    </label>
                                                    <p className="text-sm text-gray-900">{selectedTemplate.email_content}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowBulkModal(false);
                                                setSelectedTemplate(null);
                                                setBulkFormData({
                                                    send_sms: false,
                                                    send_email: false
                                                });
                                            }}
                                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBulkCreate}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                                        >
                                            Create Bulk Campaign
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CSV Import Modal */}
                {importModalOpen && (
                    <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z1500">
                        <div className="relative top-[100px] mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Import Custom Recipients from CSV
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setImportModalOpen(false);
                                            setImportData('');
                                            setImportError('');
                                        }}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Paste CSV Data
                                        </label>
                                        <textarea
                                            value={importData}
                                            onChange={(e) => setImportData(e.target.value)}
                                            rows="10"
                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                                            placeholder="Name, Email, Phone&#10;John Doe, john@example.com, 1234567890&#10;Jane Smith, jane@example.com, 0987654321&#10;..."
                                        />
                                        {importError && (
                                            <p className="text-red-600 text-sm mt-2">{importError}</p>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <CsvIcon className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-blue-800">
                                                    CSV Format
                                                </h3>
                                                <div className="mt-1 text-sm text-blue-700">
                                                    <p>Format: <code className="bg-blue-100 px-1 rounded">Name, Email, Phone</code></p>
                                                    <p className="mt-1">Each line should contain: name, email (optional), phone (optional)</p>
                                                    <p className="mt-1">At least one of email or phone is required for each recipient.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImportModalOpen(false);
                                                setImportData('');
                                                setImportError('');
                                            }}
                                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleImportCSV}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Import Recipients
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CommunicationsIndex;
