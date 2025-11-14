import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { ArrowLeft, Mail, MessageSquare, CheckCircle, XCircle, Clock, Search, Filter, User, Eye } from 'lucide-react';

const IndividualLogs = ({ logs }) => {
    const { pagination, auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'individual_email':
                return <Mail className="w-4 h-4 text-blue-500" />;
            case 'individual_sms':
                return <MessageSquare className="w-4 h-4 text-green-500" />;
            default:
                return <MessageSquare className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        router.get(route('communications.individual.logs'), {
            search: e.target.value,
            status: statusFilter,
            type: typeFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        router.get(route('communications.individual.logs'), {
            search: searchTerm,
            status: status,
            type: typeFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleTypeFilter = (type) => {
        setTypeFilter(type);
        router.get(route('communications.individual.logs'), {
            search: searchTerm,
            status: statusFilter,
            type: type
        }, {
            preserveState: true,
            replace: true
        });
    };

    const filteredLogs = logs.data.filter(log => {
        const matchesSearch = !searchTerm ||
            log.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.content?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
        const matchesType = typeFilter === 'all' || log.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <Layout>
            <Head title="Individual Communication Logs" />

            <div className="w-full">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('communications.index')}
                                className="flex items-center text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Communications
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Individual Communication Logs
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Track all your individual messages sent to users
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Messages</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {logs.total}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="text-blue-600 text-sm font-medium">Total Sent</div>
                            <div className="text-2xl font-bold text-blue-700">
                                {logs.data.filter(log => log.status === 'sent').length}
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="text-green-600 text-sm font-medium">SMS Messages</div>
                            <div className="text-2xl font-bold text-green-700">
                                {logs.data.filter(log => log.type === 'individual_sms').length}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div className="text-purple-600 text-sm font-medium">Email Messages</div>
                            <div className="text-2xl font-bold text-purple-700">
                                {logs.data.filter(log => log.type === 'individual_email').length}
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <div className="text-red-600 text-sm font-medium">Failed</div>
                            <div className="text-2xl font-bold text-red-700">
                                {logs.data.filter(log => log.status === 'failed').length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search by recipient, content, or name..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="sent">Sent</option>
                                <option value="failed">Failed</option>
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => handleTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="individual_sms">SMS</option>
                                <option value="individual_email">Email</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Recipient
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.user?.name || log.metadata?.recipient_name || 'Custom Recipient'}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {log.recipient}
                                                    </div>
                                                    {log.metadata?.recipient_type === 'custom' && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            Custom
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    {log.type === 'individual_email' && log.subject && (
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {log.subject}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-500 truncate">
                                                        {log.content}
                                                    </div>
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
                                                    <div className="text-xs text-red-500 mt-1 max-w-xs">
                                                        {log.status_message}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        // View message details
                                                        alert(`Message Details:\n\nType: ${log.type}\nRecipient: ${log.recipient}\nContent: ${log.content}\nStatus: ${log.status}\nSent: ${new Date(log.created_at).toLocaleString()}`);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>No individual communication logs found.</p>
                                            {logs.data.length > 0 && (
                                                <p className="text-sm text-gray-400 mt-2">
                                                    Try adjusting your search or filters
                                                </p>
                                            )}
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

export default IndividualLogs;
