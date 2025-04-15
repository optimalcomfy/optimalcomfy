import React, { useState } from 'react';
import { useForm, usePage, Head, Link } from '@inertiajs/react';
import Select from 'react-select';
import { CheckCircle, Upload, X } from 'lucide-react';

const SelectCompany = () => {
    const { companies, user } = usePage().props; 

    const companyOptions = companies.map(company => ({
        value: company.id,
        label: company.name
    }));

    const { data, setData, post, errors } = useForm({
      passport_number: '',
      id_number: '',
      id_front: null,
      id_back: null,
      passport_front: null,
      passport_back: null,
      user_id: user.id,
      company_id: ''
    });

    const [previews, setPreviews] = useState({
      id_front: null,
      id_back: null,
      passport_front: null,
      passport_back: null
    });

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setData(field, file);
            setPreviews(prev => ({
                ...prev,
                [field]: previewUrl
            }));
        }
    };

    const removePreview = (field) => {
        if (previews[field]) {
            URL.revokeObjectURL(previews[field]);
        }

        setData(field, null);
        setPreviews(prev => ({
            ...prev,
            [field]: null
        }));
    };

    const handleCompanyChange = (selectedOption) => {
        setData('company_id', selectedOption ? selectedOption.value : ''); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (data[key] != null) {
                formData.append(key, data[key]);
            }
        });

        post(route('employees.store'), {
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    const FileUploadPreview = ({ field, label }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center space-x-4">
                {!previews[field] && (
                    <>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field)}
                        className="hidden" 
                        id={`${field}-upload`}
                    />
                    <label 
                        htmlFor={`${field}-upload`} 
                        className="cursor-pointer flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        <Upload className="mr-2 h-5 w-5" />
                        Upload
                    </label>
                    </>
                )}
                {previews[field] && (
                    <div className="relative">
                        <img 
                            src={previews[field]} 
                            alt="Preview" 
                            className="h-16 w-16 object-cover rounded-md"
                        />
                        <button 
                            onClick={() => removePreview(field)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
            {errors[field] && <div className="text-xs text-red-500 mt-1">{errors[field]}</div>}
        </div>
    );

    return (
        <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
            <Head title="KYC submission" />
            
            <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                
                <div className="relative bg-white shadow-lg sm:rounded-3xl p-6">
                    <div className="flex justify-end mb-4">
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button" 
                            className="text-sm bg-black text-white rounded-md hover:text-red-500 transition-colors"
                        >
                            Logout
                        </Link>
                    </div>

                    <ol className="flex flex-col sm:flex-row justify-between text-sm font-medium text-gray-500 mb-6">
                        {[
                            { step: 1, label: 'Account setup', active: true },
                            { step: 2, label: 'KYC submission', active: true },
                            { step: 3, label: 'Verification & Approval', active: false }
                        ].map(({ step, label, active }) => (
                            <li 
                                key={step} 
                                className={`flex items-center space-x-2 ${active ? 'text-blue-600' : ''}`}
                            >
                                {active && <CheckCircle className="w-6 h-6" />}
                                <span>{step}. {label}</span>
                            </li>
                        ))}
                    </ol>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                            <Select
                                options={companyOptions}
                                value={companyOptions.find(option => option.value === data.company_id)}
                                onChange={handleCompanyChange}
                                className="basic-single"
                                classNamePrefix="select"
                                placeholder="Select a company"
                            />
                            {errors.company_id && <div className="text-sm text-red-500 mt-1">{errors.company_id}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID number</label>
                            <input
                                type="text"
                                value={data.id_number}
                                onChange={(e) => setData('id_number', e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.id_number && <div className="text-sm text-red-500 mt-1">{errors.id_number}</div>}
                        </div>


                        <div className="grid md:grid-cols-2 gap-4">
                            <FileUploadPreview field="id_front" label="ID Front Side" />
                            <FileUploadPreview field="id_back" label="ID Back Side" />
                            <FileUploadPreview field="passport_front" label="Passport photo" />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SelectCompany;