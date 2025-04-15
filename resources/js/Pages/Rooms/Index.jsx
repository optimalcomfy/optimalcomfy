import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const IndexRooms = ({ rooms }) => {
  return (
    <Layout>
      <div className="w-full mr-auto p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Rooms</h1>
        <Link href={route("rooms.create")} className="mb-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
          Add Room
        </Link>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Room Number</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td className="border px-4 py-2">{room.room_number}</td>
                <td className="border px-4 py-2">{room.type}</td>
                <td className="border px-4 py-2">KES {room.price_per_night}</td>
                <td className="border px-4 py-2">
                  <Link href={route("rooms.show", room.id)} className="text-blue-500 mr-2">View</Link>
                  <Link href={route("rooms.edit", room.id)} className="text-green-500 mr-2">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default IndexRooms;
