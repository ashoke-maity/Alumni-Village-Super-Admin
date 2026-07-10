import React from 'react';
import { Skeleton } from '../shared/Skeleton';


const ProfileCompletionLoader = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar Skeleton */}
            <div className="bg-white shadow-sm h-16 w-full fixed top-0 z-50 px-4">
                <div className="container mx-auto h-full flex items-center justify-between max-w-6xl">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="flex items-center space-x-6">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl pt-24 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Left Sidebar Skeleton */}
                    <div className="hidden md:block md:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center border border-gray-100 h-fit">
                            <Skeleton className="w-24 h-24 rounded-full mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Main Feed Skeleton */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Create Post Skeleton */}
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-10 flex-1 rounded-full" />
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </div>

                        {/* Posts Skeletons */}
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                                <Skeleton className="h-48 w-full rounded-lg mb-4" />
                                <div className="flex justify-between pt-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar Skeleton */}
                    <div className="hidden md:block md:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <Skeleton className="h-6 w-1/2 mb-4" />
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-full rounded-lg" />
                                <Skeleton className="h-16 w-full rounded-lg" />
                                <Skeleton className="h-16 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionLoader;
