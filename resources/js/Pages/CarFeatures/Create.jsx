import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const CreateCarFeature = ({ carFeature }) => {
  const { cars } = usePage().props;

  const { data, setData, put, errors, processing } = useForm({
    feature_name: carFeature.feature_name || '',
    car_id: carFeature.car_id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('car-features.update', { car_feature: carFeature.id }));
  };

  const carOptions = cars.map(car => ({ value: car.id, label: car.name }));

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Edit Car Feature</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Feature Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Feature Name</label>
            <input 
              type="text" 
              value={data.feature_name}
              onChange={(e) => setData('feature_name', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter feature name"
            />
            {errors.feature_name && <div className="text-sm text-red-500 mt-1">{errors.feature_name}</div>}
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
            {processing ? 'Updating...' : 'Update Feature'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('car-features.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Features
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCarFeature;
