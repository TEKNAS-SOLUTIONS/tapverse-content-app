import React, { useState, useMemo } from 'react';

function CombinationSelector({ selectedSuburbs, services, onComplete, onCombinationsChange }) {
  const [selectedCombinations, setSelectedCombinations] = useState([]);

  // Generate all possible combinations
  const allCombinations = useMemo(() => {
    const combos = [];
    selectedSuburbs.forEach(suburb => {
      services.forEach(service => {
        combos.push({
          id: `${suburb.placeId}-${service}`,
          suburb: suburb.name,
          service: service,
          label: `${service} in ${suburb.name}`,
        });
      });
    });
    return combos;
  }, [selectedSuburbs, services]);

  const handleToggleCombination = (combo) => {
    setSelectedCombinations(prev => {
      if (prev.find(c => c.id === combo.id)) {
        const updated = prev.filter(c => c.id !== combo.id);
        onCombinationsChange(updated);
        return updated;
      } else {
        const updated = [...prev, combo];
        onCombinationsChange(updated);
        return updated;
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedCombinations(allCombinations);
    onCombinationsChange(allCombinations);
  };

  const handleDeselectAll = () => {
    setSelectedCombinations([]);
    onCombinationsChange([]);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Step 3: Select Combinations</h2>
          <p className="text-gray-400 mt-2">
            Select suburb + service combinations. Up to 10 will be generated in batch.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-blue-300">
          Selected: <span className="font-bold">{selectedCombinations.length}</span> combinations
          {selectedCombinations.length > 10 && (
            <span className="ml-2 text-yellow-300">(Only first 10 will be generated)</span>
          )}
        </p>
      </div>

      {allCombinations.length === 0 ? (
        <div className="text-center py-8 bg-slate-800 rounded-lg">
          <p className="text-gray-400">No combinations available. Please complete previous steps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {allCombinations.map((combo) => {
            const isSelected = selectedCombinations.find(c => c.id === combo.id);
            return (
              <div
                key={combo.id}
                onClick={() => handleToggleCombination(combo)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!isSelected}
                    onChange={() => handleToggleCombination(combo)}
                    className="mr-3 w-4 h-4"
                  />
                  <div>
                    <p className="text-white font-medium">{combo.service}</p>
                    <p className="text-gray-400 text-sm">in {combo.suburb}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onComplete(selectedCombinations)}
          disabled={selectedCombinations.length === 0}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Generate {Math.min(selectedCombinations.length, 10)} Content Pieces →
        </button>
      </div>
    </div>
  );
}

export default CombinationSelector;
