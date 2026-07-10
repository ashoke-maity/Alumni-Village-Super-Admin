import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, ExternalLink, Loader2, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import Toast from '../../utils/toast';

export default function AddAdminModal({ isOpen, onClose, onSuccess, apiUrl = import.meta.env.VITE_ADMIN_API_URL, tokenKey = "authToken" }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [showLink, setShowLink] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (tokenKey === 'developerAuthToken') {
      if (formData.email && formData.email.includes('@')) {
        // Only fetch if not already fetched to avoid loops, or debounce. 
        // For simplicity, we fetch when email becomes valid-ish structure.
        if (!formData.adminId) {
          fetchNextAdminId();
        }
        // Force regeneration if missing (or we could force regen every time email becomes valid if desired, but sticking to "if missing" is safer for existing logic unless explicitly asked to regen)
        // User asked: "when the email entered is removed... removed... when entered again... will be generated"
        // So checking if missing is fine because we clear it below.
        if (!formData.generatedPassword) {
          generatePassword();
        }
      } else {
        // Clear fields if email is removed or invalid
        setFormData(prev => ({
          ...prev,
          adminId: '',
          generatedPassword: ''
        }));
      }
    }
  }, [formData.email, tokenKey]);

  const fetchNextAdminId = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/admin/next-id`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem(tokenKey)}` }
        }
      );
      if (response.data.status === 1) {
        setFormData(prev => ({ ...prev, adminId: response.data.nextAdminId }));
      }
    } catch (error) {
      console.error("Error fetching next admin ID", error);
    }
  };

  const generatePassword = () => {
    const prefix = "TIU-ADM";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const all = lower + numbers;

    let suffix = "";
    // Ensure at least one lowercase and one number to pass validation
    suffix += lower[Math.floor(Math.random() * lower.length)];
    suffix += numbers[Math.floor(Math.random() * numbers.length)];

    // Add 4 random chars
    for (let i = 0; i < 4; i++) {
      suffix += all.charAt(Math.floor(Math.random() * all.length));
    }

    // Shuffle suffix only
    suffix = suffix.split('').sort(() => 0.5 - Math.random()).join('');

    setFormData(prev => ({ ...prev, generatedPassword: prefix + suffix }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      Toast.error('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      Toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/admin/send-invitation`,
        {
          ...formData,
          password: formData.generatedPassword // Ensure password key matches what backend expects
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(tokenKey)}`,
          },
        }
      );

      if (response.data.status === 1) {
        let baseUrl = window.location.origin;
        if (baseUrl.includes(":5175")) {
          baseUrl = baseUrl.replace(":5175", ":5174");
        }
        
        const adminRoute = import.meta.env.VITE_ADMIN_ROUTE || "/admin-portal";
        const fullLink = `${baseUrl}${adminRoute}/admin/login`;
        setInvitationLink(fullLink);
        setShowLink(true);
        Toast.success('Invitation sent successfully!');
        onSuccess();
      } else {
        Toast.error(response.data.msg || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      Toast.error(error.response?.data?.msg || 'An error occurred while sending invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      Toast.success('Invitation link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      Toast.error('Failed to copy link to clipboard');
    }
  };

  const handleTestLink = () => {
    window.open(invitationLink, '_blank');
  };

  const handleClose = () => {
    setFormData({ firstName: '', lastName: '', email: '' });
    setInvitationLink('');
    setShowLink(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Invite New Admin</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter first name"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter last name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter email address"
              required
            />
          </div>

          {/* Admin ID - Auto-generated */}
          {tokenKey === 'developerAuthToken' && (
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">
                Admin ID (Auto-generated)
              </label>
              <input
                type="text"
                id="adminId"
                name="adminId"
                value={formData.adminId || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Will be generated automatically"
              />
            </div>
          )}

          {/* Password - Only for developers */}
          {tokenKey === 'developerAuthToken' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="text"
                readOnly
                value={formData.generatedPassword || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono text-sm text-gray-700"
                placeholder="Will be generated automatically"
              />
            </div>
          )}

          {/* Invitation Link Display */}
          {showLink && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-900 mb-2">Invitation Link Generated</h3>
              <div className="bg-white border border-red-300 rounded p-3 mb-3">
                <p className="text-xs text-gray-600 break-all">{invitationLink}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={handleTestLink}
                  className="flex items-center gap-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Test Link
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 