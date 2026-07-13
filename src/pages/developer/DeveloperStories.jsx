import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import socket from '../../socket/socket'
import { Header, PageTransition } from '../../components/admin/layout'
import { Plus } from 'lucide-react'
import StoryForm from "./forms/StoryForm"

const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE
const apiBaseUrl = import.meta.env.VITE_DEVELOPER_API_URL

const DeveloperStories = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editStoryId, setEditStoryId] = useState(null)
  const [editStory, setEditStory] = useState(null)
  const [showForm, setShowForm] = useState(false);

  // Listen for newly created stories from localStorage
  useEffect(() => {
    // Set up a listener to check localStorage for new stories
    const checkForNewStories = () => {
      try {
        const savedStories = localStorage.getItem('createdStories');
        if (savedStories) {
          const parsedStories = JSON.parse(savedStories);
          if (Array.isArray(parsedStories) && parsedStories.length > 0) {
            // Only update if we have stories and they're different from current state
            if (stories.length === 0 || JSON.stringify(stories) !== JSON.stringify(parsedStories)) {
              setStories(parsedStories);
            }
          }
        }
      } catch (e) {
        console.error("Error checking localStorage stories:", e);
      }
    };

    // Check immediately
    checkForNewStories();

    // Also set up an interval to check periodically
    const intervalId = setInterval(checkForNewStories, 2000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [stories]);

  const fetchStories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("developerAuthToken")
      // First check localStorage for stories
      const savedStories = localStorage.getItem('createdStories');
      if (savedStories) {
        const parsedStories = JSON.parse(savedStories);
        if (Array.isArray(parsedStories) && parsedStories.length > 0) {
          setStories(parsedStories);
          setError(null);
          setLoading(false);
          return;
        }
      }
      // Fetch from API
      const response = await axios.get(`${apiBaseUrl}/developer/stories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle different possible response structures
      let storiesData = []
      if (response.data.stories) {
        storiesData = response.data.stories
      } else if (response.data.data && Array.isArray(response.data.data)) {
        storiesData = response.data.data
      } else if (Array.isArray(response.data)) {
        storiesData = response.data
      }

      setStories(storiesData)
      setError(null)
    } catch (err) {
      console.error("Error fetching stories:", err)
      // Set empty array instead of error
      setStories([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  // WebSocket listeners for real-time stories
  useEffect(() => {
    const handleNewStory = (newStory) => {
      setStories((prev) => {
        const exists = prev.some((s) => s._id === newStory._id);
        if (exists) return prev;
        return [newStory, ...prev];
      });
    };

    const handleStoryEdited = (editedStory) => {
      setStories((prev) => prev.map((s) => (s._id === editedStory._id ? editedStory : s)));
    };

    const handleStoryDeleted = (deletedStoryId) => {
      setStories((prev) => prev.filter((s) => s._id !== deletedStoryId));
    };

    socket.on("new_story", handleNewStory);
    socket.on("storyEdited", handleStoryEdited);
    socket.on("storyDeleted", handleStoryDeleted);

    return () => {
      socket.off("new_story", handleNewStory);
      socket.off("storyEdited", handleStoryEdited);
      socket.off("storyDeleted", handleStoryDeleted);
    };
  }, []);

  const handleAddStoryClick = () => {
    navigate(`${developerRoute}/developer/dashboard/addStories`)
  }

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) {
      return
    }

    try {
      const token = localStorage.getItem("developerAuthToken")
      // Try to delete from API
      try {
        await axios.delete(
          `${apiBaseUrl}/developer/delete/story/${storyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      } catch (error) {
        console.error("API delete failed, removing from local state only:", error);
        return { success: false, msg: error.message };
      }

      // Remove from state regardless of API success
      setStories(stories.filter(story => story._id !== storyId))

      // Also update localStorage
      try {
        const savedStories = JSON.parse(localStorage.getItem('createdStories') || '[]');
        const updatedStories = savedStories.filter(story => story._id !== storyId);
        localStorage.setItem('createdStories', JSON.stringify(updatedStories));
      } catch (err) {
        console.error("Error updating localStorage after deletion:", err);
      }

      alert("Story deleted successfully")
    } catch (err) {
      console.error("Error deleting story:", err)
      alert("Failed to delete story. Please try again.")
    }
  }

  const handleEditStory = (story) => {
    setEditStoryId(story._id || story.id);
    setEditStory(story);
  }

  const handleCancelEdit = () => {
    setEditStoryId(null);
    setEditStory(null);
  }

  const handleEditStorySuccess = (updatedStory) => {
    setStories((prevStories) => prevStories.map((s) => (s._id === updatedStory._id ? updatedStory : s)));
    setEditStoryId(null);
    setEditStory(null);
  }

  const handleNewStorySuccess = (newStory) => {
    setStories((prev) => [newStory, ...prev]);
    setShowForm(false);
  };

  return (
    <PageTransition locationKey={location.pathname} className={`dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8`}>
      <header className="header">
        <article>
          <Header
            title="Post a Story"
            description="Create and manage stories for all users"
          />
        </article>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold flex items-center">
            <img src="/icons/story.png" alt="Stories" className="mr-2 w-5 h-5" />
            Stories
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
                New Story
              </>
            )}
          </button>
        </div>

        {/* Form for adding stories */}
        {showForm && (
          <div className="mb-6 p-4 border border-red-100 rounded-lg bg-red-50">
            <h3 className="font-medium mb-3 text-red-800">Post a New Story</h3>
            <StoryForm onSubmitSuccess={handleNewStorySuccess} />
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-20 rounded"></div>
            ))}
          </div>
        ) : error || stories.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <img
              src="/icons/story.png"
              alt="No stories"
              className="w-16 h-16 mx-auto mb-3 opacity-30"
            />
            <p>No stories have been posted yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map(story => (
              <div key={story._id || story.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {(editStoryId === (story._id || story.id)) ? (
                  <StoryForm
                    story={editStory}
                    editMode
                    onSubmitSuccess={handleEditStorySuccess}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <>
                    {(story.mediaUrl || story.media) && (
                      <div className="w-full h-48 overflow-hidden">
                        {(story.mediaUrl && story.mediaUrl.match(/\/video\/|\.(mp4|webm|ogg)$/i)) ? (
                          <video
                            src={story.mediaUrl || story.media}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={story.mediaUrl || story.media}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800">{story.title}</h3>




                      <div className="mt-3">
                        <p className="text-gray-600 text-sm line-clamp-3">{story.storyBody}</p>
                      </div>

                      {story.createdAt && (
                        <div className="mt-2 text-xs text-gray-500">
                          Posted on {new Date(story.createdAt).toLocaleDateString()}
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                        <button
                          onClick={() => handleEditStory(story)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story._id || story.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default DeveloperStories
