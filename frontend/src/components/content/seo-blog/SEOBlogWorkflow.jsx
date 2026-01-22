import React, { useState } from 'react';
import KeywordAnalysis from './KeywordAnalysis';
import KeywordGaps from './KeywordGaps';
import KeywordSelection from './KeywordSelection';
import ContentIdeas from './ContentIdeas';
import ContentGenerator from './ContentGenerator';
import ContentDisplay from './ContentDisplay';

function SEOBlogWorkflow({ projectId, clientId, project, client }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  const [keywordGaps, setKeywordGaps] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);

  const steps = [
    { num: 1, name: 'Keyword Analysis', component: KeywordAnalysis },
    { num: 2, name: 'Keyword Gaps', component: KeywordGaps },
    { num: 3, name: 'Select Keywords', component: KeywordSelection },
    { num: 4, name: 'Content Ideas', component: ContentIdeas },
    { num: 5, name: 'Generate Content', component: ContentGenerator },
    { num: 6, name: 'Content Display', component: ContentDisplay },
  ];

  const handleStepComplete = (stepNum, data) => {
    if (stepNum === 1) {
      setKeywordAnalysis(data);
      setCurrentStep(2);
    } else if (stepNum === 2) {
      setKeywordGaps(data);
      setCurrentStep(3);
    } else if (stepNum === 3) {
      setSelectedKeywords(data);
      setCurrentStep(4);
    } else if (stepNum === 4) {
      setContentIdeas(data);
      setCurrentStep(5);
    } else if (stepNum === 5) {
      setSelectedIdea(data);
      setCurrentStep(6);
    } else if (stepNum === 6) {
      setGeneratedContent(data);
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
                      ? 'bg-blue-600 text-white'
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
          keywordAnalysis={keywordAnalysis}
          keywordGaps={keywordGaps}
          selectedKeywords={selectedKeywords}
          contentIdeas={contentIdeas}
          selectedIdea={selectedIdea}
          generatedContent={generatedContent}
          onComplete={(data) => handleStepComplete(currentStep, data)}
          onRerunIdeas={() => setCurrentStep(4)}
        />
      )}
    </div>
  );
}

export default SEOBlogWorkflow;
