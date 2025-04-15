import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const EditRoom = ({ room, errors }) => {
  const [existingImages, setExistingImages] = useState(
    room.gallery?.map(path => ({ path, url: `/storage/${path}`, removed: false })) || []
  );
  const [newImages, setNewImages] = useState([]);
  
  const { data, setData, processing } = useForm({
    room_number: room.room_number,
    type: room.type,
    price_per_night: room.price_per_night,
    max_adults: room.max_adults,
    max_children: room.max_children,
    status: room.status
  });


  const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('_method', 'PUT');

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      router.post(route('rooms.update', { room: room.id }), formData, {
        forceFormData: true,
        preserveScroll: true,
      });
  };



  return (
    <Layout>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Edit Room</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {['room_number', 'type', 'price_per_night', 'max_adults', 'max_children'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium">{field.replace('_', ' ').toUpperCase()}</label>
                <input type={field.includes('price') ? 'number' : 'text'}
                       value={data[field]} onChange={(e) => setData(field, e.target.value)}
                       className="w-full border px-3 py-2 rounded" />
                {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
              </div>
            ))}
          </div>
          
          
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded mt-4" disabled={processing}>{processing ? "Updating..." : "Update Room"}</button>
        </form>
      </div>
    </Layout>
  );
};

export default EditRoom;
