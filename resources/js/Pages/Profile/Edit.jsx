import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

export default function Edit({ auth, mustVerifyEmail, status, user }) {
    const isAdmin = parseInt(auth.user?.role_id) === 1;

    return (
        <Layout>
            <Head title="Profile" />

            <div className="max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>
                
                <div className="space-y-8">
                    {/* Profile Information - Full Width Card */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                user={user}
                            />
                        </div>
                    </section>

                    {/* Bottom Row - Two Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Update Password Card */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Security</h2>
                            <div className="bg-white rounded-xl shadow-md p-8 h-full">
                                <UpdatePasswordForm />
                            </div>
                        </section>

                        {/* Conditional Admin Card */}
                        {isAdmin && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">Account Management</h2>
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