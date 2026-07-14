import React, { useState, useEffect } from 'react';
import axios from "../../apis/axios";
import { Header, PageTransition } from '../../components/layout';
import { useLocation } from 'react-router-dom';

const DeveloperList = () => {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchDevelopers = async () => {
            try {
                const token = localStorage.getItem("developerAuthToken");
                const response = await axios.get(
                    `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.status === 1) {
                    setDevelopers(response.data.developers);
                } else {
                    setError("Failed to fetch developers");
                }
            } catch (err) {
                console.error("Error fetching developers:", err);
                setError("An error occurred while fetching developers");
            } finally {
                setLoading(false);
            }
        };

        fetchDevelopers();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading developers...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <PageTransition locationKey={location.pathname} className="dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8">
            <header className="header">
                <article>
                    <Header
                        title="Developers Directory"
                        description="View all registered developers"
                    />
                </article>
            </header>

            <div className="bg-white rounded-lg shadowoverflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Profile
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Developer ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joining Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {developers.map((dev) => (
                                <tr key={dev._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {dev.ProfileImage ? (
                                            <img
                                                src={dev.ProfileImage}
                                                alt={`${dev.FirstName} ${dev.LastName}`}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                                                {dev.FirstName?.[0]}{dev.LastName?.[0]}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {dev.FirstName} {dev.LastName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{dev.DeveloperID}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{dev.Email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(dev.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dev.isOnline
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {dev.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {developers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No developers found.
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default DeveloperList;
