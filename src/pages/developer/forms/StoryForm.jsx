import React, { useState, useEffect } from "react";
import axios from "../../../apis/axios";

const StoryForm = ({ story, editMode, onSubmitSuccess, onCancel }) => {
  const [storyData, setStoryData] = useState({
    title: story?.title || "",
    storyBody: story?.storyBody || "",
  });
  const [media, setMedia] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(
    story?.mediaUrl || story?.media || null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && story) {
      setStoryData({
        title: story.title || "",
        storyBody: story.storyBody || "",
      });
      setPreviewMedia(story.mediaUrl || story.media || null);
      setMedia(null);
    }
  }, [editMode, story]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewMedia(previewUrl);
    } else if (editMode && story && (story.mediaUrl || story.media)) {
      setPreviewMedia(story.mediaUrl || story.media);
    } else {
      setPreviewMedia(null);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("developerAuthToken");
      const formData = new FormData();
      formData.append("title", storyData.title);
      formData.append("storyBody", storyData.storyBody);
      if (media) {
        formData.append("media", media);
      }
      let response;
      if (editMode && story && story._id) {
        response = await axios.put(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/edit/story/${story._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Story updated successfully!");
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/write/stories`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Story posted successfully!");
      }
      const newStory = response.data.story || {
        ...storyData,
        _id: story?._id || Date.now(),
        mediaUrl: previewMedia,
        createdAt: new Date().toISOString(),
      };
      if (onSubmitSuccess) onSubmitSuccess(newStory);
      setStoryData({ title: "", storyBody: "" });
      setMedia(null);
      setPreviewMedia(null);
    } catch {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-md p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
        encType="multipart/form-data"
      >
        {/* Story Title */}
        <div>
          <label className="text-lg font-medium text-gray-700">
            Story Title
          </label>
          <input
            type="text"
            name="title"
            value={storyData.title}
            onChange={handleInputChange}
            placeholder="Enter story title"
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>





        {/* Story Body */}
        <div>
          <label className="text-lg font-medium text-gray-700">Story</label>
          <textarea
            name="storyBody"
            value={storyData.storyBody}
            onChange={handleInputChange}
            placeholder="Write your story here..."
            rows="6"
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Media Upload (optional) */}
        <div>
          <label className="text-lg font-medium text-gray-700">
            Upload Image/Video (Optional)
          </label>
          <div className="relative">
            <input
              type="file"
              name="media"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg pl-12"
            />
            <img
              src="/icons/upload.svg"
              alt="Upload Icon"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
            />
          </div>
          {previewMedia && (
            <div className="mt-3 border border-gray-300 rounded-lg overflow-hidden w-full max-w-md">
              {media?.type?.startsWith("video") ||
                (typeof previewMedia === "string" &&
                  /\/video\/|\.(mp4|webm|ogg)$/i.test(previewMedia)) ? (
                <video
                  key={previewMedia}
                  controls
                  src={previewMedia}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <img
                  key={previewMedia}
                  src={previewMedia}
                  alt="Media Preview"
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {editMode && (
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading
              ? editMode
                ? "Saving..."
                : "Uploading..."
              : editMode
                ? "Save Changes"
                : "Upload Story"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoryForm;
