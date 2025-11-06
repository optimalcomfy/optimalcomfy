import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import {
    BarChart3,
    Mail,
    MessageSquare,
    Users,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download
} from 'lucide-react';

const Analytics = ({ stats, messageTrends, topTemplates, recentActivity, timeRange, flash }) => {
    const { auth } = usePage().props;
    const [selectedRange, setSelectedRange] = useState(timeRange);

    const handleRangeChange = (range) => {
        setSelectedRange(range);
        router.get(route('communications.analytics'), { range }, {
            preserveState: true
        });
    };

    const StatCard = ({ title, value, icon: Icon, trend, subtitle }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${trend ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    return (
        <Layout>
            <Head title="Communication Analytics" />

            <div className="w-full">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Communication Analytics</h1>
                            <p className="text-gray-600 mt-1">Track and analyze your communication performance</p>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={selectedRange}
                                onChange={(e) => handleRangeChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="1y">Last year</option>
                            </select>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
                        <strong className="font-semibold">Success: </strong>
                        {flash.success}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Messages"
                        value={stats.totalMessages?.toLocaleString() || '0'}
                        icon={Mail}
                        trend={true}
                    />
                    <StatCard
                        title="SMS Sent"
                        value={stats.smsSent?.toLocaleString() || '0'}
                        icon={MessageSquare}
                        trend={true}
                    />
                    <StatCard
                        title="Emails Sent"
                        value={stats.emailsSent?.toLocaleString() || '0'}
                        icon={Mail}
                        trend={true}
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${stats.successRate || 0}%`}
                        icon={TrendingUp}
                        trend={stats.successRate >= 90}
                        subtitle={`${stats.failureRate || 0}% failure rate`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Unique Recipients"
                        value={stats.uniqueRecipients?.toLocaleString() || '0'}
                        icon={Users}
                        trend={true}
                    />
                    <StatCard
                        title="Bulk Campaigns"
                        value={stats.bulkCampaigns?.toLocaleString() || '0'}
                        icon={BarChart3}
                        trend={true}
                    />
                    <StatCard
                        title="Active Templates"
                        value={stats.activeTemplates?.toLocaleString() || '0'}
                        icon={Mail}
                        trend={true}
                    />
                </div>

                {/* Message Trends Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Message Trends</h2>
                        <div className="flex gap-2 text-sm">
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                SMS
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                Email
                            </span>
                        </div>
                    </div>

                    <div className="h-64">
                        {messageTrends.labels && messageTrends.labels.length > 0 ? (
                            <div className="flex items-end justify-between h-48 gap-1">
                                {messageTrends.datasets[0].data.map((value, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                        <div className="flex items-end justify-center w-full gap-1 mb-2">
                                            <div
                                                className="bg-blue-500 rounded-t w-full transition-all duration-300"
                                                style={{ height: `${(value / Math.max(...messageTrends.datasets[0].data)) * 80}%` }}
                                            ></div>
                                            <div
                                                className="bg-green-500 rounded-t w-full transition-all duration-300"
                                                style={{ height: `${(messageTrends.datasets[1].data[index] / Math.max(...messageTrends.datasets[1].data)) * 80}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 truncate w-full text-center">
                                            {messageTrends.labels[index]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                No data available for the selected period
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Templates */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Templates</h2>
                        <div className="space-y-4">
                            {topTemplates && topTemplates.length > 0 ? (
                                topTemplates.map((template, index) => (
                                    <div key={template.template_id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {template.template?.name || 'Unknown Template'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {template.campaign_count} campaigns • {template.total_recipients} recipients
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">{template.total_recipients}</p>
                                            <p className="text-xs text-gray-500">recipients</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No template data available</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivity && recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {activity.template?.name || 'Untitled Campaign'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {activity.total_recipients} recipients •
                                                <span className={`ml-1 capitalize ${
                                                    activity.status === 'completed' ? 'text-green-600' :
                                                    activity.status === 'failed' ? 'text-red-600' :
                                                    activity.status === 'sending' ? 'text-blue-600' :
                                                    'text-yellow-600'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                {new Date(activity.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
