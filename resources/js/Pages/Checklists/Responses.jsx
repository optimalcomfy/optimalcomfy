import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Search, Filter, Eye, CheckCircle, Clock, XCircle, Calendar, User } from 'lucide-react';

const Responses = () => {
    const { responses, filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('checklist-responses.index'), {
            search,
            status,
            type
        }, {
            preserveState: true
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setType('');
        router.get(route('checklist-responses.index'), {}, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                </span>;
            case 'in_progress':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    In Progress
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Pending
                </span>;
        }
    };

    const getTypeBadge = (type) => {
        switch(type) {
            case 'property':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Property</span>;
            case 'car':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Car</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">General</span>;
        }
    };

    const getBookingInfo = (response) => {
        if (!response.checklistable) return null;
        
        if (response.checklistable_type.includes('Booking')) {
            return {
                type: 'Property',
                name: response.checklistable?.property?.property_name || 'Property Booking',
                number: response.checklistable?.number || 'N/A'
            };
        } else if (response.checklistable_type.includes('CarBooking')) {
            return {
                type: 'Car',
                name: response.checklistable?.car?.name || 'Car Booking',
                number: response.checklistable?.number || 'N/A'
            };
        }
        return null;
    };

    return (
        <Layout>
            <div className="w-full">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Checklist Responses</h1>
                    </div>

                    {/* Filters */}
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search responses..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="property">Property</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <div className="flex items-end space-x-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <Search className="h-4 inline mr-1" />
                                    Search
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Responses List */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {responses.data.map((response) => {
                                const bookingInfo = getBookingInfo(response);
                                const progress = response.progress_percentage || 0;
                                
                                return (
                                    <tr key={response.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{response.template?.name}</div>
                                            <div className="text-sm text-gray-500">{getTypeBadge(response.template?.type)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {bookingInfo ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{bookingInfo.type}: {bookingInfo.name}</div>
                                                    <div className="text-sm text-gray-500">#{bookingInfo.number}</div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Not linked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div 
                                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-900">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(response.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {response.completed_by ? (
                                                <div className="flex items-center">
                                                    <User className="h-4 mr-2 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{response.completedBy?.name || 'User'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Not completed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={route('checklist-responses.show', response.id)}
                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                            >
                                                <Eye className="h-4 mr-1" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {responses.links && responses.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            {responses.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        link.active
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    </div>
                )}

                {/* Empty State */}
                {responses.data.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No checklist responses</h3>
                        <p className="text-gray-500 mb-6">No checklist responses have been created yet.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Responses;