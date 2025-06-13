import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const IndexReviews = ({ reviews }) => {
  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Reviews</h1>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Rating</th>
              <th className="border px-4 py-2">Comment</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td className="border px-4 py-2">{review.id}</td>
                <td className="border px-4 py-2">{review.user?.name || "N/A"}</td>
                <td className="border px-4 py-2">{review.rating}</td>
                <td className="border px-4 py-2">{review.comment}</td>
                <td className="border px-4 py-2">
                  <Link href={route("reviews.show", review.id)} className="text-peach mr-2">View</Link>
                  <Link href={route("reviews.edit", review.id)} className="text-green-500 mr-2">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default IndexReviews;
