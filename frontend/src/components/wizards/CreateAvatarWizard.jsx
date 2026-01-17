import React, { useState } from 'react';
import { avatarsAPI } from '../../services/api';

function CreateAvatarWizard({ onSuccess, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    video: null,
    transcription: '',
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.consent) {
      setError('Please confirm that you are the person in the video and consent to avatar creation.');
      return;
    }
    if (currentStep === 2 && !formData.video) {
      setError('Please upload a video file.');
      return;
    }
    if (currentStep === 2 && !formData.transcription.trim()) {
      setError('Please transcribe the exact words spoken in the video.');
      return;
    }
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Please enter an avatar name.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create form data for multipart upload
      const submitFormData = new FormData();
      submitFormData.append('video', formData.video);
      submitFormData.append('transcription', formData.transcription.trim());
      submitFormData.append('name', formData.name.trim());

      const response = await avatarsAPI.createInstantAvatar(submitFormData);
      
      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.error || 'Failed to create avatar');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Avatar</h1>
          <p className="mt-2 text-gray-600">Step {currentStep} of 3</p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? 'bg-orange-600 text-white'
                    : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              <p className="mt-2 text-sm text-gray-600 text-center">
                {step === 1 && 'Instructions'}
                {step === 2 && 'Upload Video'}
                {step === 3 && 'Confirm'}
              </p>
            </div>
            {step < 3 && (
              <div className={`flex-1 h-0.5 mx-4 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Instructions & Consent */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-medium">To create a high-quality Instant Avatar, please follow these guidelines:</p>
              <ul className="space-y-2 list-disc list-inside ml-2">
                <li>Look directly at the camera throughout the video</li>
                <li>Use good lighting (natural or bright artificial light)</li>
                <li>Ensure a clean background with minimal distractions</li>
                <li>Speak clearly and at a moderate pace</li>
                <li>Avoid background noise</li>
                <li>Record for 15-60 seconds (recommended: 30-45 seconds)</li>
                <li>Maintain eye contact with the camera</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-gray-700">
                <span className="font-medium">I confirm that I am the person in this video</span> and{' '}
                <span className="font-medium">I consent to the creation of a digital avatar of myself</span>.
                This avatar will be used for generating AI videos with my likeness.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Video Upload */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Video</h2>
            <p className="text-gray-600 mb-6">Upload your video file and provide the exact transcription of what is spoken.</p>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File (MP4 or MOV)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-orange-500 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="video-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                    <span>Upload a file</span>
                    <input
                      id="video-upload"
                      name="video"
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">MP4, MOV, or WebM up to 200MB</p>
                {formData.video && (
                  <p className="mt-2 text-sm text-gray-900">{formData.video.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Transcription */}
          <div>
            <label htmlFor="transcription" className="block text-sm font-medium text-gray-700 mb-2">
              Transcription <span className="text-red-600">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Please transcribe the <span className="font-medium">exact words</span> spoken in the video. This is required for HeyGen verification.
            </p>
            <textarea
              id="transcription"
              name="transcription"
              rows={6}
              value={formData.transcription}
              onChange={handleInputChange}
              placeholder="Enter the exact words spoken in the video..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Confirmation</h2>
            <p className="text-gray-600 mb-6">Review your submission before creating the avatar.</p>
          </div>

          {/* Avatar Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Avatar Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter a name for your avatar (e.g., 'My Avatar', 'John Avatar')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Video File:</span>
                <span className="font-medium text-gray-900">{formData.video?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Video Size:</span>
                <span className="font-medium text-gray-900">
                  {formData.video ? `${(formData.video.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Transcription Length:</span>
                <span className="font-medium text-gray-900">{formData.transcription.length} characters</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={currentStep === 1 ? onCancel : handleBack}
          disabled={loading}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={currentStep === 3 ? handleSubmit : handleNext}
          disabled={loading || (currentStep === 1 && !formData.consent) || (currentStep === 2 && (!formData.video || !formData.transcription.trim())) || (currentStep === 3 && !formData.name.trim())}
          className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : currentStep === 3 ? 'Submit for Creation' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default CreateAvatarWizard;
