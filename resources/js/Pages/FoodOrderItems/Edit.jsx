import React from 'react';
import { useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const EditFoodOrderItem = ({ foodOrderItem, foodOrders, foods }) => {
  const { data, setData, put, processing, errors } = useForm({
    food_order_id: foodOrderItem.food_order_id,
    food_id: foodOrderItem.food_id,
    quantity: foodOrderItem.quantity,
    price: foodOrderItem.price,
    total_price: foodOrderItem.total_price,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('foodOrderItems.update', { food_order_item: foodOrderItem.id }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Edit Food Order Item</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Food Order</label>
            <Select
              options={foodOrders.map(order => ({ value: order.id, label: `Order #${order.id}` }))}
              value={foodOrders.find(order => order.id === data.food_order_id)}
              onChange={(option) => setData('food_order_id', option.value)}
              placeholder="Select Order"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Food</label>
            <Select
              options={foods.map(food => ({ value: food.id, label: food.name }))}
              value={foods.find(food => food.id === data.food_id)}
              onChange={(option) => setData('food_id', option.value)}
              placeholder="Select Food"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input type="number" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} className="w-full px-4 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Price</label>
            <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} className="w-full px-4 py-2 border rounded" />
          </div>

          <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded" disabled={processing}>
            {processing ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditFoodOrderItem;
