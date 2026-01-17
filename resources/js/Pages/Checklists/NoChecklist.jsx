import React from 'react';
import { Link } from '@inertiajs/react';
import { ClipboardX, FilePlus } from 'lucide-react';

const NoChecklist = ({ booking, type, error }) => {
    return (
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
                        {error || 'No checklist template has been assigned to this booking yet.'}
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
                                ← Back to Booking
                            </Link>
                            
                            {/* Only show to admins */}
                            {usePage().props.auth.user?.role_id === 1 && (
                                <Link
                                    href={route('checklists.index', { type })}
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                                >
                                    <FilePlus className="h-5 w-5 mr-2" />
                                    Manage Checklists
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoChecklist;