import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    LayoutContext,
    LayoutProvider,
  } from "@/Layouts/layout/context/layoutcontext.jsx";
  import { PrimeReactProvider } from "primereact/api";
  import HomeLayout from "@/Layouts/HomeLayout";
  import '../../../css/main'

export default function Login({status, canResetPassword}) {
    const {data, setData, post, processing, errors, reset} = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        sessionStorage.removeItem('hasReloaded');
        post(route('login'));
    };

    return (
    <PrimeReactProvider>
        <LayoutProvider>
        <Head title="Welcome" />
        <HomeLayout>


        <div className='bg-gray-100 w-full flex flex-col text-4xl'>
            {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}
            

            <div className="flex min-h-screen max-w-4xl mx-auto flex-col items-center justify-center py-[200px]">
                <div className="w-full p-6 rounded-lg shadow-md bg-white">
                    <div className="text-center mb-5">
                        <h2 className="text-3xl font-medium text-gray-900 mb-3">Welcome Back</h2>
                        <p className="text-gray-600">
                            Don't have an account?
                            <Link 
                                href={route('register')} 
                                className="ml-2 text-blue-500 hover:underline"
                            >
                                Create today!
                            </Link>
                        </p>
                    </div>
                    <form onSubmit={submit}>
                        <div className="space-y-4">
                            <div>
                                <label 
                                    htmlFor="email" 
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="text"
                                    placeholder="Email address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-1"/>
                            </div>
                            <div>
                                <label 
                                    htmlFor="password" 
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-1"/>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="rememberme-login"
                                        type="checkbox"
                                        className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <label 
                                        htmlFor="rememberme-login" 
                                        className="ml-2 block text-sm text-gray-900"
                                    >
                                        Remember me
                                    </label>
                                </div>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-blue-500 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            </div>

            </HomeLayout>
            </LayoutProvider>
            </PrimeReactProvider>
    );
}