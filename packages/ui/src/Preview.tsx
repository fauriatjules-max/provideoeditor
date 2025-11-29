import React from 'react';

interface PreviewProps {
  currentTime: number;
  duration: number;
}

export const Preview: React.FC<PreviewProps> = ({ currentTime, duration }) => {
  return (
    <div className="preview-container bg-black text-white flex items-center justify-center">
      <div>
        <p>Aperçu</p>
        <p>{currentTime} / {duration}</p>
      </div>
    </div>
  );
};
