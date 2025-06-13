import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const IndexServices = ({ services }) => {
  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Services</h1>
        <Link href={route("services.create")} className="mb-4 inline-block bg-blue-peach text-white px-4 py-2 rounded">
          Add Service
        </Link>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td className="border px-4 py-2">{service.name}</td>
                <td className="border px-4 py-2">{service.description}</td>
                <td className="border px-4 py-2">KES {service.price}</td>
                <td className="border px-4 py-2">
                  <Link href={route("services.show", service.id)} className="text-blue-peach mr-2">View</Link>
                  <Link href={route("services.edit", service.id)} className="text-green-500 mr-2">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default IndexServices;
