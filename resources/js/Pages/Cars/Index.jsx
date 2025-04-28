import React, { useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const CarsIndex = () => {
  const { cars } = usePage().props;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Cars List</h1>

        <div className="mb-6 text-right">
          <Link href={route('cars.create')} className="text-indigo-600 hover:text-indigo-800">
            Add New Car
          </Link>
        </div>

        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left border-b">Name</th>
              <th className="py-2 px-4 text-left border-b">Brand</th>
              <th className="py-2 px-4 text-left border-b">Model</th>
              <th className="py-2 px-4 text-left border-b">Year</th>
              <th className="py-2 px-4 text-left border-b">Price/Day</th>
              <th className="py-2 px-4 text-left border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.data.map(car => (
              <tr key={car.id}>
                <td className="py-2 px-4 border-b">{car.name}</td>
                <td className="py-2 px-4 border-b">{car.brand}</td>
                <td className="py-2 px-4 border-b">{car.model}</td>
                <td className="py-2 px-4 border-b">{car.year}</td>
                <td className="py-2 px-4 border-b">{car.price_per_day}</td>
                <td className="py-2 px-4 border-b">
                  <Link
                    href={route('cars.edit', car.id)}
                    className="text-indigo-600 hover:text-indigo-800 mr-4"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Link>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6">
          {cars.links && (
            <div className="flex justify-center">
              <nav>
                <ul className="flex space-x-2">
                  {cars.links.map((link) => (
                    <li key={link.url}>
                      {link.url ? (
                        <Link
                          href={link.url}
                          className={`px-4 py-2 border border-gray-300 rounded-md ${
                            link.active ? 'bg-indigo-600 text-white' : 'text-indigo-600'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className="px-4 py-2 border border-gray-300 rounded-md text-gray-400">
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );

  function handleDelete(carId) {
    if (confirm('Are you sure you want to delete this car?')) {
      // Delete car logic here
    }
  }
};

export default CarsIndex;
