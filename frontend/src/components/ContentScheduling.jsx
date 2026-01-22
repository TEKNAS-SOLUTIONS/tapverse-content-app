import React, { useState, useEffect } from 'react';
import { schedulingAPI, contentAPI } from '../services/api';

function ContentScheduling({ projectId, clientId }) {
  const [schedules, setSchedules] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
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
      setError(null);
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
      setError(err.response?.data?.error || err.message || 'Failed to schedule content');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (scheduleId) => {
    if (!confirm('Are you sure you want to cancel this schedule?')) return;
    try {
      setError(null);
      await schedulingAPI.cancel(scheduleId);
      loadSchedules();
    } catch (err) {
      console.error('Error cancelling schedule:', err);
      setError(err.response?.data?.error || err.message || 'Failed to cancel schedule');
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

  if (loading && schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Scheduling</h2>
          <p className="text-gray-600 text-sm mt-1">Schedule content for publishing across platforms</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Schedule Content'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSchedule} className="bg-white rounded-lg p-6 space-y-4 border border-gray-200 shadow-sm">
          <div>
            <label className="block text-gray-700 mb-2">Content</label>
            <select
              value={formData.contentId}
              onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              <label className="block text-gray-700 mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              <label className="block text-gray-700 mb-2">Content Type</label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
            <label className="block text-gray-700 mb-2">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Scheduling...</span>
              </>
            ) : (
              'Schedule Content'
            )}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Scheduled Content</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading schedules...</p>
          </div>
        ) : schedules.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No scheduled content yet</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center border border-gray-200 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
                    </span>
                    <span className="text-gray-900 font-semibold capitalize">{schedule.platform}</span>
                    <span className="text-gray-600 text-sm">{schedule.content_type}</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Scheduled: {formatDate(schedule.scheduled_at)}
                  </p>
                  {schedule.published_at && (
                    <p className="text-gray-700 text-sm">
                      Published: {formatDate(schedule.published_at)}
                    </p>
                  )}
                </div>
                {schedule.status === 'scheduled' && (
                  <button
                    onClick={() => handleCancel(schedule.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
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

