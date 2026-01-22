import React, { useState } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

function SuburbSelector({ projectId, clientId, project, client, selectedSuburbs, onComplete, onSuburbsChange }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const [suburbs, setSuburbs] = useState(selectedSuburbs || []);
  const [searchValue, setSearchValue] = useState('');

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '',
    libraries,
  });

  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        const suburb = {
          name: place.name || place.formatted_address,
          address: place.formatted_address,
          placeId: place.place_id,
          location: place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          } : null,
        };
        
        if (!suburbs.find(s => s.placeId === suburb.placeId)) {
          const newSuburbs = [...suburbs, suburb];
          setSuburbs(newSuburbs);
          onSuburbsChange(newSuburbs);
          setSearchValue('');
        }
      }
    }
  };

  const removeSuburb = (placeId) => {
    const newSuburbs = suburbs.filter(s => s.placeId !== placeId);
    setSuburbs(newSuburbs);
    onSuburbsChange(newSuburbs);
  };

  if (loadError) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300">Error loading Google Maps: {loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading Google Places...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-2xl font-semibold text-white mb-4">Step 1: Select Suburbs</h2>
      <p className="text-gray-400 mb-6">
        Search and select suburbs using Google Places API. No typos - validated through Google.
      </p>

      <div className="mb-6">
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['(cities)'],
            componentRestrictions: { country: 'au' }, // Can be made configurable
          }}
        >
          <input
            type="text"
            placeholder="Search for a suburb..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Autocomplete>
      </div>

      {suburbs.length > 0 && (
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Selected Suburbs ({suburbs.length})</h3>
          {suburbs.map((suburb) => (
            <div
              key={suburb.placeId}
              className="flex items-center justify-between bg-slate-800 rounded-lg p-3 border border-slate-700"
            >
              <div>
                <p className="text-white font-medium">{suburb.name}</p>
                <p className="text-gray-400 text-sm">{suburb.address}</p>
              </div>
              <button
                onClick={() => removeSuburb(suburb.placeId)}
                className="px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onComplete(suburbs)}
        disabled={suburbs.length === 0}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        Continue to Services →
      </button>
    </div>
  );
}

export default SuburbSelector;
