import React from "react";

const SkeletonLoader = ({ className, width, height, count = 1 }) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`bg-gray-200 animate-pulse rounded ${className || ""}`}
            style={{ width, height }}
          />
        ))}
    </>
  );
};

export default SkeletonLoader;
