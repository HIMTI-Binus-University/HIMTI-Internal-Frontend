import React from 'react';

interface StatItem {
  label: string;
  value: number;
  type?: 'positive' | 'warning' | 'danger' | 'info';
}

interface ResultInspectionProps {
  stats: StatItem[];
  highlightedStats?: StatItem[];
}

const ResultInspection: React.FC<ResultInspectionProps> = ({ 
  stats, 
  highlightedStats
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Pemeriksaan hasil</h3>
      
      <div className="space-y-1.5 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{stat.label}:</span>
            <span className={`font-medium ${
              stat.type === 'positive' ? 'text-green-600' :
              stat.type === 'warning' ? 'text-yellow-600' :
              stat.type === 'danger' ? 'text-red-600' :
              'text-gray-900'
            }`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {highlightedStats && highlightedStats.length > 0 && (
        <div className="space-y-1.5 border-t pt-4 border-gray-200">
          {highlightedStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-800">{stat.label}:</span>
              <span className={`font-bold ${
                stat.type === 'positive' ? 'text-green-600' :
                stat.type === 'warning' ? 'text-yellow-600' :
                stat.type === 'danger' ? 'text-red-600' :
                'text-gray-900'
              }`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultInspection;