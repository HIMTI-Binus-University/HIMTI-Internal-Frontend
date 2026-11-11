import React, { useState } from 'react';
import { ResultInspection, OutputFormat } from './preview-download/components';

interface StatItem {
  label: string;
  value: number;
  type?: 'positive' | 'warning' | 'danger' | 'info';
}

interface OutputOption {
  id: string;
  label: string;
  description?: string;
}

const CertificateGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const stats: StatItem[] = [
    { label: 'Sertifikat siap', value: 1, type: 'positive' },
    { label: 'Menggunakan nama lengkap', value: 1, type: 'positive' },
    { label: 'Menggunakan ukuran lebih kecil', value: 0, type: 'info' },
    { label: 'Menggunakan nama dipersingkat', value: 0, type: 'info' },
    { label: 'Override manual', value: 0, type: 'info' },
    { label: 'Mencapai ukuran minimum', value: 0, type: 'info' },
    { label: 'Perlu ditinjau', value: 0, type: 'info' },
    { label: 'Nama duplikat', value: 0, type: 'info' },
    { label: 'Estimasi file', value: 1, type: 'positive' },
  ];

  const highlightedStats: StatItem[] = [
    { label: 'Nama dipersingkat', value: 0, type: 'info' },
    { label: 'Nama mencapai font minimum', value: 0, type: 'info' },
    { label: 'Nama masih overflow', value: 0, type: 'info' },
    { label: 'Nama dengan override manual', value: 0, type: 'info' },
  ];

  const outputOptions: OutputOption[] = [
    { 
      id: 'png-zip', 
      label: 'PNG per peserta dalam ZIP',
      description: 'Resolusi asli template.'
    },
    { 
      id: 'pdf-zip', 
      label: 'PDF per peserta dalam ZIP',
      description: 'Satu halaman per file.'
    },
    { 
      id: 'pdf-multi', 
      label: 'Satu PDF multi-halaman',
      description: 'Satu peserta per halaman.'
    },
  ];

  const handleDownload = (optionId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Downloading: ${optionId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResultInspection 
            stats={stats}
            highlightedStats={highlightedStats}
          />
          <OutputFormat 
            options={outputOptions}
            onDownload={handleDownload}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;