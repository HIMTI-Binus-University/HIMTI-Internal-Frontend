import React, { useState } from 'react';

interface OutputOption {
  id: string;
  label: string;
  description?: string;
}

interface OutputFormatProps {
  options: OutputOption[];
  onDownload?: (optionId: string) => void;
  isGenerating?: boolean;
  totalCertificates?: number;
  progress?: { current: number; total: number };
}

const OutputFormat: React.FC<OutputFormatProps> = ({ 
  options, 
  onDownload,
  isGenerating = false,
  totalCertificates = 1,
  progress
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0]?.id || 'png-zip');

  const handleGenerate = () => {
    if (onDownload) {
      onDownload(selectedOption);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Output format</h3>
      
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <label 
            key={option.id} 
            className="flex items-start gap-3 cursor-pointer"
          >
            <input
              type="radio"
              name="output-format"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={(e) => setSelectedOption(e.target.value)}
              disabled={isGenerating}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-800 block">{option.label}</span>
              {option.description && (
                <span className="text-sm text-gray-500 block mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-6">
        <p className="text-sm text-gray-600">
          Final size depends on template dimensions and may be larger than source file.
        </p>
      </div>

      {isGenerating && progress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Generating certificates...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        {isGenerating ? 'Generating...' : `Generate ${totalCertificates} certificate${totalCertificates > 1 ? 's' : ''}`}
      </button>
    </div>
  );
};

export default OutputFormat;