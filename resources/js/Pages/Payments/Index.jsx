import React, { useState } from 'react';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';
import { Filter, X, FileText, FileSpreadsheet, Calendar, Loader2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import * as XLSX from 'xlsx';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const IndexPayments = () => {
  const { payments, pagination, flash, auth } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  // Date range state
  const getInitialDateRange = () => {
    const now = new Date();
    return { range: [{ startDate: startOfMonth(now), endDate: endOfMonth(now), key: 'selection' }], active: false };
  };

  const initialDateInfo = getInitialDateRange();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState(initialDateInfo.range);
  const [dateFilterActive, setDateFilterActive] = useState(initialDateInfo.active);

  const {
    delete: destroy,
  } = useForm();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLoading(true);

    router.get(route('payments.index'), { 
      search: e.target.value,
      ...getDateParams()
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const getDateParams = () => {
    return {
      start_date: format(dateRange[0].startDate, 'yyyy-MM-dd'),
      end_date: format(dateRange[0].endDate, 'yyyy-MM-dd')
    };
  };

  const applyDateFilter = () => {
    setLoading(true);
    setDateFilterActive(true);
    setDatePickerOpen(false);
    
    router.get(route('payments.index'), {
      search: searchTerm,
      ...getDateParams()
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const clearDateFilter = () => {
    setDateFilterActive(false);
    setLoading(true);
    
    router.get(route('payments.index'), {
      search: searchTerm
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const getCurrentFilters = (includeDates = dateFilterActive) => {
    const filters = { search: searchTerm };
    if (includeDates) {
        const start = dateRange[0].startDate;
        const end = dateRange[0].endDate;
        if (start && end && isValid(start) && isValid(end)) {
            filters.start_date = format(start, 'yyyy-MM-dd');
            filters.end_date = format(end, 'yyyy-MM-dd');
        }
    }
    return filters;
  };

  const generatePDF = async () => {
    setPdfLoading(true);

    const exportFilters = getCurrentFilters(dateFilterActive);

    try {
      const response = await axios.get(route('payments.exportData'), {
          params: exportFilters 
      });

      const allData = response.data; 

      if (!Array.isArray(allData)) {
         throw new Error("Invalid data received from server.");
      }

      if (allData.length === 0) {
        toast.error("No payments found matching the selected criteria for the PDF export.", { duration: 4000, position: 'top-center' });
        setPdfLoading(false);
        return;
      }

      const logoImg = new Image();
      logoImg.src = '/image/logo/logo.png'; 

      logoImg.onload = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const today = new Date().toLocaleDateString('en-GB', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        let dateRangeText = "Date Range: Current Month"; 
        if (exportFilters.start_date && exportFilters.end_date) {
            try {
                 dateRangeText = `Date Range: ${format(new Date(exportFilters.start_date + 'T00:00:00'), 'MMM dd, yyyy')} - ${format(new Date(exportFilters.end_date + 'T00:00:00'), 'MMM dd, yyyy')}`;
            } catch (e) { dateRangeText = "Date Range: Specified"; }
        }

        doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("Payments Report", pageWidth / 2, 35, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(dateRangeText, pageWidth / 2, 43, { align: 'center' }); 
        doc.text(`Generated on: ${today}`, pageWidth / 2, 50, { align: 'center' });

        const columns = ["#", "User", "Amount", "Method", "Status", "Transaction Date", "MPESA Receipt"];
        const rows = allData.map((data, index) => {
          return [
            index + 1,
            data.user_name || 'N/A',
            data.amount,
            data.method ? data.method.charAt(0).toUpperCase() + data.method.slice(1) : 'N/A',
            data.status || 'N/A',
            data.created_at ? format(new Date(data.created_at), 'MMM dd, yyyy HH:mm') : 'N/A',
            data.mpesa_receipt || 'N/A'
          ];
        });

        doc.autoTable({
          head: [columns],
          body: rows,
          startY: 58, 
          margin: { top: 58, bottom: 20 },
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [241, 104, 36], textColor: 255, halign: 'center' },
          didDrawPage: function (data) {
            const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
            doc.setFontSize(10);
            doc.text("Page " + doc.internal.getNumberOfPages(), data.settings.margin.left, pageHeight - 10);
          }
        });

        const datePart = exportFilters.start_date ? `${exportFilters.start_date}_to_${exportFilters.end_date}` : 'current_month';
        doc.save(`payments_report_${datePart}.pdf`);
      };

      logoImg.onerror = () => {
        toast.error("Error loading logo for PDF. PDF generation aborted.", { duration: 4000, position: 'top-center' });
      };

    } catch (error) {
        let message = "An error occurred while generating the PDF.";
        if (error.response) {
            message = `Error ${error.response.status}: ${error.response.data?.error || 'Could not fetch report data.'}`;
        } else if (error.request) {
             message = "No response from server. Please check network connection.";
        } else if (error.message) {
            message = error.message;
        }
        toast.error(message, { duration: 4000, position: 'top-center' });
    } finally {
         setPdfLoading(false);
    }
  };

  const generateExcel = async () => {
    setExcelLoading(true);
    const exportFilters = getCurrentFilters(dateFilterActive);

    try {
        const response = await axios.get(route('payments.exportData'), {
            params: exportFilters
        });

        const allData = response.data;
        if (!Array.isArray(allData)) {
            throw new Error("Invalid data received from server.");
        }

        if (allData.length === 0) {
            toast.error("No payments found matching the selected criteria for the Excel export.", { duration: 4000, position: 'top-center' });
            return;
        }

        const ws = XLSX.utils.json_to_sheet(allData.map((data, index) => {
          return {
            "#": index + 1,
            "User": data.user_name || 'N/A',
            "Amount": data.amount,
            "Method": data.method ? data.method.charAt(0).toUpperCase() + data.method.slice(1) : 'N/A',
            "Status": data.status || 'N/A',
            "Transaction Date": data.created_at ? format(new Date(data.created_at), 'MMM dd, yyyy HH:mm') : 'N/A',
            "MPESA Receipt": data.mpesa_receipt || 'N/A',
            "Payment Date": data.created_at ? new Date(data.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'N/A'
          };
        }));        

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payments');

        const datePart = exportFilters.start_date ? `${exportFilters.start_date}_to_${exportFilters.end_date}` : 'current_month';
        XLSX.writeFile(wb, `payments_report_${datePart}.xlsx`);

    } catch (error) {
        let message = "An error occurred while generating the Excel.";
        if (error.response) {
            message = `Error ${error.response.status}: ${error.response.data?.error || 'Could not fetch report data.'}`;
        } else if (error.request) {
            message = "No response from server. Please check network connection.";
        } else if (error.message) {
            message = error.message;
        }
        toast.error(message, { duration: 4000, position: 'top-center' });
    } finally {
        setExcelLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (paymentId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        destroy(route('payments.destroy', paymentId), {
          onSuccess: () => {
            // Optionally handle success
          },
          onError: (err) => {
            console.error('Delete error:', err);
          },
        });
      }
    });
  };

  const getPaginatedUrl = (url) => {
    if (!url) return null;
    
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    // Add search term if it exists
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    // Add date filters if they're active
    if (dateFilterActive) {
      params.set('start_date', format(dateRange[0].startDate, 'yyyy-MM-dd'));
      params.set('end_date', format(dateRange[0].endDate, 'yyyy-MM-dd'));
    }
    
    // Reconstruct the URL with all parameters
    urlObj.search = params.toString();
    return urlObj.toString();
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full">
        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {mobileFiltersOpen ? (
              <>
                <X className="w-5 h-5 mr-2" /> Close Filters
              </>
            ) : (
              <>
                <Filter className="w-5 h-5 mr-2" /> Open Filters
              </>
            )}
          </button>
        </div>

        {/* Top Section - Responsive */}
        <div className={`
          ${mobileFiltersOpen ? 'block' : 'hidden'} 
          lg:block bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4
        `}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900 w-full sm:w-auto my-auto">
              Payments
            </h1>
            
            <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
              <button
                onClick={generatePDF}
                disabled={pagination.data?.length === 0}
                className="flex cursor-pointer items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
              >
                  {pdfLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 my-auto animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2 my-auto" />
                  )}
                  <span className='my-auto'>
                    {pdfLoading ? 'Generating...' : 'PDF (All)'}
                  </span>
              </button>
              
              <button
                onClick={generateExcel}
                disabled={pagination.data?.length === 0}
                className="inline-flex cursor-pointer items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
              >
                  {excelLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 my-auto animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-2 my-auto" />
                  )}
                  <span className='my-auto'>
                    {excelLoading ? 'Generating...' : 'Excel (All)'}
                  </span>
              </button>
            </div>
          </div>

          {/* Search and Date Range Controls */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search payments..."
              />
              {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setDatePickerOpen(!datePickerOpen)}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                <span>
                  {dateFilterActive 
                    ? `${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`
                    : 'Date Range Filter'
                  }
                </span>
                <Calendar className="w-5 h-5 text-gray-500" />
              </button>
              
              {dateFilterActive && (
                <button
                  onClick={clearDateFilter}
                  className="absolute right-10 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              {datePickerOpen && (
                <div className="absolute mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <DateRange
                    editableDateInputs={true}
                    onChange={item => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    rangeColors={['#3b82f6']}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => setDatePickerOpen(false)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyDateFilter}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      
        {/* Flash Message */}
        {flash?.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
            <strong className="font-semibold">Success: </strong>
            {flash.success}
          </div>
        )}

        {/* Date Filter Indicator */}
        {dateFilterActive && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center justify-between">
            <span>
              <strong className="font-semibold">Date Filter: </strong>
              {format(dateRange[0].startDate, 'MMMM dd, yyyy')} to {format(dateRange[0].endDate, 'MMMM dd, yyyy')}
            </span>
            <button 
              onClick={clearDateFilter}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Payments Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagination.data?.length > 0 ? (
                pagination.data.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-wrap">{payment.user?.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-wrap">KES {formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 whitespace-wrap capitalize">{payment.method}</td>
                    <td className="px-6 py-4 whitespace-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-wrap">
                      {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-wrap">{payment.reference || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-wrap text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={route('payments.show', payment.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="my-6 overflow-x-auto flex justify-center">
            <div className="flex items-center gap-2">
              {/* Previous Page Link */}
              {pagination.prev_page_url ? (
                <Link
                  href={getPaginatedUrl(pagination.prev_page_url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
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
              {pagination.links.map((link, index) => (
                <React.Fragment key={index}>
                  {link.url ? (
                    <Link
                      href={getPaginatedUrl(link.url)}
                      className={`px-4 py-2 rounded-lg ${
                        link.active
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      }`}
                      preserveState
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </Link>
                  ) : (
                    <span
                      className={`px-4 py-2 rounded-lg ${
                        link.active
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-400'
                      }`}
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </span>
                  )}
                </React.Fragment>
              ))}

              {/* Next Page Link */}
              {pagination.next_page_url ? (
                <Link
                  href={getPaginatedUrl(pagination.next_page_url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
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

export default IndexPayments;