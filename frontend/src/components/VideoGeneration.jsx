import React, { useState, useEffect } from 'react';
import { videoAPI } from '../services/api';
import exportUtils from '../utils/export';

function VideoGeneration({ projectId }) {
  const [script, setScript] = useState(null);
  const [scriptText, setScriptText] = useState('');
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoStatus, setVideoStatus] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    loadAvatars();
    loadVoices();
  }, []);

  useEffect(() => {
    if (polling && videoStatus?.video_id) {
      const interval = setInterval(() => {
        checkVideoStatus(videoStatus.video_id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [polling, videoStatus]);

  const loadAvatars = async () => {
    try {
      const response = await videoAPI.getAvatars();
      if (response.data.success) {
        setAvatars(response.data.data || []);
        if (response.data.data?.length > 0) {
          setSelectedAvatarId(response.data.data[0].avatar_id || response.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading avatars:', err);
      setError(err.response?.data?.error || 'Failed to load avatars');
    }
  };

  const loadVoices = async () => {
    try {
      const response = await videoAPI.getVoices();
      if (response.data.success) {
        setVoices(response.data.data || []);
        if (response.data.data?.length > 0) {
          setSelectedVoiceId(response.data.data[0].voice_id || response.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading voices:', err);
      setError(err.response?.data?.error || 'Failed to load voices');
    }
  };

  const handleGenerateScript = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoAPI.generateScript(projectId);
      if (response.data.success) {
        const scriptData = typeof response.data.data.script === 'string'
          ? JSON.parse(response.data.data.script)
          : response.data.data.script || response.data.data;
        
        setScript(response.data.data);
        if (scriptData.content || scriptData.script) {
          setScriptText(scriptData.content || scriptData.script || '');
        } else if (typeof response.data.data.content === 'string') {
          const contentData = JSON.parse(response.data.data.content);
          setScriptText(contentData.content || contentData.script || '');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = async () => {
    if (!scriptText.trim()) {
      setError('Please generate or enter a script first');
      return;
    }
    if (!selectedAvatarId) {
      setError('Please select an avatar');
      return;
    }
    if (!selectedVoiceId) {
      setError('Please select a voice');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      const response = await videoAPI.create(
        script?.id || null,
        scriptText,
        selectedAvatarId,
        selectedVoiceId
      );
      if (response.data.success) {
        setVideoStatus(response.data.data);
        setPolling(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create video');
    } finally {
      setGenerating(false);
    }
  };

  const checkVideoStatus = async (videoId) => {
    try {
      const response = await videoAPI.checkStatus(videoId);
      if (response.data.success) {
        const status = response.data.data;
        setVideoStatus(status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          setPolling(false);
        }
      }
    } catch (err) {
      console.error('Error checking video status:', err);
      setPolling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Avatar Video Generation</h2>
        <p className="text-gray-600">
          Generate AI avatar videos using HeyGen and ElevenLabs. Create engaging video content from your project scripts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Script Generation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Video Script</h3>
          <div className="flex gap-2">
            {scriptText && (
              <>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(scriptText);
                    alert('Script copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy Script
                </button>
                <button
                  onClick={() => {
                    const scriptData = script ? { ...script, script: scriptText } : { script: scriptText };
                    exportUtils.downloadJSON(scriptData, 'video-script');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Export JSON
                </button>
              </>
            )}
            <button
              onClick={handleGenerateScript}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Script'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Script Text *
            </label>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={10}
              placeholder="Enter or generate a video script. The script will be converted into an AI avatar video."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the script text that will be spoken by the AI avatar.
            </p>
          </div>
        </div>
      </div>

      {/* Avatar and Voice Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar Selection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Avatar</h3>
          {avatars.length === 0 ? (
            <p className="text-gray-600 text-sm">Loading avatars...</p>
          ) : (
            <div className="space-y-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar.avatar_id || avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.avatar_id || avatar.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedAvatarId === (avatar.avatar_id || avatar.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {avatar.cover_url && (
                      <img
                        src={avatar.cover_url}
                        alt={avatar.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{avatar.name || avatar.avatar_name}</div>
                      {avatar.description && (
                        <div className="text-sm text-gray-600">{avatar.description}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Selection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Voice</h3>
          {voices.length === 0 ? (
            <p className="text-gray-600 text-sm">Loading voices...</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {voices.map((voice) => (
                <button
                  key={voice.voice_id || voice.id}
                  onClick={() => setSelectedVoiceId(voice.voice_id || voice.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedVoiceId === (voice.voice_id || voice.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {voice.name || voice.voice_name || voice.description}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {voice.gender && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {voice.gender}
                      </span>
                    )}
                    {voice.language && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {voice.language}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Generation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate Video</h3>
          <button
            onClick={handleCreateVideo}
            disabled={generating || !scriptText.trim() || !selectedAvatarId || !selectedVoiceId}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {generating ? 'Generating Video...' : 'Create Video'}
          </button>
        </div>

        {videoStatus && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Video Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                videoStatus.status === 'completed' ? 'bg-green-100 text-green-700' :
                videoStatus.status === 'processing' || videoStatus.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                videoStatus.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {videoStatus.status || 'Unknown'}
              </span>
            </div>

            {videoStatus.video_url && (
              <div className="mt-4">
                <video
                  src={videoStatus.video_url}
                  controls
                  className="w-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
                <a
                  href={videoStatus.video_url}
                  download
                  className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Download Video
                </a>
              </div>
            )}

            {videoStatus.progress !== undefined && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${videoStatus.progress || 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Progress: {videoStatus.progress || 0}%
                </p>
              </div>
            )}

            {polling && (
              <p className="text-sm text-gray-600 mt-2">
                Checking video status... This may take a few minutes.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoGeneration;
