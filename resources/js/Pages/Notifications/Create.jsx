import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';  

const Create = () => {
   const { users } = usePage().props; 
  const { data, setData, post, errors } = useForm({
    message: '',
    is_read: 'No',
    user_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('notifications.store'));
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
        <h1 className="text-3xl font-semibold mb-6">Create Notification</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">Registration fee comment</label>
            <textarea
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
              className="mt-1 block w-full px-4 py-2"
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

          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Create
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('notifications.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to notifications
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
