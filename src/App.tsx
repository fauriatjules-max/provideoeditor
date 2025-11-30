import React, { useState, useEffect } from 'react';
import { Timeline } from './components/Timeline';
import { Preview } from './components/Preview';
import { MediaLibrary } from './components/MediaLibrary';
import { PropertiesPanel } from './components/PropertiesPanel';

interface AppProps {
  onReady: () => void;
}

export default function App({ onReady }: AppProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [selectedClip, setSelectedClip] = useState<any>(null);

  useEffect(() => {
    // Simule le chargement de l'application
    const timer = setTimeout(() => {
      onReady();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onReady]);

  const handleImportMedia = (files: FileList) => {
    const newMedia = Array.from(files).map(file => ({
      id: `media_${Date.now()}_${Math.random()}`,
      name: file.name,
      type: file.type.split('/')[0],
      file,
      duration: 60, // Simulation
      thumbnail: URL.createObjectURL(file)
    }));
    
    setMediaFiles(prev => [...prev, ...newMedia]);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleImportMedia(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImportMedia(e.target.files);
    }
  };

  return (
    <div 
      className="app-container"
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1 className="app-title">
            <span className="app-icon">🎬</span>
            ProVideoEditor
          </h1>
          <div className="header-buttons">
            <button className="btn-primary">
              Nouveau Projet
            </button>
            <label className="btn-secondary cursor-pointer">
              Importer des médias
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileSelect}
                accept="video/*,audio/*,image/*"
              />
            </label>
            <button className="btn-primary">
              Exporter
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <div className="playback-controls">
            <button 
              className="play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <span className="time-display">
              {formatTime(currentTime)} / 00:00:00
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar - Media Library */}
        <aside className="sidebar">
          <MediaLibrary 
            mediaFiles={mediaFiles}
            onMediaSelect={setSelectedClip}
          />
        </aside>

        {/* Preview and Timeline */}
        <main className="editor-area">
          <Preview 
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeChange={setCurrentTime}
            onPlayPause={setIsPlaying}
          />
          
          <Timeline 
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            mediaFiles={mediaFiles}
          />
        </main>

        {/* Properties Panel */}
        <aside className="properties-panel">
          <PropertiesPanel 
            selectedClip={selectedClip}
          />
        </aside>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
