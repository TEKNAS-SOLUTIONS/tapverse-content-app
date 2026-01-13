import React, { useState, useEffect } from 'react';
import { schedulingAPI, contentAPI } from '../services/api';

function ContentScheduling({ projectId, clientId }) {
  const [schedules, setSchedules] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    contentId: '',
    platform: 'linkedin',
    scheduledAt: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    contentType: 'blog',
  });

  useEffect(() => {
    if (projectId) {
      loadSchedules();
      loadContent();
    }
  }, [projectId]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await schedulingAPI.getByProject(projectId);
      if (response.data.success) {
        setSchedules(response.data.data);
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const response = await contentAPI.getByProject(projectId);
      if (response.data.success) {
        setContent(response.data.data);
      }
    } catch (err) {
      console.error('Error loading content:', err);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await schedulingAPI.schedule({
        projectId,
        clientId,
        ...formData,
      });
      if (response.data.success) {
        setSchedules([response.data.data, ...schedules]);
        setShowForm(false);
        setFormData({
          contentId: '',
          platform: 'linkedin',
          scheduledAt: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          contentType: 'blog',
        });
      }
    } catch (err) {
      console.error('Error scheduling content:', err);
      alert(err.response?.data?.error || 'Failed to schedule content');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (scheduleId) => {
    if (!confirm('Are you sure you want to cancel this schedule?')) return;
    try {
      await schedulingAPI.cancel(scheduleId);
      loadSchedules();
    } catch (err) {
      console.error('Error cancelling schedule:', err);
      alert('Failed to cancel schedule');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-600';
      case 'published': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Scheduling</h2>
          <p className="text-gray-400 text-sm mt-1">Schedule content for publishing across platforms</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Schedule Content'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSchedule} className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Content</label>
            <select
              value={formData.contentId}
              onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg p-2"
              required
            >
              <option value="">Select content...</option>
              {content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.content_type} - {item.title || 'Untitled'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg p-2"
                required
              >
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="tiktok">TikTok</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Content Type</label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg p-2"
                required
              >
                <option value="blog">Blog</option>
                <option value="social">Social</option>
                <option value="ad">Ad</option>
                <option value="video">Video</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg p-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Scheduling...' : 'Schedule Content'}
          </button>
        </form>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Scheduled Content</h3>
        {schedules.length === 0 ? (
          <p className="text-gray-400">No scheduled content yet</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
                    </span>
                    <span className="text-white font-semibold capitalize">{schedule.platform}</span>
                    <span className="text-gray-400 text-sm">{schedule.content_type}</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Scheduled: {formatDate(schedule.scheduled_at)}
                  </p>
                  {schedule.published_at && (
                    <p className="text-gray-300 text-sm">
                      Published: {formatDate(schedule.published_at)}
                    </p>
                  )}
                </div>
                {schedule.status === 'scheduled' && (
                  <button
                    onClick={() => handleCancel(schedule.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentScheduling;

