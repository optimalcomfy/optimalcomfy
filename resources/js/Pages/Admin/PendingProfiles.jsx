import { Head, Link, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { useState } from 'react';
import Swal from 'sweetalert2';
import { Eye, Check, X, Download, Filter, Calendar, Search } from 'lucide-react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

export default function PendingProfiles({ pendingUsers }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const toast = useRef(null);

    // Filter users based on search
    const filteredUsers = pendingUsers.data?.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile_status?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const showApprovalAlert = (user) => {
        Swal.fire({
            title: 'Approve Changes?',
            html: `
                <div class="text-left">
                    <p class="mb-2">Are you sure you want to approve <strong>${user.name}'s</strong> profile changes?</p>
                    <p class="text-sm text-gray-600">This will apply all pending changes to their profile.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, approve',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            background: '#FFFFFF',
            customClass: {
                confirmButton: 'px-4 py-2 rounded-lg font-medium',
                cancelButton: 'px-4 py-2 rounded-lg font-medium'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                approveUser(user);
            }
        });
    };

    const showRejectionAlert = (user) => {
        Swal.fire({
            title: 'Reject Changes?',
            html: `
                <div class="text-left">
                    <p class="mb-2">Are you sure you want to reject <strong>${user.name}'s</strong> profile changes?</p>
                    <p class="text-sm text-gray-600">You'll need to provide a rejection reason.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, reject',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            background: '#FFFFFF'
        }).then((result) => {
            if (result.isConfirmed) {
                setSelectedUser(user);
                setRejectionDialog(true);
            }
        });
    };

    const approveUser = (user) => {
        setLoading(prev => ({ ...prev, [user.id]: true }));
        router.post(route('admin.approve-pending', user.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(prev => ({ ...prev, [user.id]: false }));
                
                Swal.fire({
                    title: 'Approved!',
                    text: `${user.name}'s profile changes have been approved.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#FFFFFF'
                });
            },
            onError: () => {
                setLoading(prev => ({ ...prev, [user.id]: false }));
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to approve changes. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#EF4444',
                });
            }
        });
    };

    const rejectUser = () => {
        if (!rejectionReason.trim()) {
            Swal.fire({
                title: 'Reason Required',
                text: 'Please provide a rejection reason.',
                icon: 'error',
                confirmButtonColor: '#EF4444',
            });
            return;
        }

        setLoading(prev => ({ ...prev, [selectedUser.id]: true }));
        router.post(route('admin.reject-pending', selectedUser.id), {
            rejection_reason: rejectionReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(prev => ({ ...prev, [selectedUser.id]: false }));
                setRejectionDialog(false);
                setSelectedUser(null);
                setRejectionReason('');
                
                Swal.fire({
                    title: 'Rejected!',
                    text: 'Profile changes have been rejected.',
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#FFFFFF'
                });
            },
            onError: () => {
                setLoading(prev => ({ ...prev, [selectedUser.id]: false }));
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to reject changes. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#EF4444',
                });
            }
        });
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Approved' }
        };
        
        const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter({ from: '', to: '' });
    };

    return (
        <Layout>
            <Head title="Pending Profiles" />

            <div className="w-full flex flex-col">
                {/* Mobile Filters Toggle */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {mobileFiltersOpen ? (
                            <>
                                <X className="h-5 mr-2" /> Close Filters
                            </>
                        ) : (
                            <>
                                <Filter className="h-5 mr-2" /> Open Filters
                            </>
                        )}
                    </button>
                </div>

                {/* Top Section - Filters */}
                <div className={`
                    ${mobileFiltersOpen ? 'block' : 'hidden'}
                    lg:block bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4
                `}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <h1 className="text-2xl font-semibold text-gray-900 w-full sm:w-auto">
                            Pending Profile Updates
                        </h1>
                        
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                {filteredUsers.length} Pending
                            </span>
                        </div>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Search by name, email, or status..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="date"
                                    value={dateFilter.from}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="From Date"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="date"
                                    value={dateFilter.to}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="To Date"
                                />
                            </div>
                            {(searchTerm || dateFilter.from || dateFilter.to) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                                >
                                    <X className="h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-wrap">
                                            <div className="flex items-center">
                                                {user.pending_profile_picture && (
                                                    <img 
                                                        src={`/storage/${user.pending_profile_picture}`}
                                                        className="w-8 h-8 rounded-full mr-3 object-cover"
                                                        alt={user.name}
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0U1RTVFNSIvPjxwYXRoIGQ9Ik0xNiAxN2MxLjY1NyAwIDMtMS4zNDMgMy0zcy0xLjM0My0zLTMtMy0zIDEuMzQzLTMgMyAxLjM0MyAzIDMgM3ptMCAxYy0yLjc2MiAwLTUgMi4yMzktNSA1aDEwYzAtMi43NjEtMi4yMzgtNS01LTV6IiBmaWxsPSIjOTk5Ii8+PC9zdmc+'
                                                        }}
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-wrap text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-wrap">
                                            {getStatusBadge(user.profile_status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-wrap text-gray-600">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-wrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 mr-1" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => showApprovalAlert(user)}
                                                    disabled={loading[user.id]}
                                                    className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {loading[user.id] ? (
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                            </svg>
                                                            Processing...
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <Check className="h-4 mr-1" />
                                                            Approve
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => showRejectionAlert(user)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                                    title="Reject"
                                                >
                                                    <X className="h-4 mr-1" />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        {searchTerm || dateFilter.from || dateFilter.to 
                                            ? 'No pending profiles match your filters.'
                                            : 'No pending profile updates found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* View Details Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Profile Update Details
                                    </h2>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* User Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        {selectedUser.pending_profile_picture && (
                                            <img 
                                                src={`/storage/${selectedUser.pending_profile_picture}`}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                                alt={selectedUser.name}
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">{selectedUser.name}</h3>
                                            <p className="text-gray-600">{selectedUser.email}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Submitted: {formatDate(selectedUser.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Requested Changes */}
                                {selectedUser.pending_data && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Requested Changes</h3>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                            <pre className="text-sm">
                                                {JSON.stringify(selectedUser.pending_data, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Pending Files */}
                                {(selectedUser.pending_profile_picture || selectedUser.pending_id_front || selectedUser.pending_id_back) && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Pending Files</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedUser.pending_profile_picture && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gray-50 px-3 py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-700">Profile Picture</span>
                                                    </div>
                                                    <img 
                                                        src={`/storage/${selectedUser.pending_profile_picture}`}
                                                        className="w-full h-48 object-cover"
                                                        alt="Profile"
                                                    />
                                                </div>
                                            )}
                                            {selectedUser.pending_id_front && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gray-50 px-3 py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-700">ID Front</span>
                                                    </div>
                                                    <img 
                                                        src={`/storage/${selectedUser.pending_id_front}`}
                                                        className="w-full h-48 object-contain bg-gray-100"
                                                        alt="ID Front"
                                                    />
                                                </div>
                                            )}
                                            {selectedUser.pending_id_back && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gray-50 px-3 py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-700">ID Back</span>
                                                    </div>
                                                    <img 
                                                        src={`/storage/${selectedUser.pending_id_back}`}
                                                        className="w-full h-48 object-contain bg-gray-100"
                                                        alt="ID Back"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null);
                                            showApprovalAlert(selectedUser);
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        <Check className="h-5 mr-2" />
                                        Approve Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null);
                                            setSelectedUser(selectedUser);
                                            setRejectionDialog(true);
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <X className="h-5 mr-2" />
                                        Reject Changes
                                    </button>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Modal */}
                {rejectionDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                            {/* Header */}
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <X className="h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Reject Profile Changes
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            For: {selectedUser?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        Please provide a reason for rejecting these profile changes:
                                    </p>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter rejection reason..."
                                        autoFocus
                                    />
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">
                                                    This reason will be sent to the user.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-6 py-4">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setRejectionDialog(false);
                                            setRejectionReason('');
                                        }}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={rejectUser}
                                        disabled={loading[selectedUser?.id]}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {loading[selectedUser?.id] ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <X className="h-5 mr-2" />
                                                Reject Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}