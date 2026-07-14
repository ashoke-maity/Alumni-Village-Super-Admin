import React, { useState, useEffect } from 'react';
import axios from "../../apis/axios";
import { X, Loader2 } from 'lucide-react';
import Toast from "../../utils/toast";

export default function EditUserModal({ isOpen, onClose, user, onSuccess, apiUrl, tokenKey = "authToken" }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const nameParts = user.name ? user.name.split(' ') : ['', ''];
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                password: ''
            });
        }
    }, [user, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.email.trim()) {
            Toast.error('Please fill in required fields');
            return;
        }

        // Check if nothing changed
        if (user) {
            const originalNameParts = user.name ? user.name.split(' ') : ['', ''];
            const originalFirstName = originalNameParts[0] || '';
            const originalLastName = originalNameParts.slice(1).join(' ') || '';

            if (
                formData.firstName === originalFirstName &&
                formData.lastName === originalLastName &&
                formData.email === user.email &&
                (!formData.password || formData.password.trim() === '')
            ) {
                Toast.info("No changes were made");
                onClose();
                return;
            }
        }

        setIsLoading(true);
        try {
            const response = await axios.put(
                `${apiUrl}/update/user`,
                {
                    userID: user.id,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
                    },
                }
            );

            if (response.data.status === 1) {
                Toast.success('User updated successfully');
                if (onSuccess) onSuccess(response.data.user || {
                    ...user,
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    plainPassword: (formData.password && formData.password.trim() !== "") ? formData.password : user.plainPassword
                });
                onClose();
            } else {
                Toast.error(response.data.msg || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            Toast.error(error.response?.data?.msg || 'An error occurred while updating the user');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password (Optional)
                        </label>
                        <input
                            type="text"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
