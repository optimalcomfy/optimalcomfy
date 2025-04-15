import React, { useState } from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import Gallery from "./components/Gallery";
import Amenity from "./components/Amenity";
import Service from "./components/Service";
import Feature from "./components/Feature";
import Swal from 'sweetalert2';

const ShowRoom = ({ room }) => {
  const [activeTab, setActiveTab] = useState("details");
  const { delete: destroy } = useForm();

  const { auth } = usePage().props;
  const roleId = auth.user?.role_id;

  const handleDelete = (roomId) => {
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
        destroy(route('rooms.destroy', roomId), {
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
            <h1 className="text-3xl font-semibold text-gray-800">Room {room.room_number}</h1>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                room.status === 'Available' ? 'bg-green-100 text-green-800' : 
                room.status === 'Occupied' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {room.status}
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
                Room Details
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
                onClick={() => setActiveTab("service")}
                className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "service"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Services
              </button>

              <button
                onClick={() => setActiveTab("feature")}
                className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "feature"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                Features
              </button>
            </nav>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">Room Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Room Number</span>
                      <span className="font-medium text-gray-800">{room.room_number}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Room Type</span>
                      <span className="font-medium text-gray-800">{room.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Maximum Guests</span>
                      <span className="font-medium text-gray-800">{room.max_guests}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">Pricing</h2>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Price per night</p>
                    <p className="text-4xl font-bold text-blue-600">KES {room.price_per_night}</p>
                    <p className="text-gray-500 text-sm mt-2">Exclusive of taxes and fees</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "gallery" && (
            <Gallery room={room} />
          )}

          {activeTab === "amenity" && (
            <Amenity room={room} />
          )}

          {activeTab === "service" && (
            <Service room={room} />
          )}

          {activeTab === "feature" && (
            <Feature room={room} />
          )}

          <div className="flex justify-between w-full mt-4">
            <Link 
              href={route("rooms.index")} 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="flex items-center min-w-[250px]">Back to All Rooms</span>
            </Link>

            {roleId === 1 &&
            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDelete(room.id); 
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

export default ShowRoom;