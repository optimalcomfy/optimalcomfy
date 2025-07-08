import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import HomeLayout from "@/Layouts/HomeLayout";

import {
    LayoutContext,
    LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <PrimeReactProvider>
            <LayoutProvider>
            <Head title="Forgot Password" />
             <HomeLayout>

            <div className='min-h-screen w-full items-center justify-center py-[200px] px-4 mx-auto'>
                <div className="mb-4 text-sm text-gray-600 max-w-4xl mx-auto">
                    Forgot your password? No problem. Just let us know your email address and we will email you a password
                    reset link that will allow you to choose a new one.
                </div>

                {status && <div className="mb-4 font-medium text-sm text-green-600 max-w-4xl mx-auto">{status}</div>}

                <form onSubmit={submit} className='max-w-4xl mx-auto'>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />

                    <div className="flex items-center justify-end mt-4">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full bg-peachDark text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-peach disabled:opacity-50"
                        >
                            Email Password Reset Link
                        </button>
                    </div>
                </form>
            </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}
