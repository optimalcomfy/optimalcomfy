import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Documents from './Partials/Documents';

export default function Edit({ auth, mustVerifyEmail, status, employee }) {
    const roleId = auth.user?.role_id;
    return (
        <Layout>
            <Head title="Profile" />

            <div className="grid grid-cols-2 gap-4">
                <div className="card">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        employee={employee}
                        className="max-w-xl"
                    />
                </div>

                <div className="card">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                {roleId === 1 &&
                <div className="card">
                    <DeleteUserForm className="max-w-xl" />
                </div>}

                {employee &&
                <div className="card">
                    <Documents employee={employee} />
                </div>}
            </div>
        </Layout>
    );
}
