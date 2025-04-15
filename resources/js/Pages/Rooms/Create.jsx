import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const CreateRoom = ({ errors }) => {
  const [previews, setPreviews] = useState([]);
  const { data, setData, post, processing } = useForm({
    room_number: "",
    type: "",
    price_per_night: "",
    max_adults: "",
    max_children: "",
    status: "available",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('room_number', data.room_number);
    formData.append('type', data.type);
    formData.append('price_per_night', data.price_per_night);
    formData.append('max_adults', data.max_adults);
    formData.append('max_children', data.max_children);
    formData.append('status', data.status);

    post(route("rooms.store"), {
      data: formData,
      forceFormData: true, 
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Create Room</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Room Number</label>
              <input 
                type="text" 
                value={data.room_number} 
                onChange={(e) => setData("room_number", e.target.value)}
                className="w-full border px-3 py-2 rounded" 
              />
              {errors.room_number && <p className="text-red-500 text-sm">{errors.room_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Room Type</label>
              <input 
                type="text" 
                value={data.type} 
                onChange={(e) => setData("type", e.target.value)}
                className="w-full border px-3 py-2 rounded" 
              />
              {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Price Per Night</label>
              <input 
                type="number" 
                value={data.price_per_night} 
                onChange={(e) => setData("price_per_night", e.target.value)}
                className="w-full border px-3 py-2 rounded" 
              />
              {errors.price_per_night && <p className="text-red-500 text-sm">{errors.price_per_night}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Max guest</label>
              <input 
                type="number" 
                value={data.max_adults} 
                onChange={(e) => setData("max_adults", e.target.value)}
                className="w-full border px-3 py-2 rounded" 
              />
              {errors.max_adults && <p className="text-red-500 text-sm">{errors.max_adults}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Max children</label>
              <input 
                type="number" 
                value={data.max_children} 
                onChange={(e) => setData("max_children", e.target.value)}
                className="w-full border px-3 py-2 rounded" 
              />
              {errors.max_children && <p className="text-red-500 text-sm">{errors.max_children}</p>}
            </div>
          </div>


          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 rounded mt-4" 
            disabled={processing}
          >
            {processing ? "Saving..." : "Create Room"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateRoom;