import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Toast } from '../../../utils';

const StoriesOverview = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("developerAuthToken");

        // Fetch stories data
        const res = await axios.get(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/stories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Accept both array and object response
        let storiesArr = [];
        if (Array.isArray(res.data)) {
          storiesArr = res.data;
        } else if (res.data && Array.isArray(res.data.stories)) {
          storiesArr = res.data.stories;
        }
        if (storiesArr.length > 0) {
          // Show only the latest 5 stories
          const latestStories = storiesArr
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

          setStories(latestStories);
        } else {
          setStories([]);
        }
      } catch {
        setError("Failed to fetch stories");
        Toast.error("Failed to load stories");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate long text
  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Recent Alumni Stories</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Latest community highlights</p>
          </div>
        </div>
        <Link to={`${developerRoute}/developer/dashboard/stories`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '12px', fontWeight: 600, textDecoration: 'none', padding: '5px 10px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
          Manage Stories
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
      <div style={{ padding: '16px 20px' }}>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="h-60 flex items-center justify-center text-red-500 bg-red-50 rounded-lg">
          <p>{error}</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <img
            src="/icons/story.png"
            alt="No stories"
            className="w-16 h-16 mx-auto mb-4 opacity-30"
          />
          <p>No stories have been shared yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map(story => (
            <div
              key={story._id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                {story.coverImage || story.mediaUrl ? (
                  story.mediaResourceType === 'video' ? (
                    <video
                      src={story.mediaUrl || story.coverImage}
                      controls
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <img
                      src={(story.mediaUrl || story.coverImage).startsWith('http') ? (story.mediaUrl || story.coverImage) : `${import.meta.env.VITE_DEVELOPER_API_URL}/${story.mediaUrl || story.coverImage}`}
                      alt={story.title}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  )
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    <img src="/icons/story.png" alt="Story" className="w-8 h-8 opacity-40" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{story.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{truncateText(story.storyBody)}</p>
                  <div className="flex justify-end items-center mt-2">
                    <span className="text-xs text-gray-400">{formatDate(story.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* View all link */}
          {stories.length > 0 && (
            <div className="text-center pt-2">
              <Link
                to={`${developerRoute}/developer/dashboard/stories`}
                className="text-red-500 text-sm hover:underline inline-flex items-center"
              >
                View all stories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default StoriesOverview;