import React, { useState, useEffect } from 'react';

function ServicesManager({ projectId, clientId, project, client, services, onComplete, onServicesChange }) {
  const [serviceList, setServiceList] = useState(services || []);
  const [newService, setNewService] = useState('');

  useEffect(() => {
    if (services) {
      setServiceList(services);
    }
  }, [services]);

  const handleAddService = () => {
    if (newService.trim() && !serviceList.find(s => s.toLowerCase() === newService.toLowerCase())) {
      const updated = [...serviceList, newService.trim()];
      setServiceList(updated);
      onServicesChange(updated);
      setNewService('');
    }
  };

  const handleRemoveService = (service) => {
    const updated = serviceList.filter(s => s !== service);
    setServiceList(updated);
    onServicesChange(updated);
  };

  const handleToggleService = (service) => {
    // For selection (if needed in future)
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-2xl font-semibold text-white mb-4">Step 2: Manage Services</h2>
      <p className="text-gray-400 mb-6">
        Add and manage list of services (e.g., "Plumber", "Electrician", "Dentist").
      </p>

      {/* Add Service */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
          placeholder="Enter service name (e.g., Plumber)"
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddService}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Service
        </button>
      </div>

      {/* Services List */}
      {serviceList.length > 0 ? (
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Services ({serviceList.length})</h3>
          <div className="flex flex-wrap gap-2">
            {serviceList.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-700"
              >
                <span className="text-white">{service}</span>
                <button
                  onClick={() => handleRemoveService(service)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-400">No services added yet</p>
        </div>
      )}

      <button
        onClick={() => onComplete(serviceList)}
        disabled={serviceList.length === 0}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        Continue to Combinations →
      </button>
    </div>
  );
}

export default ServicesManager;
