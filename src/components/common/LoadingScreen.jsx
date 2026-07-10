import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header Skeleton */}
        <div className="h-16 bg-white border-b border-gray-200 px-4 fixed top-0 w-full z-10 flex items-center justify-between">
          {/* Logo Placeholder */}
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />

          {/* Search Bar Skeleton */}
          <div className="hidden md:block w-96 h-10 bg-gray-100 rounded-full animate-pulse" />

          {/* Right Icons Skeleton */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* content padding for fixed header */}
        <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Sidebar Skeleton (Profile) */}
          <div className="hidden md:block md:col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="w-full h-10 bg-gray-200 rounded mt-6" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-100 rounded w-full" />
              <div className="h-8 bg-gray-100 rounded w-full" />
              <div className="h-8 bg-gray-100 rounded w-full" />
            </div>
          </div>

          {/* Main Feed Skeleton */}
          <div className="col-span-1 md:col-span-6 space-y-6">
            {/* Create Post Box */}
            <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 h-10 bg-gray-100 rounded-full" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="w-20 h-6 bg-gray-100 rounded" />
                <div className="w-20 h-6 bg-gray-100 rounded" />
                <div className="w-20 h-6 bg-gray-100 rounded" />
              </div>
            </div>

            {/* Feed Posts */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded" />
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="w-full h-4 bg-gray-100 rounded" />
                  <div className="w-3/4 h-4 bg-gray-100 rounded" />
                </div>
                <div className="w-full h-56 bg-gray-200 rounded-lg mb-4" />
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <div className="w-16 h-6 bg-gray-100 rounded" />
                  <div className="w-16 h-6 bg-gray-100 rounded" />
                  <div className="w-16 h-6 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar Skeleton (Suggestions) */}
          <div className="hidden md:block md:col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
                    <div className="w-16 h-3 bg-gray-100 rounded" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;