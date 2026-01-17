import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { ArrowLeft, Mail, MessageSquare, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

const CommunicationLogs = ({ bulkCommunication, logs }) => {
    const { pagination } = usePage().props;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle className="h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 text-red-500" />;
            default:
                return <Clock className="h-4 text-yellow-500" />;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'email':
                return <Mail className="h-4 text-blue-500" />;
            case 'sms':
                return <MessageSquare className="h-4 text-green-500" />;
            default:
                return <MessageSquare className="h-4 text-gray-500" />;
        }
    };

    return (
        <Layout>
            <Head title={`Communication Logs - ${bulkCommunication.template?.name || 'Bulk Communication'}`} />

            <div className="w-full">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('communications.index')}
                                className="flex items-center text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="h-5 mr-2" />
                                Back to Communications
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Communication Logs
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {bulkCommunication.template?.name || 'Bulk Communication'} •
                                    Sent: {new Date(bulkCommunication.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Messages</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {logs.data.length}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="text-blue-600 text-sm font-medium">SMS Sent</div>
                            <div className="text-2xl font-bold text-blue-700">{bulkCommunication.sms_sent || 0}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="text-green-600 text-sm font-medium">Emails Sent</div>
                            <div className="text-2xl font-bold text-green-700">{bulkCommunication.emails_sent || 0}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <div className="text-red-600 text-sm font-medium">SMS Failed</div>
                            <div className="text-2xl font-bold text-red-700">{bulkCommunication.sms_failed || 0}</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <div className="text-orange-600 text-sm font-medium">Emails Failed</div>
                            <div className="text-2xl font-bold text-orange-700">{bulkCommunication.emails_failed || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Message Logs</h2>
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <Search className="h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <Filter className="h-4 mr-2" />
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Recipient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Content
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sent At
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {log.user?.name || 'Custom Recipient'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {log.recipient}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getTypeIcon(log.type)}
                                                    <span className="ml-2 text-sm text-gray-900 capitalize">
                                                        {log.type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {log.type === 'email' ? log.subject : log.content}
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {log.content}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getStatusIcon(log.status)}
                                                    <span className={`ml-2 text-sm font-medium capitalize ${
                                                        log.status === 'sent' ? 'text-green-600' :
                                                        log.status === 'failed' ? 'text-red-600' :
                                                        'text-yellow-600'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                {log.status_message && (
                                                    <div className="text-xs text-red-500 mt-1">
                                                        {log.status_message}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>No communication logs found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.data.length > 0 && pagination && pagination.total > pagination.per_page && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-700">
                                    Showing {logs.data.length} of {pagination.total} logs
                                </p>
                                <div className="flex gap-2">
                                    {pagination.prev_page_url && (
                                        <Link
                                            href={pagination.prev_page_url}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {pagination.next_page_url && (
                                        <Link
                                            href={pagination.next_page_url}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CommunicationLogs;
