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

  // Generate QR Code data - you can customize this URL structure
  const generateQRData = () => {
    // Option 1: Link to booking verification page
    const baseUrl = window.location.origin;
    return `${baseUrl}/bookings/${booking.id}`;
  };

  // Print functionality
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
              size: 80mm auto;
              margin: 5mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              width: 70mm;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              border-bottom: 2px solid #0f766e;
              padding-bottom: 10px;
            }
            .logo {
              background-color: #f97316;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 6px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              color: #0f766e;
              margin: 5px 0;
            }
            .qr-container {
              text-align: center;
              margin: 15px 0;
              padding: 10px;
              background-color: #f3f4f6;
              border-radius: 8px;
            }
            .qr-code {
              margin: 0 auto;
            }
            .details {
              margin-top: 15px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              border-bottom: 1px dotted #ccc;
              padding-bottom: 4px;
            }
            .label {
              color: #6b7280;
              font-weight: 500;
            }
            .value {
              font-weight: 600;
              text-align: right;
              max-width: 60%;
              word-wrap: break-word;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
              color: #6b7280;
            }
            .important {
              background-color: #fef3c7;
              padding: 8px;
              border-radius: 4px;
              margin-top: 10px;
              font-size: 10px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">R</div>
            <div class="title">RISTAY GATE PASS</div>
          </div>
          
          <div class="qr-container">
            <div class="qr-code">
              ${passElement.querySelector('.qr-code-container').innerHTML}
            </div>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Guest:</span>
              <span class="value">${passData.guestName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Property:</span>
              <span class="value">${passData.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${passData.location}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check-in:</span>
              <span class="value">${passData.checkIn}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check-out:</span>
              <span class="value">${passData.checkOut}</span>
            </div>
            <div class="detail-row">
              <span class="label">Code:</span>
              <span class="value">${passData.confirmationCode}</span>
            </div>
          </div>
          
          <div class="important">
            Present this pass at the gate for entry verification
          </div>
          
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()}<br>
            Ristay - Your Home Away From Home
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  };

  // Download functionality - using html2canvas and jsPDF
  const handleDownload = async () => {
    try {
      // Import libraries dynamically
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      if (passRef.current) {
        // Clone the element and remove buttons
        const clonedElement = passRef.current.cloneNode(true);
        
        // Remove buttons and back button from cloned element
        const buttonsContainer = clonedElement.querySelector('.buttons-container');
        const backButton = clonedElement.querySelector('.back-button');
        if (buttonsContainer) buttonsContainer.remove();
        if (backButton) backButton.remove();
        
        // Temporarily add cloned element to DOM for capture
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        document.body.appendChild(clonedElement);

        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        // Remove cloned element
        document.body.removeChild(clonedElement);
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`ristay-pass-${passData.confirmationCode}.pdf`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open print dialog
      alert('Download failed. Please use the print option instead.');
      handlePrint();
    }
  };

  // Alternative download as image
  const handleDownloadImage = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      if (passRef.current) {
        // Clone the element and remove buttons
        const clonedElement = passRef.current.cloneNode(true);
        
        // Remove buttons and back button from cloned element
        const buttonsContainer = clonedElement.querySelector('.buttons-container');
        const backButton = clonedElement.querySelector('.back-button');
        if (buttonsContainer) buttonsContainer.remove();
        if (backButton) backButton.remove();
        
        // Temporarily add cloned element to DOM for capture
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        document.body.appendChild(clonedElement);
        
        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        // Remove cloned element
        document.body.removeChild(clonedElement);
        
        const link = document.createElement('a');
        link.download = `ristay-pass-${passData.confirmationCode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Image download failed:', error);
      alert('Download failed. Please try again or use the print option.');
    }
  };

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

      {/* Remove the old print styles as we're now using a new window for printing */}
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