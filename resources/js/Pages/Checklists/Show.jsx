import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { ArrowLeft, CheckCircle, Clock, Tag, FileText } from 'lucide-react';

const Show = () => {
    const { template } = usePage().props;

    const itemsByCategory = template.items?.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <Layout>
            <div className="w-full">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link
                                href={route('checklists.index')}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                            >
                                <ArrowLeft className="h-4 mr-1" />
                                Back to Templates
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                            <div className="flex items-center mt-2 space-x-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    template.type === 'property' ? 'bg-blue-100 text-blue-800' :
                                    template.type === 'car' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {template.type}
                                </span>
                                {template.is_active ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link
                            href={route('checklists.edit', template.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Edit Template
                        </Link>
                    </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-6">
                    {Object.entries(itemsByCategory || {}).map(([category, items]) => (
                        <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Tag className="h-4 mr-2" />
                                    {category}
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-500 mr-3">
                                                        {index + 1}.
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {item.item_name}
                                                        </h4>
                                                        {item.description && (
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex items-center">
                                                {item.is_required && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                                                        Required
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    Order: {item.order}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">Total Items</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {template.items?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">Required Items</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {template.items?.filter(item => item.is_required).length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">Categories</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {Object.keys(itemsByCategory || {}).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Show;