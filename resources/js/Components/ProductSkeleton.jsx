import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="w-full aspect-[20/19] bg-gray-200 rounded-lg"></div>
      
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;