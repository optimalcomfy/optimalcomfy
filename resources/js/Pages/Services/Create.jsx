import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const CreateService = ({ errors }) => {
  const { data, setData, post, processing } = useForm({
    name: "",
    image: null,
    description: "",
    price: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    if (data.image) {
      formData.append("image", data.image);
    }
  
    post(route("services.store"), {
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
  

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Create Service</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input type="text" value={data.name} onChange={(e) => setData("name", e.target.value)}
              className="w-full border px-3 py-2 rounded" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Image</label>
            <input type="file" onChange={(e) => setData("image", e.target.files[0])}
              className="w-full border px-3 py-2 rounded" />
            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={data.description} onChange={(e) => setData("description", e.target.value)}
              className="w-full border px-3 py-2 rounded"></textarea>
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Price</label>
            <input type="number" value={data.price} onChange={(e) => setData("price", e.target.value)}
              className="w-full border px-3 py-2 rounded" />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" disabled={processing}>
            {processing ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateService;
