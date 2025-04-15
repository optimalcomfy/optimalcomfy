import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const CreateFoodOrderItem = ({ foodOrders, foods }) => {
  const { data, setData, post, processing, errors } = useForm({
    food_order_id: '',
    food_id: '',
    quantity: '',
    price: '',
    total_price: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('foodOrderItems.store'));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Add Food Order Item</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Food Order</label>
            <Select
              options={foodOrders.map(order => ({ value: order.id, label: `Order #${order.id}` }))}
              onChange={(option) => setData('food_order_id', option.value)}
              placeholder="Select Order"
            />
            {errors.food_order_id && <div className="text-red-500">{errors.food_order_id}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Food</label>
            <Select
              options={foods.map(food => ({ value: food.id, label: food.name }))}
              onChange={(option) => setData('food_id', option.value)}
              placeholder="Select Food"
            />
            {errors.food_id && <div className="text-red-500">{errors.food_id}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input type="number" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} className="w-full px-4 py-2 border rounded" />
            {errors.quantity && <div className="text-red-500">{errors.quantity}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Price</label>
            <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} className="w-full px-4 py-2 border rounded" />
            {errors.price && <div className="text-red-500">{errors.price}</div>}
          </div>

          <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded" disabled={processing}>
            {processing ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateFoodOrderItem;
