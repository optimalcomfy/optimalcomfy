import React from 'react';
import { usePage, Head, Link } from '@inertiajs/react';

const ProcessedRequest = () => {
    const { user, notification } = usePage().props; 


    return (
        <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
            <Head title="KYC submission" />
            
            <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                
                <div className="relative bg-white shadow-lg sm:rounded-3xl p-6">
                    <div className="flex justify-end mb-4">
                        <Link href={route('logout')} method="post" as="button" className="p-link layout-topbar-button">
                            <i className="pi pi-lock"></i>
                            <span>Logout</span>
                        </Link>
                    </div>

                    <div>
                        <p>Hi, {user.name}</p>
                        <p>{notification.is_read}</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProcessedRequest;