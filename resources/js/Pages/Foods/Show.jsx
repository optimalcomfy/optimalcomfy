import React from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';

const FoodShow = () => {
  const { food } = usePage().props;

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
        destroy(route('foods.destroy', roomId), {
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
      <div className="max-w-3xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-4">Food Details</h1>

        {/* Food Information */}
        <div className="space-y-4">
          <p><strong>Name:</strong> {food.name}</p>
          <p><strong>Description:</strong> {food.description}</p>
          <p><strong>Price:</strong> ${food.price}</p>
          <p><strong>Category:</strong> {food.category}</p>
          <img src={`/storage/${food?.image}`} alt={food.name} className="w-64 h-40 object-cover mt-4" />
        </div>

        {/* Order Items (if applicable) */}
        {food.food_order_items && food.food_order_items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Orders Containing this Food</h2>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Order ID</th>
                  <th className="px-4 py-2 border">Quantity</th>
                  <th className="px-4 py-2 border">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {food.food_order_items.map((orderItem) => (
                  <tr key={orderItem.id} className="border-t">
                    <td className="px-4 py-2 border">{orderItem.order_id}</td>
                    <td className="px-4 py-2 border">{orderItem.quantity}</td>
                    <td className="px-4 py-2 border">${orderItem.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between w-full mt-4">
          <Link 
            href={route("foods.index")} 
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="flex items-center min-w-[250px]">Back to All Foods</span>
          </Link>

          {roleId === 1 &&
          <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDelete(food.id); 
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

export default FoodShow;
