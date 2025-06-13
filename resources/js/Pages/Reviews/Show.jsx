import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const ShowReview = ({ review }) => {
  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Review Details</h1>
        <p><strong>User:</strong> {review.user?.name || "N/A"}</p>
        <p><strong>Rating:</strong> {review.rating}</p>
        <p><strong>Comment:</strong> {review.comment}</p>

        <Link href={route("reviews.index")} className="mt-4 inline-block text-peach">Back to Reviews</Link>
      </div>
    </Layout>
  );
};

export default ShowReview;
