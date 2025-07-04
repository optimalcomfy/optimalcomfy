import React, { useState } from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import Gallery from "./components/Gallery";
import Amenity from "./components/Amenity";
import Service from "./components/Service";
import Feature from "./components/Feature";
import Swal from 'sweetalert2';
import Map from "./components/Map";
import Variation from "./components/Variation";

const ShowProperty = ({ property }) => {
  const [activeTab, setActiveTab] = useState("details");
  const { delete: destroy } = useForm();

  const { auth, amenities } = usePage().props;
  const roleId = parseInt(auth.user?.role_id);

  const handleDelete = (propertyId) => {
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
        destroy(route('properties.destroy', propertyId), {
          onSuccess: () => {},
          onError: (err) => {
            console.error('Delete error:', err);
          },
        });
      }
    });
  };

  return (
    <Layout>
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden mx-2 sm:mx-auto md:mx-0 sm:max-w-5xl">
        <div className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
            <h1 className="text-xl sm:text-3xl font-semibold text-gray-800 capitalize break-words">
              {property.property_name}
            </h1>
            <div className="bg-blue-50 px-3 py-1 sm:px-4 sm:py-2 rounded-lg">
              <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                property.status === 'Available' ? 'bg-green-100 text-green-800' : 
                property.status === 'Occupied' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {property.status}
              </span>
            </div>
          </div>
          
          {/* Tab Navigation - Scrollable on mobile */}
          <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
            <nav className="flex space-x-2 sm:space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-3 py-2 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === "details"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Stay Details
              </button>
              <button
                onClick={() => setActiveTab("variations")}
                className={`px-3 py-2 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === "variations"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Variations
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`px-3 py-2 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === "gallery"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab("amenity")}
                className={`px-3 py-2 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === "amenity"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Amenities
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-3 py-2 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === "map"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setActiveTab("lock")}
                className={`px-3 py-2 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === "lock"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Lock box
              </button>
            </nav>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Stay Information</h2>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Property Name</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800 break-words">{property.property_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Property Type</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Max Adults</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.max_adults}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Max Children</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.max_children}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                  <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Pricing</h2>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-500">Price per night</p>
                    <p className="text-2xl sm:text-4xl font-bold text-blue-600">KES {property.price_per_night}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Exclusive of taxes and fees</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lock" && (
            <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Lock box details</h2>
                  <div className="space-y-2 sm:space-y-3">
                     <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Wifi name</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800 break-all">{property.wifi_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Wifi password</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800 break-all">{property.wifi_password}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Cook</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.cook}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Cleaner</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.cleaner}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Emergency contact</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.emergency_contact}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Key location</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.key_location}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Apartment name</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.apartment_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Block</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.block}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">House number</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.house_number}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
                      <span className="text-sm sm:text-base text-gray-600">Lock box location</span>
                      <span className="text-sm sm:text-base font-medium text-gray-800">{property.lock_box_location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "variations" && <Variation property={property} />}
          {activeTab === "gallery" && <Gallery property={property} />}
          {activeTab === "amenity" && <Amenity property={property} amenities={amenities} />}
          {activeTab === "map" && <Map property={property} />}

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center w-full mt-4 gap-3 sm:gap-0">
            <Link 
              href={route("properties.index")} 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to All Stays</span>
            </Link>

            {roleId === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDelete(property.id); 
                }}
                className="inline"
              >
                <button 
                  type="submit" 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-sm sm:text-base"
                >
                  Delete
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShowProperty;