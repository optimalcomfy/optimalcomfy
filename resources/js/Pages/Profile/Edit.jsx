import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Documents from './Partials/Documents';

export default function Edit({ auth, mustVerifyEmail, status, employee }) {
    const roleId = parseInt(auth.user?.role_id);

    return (
        <Layout>
            <Head title="Profile" />

            <div className="flex flex-wrap gap-4">
                <div className="card flex-1 min-w-[300px] max-w-xl">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        employee={employee}
                        className="max-w-xl"
                    />
                </div>

                <div className="card flex-1 min-w-[300px] max-w-xl">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                {roleId === 1 && (
                    <div className="card flex-1 min-w-[300px] max-w-xl">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                )}

                {employee && (
                    <div className="card flex-1 min-w-[300px] max-w-xl">
                        <Documents employee={employee} />
                    </div>
                )}
            </div>
        </Layout>
    );
}
