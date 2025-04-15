import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Link } from '@inertiajs/react';

const CreateFood = () => {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    if (data.image) {
      formData.append('image', data.image);
    }
    
    post(route('foods.store'), {
      data: formData,
      forceFormData: true,
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-4">Add New Food</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Food Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.name && <div className="text-sm text-red-500 mt-1">{errors.name}</div>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              onChange={(e) => setData('image', e.target.files[0])}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.image && <div className="text-sm text-red-500 mt-1">{errors.image}</div>}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              required
            ></textarea>
            {errors.description && <div className="text-sm text-red-500 mt-1">{errors.description}</div>}
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (KES)</label>
            <input
              type="number"
              step="0.01"
              value={data.price}
              onChange={(e) => setData('price', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.price && <div className="text-sm text-red-500 mt-1">{errors.price}</div>}
          </div>

          {/* Category Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={data.category}
              onChange={(e) => setData('category', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.category && <div className="text-sm text-red-500 mt-1">{errors.category}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={processing}
          >
            {processing ? 'Saving...' : 'Save'}
          </button>
        </form>

        {/* Back to List */}
        <Link href={route('foods.index')} className="mt-4 inline-block text-sm text-blue-600">
          Back to Foods
        </Link>
      </div>
    </Layout>
  );
};

export default CreateFood;
