import React, { useEffect, useState, useContext } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  Home, Users, Calendar, Star, DollarSign, Loader, Check, Car, Plus, 
  Wallet, Settings, MapPin, Briefcase, CreditCard, Activity, AlertTriangle,
  TrendingDown, TrendingUp
} from 'lucide-react';
import { usePage, useForm } from '@inertiajs/react';
import { LayoutContext } from '@/Layouts/layout/context/layoutcontext';
import Layout from "@/Layouts/layout/layout.jsx";

const Dashboard = () => {
  // Get all available data from props
  const { 
    propertiesCount, 
    carsCount,
    totalBookingsCount, 
    monthlyEarnings, 
    propertyBookingTotal,
    carBookingTotal,
    totalEarnings,
    pendingPayouts,
    availableBalance,
    recentTransactions,
    hostsWithOverdrafts: overdraftData,
    auth,
    flash
  } = usePage().props;

  const { data, setData, get, processing } = useForm({
    type: "", 
    number: "",
  });
  
  const [lineOptions, setLineOptions] = useState({});
  const { layoutConfig } = useContext(LayoutContext);
  const roleId = parseInt(auth.user?.role_id);
  const isDarkMode = layoutConfig.colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);

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
        if (typeof amount === 'string') {
            amount = parseFloat(amount);
        }
        return `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
            <div className="h-full bg-peachDark rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  // Custom InfoCard component
  const InfoCard = ({ title, value, icon, iconColor, description, trend, isNegative }) => {
    const Icon = icon;
    const trendColor = trend?.value > 0 ? 'green' : trend?.value < 0 ? 'red' : 'gray';
    const trendIcon = trend?.value > 0 ? '↑' : trend?.value < 0 ? '↓' : '→';
    
    return (
      <div className="flex-1 p-3 min-w-[250px]">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} ${isNegative ? 'border-l-4 border-red-500' : ''}`}>
          <div className="flex justify-between gap-4 items-center mb-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className={`p-2 rounded-full ${isNegative ? 'bg-red-100 text-red-500' : `bg-${iconColor}-100 text-${iconColor}-500`}`}>
              <Icon size={20} />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold ${isNegative ? 'text-red-500' : ''}`}>
              {isNegative && '-'}{value}
            </span>
            {trend && (
              <span className={`ml-2 text-sm text-${trendColor}-500`}>
                {trendIcon} {Math.abs(trend.value)}% {trend.period}
              </span>
            )}
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
    );
  };

  // Overdraft Summary Card
  const OverdraftSummary = () => {
    const totalOverdraft = overdraftData.reduce((sum, host) => sum + Math.abs(host.overdraft_amount), 0);
    const affectedHosts = overdraftData.length;

    return (
      <div className="p-3 min-w-[280px]">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} border-l-4 border-red-500`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-500">
            <AlertTriangle size={18} />
            Overdraft Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Overdraft Amount</span>
              <span className="font-bold text-red-500">-{formatCurrency(totalOverdraft)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Affected Hosts</span>
              <span className="font-bold">{affectedHosts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Average Overdraft</span>
              <span className="font-bold text-red-500">-{formatCurrency(totalOverdraft / affectedHosts)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Overdraft Hosts List
  const OverdraftHostsList = () => {
    return (
      <div className="flex-[2] p-3 min-w-full">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown size={18} />
            Hosts with Overdraft
          </h3>
          {overdraftData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Host Name</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Properties</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Vehicles</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Available Balance</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Overdraft Amount</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overdraftData.map((host, index) => (
                    <tr key={host.id} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-3 text-sm font-medium">{host.name}</td>
                      <td className="py-3 px-3 text-sm">{host.email}</td>
                      <td className="py-3 px-3 text-sm">{host.properties_count}</td>
                      <td className="py-3 px-3 text-sm">{host.cars_count}</td>
                      <td className="py-3 px-3 text-sm text-right font-medium text-red-500">
                        -{formatCurrency(Math.abs(host.available_balance))}
                      </td>
                      <td className="py-3 px-3 text-sm text-right">
                        {formatCurrency(host.overdraft_amount)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right">
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Overdraft
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No hosts with overdraft found
            </div>
          )}
        </div>
      </div>
    );
  };

  // Overdraft Chart
  const OverdraftChart = () => {
    const chartData = overdraftData.map(host => ({
      name: host.name.split(' ')[0], // First name only
      overdraft: Math.abs(host.overdraft_amount),
      balance: Math.abs(host.available_balance),
      properties: host.properties_count,
      cars: host.cars_count
    }));

    return (
      <div className="flex-1 p-3 min-w-[300px]">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4">Overdraft Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                />
                <Legend />
                <Bar dataKey="overdraft" fill="#EF4444" name="Overdraft Amount" />
                <Bar dataKey="balance" fill="#F59E0B" name="Negative Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // User Profile Card
  const UserProfileCard = () => {
    return (
      <div className="p-3">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="flex items-center gap-4">
            <img 
              src={`/storage/${auth.user.profile_picture}`} 
              alt="Profile" 
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
            />
            <div>
              <h3 className="text-xl font-bold">{auth.user.name}</h3>
              <p className="text-sm text-gray-500">
                {auth.user.user_type === 'host' ? 'Property Host' : 'Traveler'} • {auth.user.current_location}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {auth.user.nationality}
                </span>
                {auth.user.languages && JSON.parse(auth.user.languages).map((lang, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {lang.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap mt-4 gap-4">
            <div className="flex-1 min-w-[120px]">
              <p className="text-sm text-gray-500">Member Since</p>
              <p>{new Date(auth.user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex-1 min-w-[120px]">
              <p className="text-sm text-gray-500">Verification</p>
              <p className="text-green-500 flex items-center gap-1">
                <Check size={14} />
                {auth.user.id_verification ? 'Verified' : 'Not Verified'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Earnings Breakdown Pie Chart
  const EarningsBreakdown = () => {
    const data = [
      { name: 'Properties', value: parseFloat(propertyBookingTotal) || 0 },
      { name: 'Car Rentals', value: parseFloat(carBookingTotal) || 0 },
    ];

    const COLORS = ['#3B82F6', '#10B981'];

    return (
      <div className="flex-1 p-3 min-w-[300px]">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value)}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {data.map((item, index) => (
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

  // Financial Summary Card
  const FinancialSummary = () => {
    const hasOverdraft = availableBalance < 0;
    
    return (
      <div className="p-3 min-w-[300px]">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} ${hasOverdraft ? 'border-l-4 border-red-500' : ''}`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={18} />
            Financial Summary
            {hasOverdraft && <AlertTriangle size={16} className="text-red-500" />}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Available Balance</span>
                <span className={`font-bold ${hasOverdraft ? 'text-red-500' : ''}`}>
                  {hasOverdraft && '-'}{formatCurrency(Math.abs(availableBalance))}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${hasOverdraft ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min(100, (Math.abs(availableBalance) / (totalEarnings || 1)) * 100)}%` }}
                ></div>
              </div>
              {hasOverdraft && (
                <p className="text-xs text-red-500 mt-1">Your account is in overdraft</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pending Payouts</span>
                <span className="font-bold">{formatCurrency(pendingPayouts)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (pendingPayouts / (totalEarnings || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Recent Transactions Table
  const RecentTransactions = () => {
    return (
      <div className="flex-[2] p-3 min-w-full">
        <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} />
            Recent Transactions
          </h3>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Guest</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Amount</th>
                    {roleId === 1 &&
                    <>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Customer Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Platform charges</th>
                    </>}
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions?.map((transaction, index) => (
                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-3 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-sm capitalize">{transaction.type}</td>
                      <td className="py-3 px-3 text-sm">{transaction.guest}</td>
                      <td className="py-3 px-3 text-sm text-right font-medium">
                        {formatCurrency(transaction.net_amount)}
                      </td>
                      {roleId === 1 &&
                      <>
                      <td className="px-6 py-4 whitespace-wrap">KES {formatCurrency(transaction.platform_price)}</td>
                      <td className="px-6 py-4 whitespace-wrap">KES {formatCurrency(transaction.platform_charges)}</td>
                      </>}
                      <td className="py-3 px-3 text-sm text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No recent transactions found
            </div>
          )}
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
          <div className={`p-4 rounded-lg ${
            flash.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {flash.success || flash.error}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* First Column */}
        {(roleId !== 4) && (
        <div className="flex flex-col flex-1 justify-start gap-4">
          <UserProfileCard />
          {(roleId === 1 || roleId === 2) && <FinancialSummary />}
          {/* Overdraft Summary - Only show for admin/management roles */}
          {(roleId === 1) && overdraftData.length > 0 && <OverdraftSummary />}
        </div>)}

        {/* Second Column */}
        <div className="flex flex-col flex-[2] gap-4">
          <div className="flex flex-wrap -mx-3">
            {(roleId === 1 || roleId === 2) && (
              <InfoCard 
                title="Total Properties" 
                value={propertiesCount} 
                icon={Home} 
                iconColor="blue" 
                description="Your listed properties"
                trend={{ value: 12, period: 'this month' }}
              />
            )}
            {(roleId === 1 || roleId === 2) && (
              <InfoCard 
                title="Total Vehicles" 
                value={carsCount} 
                icon={Car} 
                iconColor="purple" 
                description="Your listed vehicles"
                trend={{ value: 5, period: 'this month' }}
              />
            )}
             {(roleId !== 4) && (
            <InfoCard 
              title="Total Bookings" 
              value={totalBookingsCount} 
              icon={Calendar} 
              iconColor="green" 
              description="All-time bookings"
              trend={{ value: 8, period: 'this month' }}
            />)}
          </div>

          {/* Overdraft Section - Only show for admin/management roles */}
          {(roleId === 1) && overdraftData.length > 0 && (
            <>
              <div className="flex flex-wrap -mx-3">
                <OverdraftChart />
                <EarningsBreakdown />
              </div>
              <OverdraftHostsList />
            </>
          )}

          {(roleId === 4) && (
            <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-lg font-bold mb-4">Find Booking</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Booking Type</label>
                  <select
                    value={data.type}
                    onChange={(e) => setData("type", e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Type</option>
                    <option value="property">Property</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Booking Number</label>
                  <input
                    type="text"
                    value={data.number}
                    onChange={(e) => setData("number", e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g. BKG-XXXX or CAR-XXXX"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  disabled={processing}
                >
                  {processing ? "Searching..." : "Search Booking"}
                </button>
              </form>
            </div>
          )}

          {(roleId === 1 || roleId === 2) && (
            <div className="flex flex-wrap -mx-3">
              {(roleId !== 1 || overdraftData.length === 0) && <EarningsBreakdown />}
              
              <div className="flex-1 p-3 min-w-[300px]">
                <div className={`shadow-md rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                  <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyEarnings}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                        <XAxis dataKey="month" />
                        <YAxis />
                       <Tooltip 
                          formatter={(value) => {
                              const num = parseFloat(value);
                              return [isNaN(num) ? value : num.toFixed(2), 'Amount'];
                          }}
                          />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#3B82F6" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2} 
                          name="Total Earnings"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="property_earnings" 
                          stroke="#10B981" 
                          strokeWidth={2} 
                          name="Property Earnings"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="car_earnings" 
                          stroke="#8B5CF6" 
                          strokeWidth={2} 
                          name="Car Earnings"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(roleId === 1 || roleId === 2) && <RecentTransactions />}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;