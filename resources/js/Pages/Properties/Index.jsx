import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const IndexProperties = ({ properties }) => {
  return (
    <Layout>
      <div className="w-full mr-auto p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Properties</h1>
        <Link href={route("properties.create")} className="mb-4 inline-block bg-peach text-white px-4 py-2 rounded">
          Add Property
        </Link>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Property Name</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(property => (
              <tr key={property.id}>
                <td className="border px-4 py-2">{property.property_name}</td>
                <td className="border px-4 py-2">{property.type}</td>
                <td className="border px-4 py-2">KES {property.price_per_night}</td>
                <td className="border px-4 py-2">
                  <Link href={route("properties.show", property.id)} className="text-peach mr-2">View</Link>
                  <Link href={route("properties.edit", property.id)} className="text-green-500 mr-2">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default IndexProperties;
