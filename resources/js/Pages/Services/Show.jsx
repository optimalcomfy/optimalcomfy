import React from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';

const ShowService = ({ service }) => {

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
        destroy(route('services.destroy', roomId), {
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
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Service Details</h1>
        <p><strong>Name:</strong> {service.name}</p>
        <p><strong>Description:</strong> {service.description}</p>
        <p><strong>Price:</strong> KES {service.price}</p>
        <img src={`/storage/${service?.image}`} alt={service.name} className="w-64 h-40 object-cover mt-4" />

        <div className="flex justify-between w-full mt-4">
          <Link 
            href={route("services.index")} 
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="flex items-center min-w-[250px]">Back to All Services</span>
          </Link>

          {roleId === 1 &&
          <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDelete(service.id); 
              }}
              className="inline"
            >
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                Delete
              </button>

          </form>}
        </div>

      </div>
    </Layout>
  );
};

export default ShowService;
