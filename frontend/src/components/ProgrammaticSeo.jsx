import React, { useState, useEffect, useRef } from 'react';
import { programmaticSeoAPI } from '../services/api';

function ProgrammaticSeo({ clientId, projectId, clientData, projectData }) {
  const [contentType, setContentType] = useState('service_location');
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceInput, setServiceInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [bulkLocationInput, setBulkLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const locationInputRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);

  // Debounced location suggestions
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (locationInput.length >= 2) {
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await programmaticSeoAPI.getSuggestions(locationInput);
          if (response.data.success) {
            setLocationSuggestions(response.data.data);
          }
        } catch (err) {
          console.error('Error fetching location suggestions:', err);
        }
      }, 300);
    } else {
      setLocationSuggestions([]);
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [locationInput]);

  const addService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput('');
    }
  };

  const removeService = (service) => {
    setServices(services.filter(s => s !== service));
  };

  const addLocation = (location) => {
    const locationText = typeof location === 'string' ? location : location.description;
    if (locationText.trim() && !locations.includes(locationText.trim())) {
      setLocations([...locations, locationText.trim()]);
      setLocationInput('');
      setLocationSuggestions([]);
    }
  };

  const removeLocation = (location) => {
    setLocations(locations.filter(l => l !== location));
  };

  const handleBulkLocationAdd = () => {
    const locationList = bulkLocationInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    
    const newLocations = [...locations];
    locationList.forEach(loc => {
      if (!newLocations.includes(loc)) {
        newLocations.push(loc);
      }
    });
    
    setLocations(newLocations);
    setBulkLocationInput('');
    setShowBulkInput(false);
  };

  const calculateTotalCombinations = () => {
    if (contentType === 'service_location') {
      return services.length * locations.length;
    } else if (contentType === 'service_only') {
      return services.length;
    } else if (contentType === 'location_only') {
      return locations.length;
    }
    return 0;
  };

  const handleGenerate = async () => {
    if (services.length === 0 || locations.length === 0) {
      setError('Please add at least one service and one location');
      return;
    }

    const total = calculateTotalCombinations();
    if (total > 50) {
      setError(`Maximum 50 combinations allowed. You have ${total}. Please reduce services or locations.`);
      return;
    }

    setGenerating(true);
    setError(null);
    setResults([]);

    try {
      const response = await programmaticSeoAPI.generateBatch({
        clientId,
        projectId,
        services,
        locations,
        contentType,
      });

      if (response.data.success) {
        setResults(response.data.data.results || []);
        if (response.data.data.errors && response.data.data.errors.length > 0) {
          setError(`Generated ${response.data.data.generated} out of ${response.data.data.total}. Some errors occurred.`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Type Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Programmatic SEO Content Generator</h2>
        <p className="text-gray-400 mb-6">
          Generate unique SEO-optimized content for Service + Location combinations (e.g., "Plumber in Melbourne CBD")
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Content Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="service_location"
                checked={contentType === 'service_location'}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-300">Service + Location Pages</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="service_only"
                checked={contentType === 'service_only'}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-300">Service Pages Only</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="location_only"
                checked={contentType === 'location_only'}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-300">Location Pages Only</span>
            </label>
          </div>
        </div>

        {/* Service Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Services *</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addService()}
              placeholder="e.g., Plumber, Electrician, HVAC"
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={addService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Service
            </button>
          </div>
          {services.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {services.map((service, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm"
                >
                  {service}
                  <button
                    onClick={() => removeService(service)}
                    className="text-blue-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Locations *</label>
          <div className="relative mb-2">
            <input
              ref={locationInputRef}
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Start typing location (e.g., Melbourne, Sydney)"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            {locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => addLocation(suggestion)}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {suggestion.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!showBulkInput ? (
            <button
              onClick={() => setShowBulkInput(true)}
              className="text-sm text-blue-400 hover:text-blue-300 mb-2"
            >
              + Bulk Add Locations (paste list)
            </button>
          ) : (
            <div className="mb-2">
              <textarea
                value={bulkLocationInput}
                onChange={(e) => setBulkLocationInput(e.target.value)}
                placeholder="Paste locations one per line..."
                rows="4"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleBulkLocationAdd}
                  className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Add All Locations
                </button>
                <button
                  onClick={() => {
                    setShowBulkInput(false);
                    setBulkLocationInput('');
                  }}
                  className="px-4 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {locations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {locations.map((location, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm"
                >
                  {location}
                  <button
                    onClick={() => removeLocation(location)}
                    className="text-green-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preview & Generate */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Content Template:</span>
            <span className="text-yellow-400 font-medium">
              {contentType === 'service_location' && '[SERVICE] in [LOCATION]'}
              {contentType === 'service_only' && '[SERVICE] Services'}
              {contentType === 'location_only' && 'Services in [LOCATION]'}
            </span>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            Example: {services[0] && locations[0] 
              ? `${services[0]} in ${locations[0]}`
              : 'Enter services and locations to see example'}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">
              Total combinations: <span className="font-medium text-white">{calculateTotalCombinations()}</span> / 50 max
            </span>
            <button
              onClick={handleGenerate}
              disabled={generating || services.length === 0 || locations.length === 0 || calculateTotalCombinations() > 50}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generating ? 'Generating...' : `Generate ${calculateTotalCombinations()} Content Pieces`}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Generated Content ({results.length} pieces)</h3>
          {results.map((result, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">{result.keyword}</h4>
                  <p className="text-sm text-gray-400">
                    {result.service} {result.location && `in ${result.location}`}
                  </p>
                </div>
                <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded">
                  {result.wordCount || 'N/A'} words
                </span>
              </div>
              
              {result.title && (
                <div className="mb-3">
                  <label className="text-xs text-gray-500 uppercase mb-1 block">SEO Title</label>
                  <p className="text-white">{result.title}</p>
                </div>
              )}
              
              {result.metaDescription && (
                <div className="mb-3">
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Meta Description</label>
                  <p className="text-gray-300">{result.metaDescription}</p>
                </div>
              )}

              {result.h1 && (
                <div className="mb-3">
                  <label className="text-xs text-gray-500 uppercase mb-1 block">H1 Heading</label>
                  <p className="text-white text-lg">{result.h1}</p>
                </div>
              )}

              {result.content && (
                <div className="mb-3">
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Content Preview</label>
                  <div 
                    className="text-gray-300 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: result.content.substring(0, 300) + '...' }}
                  />
                </div>
              )}

              {result.keywords && result.keywords.length > 0 && (
                <div className="mt-3">
                  <label className="text-xs text-gray-500 uppercase mb-2 block">Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, kwIdx) => (
                      <span key={kwIdx} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgrammaticSeo;
