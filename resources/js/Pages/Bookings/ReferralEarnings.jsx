import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Filter, X, Calendar, DollarSign, TrendingUp, Search, Loader2, FileText, FileSpreadsheet, Users, UserCheck, Gift, Building, Car, Home } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

const ReferralEarnings = () => {
  const { auth, pagination, flash, referrals } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all' // 'all', 'property', 'car'
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [dateFilterActive, setDateFilterActive] = useState(false);

  const user = auth.user;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (e) {
      return 'N/A';
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setLoading(true);

    router.get(route('bookings.referral-earnings'), {
      search: value,
      type: filters.type !== 'all' ? filters.type : null,
      ...getDateParams()
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  // Handle type filter change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFilters({ ...filters, type });
    setLoading(true);

    router.get(route('bookings.referral-earnings'), {
      search: searchTerm,
      type: type !== 'all' ? type : null,
      ...getDateParams()
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  // Get date parameters
  const getDateParams = () => {
    if (dateFilterActive) {
      return {
        start_date: format(dateRange[0].startDate, 'yyyy-MM-dd'),
        end_date: format(dateRange[0].endDate, 'yyyy-MM-dd')
      };
    }
    return {};
  };

  // Apply date filter
  const applyDateFilter = () => {
    setDateFilterActive(true);
    setDatePickerOpen(false);
    setLoading(true);

    router.get(route('bookings.referral-earnings'), {
      search: searchTerm,
      type: filters.type !== 'all' ? filters.type : null,
      ...getDateParams()
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilterActive(false);
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
      }
    ]);
    setLoading(true);

    router.get(route('bookings.referral-earnings'), {
      search: searchTerm,
      type: filters.type !== 'all' ? filters.type : null,
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const data = pagination?.data || referrals || [];
    if (!data || data.length === 0) return { totalEarnings: 0, totalReferrals: 0, averageEarnings: 0 };

    const totalEarnings = data.reduce((sum, referral) => {
      return sum + (parseFloat(referral.referral_profit) || 0);
    }, 0);

    const totalReferrals = data.length;
    const averageEarnings = totalReferrals > 0 ? totalEarnings / totalReferrals : 0;

    return {
      totalEarnings,
      totalReferrals,
      averageEarnings
    };
  };

  const summary = calculateSummary();

  // Generate PDF Report
  const generatePDF = async () => {
    setPdfLoading(true);

    try {
      const response = await axios.get(route('bookings.referral-export'), {
        params: {
          type: filters.type !== 'all' ? filters.type : null,
          ...getDateParams(),
          search: searchTerm
        }
      });

      const data = response.data.data || [];

      if (data.length === 0) {
        alert('No data to export');
        setPdfLoading(false);
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = new Date().toLocaleDateString('en-GB');

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Referral Earnings Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${today}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Referrer: ${user.name} (${user.email})`, pageWidth / 2, 36, { align: 'center' });

      if (dateFilterActive) {
        doc.text(
          `Period: ${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`,
          pageWidth / 2,
          42,
          { align: 'center' }
        );
      }

      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 56);

      doc.setFontSize(11);
      doc.text(`Total Referral Earnings: KES ${summary.totalEarnings.toFixed(2)}`, 14, 66);
      doc.text(`Total Referrals: ${summary.totalReferrals}`, 14, 73);
      doc.text(`Average per Referral: KES ${summary.averageEarnings.toFixed(2)}`, 14, 80);

      // Table
      const columns = [
        "Type",
        "Booking #",
        "Referrer",
        "Referred Guest",
        "Booking Item",
        "Booking Dates",
        "Booking Amount",
        "Referral Percentage",
        "Referral Earnings",
        "Booking Status"
      ];

      const rows = data.map((referral) => [
        referral.type || (referral.booking_type === 'property' ? 'Property Booking' : 'Car Rental'),
        referral.booking_number || 'N/A',
        referral.referrer_name || user.name || 'N/A',
        referral.guest_name || 'N/A',
        referral.item_name || 'N/A',
        referral.booking_type === 'property'
          ? `${format(new Date(referral.start_date || referral.check_in_date), 'MMM dd, yyyy')} - ${format(new Date(referral.end_date || referral.check_out_date), 'MMM dd, yyyy')}`
          : `${format(new Date(referral.start_date), 'MMM dd, yyyy')} - ${format(new Date(referral.end_date), 'MMM dd, yyyy')}`,
        `KES ${parseFloat(referral.booking_amount || 0).toFixed(2)}`,
        `${referral.referral_percentage || 0}%`,
        `KES ${parseFloat(referral.referral_profit || 0).toFixed(2)}`,
        referral.booking_status || 'N/A'
      ]);

      doc.autoTable({
        head: [columns],
        body: rows,
        startY: 90,
        margin: { top: 90, bottom: 20 },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [241, 104, 36], textColor: 255 },
        didDrawPage: function (data) {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(10);
          doc.text(
            "Page " + doc.internal.getNumberOfPages(),
            data.settings.margin.left,
            pageHeight - 10
          );
        }
      });

      doc.save(`referral_earnings_${user.name.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF report');
    } finally {
      setPdfLoading(false);
    }
  };

  // Generate Excel Report
  const generateExcel = async () => {
    setExcelLoading(true);

    try {
      const response = await axios.get(route('bookings.referral-export'), {
        params: {
          type: filters.type !== 'all' ? filters.type : null,
          ...getDateParams(),
          search: searchTerm
        }
      });

      const data = response.data.data || [];

      if (data.length === 0) {
        alert('No data to export');
        setExcelLoading(false);
        return;
      }

      // Prepare data for Excel
      const excelData = data.map((referral) => ({
        'Type': referral.type || (referral.booking_type === 'property' ? 'Property Booking' : 'Car Rental'),
        'Booking Number': referral.booking_number,
        'Referrer Name': referral.referrer_name || user.name,
        'Referrer Email': referral.referrer_email || user.email,
        'Guest Name': referral.guest_name,
        'Guest Email': referral.guest_email,
        'Property/Car Name': referral.item_name,
        'Host/Owner Name': referral.host_name,
        'Start Date': referral.start_date ? format(new Date(referral.start_date), 'yyyy-MM-dd') : '',
        'End Date': referral.end_date ? format(new Date(referral.end_date), 'yyyy-MM-dd') : '',
        'Duration (Days)': referral.duration,
        'Booking Amount (KES)': parseFloat(referral.booking_amount || 0).toFixed(2),
        'Referral Percentage (%)': referral.referral_percentage,
        'Referral Earnings (KES)': parseFloat(referral.referral_profit || 0).toFixed(2),
        'Booking Status': referral.booking_status,
        'Booking Date': referral.booking_date ? format(new Date(referral.booking_date), 'yyyy-MM-dd HH:mm:ss') : ''
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Referral Earnings');

      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `referral_earnings_${user.name.replace(/\s+/g, '_')}_${today}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel report');
    } finally {
      setExcelLoading(false);
    }
  };

  // Get paginated URL with filters
  const getPaginatedUrl = (url) => {
    if (!url) return null;

    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    if (searchTerm) params.set('search', searchTerm);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (dateFilterActive) {
      params.set('start_date', format(dateRange[0].startDate, 'yyyy-MM-dd'));
      params.set('end_date', format(dateRange[0].endDate, 'yyyy-MM-dd'));
    }

    urlObj.search = params.toString();
    return urlObj.toString();
  };

  // Get display data - use pagination.data if available, otherwise use referrals
  const displayData = pagination?.data || referrals || [];

  return (
    <Layout>
      <div className="w-full flex flex-col">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Referral Earnings</h1>
              <p className="text-gray-600 mt-1">Your earnings from referral bookings</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Referral Code: {user.referral_code}</span>
                <span>Share this code to earn more!</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generatePDF}
                disabled={displayData.length === 0 || pdfLoading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 mr-2" />
                )}
                Export PDF
              </button>

              <button
                onClick={generateExcel}
                disabled={displayData.length === 0 || excelLoading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {excelLoading ? (
                  <Loader2 className="h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 mr-2" />
                )}
                Export Excel
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Total Referral Earnings</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    KES {summary.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Gift className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Referrals</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {summary.totalReferrals}
                  </p>
                </div>
                <UserCheck className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Average per Referral</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    KES {summary.averageEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-green-500 text-xl font-bold">Ø</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading referral earnings...</span>
          </div>
        )}

        {/* Referral Earnings Table */}
        {!loading && (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Referred Guest</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Booking Details</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Booking Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Referral %</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Referral Earnings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Booking Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayData.length > 0 ? (
                  displayData.map((referral) => {
                    const isProperty = referral.booking_type === 'property';
                    const status = isProperty ? referral.stay_status : referral.ride_status;
                    const displayStatus = status || referral.booking_status;

                    return (
                      <tr key={`${referral.booking_type}-${referral.booking_id || referral.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isProperty
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {isProperty ? (
                                <>
                                  <Home className="w-3 h-3 mr-1" />
                                  Property
                                </>
                              ) : (
                                <>
                                  <Car className="w-3 h-3 mr-1" />
                                  Car
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{referral.booking_number}</div>
                          <div className="text-sm text-gray-500">Referrer: {referral.referrer_name || user.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{referral.guest_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{referral.guest_email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{referral.item_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {isProperty ? 'Host: ' : 'Owner: '} {referral.host_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>{isProperty ? 'Check-in' : 'Start'}: {formatDate(referral.start_date)}</div>
                            <div className="text-gray-500">{isProperty ? 'Check-out' : 'End'}: {formatDate(referral.end_date)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-700">
                            KES {parseFloat(referral.booking_amount || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {referral.referral_percentage || '0'}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-800 text-lg">
                            KES {parseFloat(referral.referral_profit || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              displayStatus === 'paid' || displayStatus === 'confirmed' || displayStatus === 'checked_in'
                                ? 'bg-green-100 text-green-800'
                                : displayStatus === 'pending' || displayStatus === 'upcoming_ride' || displayStatus === 'upcoming_stay'
                                ? 'bg-yellow-100 text-yellow-800'
                                : displayStatus === 'checked_out'
                                ? 'bg-purple-100 text-purple-800'
                                : displayStatus === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {displayStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(referral.booking_date)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-12 text-gray-500">
                      <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg">No referral earnings found</p>
                      <p className="text-sm mt-2">
                        Your referral earnings will appear here when someone uses your referral code to make a booking.
                      </p>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Your referral code: <span className="font-bold text-blue-600">{user.referral_code}</span></p>
                        <p className="text-sm text-gray-500 mt-2">Share this code with friends to earn {user.company?.booking_referral_percentage || 2}% of their booking value!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && displayData.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              {/* Previous Page */}
              {pagination.prev_page_url ? (
                <Link
                  href={getPaginatedUrl(pagination.prev_page_url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  preserveState
                >
                  Previous
                </Link>
              ) : (
                <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                  Previous
                </span>
              )}

              {/* Page Numbers */}
              {pagination.links?.slice(1, -1).map((link, index) => (
                <Link
                  key={index}
                  href={getPaginatedUrl(link.url)}
                  className={`px-4 py-2 rounded-lg ${
                    link.active
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
                  preserveState
                >
                  {link.label}
                </Link>
              ))}

              {/* Next Page */}
              {pagination.next_page_url ? (
                <Link
                  href={getPaginatedUrl(pagination.next_page_url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  preserveState
                >
                  Next
                </Link>
              ) : (
                <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReferralEarnings;
