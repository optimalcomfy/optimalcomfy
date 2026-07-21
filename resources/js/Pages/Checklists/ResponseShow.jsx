import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { ArrowLeft, CheckCircle, Clock, User, Calendar, ClipboardCheck } from 'lucide-react';

const ResponseShow = () => {
    const { response } = usePage().props;

    const getBookingInfo = () => {
        if (!response.checklistable) return null;
        
        if (response.checklistable_type.includes('Booking')) {
            return {
                type: 'Property Booking',
                name: response.checklistable?.property?.property_name || 'Property',
                number: response.checklistable?.number,
                link: route('bookings.show', response.checklistable.id)
            };
        } else if (response.checklistable_type.includes('CarBooking')) {
            return {
                type: 'Car Booking',
                name: response.checklistable?.car?.name || 'Car',
                number: response.checklistable?.number,
                link: route('car-bookings.show', response.checklistable.id)
            };
        }
        return null;
    };

    const bookingInfo = getBookingInfo();
    const itemsByCategory = response.template?.items?.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    const getResponseItem = (itemId) => {
        return response.responseItems?.find(ri => ri.checklist_item_id === itemId);
    };

    const totalItems = response.responseItems?.length || 0;
    const checkedItems = response.responseItems?.filter(ri => ri.is_checked).length || 0;
    const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    return (
        <Layout>
            <div className="w-full">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link
                                href={route('checklist-responses.index')}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                            >
                                <ArrowLeft className="h-4 mr-1" />
                                Back to Responses
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Checklist Response Details</h1>
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700">Template</p>
                                    <p className="mt-2 text-lg font-semibold text-gray-900">{response.template?.name}</p>
                                </div>
                                
                                {bookingInfo && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700">Booking</p>
                                        <p className="mt-2 text-lg font-semibold text-gray-900">{bookingInfo.type}</p>
                                        <p className="text-sm text-gray-600">#{bookingInfo.number}</p>
                                        {bookingInfo.link && (
                                            <Link href={bookingInfo.link} className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block">
                                                View Booking →
                                            </Link>
                                        )}
                                    </div>
                                )}
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700">Status</p>
                                    <div className="mt-2">
                                        {response.status === 'completed' ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-4 mr-1" />
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                <Clock className="h-4 mr-1" />
                                                {response.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress and Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Progress</p>
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-900 mt-2">{progress}% ({checkedItems}/{totalItems})</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Completed By</p>
                            <div className="mt-2 flex items-center">
                                <User className="h-5 text-gray-400 mr-2" />
                                <p className="text-sm text-gray-900">{response.completedBy?.name || 'Not completed'}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Completion Time</p>
                            <div className="mt-2 flex items-center">
                                <Calendar className="h-5 text-gray-400 mr-2" />
                                <p className="text-sm text-gray-900">
                                    {response.completed_at 
                                        ? new Date(response.completed_at).toLocaleString() 
                                        : 'Not completed'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Created</p>
                            <div className="mt-2">
                                <p className="text-sm text-gray-900">
                                    {new Date(response.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-6">
                    {Object.entries(itemsByCategory || {}).map(([category, items]) => (
                        <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => {
                                    const responseItem = getResponseItem(item.id);
                                    const isChecked = responseItem?.is_checked || false;
                                    
                                    return (
                                        <div key={item.id} className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 pt-1">
                                                    <div className={`flex items-center justify-center h-6 rounded-md border ${
                                                        isChecked
                                                            ? 'bg-green-100 border-green-500 text-green-500'
                                                            : 'bg-gray-100 border-gray-300 text-gray-400'
                                                    }`}>
                                                        {isChecked ? '✓' : '○'}
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h4 className={`text-sm font-medium ${
                                                                isChecked ? 'text-gray-500 line-through' : 'text-gray-900'
                                                            }`}>
                                                                {item.item_name}
                                                            </h4>
                                                            {item.description && (
                                                                <p className={`mt-1 text-sm ${
                                                                    isChecked ? 'text-gray-400' : 'text-gray-600'
                                                                }`}>
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {item.is_required && (
                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Notes */}
                                                    {responseItem?.notes && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                                                            <p className="text-sm font-medium text-blue-800 mb-1">Notes:</p>
                                                            <p className="text-sm text-blue-700">{responseItem.notes}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Checked Info */}
                                                    {isChecked && responseItem?.checked_at && (
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            Checked on {new Date(responseItem.checked_at).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Notes Section */}
                {response.notes && (
                    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                        <div className="p-4 bg-gray-50 rounded-md">
                            <p className="text-gray-700">{response.notes}</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ResponseShow;