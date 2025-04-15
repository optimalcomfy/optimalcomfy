import React from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const EditReview = ({ review, users, errors }) => {
  const { data, setData, put, processing } = useForm({
    user_id: review.user_id,
    rating: review.rating,
    comment: review.comment,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("reviews.update", review.id));
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Edit Review</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">User</label>
            <select value={data.user_id} onChange={(e) => setData("user_id", e.target.value)}
              className="w-full border px-3 py-2 rounded">
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Rating</label>
            <input type="number" value={data.rating} onChange={(e) => setData("rating", e.target.value)}
              min="1" max="5" className="w-full border px-3 py-2 rounded" />
            {errors.rating && <p className="text-red-500 text-sm">{errors.rating}</p>}
          </div>

          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded" disabled={processing}>
            {processing ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditReview;
