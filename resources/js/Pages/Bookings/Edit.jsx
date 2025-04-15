import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';  

const EditNotification = ({ notification, errors }) => {
  const { users } = usePage().props; 

  const { data, setData, put, processing } = useForm({
    user_id: notification.user_id,
    is_read: notification.is_read,
    message: notification.message
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('notifications.update', { notification: notification.id }));
  };

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.name
  }));

  const handleUserChange = (selectedOption) => {
      setData('user_id', selectedOption ? selectedOption.value : ''); 
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1>Edit Notification</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration fee comment</label>
            <textarea
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{height: '200px'}}
            ></textarea>
            {errors.message && <div className="text-sm text-red-500 mt-1">{errors.message}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Registration comment</label>
            <textarea
              value={data.is_read}
              onChange={(e) => setData('is_read', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{height: '200px'}}
            ></textarea>
            {errors.is_read && <div className="text-sm text-red-500 mt-1">{errors.is_read}</div>}
          </div>


          <div>
              <label className="block text-sm font-medium text-gray-700">User</label>
              <Select
                  options={userOptions}
                  value={userOptions.find(option => option.value === data.user_id)} 
                  onChange={handleUserChange}
                  className="mt-1 block w-full py-2"
                  placeholder="Select a user"
              />
              {errors.user_id && <div className="text-sm text-red-500 mt-1">{errors.user_id}</div>}
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
        <Link href={route('notifications.index')} className="mt-4 inline-block text-sm text-blue-600">Back to Notifications</Link>
      </div>
    </Layout>
  );
};

export default EditNotification;
