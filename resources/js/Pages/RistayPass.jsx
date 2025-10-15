import React, { useState, useRef } from 'react';
import { Head, usePage } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import { Calendar, Home, User, Download, Eye, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const RistayPass = () => {
  const [currentView, setCurrentView] = useState('main');
  const { booking } = usePage().props;
  const passRef = useRef(null);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const [passData] = useState({
    houseNumber: booking.property.house_number || 'Not specified',
    checkIn: formatDate(booking.check_in_date),
    checkOut: formatDate(booking.check_out_date),
    confirmationCode: booking.number,
    guestName: booking.user.name,
    idType: 'National ID',
    idNumber: '12345678',
    propertyName: booking.property.property_name,
    location: booking.property.location,
    price: booking.total_price,
    status: booking.status,
    maxGuests: booking.property.max_guests,
    maxAdults: booking.property.max_adults,
    maxChildren: booking.property.max_children,
    wifiName: booking.property.wifi_name,
    wifiPassword: booking.property.wifi_password,
    emergencyContact: booking.property.emergency_contact,
    keyLocation: booking.property.key_location,
    cook: booking.property.cook,
    cleaner: booking.property.cleaner
  });

  // Generate QR Code data
  const generateQRData = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/bookings/${booking.id}`;
  };

  // Print functionality - optimized for single page
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const passElement = passRef.current;

    if (passElement && printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ristay Gate Pass</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 15px;
              font-size: 12px;
              line-height: 1.3;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              border-bottom: 3px solid #0f766e;
              padding-bottom: 15px;
            }
            .logo {
              background-color: #f97316;
              color: white;
              width: 40px;
              height: 40px;
              border-radius: 8px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 20px;
              margin-bottom: 8px;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              color: #0f766e;
              margin: 8px 0;
            }
            .subtitle {
              font-size: 14px;
              color: #6b7280;
            }
            .content {
              display: flex;
              gap: 20px;
              margin: 20px 0;
            }
            .qr-section {
              flex: 1;
              text-align: center;
            }
            .qr-container {
              background-color: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 15px;
            }
            .details-section {
              flex: 2;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .detail-item {
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 1px dotted #e5e7eb;
            }
            .label {
              color: #6b7280;
              font-weight: 500;
              font-size: 11px;
            }
            .value {
              font-weight: 600;
              font-size: 11px;
            }
            .full-width {
              grid-column: 1 / -1;
            }
            .footer {
              text-align: center;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 2px solid #e5e7eb;
              font-size: 10px;
              color: #6b7280;
            }
            .important-note {
              background-color: #fffbeb;
              border: 1px solid #f59e0b;
              padding: 12px;
              border-radius: 6px;
              margin-top: 15px;
              font-size: 11px;
              text-align: center;
            }
            @media print {
              body {
                padding: 0;
              }
              .content {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">R</div>
            <div class="title">RISTAY GATE PASS</div>
            <div class="subtitle">Your Digital Access Card</div>
          </div>

          <div class="content">
            <div class="qr-section">
              <div class="qr-container">
                ${passElement.querySelector('.qr-code-container').innerHTML}
              </div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 8px;">
                Scan for verification
              </div>
            </div>

            <div class="details-section">
              <div class="details-grid">
                <div class="detail-item full-width">
                  <div class="label">GUEST NAME</div>
                  <div class="value">${passData.guestName}</div>
                </div>

                <div class="detail-item">
                  <div class="label">PROPERTY</div>
                  <div class="value">${passData.propertyName}</div>
                </div>

                <div class="detail-item">
                  <div class="label">CONFIRMATION CODE</div>
                  <div class="value">${passData.confirmationCode}</div>
                </div>

                <div class="detail-item">
                  <div class="label">CHECK-IN</div>
                  <div class="value">${passData.checkIn}</div>
                </div>

                <div class="detail-item">
                  <div class="label">CHECK-OUT</div>
                  <div class="value">${passData.checkOut}</div>
                </div>

                <div class="detail-item full-width">
                  <div class="label">LOCATION</div>
                  <div class="value">${passData.location}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="important-note">
            <strong>Important:</strong> Present this pass at the gate for entry verification.
            Keep this pass with you during your entire stay.
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}<br>
            <strong>Ristay</strong> - Your Home Away From Home
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  };

  // Download functionality - optimized for single page
  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      if (passRef.current) {
        // Clone and prepare element for capture
        const clonedElement = passRef.current.cloneNode(true);

        // Remove interactive elements
        const buttonsContainer = clonedElement.querySelector('.buttons-container');
        const backButton = clonedElement.querySelector('.back-button');
        if (buttonsContainer) buttonsContainer.remove();
        if (backButton) backButton.remove();

        // Add styles for PDF
        clonedElement.style.width = '210mm';
        clonedElement.style.padding = '20px';
        clonedElement.style.backgroundColor = '#ffffff';

        // Temporarily add to DOM
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '0';
        document.body.appendChild(clonedElement);

        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: clonedElement.scrollWidth,
          height: clonedElement.scrollHeight,
          windowWidth: clonedElement.scrollWidth,
          windowHeight: clonedElement.scrollHeight
        });

        // Clean up
        document.body.removeChild(clonedElement);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a5');
        const pdfWidth = 150;
        const pdfHeight = 180;

        // Calculate dimensions to fit on single page
        const imgWidth = pdfWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center vertically if content is smaller than page
        const yPosition = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
        pdf.save(`ristay-pass-${passData.confirmationCode}.pdf`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to print
      alert('Download failed. Using print option instead.');
      handlePrint();
    }
  };

  // Alternative download as image - optimized
  const handleDownloadImage = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;

      if (passRef.current) {
        const clonedElement = passRef.current.cloneNode(true);

        // Remove interactive elements
        const buttonsContainer = clonedElement.querySelector('.buttons-container');
        const backButton = clonedElement.querySelector('.back-button');
        if (buttonsContainer) buttonsContainer.remove();
        if (backButton) backButton.remove();

        // Optimize for image capture
        clonedElement.style.width = '800px';
        clonedElement.style.padding = '40px';
        clonedElement.style.backgroundColor = '#ffffff';

        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        document.body.appendChild(clonedElement);

        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: clonedElement.scrollWidth,
          height: clonedElement.scrollHeight
        });

        document.body.removeChild(clonedElement);

        const link = document.createElement('a');
        link.download = `ristay-pass-${passData.confirmationCode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Image download failed:', error);
      alert('Image download failed. Please try the PDF option.');
    }
  };

  // Rest of your component views remain the same...
  const MainDashboard = () => (
    <div className="p-4">
      <Head title="Ristay Pass" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button onClick={() => setCurrentView('bookings')} className="bg-white p-6 rounded-2xl shadow border hover:shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-teal-800">Bookings</h2>
            <Calendar className="text-teal-600" size={24} />
          </div>
        </button>

        <button onClick={() => setCurrentView('pass')} className="bg-white p-6 rounded-2xl shadow border hover:shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-teal-800">Ristay Pass</h2>
              <p className="text-gray-600 text-sm">View & Download</p>
            </div>
          </div>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-orange-500 p-3 rounded-xl">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="text-2xl font-semibold text-teal-800">Ristay Pass</h2>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <Home className="text-teal-600" size={20} />
            <span className="text-gray-700">Property: <strong>{passData.propertyName}</strong></span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="text-teal-600" size={20} />
            <div>
              <div className="text-gray-700">Check-in: <strong>{passData.checkIn}</strong></div>
              <div className="text-gray-700">Check-out: <strong>{passData.checkOut}</strong></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <User className="text-teal-600" size={20} />
            <span className="text-gray-700">Confirmation Code: <strong>{passData.confirmationCode}</strong></span>
          </div>
        </div>

        <button onClick={() => setCurrentView('fullPass')} className="w-full bg-teal-800 text-white py-3 rounded-xl font-medium hover:bg-teal-900">
          View Pass
        </button>
      </div>
    </div>
  );

  const BookingsView = () => (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow border p-6 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-teal-800">My Bookings</h1>
          <button onClick={() => setCurrentView('main')} className="text-teal-600 hover:text-teal-800">← Back</button>
        </div>

        <div className="border rounded-xl p-4 bg-green-50 border-green-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-teal-800">{passData.propertyName}</h3>
              <p className="text-sm text-gray-600">{passData.checkIn} - {passData.checkOut}</p>
              <p className="text-sm text-gray-600">{passData.location}</p>
            </div>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {passData.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Code: {passData.confirmationCode}</p>
            <p className="text-sm font-semibold">KSh {passData.price}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PassView = () => (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow border p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-teal-800">Pass Management</h1>
          <button onClick={() => setCurrentView('main')} className="text-teal-600 hover:text-teal-800">← Back</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => setCurrentView('fullPass')} className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-gray-50">
            <Eye className="text-teal-600" size={24} />
            <div>
              <h3 className="font-semibold text-teal-800">View Pass</h3>
              <p className="text-sm text-gray-600">Display QR code for entry</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const FullPassView = () => (
    <div className="p-4">
      <div ref={passRef} className="bg-white rounded-2xl shadow border p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6 back-button">
          <h1 className="text-xl font-semibold text-teal-800">Gate Pass</h1>
          <button onClick={() => setCurrentView('pass')} className="text-teal-600 hover:text-teal-800">← Back</button>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block mb-6 text-center">
          <h1 className="text-2xl font-bold text-teal-800">Ristay Gate Pass</h1>
        </div>

        <div className="bg-gray-100 h-48 rounded-xl mb-6 flex items-center justify-center qr-code-container">
          <QRCodeSVG
            value={generateQRData()}
            size={128}
            level="M"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Guest:</span><span>{passData.guestName}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Property:</span><span>{passData.propertyName}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Location:</span><span>{passData.location}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Check-in:</span><span>{passData.checkIn}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Check-out:</span><span>{passData.checkOut}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Code:</span><span>{passData.confirmationCode}</span></div>
        </div>

        <div className="mt-6 space-y-2 buttons-container">
          <button onClick={handlePrint} className="w-full bg-teal-800 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <Printer size={20} /> Print Receipt
          </button>
          <button onClick={handleDownload} className="w-full border border-teal-800 text-teal-800 py-2 rounded-lg flex items-center justify-center gap-2">
            <Download size={20} /> Download PDF
          </button>
          <button onClick={handleDownloadImage} className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2">
            <Download size={20} /> Download Image
          </button>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'bookings':
        return <BookingsView />;
      case 'pass':
        return <PassView />;
      case 'fullPass':
        return <FullPassView />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl">
        {renderView()}
      </div>
    </Layout>
  );
};

export default RistayPass;
