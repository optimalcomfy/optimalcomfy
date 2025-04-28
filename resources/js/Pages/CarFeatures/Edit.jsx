import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const EditCarFeature = ({ carFeature }) => {
  const { cars } = usePage().props;

  const { data, setData, put, errors, processing } = useForm({
    feature_name: carFeature.feature_name || '',
    car_id: carFeature.car_id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('car-features.update', { car_feature: carFeature.id }));
  };

  const carOptions = cars.map(car => ({
    value: car.id,
    label: car.name
  }));

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mt-8">
        <h1 className="text-3xl font-bold mb-6">Edit Car Feature</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Feature Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Feature Name</label>
            <input 
              type="text"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              value={data.feature_name}
              onChange={(e) => setData('feature_name', e.target.value)}
              placeholder="Enter feature name"
            />
            {errors.feature_name && (
              <div className="text-sm text-red-500 mt-1">{errors.feature_name}</div>
            )}
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
            {errors.car_id && (
              <div className="text-sm text-red-500 mt-1">{errors.car_id}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
          >
            {processing ? 'Updating...' : 'Update Feature'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={route('car-features.index')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Features
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default EditCarFeature;
