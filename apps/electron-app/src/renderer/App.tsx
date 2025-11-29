import React, { useState } from 'react';
import { Timeline } from '@provideoeditor/ui';

declare global {
  interface Window {
    electronAPI: any;
  }
}

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks, setTracks] = useState([]);

  const handleImportMedia = async () => {
    // Cette fonction devrait ouvrir une boîte de dialogue de sélection de fichiers
    // Pour l'instant, utilisons des chemins fictifs
    const filePaths = ['/path/to/video1.mp4', '/path/to/video2.mp4'];
    const mediaInfos = await window.electronAPI.importMedia(filePaths);
    console.log('Media imported:', mediaInfos);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ProVideoEditor</h1>
        <button 
          onClick={handleImportMedia}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
        >
          Importer des médias
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Media bin */}
        <aside className="w-64 bg-gray-800 p-4">
          <h2 className="font-semibold mb-4">Médiathèque</h2>
          {/* Liste des médias importés */}
        </aside>

        {/* Preview and timeline */}
        <main className="flex-1 flex flex-col">
          {/* Preview */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="text-center">
              <p>Aperçu vidéo</p>
              <p>Temps actuel: {currentTime.toFixed(2)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48">
            <Timeline 
              tracks={tracks}
              currentTime={currentTime}
              onTimeChange={setCurrentTime}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
