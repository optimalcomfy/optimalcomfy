import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const CreateCarCategory = () => {
  const { data, setData, post, errors, processing } = useForm({
    name: '',
    slug: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('car-categories.store'));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Create Car Category</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
            {errors.name && <div className="text-sm text-red-500 mt-1">{errors.name}</div>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => setData('slug', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.slug && <div className="text-sm text-red-500 mt-1">{errors.slug}</div>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              rows="4"
            />
            {errors.description && <div className="text-sm text-red-500 mt-1">{errors.description}</div>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={processing}
          >
            {processing ? 'Creating...' : 'Create Category'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('car-categories.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Car Categories
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCarCategory;
