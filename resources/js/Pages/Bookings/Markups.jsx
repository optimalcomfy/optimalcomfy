import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Filter, X, Calendar, DollarSign, TrendingUp, Search, Loader2, FileText, FileSpreadsheet, Car, Home } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

const MarkupBookings = () => {
  const { auth, pagination, flash } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
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
  const isMarkupUser = user && user.id;

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setLoading(true);

    router.get(route('bookings.markup'), {
      search: value,
      status: filters.status !== 'all' ? filters.status : null,
      ...getDateParams()
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    const status = e.target.value;
    setFilters({ ...filters, status });
    setLoading(true);

    router.get(route('bookings.markup'), {
      search: searchTerm,
      status: status !== 'all' ? status : null,
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

    router.get(route('bookings.markup'), {
      search: searchTerm,
      status: filters.status !== 'all' ? filters.status : null,
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

    router.get(route('bookings.markup'), {
      search: searchTerm,
      status: filters.status !== 'all' ? filters.status : null,
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

    router.get(route('bookings.markup'), {
      search: searchTerm,
      status: filters.status !== 'all' ? filters.status : null,
      type: filters.type !== 'all' ? filters.type : null,
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!pagination?.data) return { totalEarnings: 0, totalBookings: 0, averageEarnings: 0 };

    const bookings = pagination.data;
    const totalEarnings = bookings.reduce((sum, booking) => {
      return sum + (booking.total_earnings || 0);
    }, 0);

    const totalBookings = bookings.length;
    const averageEarnings = totalBookings > 0 ? totalEarnings / totalBookings : 0;

    return {
      totalEarnings,
      totalBookings,
      averageEarnings
    };
  };

  const summary = calculateSummary();

  // Generate PDF Report
  const generatePDF = async () => {
    setPdfLoading(true);

    try {
      const response = await axios.get(route('bookings.markup-export'), {
        params: {
          status: filters.status !== 'all' ? filters.status : null,
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
      doc.text('Markup Earnings Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${today}`, pageWidth / 2, 30, { align: 'center' });

      if (dateFilterActive) {
        doc.text(
          `Period: ${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`,
          pageWidth / 2,
          36,
          { align: 'center' }
        );
      }

      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 50);

      doc.setFontSize(11);
      doc.text(`Total Earnings: KES ${summary.totalEarnings.toFixed(2)}`, 14, 60);
      doc.text(`Total Bookings: ${summary.totalBookings}`, 14, 67);
      doc.text(`Average per Booking: KES ${summary.averageEarnings.toFixed(2)}`, 14, 74);

      // Table
      const columns = [
        "Type",
        "Booking #",
        "Guest",
        "Property/Car",
        "Start Date",
        "End Date",
        "Duration",
        "Markup/Unit",
        "Total Earnings",
        "Status"
      ];

      const rows = data.map((booking, index) => [
        booking.type,
        booking.booking_number || 'N/A',
        booking.guest_name || 'N/A',
        booking.booking_type === 'property' ? booking.property_name : booking.car_name || 'N/A',
        format(new Date(booking.booking_type === 'property' ? booking.check_in_date : booking.start_date), 'MMM dd, yyyy'),
        format(new Date(booking.booking_type === 'property' ? booking.check_out_date : booking.end_date), 'MMM dd, yyyy'),
        `${booking.duration} ${booking.duration_unit}`,
        `KES`,
        `KES ${booking.total_earnings?.toFixed(2)}`,
        booking.status
      ]);

      doc.autoTable({
        head: [columns],
        body: rows,
        startY: 80,
        margin: { top: 80, bottom: 20 },
        styles: { fontSize: 9, cellPadding: 2 },
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

      doc.save(`markup_earnings_${today}.pdf`);
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
      const response = await axios.get(route('bookings.markup-export'), {
        params: {
          status: filters.status !== 'all' ? filters.status : null,
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

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Markup Earnings');

      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `markup_earnings_${today}.xlsx`);
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
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (dateFilterActive) {
      params.set('start_date', format(dateRange[0].startDate, 'yyyy-MM-dd'));
      params.set('end_date', format(dateRange[0].endDate, 'yyyy-MM-dd'));
    }

    urlObj.search = params.toString();
    return urlObj.toString();
  };

  if (!isMarkupUser) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Markup Access</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have access to markup earnings.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full flex flex-col">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Markup Earnings</h1>
              <p className="text-gray-600 mt-1">Your earnings from markup bookings</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generatePDF}
                disabled={pagination?.data?.length === 0 || pdfLoading}
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
                disabled={pagination?.data?.length === 0 || excelLoading}
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    KES {summary.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Bookings</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {summary.totalBookings}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Average per Booking</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    KES {summary.averageEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-purple-500 text-xl font-bold">Ø</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading markup earnings...</span>
          </div>
        )}

        {/* Bookings Table */}
        {!loading && (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Property/Car</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Markup/Unit</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Earnings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagination?.data?.length > 0 ? (
                  pagination.data.map((booking) => {
                    const isProperty = booking.booking_type === 'property';
                    const status = isProperty ? booking.stay_status : booking.ride_status;
                    const itemName = isProperty
                      ? booking.property?.property_name
                      : booking.car?.name;
                    const hostName = isProperty
                      ? booking.property?.user?.name
                      : booking.car?.user?.name;
                    const durationText = `${booking.duration} ${booking.duration_type}`;

                    return (
                      <tr key={`${booking.booking_type}-${booking.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isProperty
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {isProperty ? 'Property' : 'Car'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{booking.number}</div>
                          <div className="text-sm text-gray-500">Guest: {booking.user?.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{itemName}</div>
                          <div className="text-sm text-gray-500">Host: {hostName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>{isProperty ? 'Check-in' : 'Start'}: {formatDate(booking.start_date)}</div>
                            <div className="text-gray-500">{isProperty ? 'Check-out' : 'End'}: {formatDate(booking.end_date)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-nowrap rounded-full text-sm font-medium">
                            {durationText}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-green-700">
                            KES {booking.markup_profit?.toFixed(2) || '0.00'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-800 text-lg">
                            KES {booking.total_earnings?.toFixed(2) || '0.00'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'paid' || booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.status === 'checked_in'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.status === 'checked_out'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg">No markup bookings found</p>
                      <p className="text-sm mt-2">Your markup earnings will appear here when you have markup bookings.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.data?.length > 0 && (
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
              {pagination.links.slice(1, -1).map((link, index) => (
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

export default MarkupBookings;
