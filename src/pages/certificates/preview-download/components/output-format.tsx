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
}

const OutputFormat: React.FC<OutputFormatProps> = ({ 
  options, 
  onDownload,
  isGenerating = false 
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0]?.id || 'png-zip');

  const handleGenerate = () => {
    if (onDownload) {
      onDownload(selectedOption);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Format output</h3>
      
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
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
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
          Ukuran akhir bergantung pada dimensi template dan dapat lebih besar dari file sumber.
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        {isGenerating ? 'Generating...' : 'Generate 1 sertifikat'}
      </button>
    </div>
  );
};

export default OutputFormat;