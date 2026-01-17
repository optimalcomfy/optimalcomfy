import React, { useEffect, useState, useContext } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  Home, Users, Calendar, Star, DollarSign, Loader, Check, Car, Plus,
  Wallet, Settings, MapPin, Briefcase, CreditCard, Activity, AlertTriangle,
  TrendingDown, TrendingUp, Tag, UserCheck, Building, TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon, ArrowUpRight, ArrowDownRight, Eye, Package,
  Building2,
  Info
} from 'lucide-react';
import { usePage, useForm } from '@inertiajs/react';
import { LayoutContext } from '@/Layouts/layout/context/layoutcontext';
import Layout from "@/Layouts/layout/layout.jsx";

const Dashboard = () => {
  // Get all available data from props
  const {
    propertiesCount = 0,
    carsCount = 0,
    totalBookingsCount = 0,
    monthlyEarnings = [],
    propertyBookingTotal = 0,
    carBookingTotal = 0,
    totalEarnings = 0,
    pendingPayouts = 0,
    availableBalance = 0,
    recentTransactions = [],
    hostsWithOverdrafts: overdraftData = [],
    auth,
    flash,
    earnings_type,
    description,
    platform_percentage = 15,
    host_percentage = 85,
    repaymentAmount = 0,
    earnings_breakdown = {},
    financial_summary = {},
    averagePropertyBookingValue = 0,
    averageCarBookingValue = 0,
    totalBookingsCount: totalBookings = 0,
    isAdmin = false,
    adminStats = null,
    referral_percentage = 2,
    referral_calculation_explanation = ""
  } = usePage().props;

  const { data, setData, get, processing } = useForm({
    type: "",
    number: "",
  });

  const [lineOptions, setLineOptions] = useState({});
  const { layoutConfig } = useContext(LayoutContext);
  const roleId = parseInt(auth?.user?.role_id || 0);
  const isDarkMode = layoutConfig.colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [completeSummary, setCompleteSummary] = useState(null);
  const [loadingCompleteSummary, setLoadingCompleteSummary] = useState(false);

  // Fetch complete financial summary for hosts
  useEffect(() => {
      setLoadingCompleteSummary(true);
      // Simulate API call with provided data
      setTimeout(() => {
        setCompleteSummary({
          direct_host_earnings: {
            property_earnings: financial_summary?.direct_host_earnings?.property_earnings || 591.6,
            car_earnings: financial_summary?.direct_host_earnings?.car_earnings || 0,
            total_direct_earnings: financial_summary?.direct_host_earnings?.total_direct_earnings || 591.6,
            description: "Earnings from your own properties and cars"
          },
          markup_referral_earnings: {
            earnings_from_markups: auth.user?.earnings_from_markups || 50,
            earnings_from_referrals: auth.user?.earnings_from_referral || 0.29,
            total_markup_referral_earnings: 50.29,
            available_balance: auth.user?.balance || 0,
            pending_earnings: auth.user?.pending_balance || 166.89,
            upcoming_earnings: auth.user?.upcoming_markup_earnings || 0,
            description: "Earnings from markups and referral commissions"
          },
          combined_totals: {
            total_all_earnings: totalEarnings || 641.89,
            total_available_balance: availableBalance || 0,
            total_repayments: repaymentAmount || 270,
            net_available_balance: (availableBalance || 0) - (repaymentAmount || 0)
          }
        });
        setLoadingCompleteSummary(false);
      }, 500);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.type || !data.number) return;

    get(route("bookings.lookup"), {
      preserveScroll: true,
    });
  };

  // Theme setup for charts
  const applyLightTheme = () => {
    const lineOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
    setLineOptions(lineOptions);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'KES 0';
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    return `KES ${amount?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`;
  };

  const formatCurrencyWithDecimal = (amount) => {
    if (amount === null || amount === undefined) return 'KES 0.00';
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    return `KES ${amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;
  };

  const applyDarkTheme = () => {
    const lineOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#ebedef'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#ebedef'
          },
          grid: {
            color: 'rgba(160, 167, 181, .3)'
          }
        },
        y: {
          ticks: {
            color: '#ebedef'
          },
          grid: {
            color: 'rgba(160, 167, 181, .3)'
          }
        }
      }
    };
    setLineOptions(lineOptions);
  };

  useEffect(() => {
    if (layoutConfig.colorScheme === 'light') {
      applyLightTheme();
    } else {
      applyDarkTheme();
    }
  }, [layoutConfig.colorScheme]);

  // Loading Screen Component
  const LoadingScreen = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Loader size={48} className="text-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Home size={20} className="text-blue-700 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
          <div className="mt-3 h-1 w-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  // Custom InfoCard component
  const InfoCard = ({ title, value, icon: Icon, iconColor, description, trend, isNegative, isPositive, isWarning, isInfo, bgColor, textColor }) => {
    const trendColor = trend?.value > 0 ? 'green' : trend?.value < 0 ? 'red' : 'gray';
    const trendIcon = trend?.value > 0 ? <ArrowUpRight size={14} /> : trend?.value < 0 ? <ArrowDownRight size={14} /> : null;

    return (
      <div className="flex-1 p-3 min-w-[250px]">
        <div className={`
          rounded-xl p-5 transition-all duration-200 hover:shadow-lg
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}
          ${isNegative ? 'border-l-4 border-red-500' : ''}
          ${isPositive ? 'border-l-4 border-green-500' : ''}
          ${isWarning ? 'border-l-4 border-yellow-500' : ''}
          ${isInfo ? 'border-l-4 border-blue-500' : ''}
          ${bgColor ? bgColor : ''}
          shadow-md
        `}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className={`text-2xl font-bold ${textColor || ''} ${isNegative ? 'text-red-500' : isPositive ? 'text-green-500' : ''}`}>
                  {typeof value === 'number' ? formatCurrency(value) : value}
                </span>
                {trend && (
                  <span className={`flex items-center text-sm mb-1 ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trendIcon}
                    {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-full ${iconColor || 'bg-blue-100'} ${isDarkMode ? 'bg-opacity-20' : ''}`}>
              <Icon size={24} className={textColor || 'text-blue-600'} />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
        </div>
      </div>
    );
  };


  const InformationCard = ({ title, value, icon: Icon, iconColor, description, trend, isNegative, isPositive, isWarning, isInfo, bgColor, textColor }) => {
    const trendIcon = trend?.value > 0 ? <ArrowUpRight size={14} /> : trend?.value < 0 ? <ArrowDownRight size={14} /> : null;

    return (
      <div className="flex-1 p-3 min-w-[250px]">
        <div className={`
          rounded-xl p-5 transition-all duration-200 hover:shadow-lg
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}
          ${isNegative ? 'border-l-4 border-red-500' : ''}
          ${isPositive ? 'border-l-4 border-green-500' : ''}
          ${isWarning ? 'border-l-4 border-yellow-500' : ''}
          ${isInfo ? 'border-l-4 border-blue-500' : ''}
          ${bgColor ? bgColor : ''}
          shadow-md
        `}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className={`text-2xl font-bold ${textColor || ''} ${isNegative ? 'text-red-500' : isPositive ? 'text-green-500' : ''}`}>
                  {value}
                </span>
                {trend && (
                  <span className={`flex items-center text-sm mb-1 ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trendIcon}
                    {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-full ${iconColor || 'bg-blue-100'} ${isDarkMode ? 'bg-opacity-20' : ''}`}>
              <Icon size={24} className={textColor || 'text-blue-600'} />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
        </div>
      </div>
    );
  };

  // Quick Stats Cards for Hosts
  const HostQuickStats = () => {
    if (roleId !== 2 && roleId !== 1) return null;

    return (
      <div className="flex flex-wrap -mx-3 mb-6">
        <InformationCard
          title="Properties Listed"
          value={propertiesCount}
          icon={Home}
          iconColor="bg-blue-100"
          description="Active property listings"
          isPositive={propertiesCount > 0}
        />
        <InformationCard
          title="Vehicles Listed"
          value={carsCount}
          icon={Car}
          iconColor="bg-purple-100"
          description="Available vehicles for rent"
          isPositive={carsCount > 0}
        />
        <InformationCard
          title="Total Bookings"
          value={totalBookingsCount}
          icon={Calendar}
          iconColor="bg-green-100"
          description="All completed bookings"
          isPositive={totalBookingsCount > 0}
        />
        <InfoCard
          title="Avg Booking Value"
          value={averagePropertyBookingValue}
          icon={DollarSign}
          iconColor="bg-amber-100"
          description="Average property booking"
          isPositive={averagePropertyBookingValue > 0}
        />
      </div>
    );
  };

  // Financial Overview Cards
  const FinancialOverview = () => {
    return (
      <div className="flex flex-wrap -mx-3 mb-6">
        <InfoCard
          title="Total Earnings"
          value={totalEarnings}
          icon={DollarSign}
          iconColor="bg-green-100"
          textColor="text-green-600"
          description="All-time earnings"
          trend={{ value: 15, period: 'this month' }}
          isPositive={true}
        />
        <InfoCard
          title="Available Balance"
          value={availableBalance}
          icon={Wallet}
          iconColor="bg-blue-100"
          textColor="text-blue-600"
          description="Ready for withdrawal"
          isPositive={availableBalance > 0}
          isWarning={availableBalance === 0}
          isNegative={availableBalance < 0}
        />
        <InfoCard
          title="Pending Payouts"
          value={pendingPayouts}
          icon={AlertTriangle}
          iconColor="bg-yellow-100"
          textColor="text-yellow-600"
          description="Awaiting clearance"
          isWarning={true}
        />
        {repaymentAmount > 0 && (
          <InfoCard
            title="Withdrawals"
            value={repaymentAmount}
            icon={CreditCard}
            iconColor="bg-red-100"
            textColor="text-red-600"
            description="Approved withdrawals"
            isNegative={true}
          />
        )}
      </div>
    );
  };

  // Detailed Earnings Breakdown for Hosts
  const DetailedEarningsBreakdown = () => {

    const percentageSections = [
      { label: "Platform Fee", value: `${platform_percentage}%`, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-900/20" },
      { label: "Host Share", value: `${host_percentage}%`, color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
      { label: "Referral Rate", value: `${referral_percentage}%`, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    ];

    return (
      <div className="mb-8">
        <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
            <h3 className="text-xl font-bold flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <DollarSign size={22} className={isDarkMode ? 'text-blue-300' : 'text-blue-600'} />
              </div>
              <span>Earnings Breakdown</span>
              <span className="ml-auto text-sm font-normal px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Detailed View
              </span>
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Direct Earnings Card */}
              <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg">Direct Earnings</h4>
                  <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium">
                    Primary Income
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
                        <Building2 size={18} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium">Property</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Direct bookings</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">
                      {formatCurrencyWithDecimal(earnings_breakdown.direct_property_earnings || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900">
                        <Car size={18} className="text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <div>
                        <p className="font-medium">Car Rentals</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Direct bookings</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">
                      {formatCurrencyWithDecimal(earnings_breakdown.direct_car_earnings || 0)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <span className="font-bold">Total Direct Earnings</span>
                      <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                        {formatCurrencyWithDecimal(earnings_breakdown.total_direct_earnings || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bonus Earnings Card */}
              <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg">Bonus Earnings</h4>
                  <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-sm font-medium">
                    Additional Income
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900">
                        <TrendingUp size={18} className="text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="font-medium">Markup Earnings</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Service fees</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                      {formatCurrencyWithDecimal(earnings_breakdown.markup_earnings || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
                        <Users size={18} className="text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="font-medium">Referral Earnings</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Network commissions</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">
                      {formatCurrencyWithDecimal(earnings_breakdown.referral_earnings || 0)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <span className="font-bold">Total Bonus</span>
                      <span className="font-bold text-xl text-purple-600 dark:text-purple-400">
                        {formatCurrencyWithDecimal(earnings_breakdown.total_markup_referral_earnings || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary Bar */}
              <div className={`mt-6 p-4 flex flex-col rounded-lg ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} border ${isDarkMode ? 'border-gray-700' : 'border-blue-200'}`}>
                <div className="flex flex-col lg:m-auto sm:flex-row items-center justify-between">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div>
                      <p className="font-bold text-lg">Total Combined Earnings</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Direct + Bonus earnings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrencyWithDecimal(
                        (earnings_breakdown.total_direct_earnings || 0) + 
                        (earnings_breakdown.total_markup_referral_earnings || 0)
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      All income sources combined
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Monthly Earnings Chart
  const MonthlyEarningsChart = () => {
    return (
      <div className="p-3 w-full">
        <div className={`rounded-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Monthly Earnings Trend</h3>
            <div className="flex gap-2">
              <span className="flex items-center text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Total
              </span>
              <span className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Direct
              </span>
              <span className="flex items-center text-sm">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Markup
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `KES ${value}`} />
                <Tooltip
                  formatter={(value) => [`${formatCurrencyWithDecimal(value)}`, 'Amount']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  name="Total Earnings"
                />
                <Line
                  type="monotone"
                  dataKey="direct_earnings"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Direct Earnings"
                />
                <Line
                  type="monotone"
                  dataKey="markup_earnings"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Markup Earnings"
                />
                <Line
                  type="monotone"
                  dataKey="referral_earnings"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Referral Earnings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Earnings Distribution Pie Chart
  const EarningsDistribution = () => {
    const pieData = [
      { name: 'Direct Property', value: parseFloat(earnings_breakdown.direct_property_earnings || 0) },
      { name: 'Direct Car', value: parseFloat(earnings_breakdown.direct_car_earnings || 0) },
      { name: 'Markup Earnings', value: parseFloat(earnings_breakdown.markup_earnings || 0) },
      { name: 'Referral Earnings', value: parseFloat(earnings_breakdown.referral_earnings || 0) }
    ].filter(item => item.value > 0);

    const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

    return (
      <div className="p-3 w-full lg:w-1/2">
        <div className={`rounded-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <h3 className="text-lg font-semibold mb-6">Earnings Distribution</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${formatCurrencyWithDecimal(value)}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No earnings data available
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Recent Transactions Table
  const RecentTransactionsTable = () => {
    return (
      <div className="p-3 w-full">
        <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="p-5 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} />
              Recent Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Booking #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Earnings Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions?.map((transaction, index) => (
                  <tr key={index} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className="py-3 px-4 text-sm">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">
                      <span className="flex items-center gap-1">
                        {transaction.type === 'property' ? <Home size={14} /> : <Car size={14} />}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{transaction.guest}</td>
                    <td className="py-3 px-4 text-sm font-mono">{transaction.booking_number}</td>
                    <td className="py-3 px-4 text-sm font-bold">{formatCurrencyWithDecimal(transaction.amount)}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${transaction.earnings_type === 'Direct' ? 'bg-blue-100 text-blue-800' :
                          transaction.earnings_type === 'Markup' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'}
                      `}>
                        {transaction.earnings_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!recentTransactions || recentTransactions.length === 0) && (
            <div className="py-8 text-center text-gray-500">
              No recent transactions found
            </div>
          )}
        </div>
      </div>
    );
  };

  // Profile Card
  const ProfileCard = () => {
    return (
      <div className="p-3 w-full">
        <div className={`rounded-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={`/storage/${auth.user.profile_picture}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=db5528&color=fff&size=96`;
                }}
              />
            </div>
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{auth.user.name}</h2>
                  <p className="text-gray-500">
                    {roleId === 2 ? 'Property Host' : 'User'} • Joined {new Date(auth.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="mt-2 md:mt-0">
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg">
                    <Tag size={14} />
                    <span className="font-mono font-bold">{auth.user.referral_code}</span>
                    <span className="text-xs">Referral Code</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{auth.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{auth.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin size={14} />
                    {auth.user.city || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verification</p>
                  <p className={`font-medium flex items-center gap-1 ${auth.user.id_front ? 'text-green-600' : 'text-yellow-600'}`}>
                    <Check size={14} />
                    {auth.user.id_front ? 'Verified' : 'Pending'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {auth.user.nationality && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-sm">
                    {auth.user.nationality}
                  </span>
                )}
                {auth.user.user_type && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    {auth.user.user_type}
                  </span>
                )}
                {auth.user.ristay_verified && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
                    Ristay Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Find Booking Form (for role 4)
  const FindBookingForm = () => {
    if (roleId !== 4) return null;

    return (
      <div className="p-3 w-full">
        <div className={`rounded-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <h3 className="text-lg font-semibold mb-4">Find Booking</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Booking Type</label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="property">Property Booking</option>
                  <option value="car">Car Booking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Booking Number</label>
                <input
                  type="text"
                  value={data.number}
                  onChange={(e) => setData("number", e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., BKG-HDTGZJI5"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" />
                  Searching...
                </span>
              ) : (
                'Search Booking'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Quick Actions for Hosts
  const QuickActions = () => {
    if (roleId !== 2) return null;

    const actions = [
      {
        title: 'Add Property',
        description: 'List a new property',
        icon: Plus,
        color: 'bg-blue-500',
        route: route('properties.create')
      },
      {
        title: 'Add Vehicle',
        description: 'List a new car',
        icon: Car,
        color: 'bg-purple-500',
        route: route('main-cars.create')
      },
      {
        title: 'View Wallet',
        description: 'Check balance & withdraw',
        icon: Wallet,
        color: 'bg-green-500',
        route: route('wallet')
      },
      {
        title: 'Markup Earnings',
        description: 'Manage markups',
        icon: Tag,
        color: 'bg-amber-500',
        route: route('bookings.markup')
      }
    ];

    return (
      <div className="p-3 w-full">
        <div className={`rounded-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <a
                key={index}
                href={action.route}
                className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{action.title}</h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {isLoading && <LoadingScreen />}

      {/* Flash Messages */}
      {flash && (
        <div className="p-3">
          <div className={`p-4 rounded-lg ${flash.success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {flash.success ? <Check size={20} /> : <AlertTriangle size={20} />}
              <span>{flash.success || flash.error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {/* Profile Section */}
        <ProfileCard />

        {/* Role-specific Content */}
          <>
            <HostQuickStats />

            {/* Financial Overview */}
            <FinancialOverview />

            {/* Detailed Earnings Breakdown */}
            <DetailedEarningsBreakdown />

            {/* Quick Actions */}
            <QuickActions />
          </>

        {/* Find Booking Form (Role 4) */}
        {roleId === 4 && <FindBookingForm />}

        {/* Charts Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          <MonthlyEarningsChart />
          <EarningsDistribution />
        </div>

        {/* Recent Transactions */}
        <RecentTransactionsTable />
      </div>
    </Layout>
  );
};

export default Dashboard;