import React from "react";
import { useForm, router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const EditService = ({ service, errors }) => {
  const { data, setData, processing } = useForm({
    name: service.name,
    image: null,
    description: service.description,
    price: service.price,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("_method", 'PUT');
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    
    if (data.image) {
      formData.append("image", data.image);
    }
    
    router.post(route('services.update', { service: service.id }), formData, {
      forceFormData: true,
      preserveScroll: true,
    });
    
  };
  

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Edit Service</h1>
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

          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded" disabled={processing}>
            {processing ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditService;
