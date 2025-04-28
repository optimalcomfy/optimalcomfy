import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const CreateCar = () => {
  const { categories, features } = usePage().props;

  const { data, setData, post, errors, processing } = useForm({
    car_category_id: '',
    name: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    body_type: '',
    seats: '',
    doors: '',
    luggage_capacity: '',
    fuel_type: '',
    engine_capacity: '',
    transmission: '',
    drive_type: '',
    fuel_economy: '',
    exterior_color: '',
    interior_color: '',
    price_per_day: '',
    description: '',
    is_available: true,
    location_address: '',
    latitude: '',
    longitude: '',
    features: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('cars.store'));
  };

  const categoryOptions = categories.map(category => ({
    value: category.id, label: category.name
  }));

  const featureOptions = features.map(feature => ({
    value: feature.id, label: feature.feature_name
  }));

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Create New Car</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Car Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Category</label>
            <Select
              options={categoryOptions}
              value={categoryOptions.find(option => option.value === data.car_category_id)}
              onChange={(selected) => setData('car_category_id', selected ? selected.value : '')}
              placeholder="Select a category"
            />
            {errors.car_category_id && <div className="text-sm text-red-500 mt-1">{errors.car_category_id}</div>}
          </div>

          {/* Car Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Car Name"
            />
            {errors.name && <div className="text-sm text-red-500 mt-1">{errors.name}</div>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              value={data.brand}
              onChange={(e) => setData('brand', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Brand"
            />
            {errors.brand && <div className="text-sm text-red-500 mt-1">{errors.brand}</div>}
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              value={data.model}
              onChange={(e) => setData('model', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Model"
            />
            {errors.model && <div className="text-sm text-red-500 mt-1">{errors.model}</div>}
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={data.year}
              onChange={(e) => setData('year', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Year"
            />
            {errors.year && <div className="text-sm text-red-500 mt-1">{errors.year}</div>}
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mileage</label>
            <input
              type="number"
              value={data.mileage}
              onChange={(e) => setData('mileage', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Mileage"
            />
            {errors.mileage && <div className="text-sm text-red-500 mt-1">{errors.mileage}</div>}
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
            <input
              type="text"
              value={data.fuel_type}
              onChange={(e) => setData('fuel_type', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Fuel Type"
            />
            {errors.fuel_type && <div className="text-sm text-red-500 mt-1">{errors.fuel_type}</div>}
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Transmission</label>
            <input
              type="text"
              value={data.transmission}
              onChange={(e) => setData('transmission', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Transmission"
            />
            {errors.transmission && <div className="text-sm text-red-500 mt-1">{errors.transmission}</div>}
          </div>

          {/* Location Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Location Address</label>
            <input
              type="text"
              value={data.location_address}
              onChange={(e) => setData('location_address', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Location Address"
            />
            {errors.location_address && <div className="text-sm text-red-500 mt-1">{errors.location_address}</div>}
          </div>

          {/* Features Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Features</label>
            <Select
              isMulti
              options={featureOptions}
              value={featureOptions.filter(option => data.features.includes(option.value))}
              onChange={(selected) => setData('features', selected.map(s => s.value))}
              placeholder="Select Features"
            />
            {errors.features && <div className="text-sm text-red-500 mt-1">{errors.features}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={processing}
          >
            {processing ? 'Creating Car...' : 'Create Car'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('cars.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Cars List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCar;
