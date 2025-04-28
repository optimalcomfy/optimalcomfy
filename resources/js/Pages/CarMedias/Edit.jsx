import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const EditCarMedia = ({ carMedia, cars }) => {
  const { data, setData, put, errors, processing } = useForm({
    media_url: carMedia.media_url,
    media_type: carMedia.media_type,
    car_id: carMedia.car_id,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('car-media.update', { carMedia: carMedia.id }));
  };

  const carOptions = cars.map(car => ({ value: car.id, label: car.name }));

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Edit Car Media</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Media URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Media URL</label>
            <input 
              type="text" 
              value={data.media_url} 
              onChange={(e) => setData('media_url', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.media_url && <div className="text-sm text-red-500 mt-1">{errors.media_url}</div>}
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Media Type</label>
            <select 
              value={data.media_type} 
              onChange={(e) => setData('media_type', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            {errors.media_type && <div className="text-sm text-red-500 mt-1">{errors.media_type}</div>}
          </div>

          {/* Car Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Car</label>
            <Select
              options={carOptions}
              value={carOptions.find(option => option.value === data.car_id)}
              onChange={(selected) => setData('car_id', selected ? selected.value : '')}
              placeholder="Select a car"
            />
            {errors.car_id && <div className="text-sm text-red-500 mt-1">{errors.car_id}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={processing}
          >
            {processing ? 'Updating...' : 'Update Media'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('car-media.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Car Media List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default EditCarMedia;
