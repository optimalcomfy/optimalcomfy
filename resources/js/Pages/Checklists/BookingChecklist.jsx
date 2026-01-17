import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { 
    CheckCircle, Circle, CheckSquare, Square, 
    ArrowLeft, Save, Check, ClipboardCheck,
    MessageSquare, Camera, Upload, AlertCircle,
    FilePlus, ClipboardX, Loader2
} from 'lucide-react';

const BookingChecklist = () => {
    const { booking, checklist, type, error, auth, success } = usePage().props;
    
    // Show success message if available
    useEffect(() => {
        if (success) {
            console.log('Success message:', success);
            // You could show a toast notification here instead of alert
            // alert(success);
        }
    }, [success]);

    // Handle the case when checklist is null/missing
    if (!checklist || error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <ClipboardX className="h-16 w-16 text-gray-400" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                No Checklist Available
                            </h2>
                            
                            <p className="text-gray-600 mb-6">
                                {error || 'No checklist has been assigned to this booking yet.'}
                            </p>
                            
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                    Booking ID: <span className="font-medium">{booking.id}</span> • 
                                    Type: <span className="font-medium">{type === 'property' ? 'Property' : 'Car'}</span>
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                    <Link
                                        href={type === 'property' 
                                            ? route('bookings.show', booking.id) 
                                            : route('car-bookings.show', booking.id)}
                                        className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
                                    >
                                        <ArrowLeft className="h-5 mr-2" />
                                        Back to Booking
                                    </Link>
                                    
                                    {/* Only show to admins */}
                                    {auth?.user?.role_id === 1 && (
                                        <Link
                                            href={route('checklists.index', { type })}
                                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                                        >
                                            <FilePlus className="h-5 mr-2" />
                                            Manage Checklists
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Initialize state
    const [notes, setNotes] = useState({});
    const [loadingItems, setLoadingItems] = useState({});
    const [showNotes, setShowNotes] = useState({});

    // Get response items array
    const responseItems = checklist.response_items || [];

    // Create a lookup map for response items
    const responseItemMap = React.useMemo(() => {
        const map = {};
        
        if (Array.isArray(responseItems)) {
            responseItems.forEach(item => {
                if (item && item.checklist_item_id) {
                    // Convert to string key to avoid type issues
                    const key = String(item.checklist_item_id);
                    map[key] = item;
                }
            });
        }
        
        return map;
    }, [responseItems]);

    // Function to get response item by template item ID
    const getResponseItem = (templateItemId) => {
        // Convert to string for consistent lookup
        const key = String(templateItemId);
        return responseItemMap[key];
    };

    const handleCheckItem = async (templateItemId, isChecked) => {
        console.log('handleCheckItem called:', { templateItemId, isChecked });
        
        setLoadingItems(prev => ({ ...prev, [templateItemId]: true }));

        const responseItem = getResponseItem(templateItemId);
        
        console.log('Found response item:', responseItem);

        if (!responseItem || !responseItem.id) {
            console.error('Response item not found for template item ID:', templateItemId);
            alert(`Error: Could not find response item for template item ID: ${templateItemId}. This should not happen. Please contact support.`);
            setLoadingItems(prev => ({ ...prev, [templateItemId]: false }));
            return;
        }

        try {
            await router.post(route('checklist.update-item', checklist.id), {
                response_item_id: responseItem.id,
                is_checked: isChecked,
                notes: notes[templateItemId] || ''
            }, {
                preserveState: true, // Keep current state
                preserveScroll: true, // Maintain scroll position
                onSuccess: (page) => {
                    console.log('Success - page updated');
                    setLoadingItems(prev => ({ ...prev, [templateItemId]: false }));
                    
                    // Clear the notes for this item since they've been saved
                    if (notes[templateItemId]) {
                        setNotes(prev => {
                            const newNotes = { ...prev };
                            delete newNotes[templateItemId];
                            return newNotes;
                        });
                    }
                    
                    // If notes were being edited, close the notes section
                    if (showNotes[templateItemId]) {
                        setShowNotes(prev => ({ ...prev, [templateItemId]: false }));
                    }
                },
                onError: (errors) => {
                    console.error('Error updating item:', errors);
                    alert('Failed to update checklist item. Please try again.');
                    setLoadingItems(prev => ({ ...prev, [templateItemId]: false }));
                }
            });
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. Please check your connection and try again.');
            setLoadingItems(prev => ({ ...prev, [templateItemId]: false }));
        }
    };

    const handleCompleteChecklist = async () => {
        if (confirm('Mark this checklist as completed?')) {
            await router.post(route('checklist.complete', checklist.id), {}, {
                preserveState: false,
                onSuccess: () => {
                    alert('Checklist marked as completed!');
                },
                onError: () => {
                    alert('Failed to complete checklist. Please try again.');
                }
            });
        }
    };

    const getBookingDetails = () => {
        if (type === 'property') {
            return {
                title: booking.property?.property_name || 'Property',
                number: booking.number,
                checkIn: booking.check_in_date,
                checkOut: booking.check_out_date,
                backLink: route('bookings.show', booking.id)
            };
        } else {
            return {
                title: booking.car?.name || 'Car',
                number: booking.number,
                checkIn: booking.start_date,
                checkOut: booking.end_date,
                backLink: route('car-bookings.show', booking.id)
            };
        }
    };

    // Group items by category - FIXED: We need to use the checklist template items
    // Your data shows checklist.template doesn't exist, so we need to get items from response items
    const itemsByCategory = React.useMemo(() => {
        // Get unique items from response items
        const uniqueItems = [];
        const seenIds = new Set();
        
        responseItems.forEach(responseItem => {
            if (responseItem.item && !seenIds.has(responseItem.item.id)) {
                seenIds.add(responseItem.item.id);
                uniqueItems.push(responseItem.item);
            }
        });
        
        // Group by category
        return uniqueItems.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    }, [responseItems]);

    const bookingDetails = getBookingDetails();
    
    // Calculate progress
    const allChecked = responseItems.every(ri => ri.is_checked);
    const requiredChecked = responseItems.filter(ri => {
        const item = ri.item; // Use the item from responseItem
        return item?.is_required && ri.is_checked;
    }).length;
    
    const totalRequired = responseItems.filter(ri => ri.item?.is_required).length;

    return (
        <Layout>
            <div className="w-full">
                {/* Success Message Banner */}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <p className="text-green-800 font-medium">{success}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link
                                href={bookingDetails.backLink}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                            >
                                <ArrowLeft className="h-4 mr-1" />
                                Back to Booking
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {type === 'property' ? 'Property' : 'Car'} Setup Checklist
                            </h1>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                    Booking: <span className="font-medium">{bookingDetails.number}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    {type === 'property' ? 'Property' : 'Car'}:{' '}
                                    <span className="font-medium">{bookingDetails.title}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Period: {new Date(bookingDetails.checkIn).toLocaleDateString()} -{' '}
                                    {new Date(bookingDetails.checkOut).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <div className="mb-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    checklist?.status === 'completed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {checklist?.status === 'completed' ? (
                                        <>
                                            <CheckCircle className="h-4 mr-1" />
                                            Completed
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardCheck className="h-4 mr-1" />
                                            In Progress
                                        </>
                                    )}
                                </span>
                            </div>
                            {checklist?.status !== 'completed' && (
                                <button
                                    onClick={handleCompleteChecklist}
                                    disabled={!allChecked}
                                    className={`px-4 py-2 rounded-lg flex items-center ${
                                        allChecked
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <Check className="h-4 mr-2" />
                                    Complete Checklist
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Overall Progress</p>
                            <div className="mt-2 flex items-center">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${(responseItems.filter(ri => ri.is_checked).length / (responseItems.length || 1)) * 100}%` 
                                        }}
                                    />
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-900">
                                    {responseItems.filter(ri => ri.is_checked).length} / {responseItems.length}
                                </span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Required Items</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {requiredChecked} / {totalRequired}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {totalRequired === requiredChecked ? 'All required items checked!' : 'Some required items pending'}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Last Updated</p>
                            <p className="mt-2 text-sm text-gray-900">
                                {checklist?.updated_at 
                                    ? new Date(checklist.updated_at).toLocaleString() 
                                    : 'Not started'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-6">
                    {Object.entries(itemsByCategory || {}).map(([category, items]) => (
                        <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {category}
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => {
                                    const responseItem = getResponseItem(item.id);
                                    const isChecked = responseItem?.is_checked || false;
                                    const isLoading = loadingItems[item.id];

                                    return (
                                        <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 pt-1">
                                                    <button
                                                        onClick={() => {
                                                            if (!isLoading && responseItem) {
                                                                handleCheckItem(item.id, !isChecked);
                                                            }
                                                        }}
                                                        disabled={isLoading || !responseItem}
                                                        className={`flex items-center justify-center h-6 rounded-md border transition-colors ${
                                                            isChecked
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                                        } ${(isLoading || !responseItem) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 animate-spin" />
                                                        ) : isChecked ? (
                                                            <CheckSquare className="h-4" />
                                                        ) : (
                                                            <Square className="h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="flex justify-between items-start">
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
                                                        <div className="flex items-center gap-2">
                                                            {item.is_required && (
                                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Notes Section */}
                                                    <div className="mt-3">
                                                        <button
                                                            onClick={() => setShowNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                            disabled={!responseItem}
                                                            className={`inline-flex items-center text-sm ${
                                                                responseItem 
                                                                    ? 'text-blue-600 hover:text-blue-800' 
                                                                    : 'text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <MessageSquare className="h-4 mr-1" />
                                                            {responseItem?.notes ? 'View/Edit Notes' : 'Add Notes'}
                                                        </button>
                                                        
                                                        {showNotes[item.id] && responseItem && (
                                                            <div className="mt-2">
                                                                <textarea
                                                                    value={notes[item.id] || responseItem?.notes || ''}
                                                                    onChange={(e) => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                                    rows="2"
                                                                    placeholder="Add notes about this item..."
                                                                />
                                                                <div className="mt-2 flex justify-end">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (responseItem?.id) {
                                                                                handleCheckItem(item.id, isChecked);
                                                                                setShowNotes(prev => ({ ...prev, [item.id]: false }));
                                                                            }
                                                                        }}
                                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                                                    >
                                                                        Save Notes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

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

                {/* No items message */}
                {(!itemsByCategory || Object.keys(itemsByCategory).length === 0) && (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No checklist items found.</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <Link
                            href={bookingDetails.backLink}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeft className="h-4 mr-1" />
                            Back to Booking
                        </Link>
                        
                        <div className="text-sm text-gray-500">
                            Checklist Response ID: {checklist.id} • Created: {new Date(checklist.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BookingChecklist;