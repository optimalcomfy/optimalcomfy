import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className='w-full flex flex-col min-h-screen'>
            <div className='w-full flex flex-col py-[200px]'>

                <div className="mb-4 text-sm text-gray-600 max-w-3xl mx-auto">
                    Thanks for signing up! Before getting started, could you verify your email address by clicking on the
                    link we will email to you when you click the send verification code button below?.
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 font-medium text-sm text-green-600 max-w-4xl mx-auto">
                        A new verification link has been sent to the email address you provided during registration.
                    </div>
                )}

                <form onSubmit={submit} className='max-w-4xl mx-auto'>
                    <div className="mt-4 flex gap-4 items-center justify-between">
                        <PrimaryButton disabled={processing}>Send Verification Email</PrimaryButton>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Log Out
                        </Link>
                    </div>
                </form>
            </div>
            </div>

        </GuestLayout>
    );
}
