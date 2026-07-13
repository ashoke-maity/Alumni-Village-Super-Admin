import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import socket from "../../socket/socket";
import { Header, PageTransition } from "../../components/admin/layout";
import { Plus } from "lucide-react";
import EventForm from "./forms/EventForm";

const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;
const apiBaseUrl = import.meta.env.VITE_DEVELOPER_API_URL;

const DeveloperEvents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    eventName: "",
    eventDate: "",
    eventLocation: "",
    eventDescription: "",
    eventSummary: "",
    mediaUrl: "",
  });
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [showForm, setShowForm] = useState(false);


  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("developerAuthToken");

      const response = await axios.get(`${import.meta.env.VITE_DEVELOPER_API_URL}/developer/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const eventsData =
        response.data.events ||
        (Array.isArray(response.data.data) && response.data.data) ||
        (Array.isArray(response.data) && response.data) ||
        [];

      setEvents(eventsData);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // WebSocket listeners for real-time events
  useEffect(() => {
    const handleNewEvent = (newEvent) => {
      setEvents((prev) => {
        const exists = prev.some((e) => e._id === newEvent._id);
        if (exists) return prev;
        return [newEvent, ...prev];
      });
    };

    const handleEventEdited = (editedEvent) => {
      setEvents((prev) => prev.map((e) => (e._id === editedEvent._id ? editedEvent : e)));
    };

    const handleEventDeleted = (deletedEventId) => {
      setEvents((prev) => prev.filter((e) => e._id !== deletedEventId));
    };

    socket.on("new_event", handleNewEvent);
    socket.on("eventEdited", handleEventEdited);
    socket.on("eventDeleted", handleEventDeleted);

    return () => {
      socket.off("new_event", handleNewEvent);
      socket.off("eventEdited", handleEventEdited);
      socket.off("eventDeleted", handleEventDeleted);
    };
  }, []);

  const handleEventSubmitSuccess = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setShowForm(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("developerAuthToken");

      await axios.delete(`${import.meta.env.VITE_DEVELOPER_API_URL}/developer/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(events.filter((event) => event._id !== eventId));
      alert("Event deleted successfully");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  const openEditModal = (event) => {
    setEditEvent(event);
    setEditForm({
      eventName: event.eventName || "",
      eventDate: event.eventDate ? event.eventDate.slice(0, 10) : "",
      eventLocation: event.eventLocation || "",
      eventDescription: event.eventDescription || "",
      eventSummary: event.eventSummary || "",
      mediaUrl: event.mediaUrl || "",
    });
    setEditMediaFile(null);
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditEvent(null);
    setEditError(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditMediaChange = (e) => {
    setEditMediaFile(e.target.files[0] || null);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem("developerAuthToken");
      if (editMediaFile) {
        const formData = new FormData();
        Object.entries(editForm).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("media", editMediaFile);
        await axios.put(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/event/${editEvent._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.put(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/event/${editEvent._id}`,
          editForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      await fetchEvents();
      closeEditModal();
    } catch {
      setEditError("Failed to update event. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditEvent = (eventId) => {
    const event = events.find((ev) => ev._id === eventId);
    if (event) openEditModal(event);
  };

  return (
    <PageTransition locationKey={location.pathname} className={`dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8`}>
      <header className="header">
        <article>
          <Header
            title="Post an Event"
            description="Create and manage events for all users"
          />
        </article>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold flex items-center">
            <img src="/icons/calendar.svg" alt="Events" className="mr-2 w-5 h-5" />
            Events
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors font-medium flex items-center gap-2 ${showForm
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-red-500 text-white hover:bg-red-600"
              }`}
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={16} />
                New Event
              </>
            )}
          </button>
        </div>

        {/* Form for adding events */}
        {showForm && (
          <div className="mb-6 p-4 border border-red-100 rounded-lg bg-red-50">
            <h3 className="font-medium mb-3 text-red-800">Post a New Event</h3>
            <EventForm onSubmitSuccess={handleEventSubmitSuccess} />
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-20 rounded"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <img
              src="/icons/calendar.svg"
              alt="No events"
              className="w-16 h-16 mx-auto mb-3 opacity-30"
            />
            <p>No events have been posted yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event._id || event.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                {(event.mediaUrl || event.media) && (
                  <div className="w-full h-48 overflow-hidden">
                    {event.mediaType?.startsWith("video") ||
                      event.media?.type?.startsWith("video") ||
                      (typeof event.media === "string" &&
                        event.media.includes(".mp4")) ? (
                      <video
                        src={event.mediaUrl || event.media}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={event.mediaUrl || event.media}
                        alt={event.eventName || event.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800">
                    {event.eventName || event.name}
                  </h3>
                  <div className="mt-2 text-gray-700 text-sm">
                    <div>
                      <span className="font-semibold">Date:</span>{" "}
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Location:</span>{" "}
                      {event.eventLocation || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Summary:</span>{" "}
                      {event.eventSummary || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Description:</span>{" "}
                      {event.eventDescription || "N/A"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <button
                      onClick={() => handleEditEvent(event._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeEditModal}
              disabled={editLoading}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Event</h2>
            {editError && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm">
                {editError}
              </div>
            )}
            <form onSubmit={handleEditFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={editForm.eventName}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Event Date
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={editForm.eventDate}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Location</label>
                <input
                  type="text"
                  name="eventLocation"
                  value={editForm.eventLocation}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="eventDescription"
                  value={editForm.eventDescription}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Summary</label>
                <textarea
                  name="eventSummary"
                  value={editForm.eventSummary}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Media URL</label>
                <input
                  type="text"
                  name="mediaUrl"
                  value={editForm.mediaUrl}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1 mb-2"
                  placeholder="Paste image/video URL or upload below"
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleEditMediaChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  disabled={editLoading}
                />
                {editMediaFile ? (
                  <div className="mt-2">
                    {editMediaFile.type.startsWith("video") ? (
                      <video
                        src={URL.createObjectURL(editMediaFile)}
                        controls
                        className="w-32 h-20 object-contain rounded"
                        type={editMediaFile.type}
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(editMediaFile)}
                        alt="Preview"
                        className="w-20 h-20 object-contain rounded"
                      />
                    )}
                  </div>
                ) : (
                  editForm.mediaUrl && (
                    <div className="mt-2">
                      {(() => {
                        // Robust check for Cloudinary video URLs or video extensions
                        const url = editForm.mediaUrl;
                        const isVideo =
                          /\.(mp4|webm|ogg)$/i.test(url) ||
                          /\/video\/upload\//.test(url) ||
                          (url.includes("cloudinary") &&
                            url.includes("/video/"));
                        return isVideo ? (
                          <video
                            src={url}
                            controls
                            className="w-32 h-20 object-contain rounded"
                          />
                        ) : (
                          <img
                            src={url}
                            alt="Current Media"
                            className="w-20 h-20 object-contain rounded"
                          />
                        );
                      })()}
                    </div>
                  )
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-60"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default DeveloperEvents;
