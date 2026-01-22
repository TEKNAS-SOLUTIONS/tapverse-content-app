import React, { useState } from 'react';
import SuburbSelector from './SuburbSelector';
import ServicesManager from './ServicesManager';
import CombinationSelector from './CombinationSelector';
import BatchGenerator from './BatchGenerator';
import ProgrammaticDisplay from './ProgrammaticDisplay';

function ProgrammaticSEO({ projectId, clientId, project, client }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSuburbs, setSelectedSuburbs] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCombinations, setSelectedCombinations] = useState([]);
  const [generatedContent, setGeneratedContent] = useState([]);

  const steps = [
    { num: 1, name: 'Select Suburbs', component: SuburbSelector },
    { num: 2, name: 'Manage Services', component: ServicesManager },
    { num: 3, name: 'Select Combinations', component: CombinationSelector },
    { num: 4, name: 'Batch Generate', component: BatchGenerator },
    { num: 5, name: 'Content Display', component: ProgrammaticDisplay },
  ];

  const handleStepComplete = (stepNum, data) => {
    if (stepNum === 1) {
      setSelectedSuburbs(data);
      setCurrentStep(2);
    } else if (stepNum === 2) {
      setServices(data);
      setCurrentStep(3);
    } else if (stepNum === 3) {
      setSelectedCombinations(data);
      setCurrentStep(4);
    } else if (stepNum === 4) {
      setGeneratedContent(data);
      setCurrentStep(5);
    }
  };

  const CurrentStepComponent = steps.find(s => s.num === currentStep)?.component;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep === step.num
                      ? 'bg-purple-600 text-white'
                      : currentStep > step.num
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-gray-400'
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </button>
                <span className={`ml-2 text-sm ${
                  currentStep === step.num ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${
                  currentStep > step.num ? 'bg-green-600' : 'bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      {CurrentStepComponent && (
        <CurrentStepComponent
          projectId={projectId}
          clientId={clientId}
          project={project}
          client={client}
          selectedSuburbs={selectedSuburbs}
          services={services}
          selectedCombinations={selectedCombinations}
          generatedContent={generatedContent}
          onComplete={(data) => handleStepComplete(currentStep, data)}
          onSuburbsChange={setSelectedSuburbs}
          onServicesChange={setServices}
          onCombinationsChange={setSelectedCombinations}
        />
      )}
    </div>
  );
}

export default ProgrammaticSEO;
