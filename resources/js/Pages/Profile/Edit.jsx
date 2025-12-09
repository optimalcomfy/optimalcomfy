import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

export default function Edit({ auth, mustVerifyEmail, status, user }) {
    const isAdmin = parseInt(auth.user?.role_id) === 1;
    const toast = useRef(null);
    const { flash } = usePage().props;

    return (
        <Layout>
            <Head title="Profile" />
            <Toast ref={toast} />

            <div className="max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your account information and security settings</p>
                    </div>
                </div>
                
                <div className="space-y-8">
                    {/* Profile Information - Full Width Card */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <i className="pi pi-user-edit text-blue-500"></i>
                            Personal Information
                        </h2>
                        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                user={user}
                                onSuccess={(message) => {
                                    toast.current?.show({
                                        severity: 'success',
                                        summary: 'Success',
                                        detail: message,
                                        life: 3000
                                    });
                                }}
                                onError={(message) => {
                                    toast.current?.show({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: message,
                                        life: 3000
                                    });
                                }}
                            />
                        </div>
                    </section>

                    {/* Bottom Row - Two Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Update Password Card */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <i className="pi pi-lock text-green-500"></i>
                                Security
                            </h2>
                            <div className="bg-white rounded-xl shadow-md p-8 h-full">
                                <UpdatePasswordForm />
                            </div>
                        </section>

                        {/* Conditional Admin Card */}
                        {isAdmin && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <i className="pi pi-shield text-red-500"></i>
                                    Account Management
                                </h2>
                                <div className="bg-white rounded-xl shadow-md p-8 h-full">
                                    <DeleteUserForm />
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}