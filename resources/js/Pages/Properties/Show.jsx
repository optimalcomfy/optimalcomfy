import React, { useState } from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import Gallery from "./components/Gallery";
import Amenity from "./components/Amenity";
import Service from "./components/Service";
import Feature from "./components/Feature";
import Swal from 'sweetalert2';
import Map from "./components/Map";

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
        // Use Inertia.delete for making the delete request
        destroy(route('properties.destroy', propertyId), {
          onSuccess: () => {
            // Optionally you can handle success actions here
          },
          onError: (err) => {
            console.error('Delete error:', err);
          },
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 capitalize">{property.property_name}</h1>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                property.status === 'Available' ? 'bg-green-100 text-green-800' : 
                property.status === 'Occupied' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {property.status}
              </span>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "details"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Property Details
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "gallery"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Photo Gallery
              </button>
              <button
                onClick={() => setActiveTab("amenity")}
                className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "amenity"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Amenities
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "map"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Map
              </button>
            </nav>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">Property Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-4">
                      <span className="text-gray-600">Property Name</span>
                      <span className="font-medium text-gray-800">{property.property_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-4">
                      <span className="text-gray-600">Property Type</span>
                      <span className="font-medium text-gray-800">{property.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-4">
                      <span className="text-gray-600">Maximum Adults</span>
                      <span className="font-medium text-gray-800">{property.max_adults}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 gap-4">
                      <span className="text-gray-600">Maximum Children</span>
                      <span className="font-medium text-gray-800">{property.max_children}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">Pricing</h2>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Price per night</p>
                    <p className="text-4xl font-bold text-blue-600">KES {property.price_per_night}</p>
                    <p className="text-gray-500 text-sm mt-2">Exclusive of taxes and fees</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "gallery" && (
            <Gallery property={property} />
          )}

          {activeTab === "amenity" && (
            <Amenity property={property} amenities={amenities} />
          )}

          {activeTab === "map" && (
            <Map property={property} />
          )}

          <div className="flex justify-between w-full mt-4">
            <Link 
              href={route("properties.index")} 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="flex items-center min-w-[250px]">Back to All Properties</span>
            </Link>

            {roleId === 1 &&
            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDelete(property.id); 
                }}
                className="inline"
              >
                <button type="submit" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                  Delete
                </button>

            </form>}
          </div>
        </div>
      </div>
      
      
    </Layout>
  );
};

export default ShowProperty;